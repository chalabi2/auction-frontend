import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the API key from server-side environment variables
    const apiKey = process.env.API_KEY || 
                   process.env.NEXT_PUBLIC_API_KEY || 
                   process.env.VERCEL_API_KEY ||
                   process.env.CHANDRASTATION_API_KEY;
    
    console.log('Test proxy - Environment check:', {
      hasApiKey: !!apiKey,
      nodeEnv: process.env.NODE_ENV,
      keyLength: apiKey ? apiKey.length : 0,
      availableEnvVars: Object.keys(process.env).filter(key => 
        key.includes('API') || key.includes('KEY')
      )
    });
    
    if (!apiKey) {
      return res.status(500).json({ 
        error: 'API key not configured',
        debug: {
          availableEnvVars: Object.keys(process.env).filter(key => 
            key.includes('API') || key.includes('KEY')
          )
        }
      });
    }

    // Test with a simple RPC call to get the latest block
    const testPayload = {
      jsonrpc: "2.0",
      id: 1,
      method: "abci_info",
      params: {}
    };

    console.log('Making test request to external API...');
    
    const response = await fetch('https://api.chandrastation.com/rpc/gravity/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(testPayload),
    });

    const data = await response.json();

    console.log('External API response:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      dataKeys: Object.keys(data)
    });

    if (!response.ok) {
      return res.status(response.status).json({
        error: 'External API error',
        status: response.status,
        statusText: response.statusText,
        data
      });
    }

    res.status(200).json({
      success: true,
      message: 'Proxy test successful',
      apiResponse: data,
      testInfo: {
        endpoint: 'https://api.chandrastation.com/rpc/gravity/',
        method: 'POST',
        hasApiKey: !!apiKey,
        keyLength: apiKey ? apiKey.length : 0
      }
    });
  } catch (error) {
    console.error('Test proxy error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 