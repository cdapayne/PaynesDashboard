import { Router, Request, Response } from 'express';
import { rssService } from '../../integrations/rss';
import { authenticateToken, AuthenticatedRequest } from '../../middleware';

const router = Router();

// Get aggregated feed items (public endpoint)
router.get('/items', async (_req: Request, res: Response) => {
  try {
    // Fetch all feeds first
    await rssService.fetchAllFeeds();
    
    const limit = parseInt(_req.query.limit as string) || 20;
    const items = rssService.getAggregatedItems(limit);

    res.json({
      success: true,
      data: {
        items,
        count: items.length,
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('RSS fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch RSS feeds',
    });
  }
});

// Get all configured feeds
router.get('/feeds', (_req: Request, res: Response) => {
  const feeds = rssService.getCachedFeeds();
  const feedUrls = rssService.getFeedUrls();

  res.json({
    success: true,
    data: {
      feeds: feeds.map(feed => ({
        url: feed.url,
        title: feed.title,
        description: feed.description,
        itemCount: feed.items.length,
        lastFetched: feed.lastFetched,
      })),
      configuredUrls: feedUrls,
    },
  });
});

// Validate URL to prevent SSRF attacks
function isValidRSSUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return false;
    }
    // Block localhost and private IP ranges
    const hostname = parsedUrl.hostname.toLowerCase();
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      hostname.startsWith('172.') ||
      hostname === '0.0.0.0' ||
      hostname.endsWith('.local')
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

// Fetch a specific feed by URL
router.get('/fetch', async (req: Request, res: Response) => {
  const url = req.query.url as string;

  if (!url) {
    res.status(400).json({
      success: false,
      error: 'URL query parameter is required',
    });
    return;
  }

  if (!isValidRSSUrl(url)) {
    res.status(400).json({
      success: false,
      error: 'Invalid URL. Only public HTTP/HTTPS URLs are allowed.',
    });
    return;
  }

  try {
    const feed = await rssService.fetchFeed(url);

    if (!feed) {
      res.status(404).json({
        success: false,
        error: 'Failed to fetch feed or feed not found',
      });
      return;
    }

    res.json({
      success: true,
      data: feed,
    });
  } catch (error) {
    console.error('RSS fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch RSS feed',
    });
  }
});

// Add a new feed (authenticated)
router.post('/feeds', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { url } = req.body;

  if (!url) {
    res.status(400).json({
      success: false,
      error: 'URL is required',
    });
    return;
  }

  if (!isValidRSSUrl(url)) {
    res.status(400).json({
      success: false,
      error: 'Invalid URL. Only public HTTP/HTTPS URLs are allowed.',
    });
    return;
  }

  try {
    const added = await rssService.addFeed(url);

    if (!added) {
      res.status(400).json({
        success: false,
        error: 'Failed to add feed. URL may be invalid or already exists.',
      });
      return;
    }

    res.status(201).json({
      success: true,
      message: 'Feed added successfully',
    });
  } catch (error) {
    console.error('RSS add feed error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add feed',
    });
  }
});

// Remove a feed (authenticated)
router.delete('/feeds', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { url } = req.body;

  if (!url) {
    res.status(400).json({
      success: false,
      error: 'URL is required',
    });
    return;
  }

  const removed = await rssService.removeFeed(url);

  if (!removed) {
    res.status(404).json({
      success: false,
      error: 'Feed not found',
    });
    return;
  }

  res.json({
    success: true,
    message: 'Feed removed successfully',
  });
});

// Refresh all feeds
router.post('/refresh', async (_req: Request, res: Response) => {
  try {
    const feeds = await rssService.fetchAllFeeds();

    res.json({
      success: true,
      data: {
        feedsRefreshed: feeds.length,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('RSS refresh error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to refresh feeds',
    });
  }
});

export default router;
