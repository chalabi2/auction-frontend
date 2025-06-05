import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get all environment variables that might contain API keys
  const envVars = {
    API_KEY: !!process.env.API_KEY,
    NEXT_PUBLIC_API_KEY: !!process.env.NEXT_PUBLIC_API_KEY,
    VERCEL_API_KEY: !!process.env.VERCEL_API_KEY,
    CHANDRASTATION_API_KEY: !!process.env.CHANDRASTATION_API_KEY,
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV,
    VERCEL_URL: process.env.VERCEL_URL,
  };

  // Get the actual API key (without exposing it)
  const apiKey = process.env.API_KEY || 
                 process.env.NEXT_PUBLIC_API_KEY || 
                 process.env.VERCEL_API_KEY ||
                 process.env.CHANDRASTATION_API_KEY;

  // List all environment variables that contain 'API' or 'KEY'
  const allApiKeyVars = Object.keys(process.env).filter(key => 
    key.includes('API') || key.includes('KEY')
  );

  res.status(200).json({
    envVars,
    hasApiKey: !!apiKey,
    apiKeyLength: apiKey ? apiKey.length : 0,
    apiKeySource: apiKey === process.env.API_KEY ? 'API_KEY' :
                  apiKey === process.env.NEXT_PUBLIC_API_KEY ? 'NEXT_PUBLIC_API_KEY' :
                  apiKey === process.env.VERCEL_API_KEY ? 'VERCEL_API_KEY' :
                  apiKey === process.env.CHANDRASTATION_API_KEY ? 'CHANDRASTATION_API_KEY' :
                  'unknown',
    allApiKeyVars,
    timestamp: new Date().toISOString()
  });
} 