/**
 * Campaign Manager
 * 
 * Provides campaign management functionality for social media posts:
 * - Create, edit, and schedule posts
 * - Track campaign performance
 * - Manage multiple platform campaigns
 */

import type {
  Campaign,
  CampaignMetrics,
  SocialPost,
  SocialPlatform,
} from '../types/social.js';
import type { WidgetDataResult, AuthConfig } from '../types/index.js';

/**
 * Campaign status type
 */
export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed';

/**
 * Post scheduling options
 */
export interface ScheduleOptions {
  scheduledAt: Date;
  platforms: SocialPlatform[];
  autoPublish?: boolean;
  timezone?: string;
}

/**
 * Campaign creation options
 */
export interface CreateCampaignOptions {
  name: string;
  description?: string;
  platforms: SocialPlatform[];
  startDate?: Date;
  endDate?: Date;
}

/**
 * Campaign Manager class
 */
export class CampaignManager {
  private campaigns: Map<string, Campaign> = new Map();
  private connectors: Map<string, SocialConnector> = new Map();

  /**
   * Register a social media connector
   */
  registerConnector(connector: SocialConnector): void {
    this.connectors.set(connector.platform, connector);
  }

  /**
   * Get registered connector for a platform
   */
  getConnector(platform: SocialPlatform): SocialConnector | undefined {
    return this.connectors.get(platform);
  }

  /**
   * Create a new campaign
   */
  async createCampaign(options: CreateCampaignOptions): Promise<Campaign> {
    const campaign: Campaign = {
      id: this.generateId(),
      name: options.name,
      description: options.description,
      platforms: options.platforms,
      posts: [],
      startDate: options.startDate,
      endDate: options.endDate,
      status: 'draft',
    };

    this.campaigns.set(campaign.id, campaign);
    return campaign;
  }

  /**
   * Get a campaign by ID
   */
  getCampaign(campaignId: string): Campaign | undefined {
    return this.campaigns.get(campaignId);
  }

  /**
   * Get all campaigns
   */
  getAllCampaigns(): Campaign[] {
    return Array.from(this.campaigns.values());
  }

  /**
   * Update campaign status
   */
  async updateCampaignStatus(campaignId: string, status: CampaignStatus): Promise<Campaign | undefined> {
    const campaign = this.campaigns.get(campaignId);
    if (campaign) {
      campaign.status = status;
      return campaign;
    }
    return undefined;
  }

  /**
   * Delete a campaign
   */
  async deleteCampaign(campaignId: string): Promise<boolean> {
    return this.campaigns.delete(campaignId);
  }

  /**
   * Add a post to a campaign
   */
  async addPostToCampaign(
    campaignId: string,
    content: string,
    platforms: SocialPlatform[],
    scheduleOptions?: ScheduleOptions
  ): Promise<SocialPost | undefined> {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) {
      return undefined;
    }

    const post: SocialPost = {
      id: this.generateId(),
      platform: platforms[0] ?? 'facebook',
      content,
      status: scheduleOptions ? 'scheduled' : 'draft',
      scheduledAt: scheduleOptions?.scheduledAt,
    };

    campaign.posts.push(post);
    return post;
  }

  /**
   * Schedule a post for publishing
   */
  async schedulePost(
    campaignId: string,
    postId: string,
    options: ScheduleOptions
  ): Promise<SocialPost | undefined> {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) {
      return undefined;
    }

    const post = campaign.posts.find(p => p.id === postId);
    if (!post) {
      return undefined;
    }

    post.scheduledAt = options.scheduledAt;
    post.status = 'scheduled';

    // Schedule with each platform connector
    for (const platform of options.platforms) {
      const connector = this.connectors.get(platform);
      if (connector) {
        await connector.schedulePost(post);
      }
    }

    return post;
  }

  /**
   * Publish a post immediately
   */
  async publishPost(
    campaignId: string,
    postId: string,
    platforms: SocialPlatform[]
  ): Promise<SocialPost | undefined> {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) {
      return undefined;
    }

    const post = campaign.posts.find(p => p.id === postId);
    if (!post) {
      return undefined;
    }

    // Publish to each platform
    for (const platform of platforms) {
      const connector = this.connectors.get(platform);
      if (connector) {
        await connector.publishPost(post);
      }
    }

    post.status = 'published';
    post.publishedAt = new Date();

    return post;
  }

  /**
   * Get campaign performance metrics
   */
  async getCampaignMetrics(campaignId: string): Promise<WidgetDataResult<CampaignMetrics>> {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) {
      return {
        status: 'error',
        error: {
          code: 'NOT_FOUND',
          message: 'Campaign not found',
          timestamp: new Date(),
          recoverable: false,
        },
        lastUpdated: new Date(),
      };
    }

    const platformBreakdown: CampaignMetrics['platformBreakdown'] = [];
    let totalReach = 0;
    let totalEngagements = 0;
    let totalImpressions = 0;

    // Aggregate metrics from each platform
    for (const platform of campaign.platforms) {
      const connector = this.connectors.get(platform);
      if (connector) {
        const platformMetrics = await connector.getPostMetrics(campaign.posts);
        platformBreakdown.push({
          platform,
          reach: platformMetrics.reach,
          engagements: platformMetrics.engagements,
          impressions: platformMetrics.impressions,
        });
        totalReach += platformMetrics.reach;
        totalEngagements += platformMetrics.engagements;
        totalImpressions += platformMetrics.impressions;
      }
    }

    const engagementRate = totalImpressions > 0 
      ? (totalEngagements / totalImpressions) * 100 
      : 0;

    const metrics: CampaignMetrics = {
      totalReach,
      totalEngagements,
      totalImpressions,
      engagementRate,
      platformBreakdown,
    };

    return {
      status: 'success',
      data: metrics,
      lastUpdated: new Date(),
    };
  }

  /**
   * Generate a unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}

/**
 * Abstract interface for social media platform connectors
 */
export interface SocialConnector {
  platform: SocialPlatform;
  
  /**
   * Initialize the connector with authentication
   */
  initialize(authConfig: AuthConfig): Promise<void>;
  
  /**
   * Check if connected and authenticated
   */
  isConnected(): boolean;
  
  /**
   * Schedule a post for future publishing
   */
  schedulePost(post: SocialPost): Promise<void>;
  
  /**
   * Publish a post immediately
   */
  publishPost(post: SocialPost): Promise<void>;
  
  /**
   * Get metrics for published posts
   */
  getPostMetrics(posts: SocialPost[]): Promise<{
    reach: number;
    engagements: number;
    impressions: number;
  }>;
  
  /**
   * Delete a scheduled or published post
   */
  deletePost(postId: string): Promise<boolean>;
}

/**
 * Default campaign manager singleton
 */
export const defaultCampaignManager = new CampaignManager();
