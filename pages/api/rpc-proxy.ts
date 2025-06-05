import type { NextApiRequest, NextApiResponse } from 'next';
import { cacheManager, CACHE_TTL } from '../../lib/cache';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the API key from server-side environment variables
    // Try multiple possible environment variable names
    const apiKey = process.env.API_KEY || 
                   process.env.NEXT_PUBLIC_API_KEY || 
                   process.env.VERCEL_API_KEY ||
                   process.env.CHANDRASTATION_API_KEY;
    
    console.log('RPC Proxy - Environment check:', {
      hasApiKey: !!apiKey,
      nodeEnv: process.env.NODE_ENV,
      keyLength: apiKey ? apiKey.length : 0,
      requestMethod: req.method,
      hasBody: !!req.body,
      bodyType: typeof req.body,
      userAgent: req.headers['user-agent'],
      contentType: req.headers['content-type']
    });
    
    if (!apiKey) {
      console.error('API key not found in environment variables');
      return res.status(500).json({ 
        error: 'API key not configured',
        debug: {
          availableEnvVars: Object.keys(process.env).filter(key => 
            key.includes('API') || key.includes('KEY')
          )
        }
      });
    }

    // Validate request body
    if (!req.body) {
      console.error('No request body provided');
      return res.status(400).json({ error: 'Request body is required' });
    }

    // Generate cache key from request body
    const cacheKey = cacheManager.generateKey(req.body);
    
    // Check if we have a valid cached response
    const cachedData = cacheManager.get(cacheKey);
    if (cachedData) {
      console.log('Cache HIT for request');
      // Add cache headers to response
      res.setHeader('X-Cache', 'HIT');
      res.setHeader('X-Cache-Age', cacheManager.getEntryAge(cacheKey) || 0);
      
      // Add Vercel-specific caching headers
      res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');
      
      return res.status(200).json(cachedData);
    }

    console.log('Cache MISS - Making request to external API...');
    console.log('Request payload:', JSON.stringify(req.body, null, 2));
    
    // Forward the request to the actual RPC endpoint
    const response = await fetch('https://api.chandrastation.com/rpc/gravity/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'User-Agent': 'Gravity-Auction-App/1.0',
      },
      body: JSON.stringify(req.body),
    });

    console.log('External API response status:', response.status);
    console.log('External API response headers:', Object.fromEntries(response.headers.entries()));

    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      console.error('Failed to parse response as JSON:', parseError);
      const textResponse = await response.text();
      console.error('Response text:', textResponse);
      return res.status(500).json({ 
        error: 'Invalid JSON response from external API',
        responseText: textResponse.substring(0, 500) // Limit response size
      });
    }

    if (!response.ok) {
      console.error(`External API error (${response.status}):`, {
        status: response.status,
        statusText: response.statusText,
        error: data.message || data.error || data,
        headers: Object.fromEntries(response.headers.entries())
      });
      return res.status(response.status).json(data);
    }

    console.log('External API request successful');

    // Cache the successful response
    cacheManager.set(cacheKey, data, CACHE_TTL.RPC_QUERIES);

    // Clean expired cache entries periodically (10% chance)
    if (Math.random() < 0.1) {
      const cleaned = cacheManager.cleanExpired();
      if (cleaned > 0) {
        console.log(`Cleaned ${cleaned} expired cache entries`);
      }
    }

    // Add cache headers to response
    res.setHeader('X-Cache', 'MISS');
    res.setHeader('X-Cache-TTL', CACHE_TTL.RPC_QUERIES / 1000);
    
    // Add Vercel-specific caching headers
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');

    res.status(200).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 