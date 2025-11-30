/**
 * Tests for Social & Campaign Management (Phases 3-4)
 */

import {
  FacebookWidget,
  YouTubeWidget,
  TikTokWidget,
  AmazonAffiliateWidget,
  RSSFeedWidget,
  WidgetRegistry,
} from '../src/widgets/index.js';
import {
  CampaignManager,
  OnlySocialConnector,
  PostlyConnector,
} from '../src/campaigns/index.js';
import type { WidgetConfig, AuthConfig } from '../src/types/index.js';

describe('Phase 3: Social Widgets', () => {
  let registry: WidgetRegistry;

  beforeEach(() => {
    registry = new WidgetRegistry();
  });

  afterEach(async () => {
    await registry.disconnectAll();
  });

  describe('Widget Registration', () => {
    it('should have all Phase 3 widgets registered', () => {
      const types = registry.getRegisteredTypes();
      expect(types).toContain('facebook');
      expect(types).toContain('youtube');
      expect(types).toContain('tiktok');
      expect(types).toContain('amazon_affiliate');
      expect(types).toContain('rss_feed');
    });
  });

  describe('FacebookWidget', () => {
    it('should create Facebook widget', async () => {
      const config: WidgetConfig = {
        id: 'test-facebook',
        type: 'facebook',
        displayConfig: { title: 'Facebook Stats' },
        authConfigId: 'fb-auth',
        customConfig: { pageId: 'test-page' },
      };

      const widget = await registry.createWidget(config);
      expect(widget).toBeInstanceOf(FacebookWidget);
      expect(widget.type).toBe('facebook');
      expect(widget.name).toBe('Facebook');
    });
  });

  describe('YouTubeWidget', () => {
    it('should create YouTube widget', async () => {
      const config: WidgetConfig = {
        id: 'test-youtube',
        type: 'youtube',
        displayConfig: { title: 'YouTube Stats' },
        authConfigId: 'yt-auth',
        customConfig: { channelId: 'test-channel' },
      };

      const widget = await registry.createWidget(config);
      expect(widget).toBeInstanceOf(YouTubeWidget);
      expect(widget.type).toBe('youtube');
    });
  });

  describe('TikTokWidget', () => {
    it('should create TikTok widget', async () => {
      const config: WidgetConfig = {
        id: 'test-tiktok',
        type: 'tiktok',
        displayConfig: { title: 'TikTok Stats' },
        authConfigId: 'tt-auth',
      };

      const widget = await registry.createWidget(config);
      expect(widget).toBeInstanceOf(TikTokWidget);
      expect(widget.type).toBe('tiktok');
    });
  });

  describe('AmazonAffiliateWidget', () => {
    it('should create Amazon Affiliate widget', async () => {
      const config: WidgetConfig = {
        id: 'test-amazon',
        type: 'amazon_affiliate',
        displayConfig: { title: 'Amazon Analytics' },
        authConfigId: 'amz-auth',
      };

      const widget = await registry.createWidget(config);
      expect(widget).toBeInstanceOf(AmazonAffiliateWidget);
      expect(widget.type).toBe('amazon_affiliate');
    });
  });

  describe('RSSFeedWidget', () => {
    it('should create RSS Feed widget', async () => {
      const config: WidgetConfig = {
        id: 'test-rss',
        type: 'rss_feed',
        displayConfig: { title: 'News Feed' },
        authConfigId: 'rss-auth',
        customConfig: {
          feeds: [
            { id: 'feed1', name: 'Test Feed', url: 'https://example.com/feed.xml' },
          ],
        },
      };

      const widget = await registry.createWidget(config);
      expect(widget).toBeInstanceOf(RSSFeedWidget);
      expect(widget.type).toBe('rss_feed');
    });

    it('should add and remove feeds', () => {
      const config: WidgetConfig = {
        id: 'test-rss-feeds',
        type: 'rss_feed',
        displayConfig: { title: 'News Feed' },
        authConfigId: 'rss-auth',
        customConfig: {
          feeds: [
            { id: 'feed1', name: 'Test Feed', url: 'https://example.com/feed.xml' },
          ],
        },
      };

      const widget = new RSSFeedWidget(config);
      
      // Add a feed
      widget.addFeed({ id: 'feed2', name: 'Feed 2', url: 'https://example.com/feed2.xml' });
      expect(widget.getFeeds()).toHaveLength(2);
      
      // Remove a feed
      const removed = widget.removeFeed('feed2');
      expect(removed).toBe(true);
      expect(widget.getFeeds()).toHaveLength(1);
    });
  });
});

describe('Phase 4: Campaign Management', () => {
  let campaignManager: CampaignManager;

  beforeEach(() => {
    campaignManager = new CampaignManager();
  });

  describe('Campaign Creation', () => {
    it('should create a campaign', async () => {
      const campaign = await campaignManager.createCampaign({
        name: 'Test Campaign',
        description: 'A test campaign',
        platforms: ['facebook', 'twitter'],
      });

      expect(campaign.id).toBeDefined();
      expect(campaign.name).toBe('Test Campaign');
      expect(campaign.status).toBe('draft');
      expect(campaign.platforms).toContain('facebook');
    });

    it('should retrieve a campaign by ID', async () => {
      const created = await campaignManager.createCampaign({
        name: 'Retrieve Test',
        platforms: ['instagram'],
      });

      const retrieved = campaignManager.getCampaign(created.id);
      expect(retrieved).toBeDefined();
      expect(retrieved?.name).toBe('Retrieve Test');
    });

    it('should get all campaigns', async () => {
      await campaignManager.createCampaign({ name: 'Campaign 1', platforms: ['facebook'] });
      await campaignManager.createCampaign({ name: 'Campaign 2', platforms: ['twitter'] });

      const all = campaignManager.getAllCampaigns();
      expect(all).toHaveLength(2);
    });

    it('should delete a campaign', async () => {
      const campaign = await campaignManager.createCampaign({
        name: 'Delete Test',
        platforms: ['facebook'],
      });

      const deleted = await campaignManager.deleteCampaign(campaign.id);
      expect(deleted).toBe(true);
      expect(campaignManager.getCampaign(campaign.id)).toBeUndefined();
    });
  });

  describe('Campaign Status', () => {
    it('should update campaign status', async () => {
      const campaign = await campaignManager.createCampaign({
        name: 'Status Test',
        platforms: ['facebook'],
      });

      const updated = await campaignManager.updateCampaignStatus(campaign.id, 'active');
      expect(updated?.status).toBe('active');
    });
  });

  describe('Post Management', () => {
    it('should add a post to a campaign', async () => {
      const campaign = await campaignManager.createCampaign({
        name: 'Post Test',
        platforms: ['facebook'],
      });

      const post = await campaignManager.addPostToCampaign(
        campaign.id,
        'Test post content',
        ['facebook']
      );

      expect(post).toBeDefined();
      expect(post?.content).toBe('Test post content');
      expect(post?.status).toBe('draft');
    });
  });

  describe('Connectors', () => {
    it('should register OnlySocial connector', () => {
      const connector = new OnlySocialConnector();
      campaignManager.registerConnector(connector);

      const retrieved = campaignManager.getConnector('facebook');
      expect(retrieved).toBeDefined();
    });

    it('should register Postly connector', () => {
      const connector = new PostlyConnector();
      campaignManager.registerConnector(connector);

      const retrieved = campaignManager.getConnector('facebook');
      expect(retrieved).toBeDefined();
    });
  });
});
