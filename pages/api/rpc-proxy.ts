import type { NextApiRequest, NextApiResponse } from 'next';
import { cacheManager, CACHE_TTL } from '../../lib/cache';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the API key from server-side environment variables
    const apiKey = process.env.API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    // Generate cache key from request body
    const cacheKey = cacheManager.generateKey(req.body);
    
    // Check if we have a valid cached response
    const cachedData = cacheManager.get(cacheKey);
    if (cachedData) {
      // Add cache headers to response
      res.setHeader('X-Cache', 'HIT');
      res.setHeader('X-Cache-Age', cacheManager.getEntryAge(cacheKey) || 0);
      
      // Add Vercel-specific caching headers
      res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');
      
      return res.status(200).json(cachedData);
    }

    // Forward the request to the actual RPC endpoint
    const response = await fetch('https://api.chandrastation.com/rpc/gravity/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`External API error (${response.status}):`, data.message || data.error);
      return res.status(response.status).json(data);
    }

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
    res.status(500).json({ error: 'Internal server error' });
  }
} 