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
