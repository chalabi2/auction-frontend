import type { NextApiRequest, NextApiResponse } from 'next';
import { cacheManager } from '../../lib/cache';

// Import the cache from the proxy (we'll need to export it)
// For now, we'll create a simple cache stats endpoint

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method, query } = req;

  // Optional: Add basic authentication for cache control endpoints
  const apiKey = process.env.API_KEY;
  if (apiKey !== process.env.API_KEY) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  switch (method) {
    case 'GET':
      // Get cache statistics
      if (query.action === 'stats') {
        const stats = cacheManager.getStats();
        return res.status(200).json({
          ...stats,
          hitRatePercentage: Math.round(stats.hitRate * 100),
          timestamp: new Date().toISOString(),
        });
      }
      break;

    case 'DELETE':
      // Clear cache
      if (query.action === 'clear') {
        const statsBefore = cacheManager.getStats();
        cacheManager.clear();
        
        return res.status(200).json({
          message: 'Cache cleared successfully',
          entriesCleared: statsBefore.totalEntries,
          timestamp: new Date().toISOString(),
        });
      }
      
      // Clean expired entries
      if (query.action === 'clean') {
        const cleaned = cacheManager.cleanExpired();
        
        return res.status(200).json({
          message: 'Expired cache entries cleaned',
          entriesRemoved: cleaned,
          timestamp: new Date().toISOString(),
        });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'DELETE']);
      return res.status(405).json({ error: `Method ${method} not allowed` });
  }

  return res.status(400).json({ 
    error: 'Invalid action',
    availableActions: {
      GET: ['stats'],
      DELETE: ['clear', 'clean']
    }
  });
} 