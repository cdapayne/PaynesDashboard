import { Router, Response } from 'express';
import { optionalAuth, AuthenticatedRequest } from '../../middleware';

const router = Router();

// Get available widgets
router.get('/available', optionalAuth, (_req: AuthenticatedRequest, res: Response) => {
  const widgets = [
    {
      id: 'analytics',
      name: 'Analytics',
      description: 'App Store Connect, Google Play, book sales tracking',
      category: 'analytics',
      defaultSize: { w: 4, h: 3 },
      minSize: { w: 2, h: 2 },
      icon: '📊',
      enabled: true,
      comingSoon: false,
    },
    {
      id: 'social',
      name: 'Social Media',
      description: 'Facebook, YouTube, TikTok tracking',
      category: 'social-media',
      defaultSize: { w: 4, h: 3 },
      minSize: { w: 2, h: 2 },
      icon: '📱',
      enabled: true,
      comingSoon: false,
    },
    {
      id: 'affiliate',
      name: 'Affiliate Marketing',
      description: 'Amazon Associates tracking',
      category: 'affiliate',
      defaultSize: { w: 4, h: 3 },
      minSize: { w: 2, h: 2 },
      icon: '💰',
      enabled: true,
      comingSoon: false,
    },
    {
      id: 'rss',
      name: 'RSS Feeds',
      description: 'Aggregated content feeds',
      category: 'rss',
      defaultSize: { w: 6, h: 4 },
      minSize: { w: 3, h: 2 },
      icon: '📰',
      enabled: true,
      comingSoon: false,
    },
    {
      id: 'ai',
      name: 'AI Content',
      description: 'OpenAI powered content generation',
      category: 'ai',
      defaultSize: { w: 6, h: 4 },
      minSize: { w: 3, h: 2 },
      icon: '🤖',
      enabled: true,
      comingSoon: false,
    },
    {
      id: 'campaigns',
      name: 'Campaign Manager',
      description: 'OnlySocial and Postly integration',
      category: 'social-media',
      defaultSize: { w: 6, h: 4 },
      minSize: { w: 3, h: 3 },
      icon: '📅',
      enabled: false,
      comingSoon: true,
    },
  ];

  res.json({
    success: true,
    data: widgets,
  });
});

// Placeholder for widget data endpoints
router.get('/:widgetId/data', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const { widgetId } = req.params;

  // Placeholder data for different widget types
  const placeholderData: Record<string, unknown> = {
    analytics: {
      downloads: 1234,
      revenue: 5678.90,
      trend: '+12%',
      lastUpdated: new Date().toISOString(),
    },
    social: {
      facebook: { likes: 1500, followers: 2300 },
      youtube: { subscribers: 5000, views: 25000 },
      tiktok: { followers: 10000, likes: 150000 },
      lastUpdated: new Date().toISOString(),
    },
    affiliate: {
      clicks: 450,
      orders: 23,
      earnings: 89.45,
      lastUpdated: new Date().toISOString(),
    },
    rss: {
      items: [
        { title: 'Sample Feed Item 1', source: 'Blog A', date: new Date().toISOString() },
        { title: 'Sample Feed Item 2', source: 'Blog B', date: new Date().toISOString() },
        { title: 'Sample Feed Item 3', source: 'News C', date: new Date().toISOString() },
      ],
      lastUpdated: new Date().toISOString(),
    },
    ai: {
      recentGenerations: 5,
      tokensUsed: 2500,
      lastGeneration: 'App release notes for v2.0',
      lastUpdated: new Date().toISOString(),
    },
  };

  const data = placeholderData[widgetId];

  if (!data) {
    res.status(404).json({
      success: false,
      error: 'Widget not found',
    });
    return;
  }

  res.json({
    success: true,
    data,
  });
});

export default router;
