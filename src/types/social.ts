/**
 * Social Media Widget Types
 * 
 * Types and interfaces for social media analytics widgets
 */

/**
 * Social media engagement metrics
 */
export interface SocialMetrics {
  followers?: number;
  likes?: number;
  shares?: number;
  comments?: number;
  views?: number;
  engagementRate?: number;
  reachCount?: number;
}

/**
 * Social media post data
 */
export interface SocialPost {
  id: string;
  platform: SocialPlatform;
  content: string;
  mediaUrls?: string[];
  publishedAt?: Date;
  scheduledAt?: Date;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  metrics?: SocialMetrics;
}

/**
 * Supported social media platforms
 */
export type SocialPlatform = 'facebook' | 'youtube' | 'tiktok' | 'twitter' | 'instagram';

/**
 * RSS feed item
 */
export interface RSSFeedItem {
  id: string;
  title: string;
  link: string;
  description?: string;
  pubDate?: Date;
  author?: string;
  categories?: string[];
  content?: string;
  thumbnail?: string;
}

/**
 * RSS feed configuration
 */
export interface RSSFeedConfig {
  id: string;
  name: string;
  url: string;
  refreshInterval?: number;
  maxItems?: number;
  categories?: string[];
}

/**
 * Aggregated RSS feed data
 */
export interface RSSFeedData {
  feed: RSSFeedConfig;
  items: RSSFeedItem[];
  lastFetched: Date;
  error?: string;
}

/**
 * Amazon affiliate analytics
 */
export interface AmazonAffiliateMetrics {
  clicks: number;
  conversions: number;
  revenue: number;
  currency: string;
  topProducts: {
    asin: string;
    title: string;
    clicks: number;
    conversions: number;
    earnings: number;
  }[];
}

/**
 * Widget position for drag-and-drop
 */
export interface WidgetPosition {
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex?: number;
}

/**
 * Dashboard layout configuration
 */
export interface DashboardLayout {
  id: string;
  name: string;
  widgets: {
    widgetId: string;
    position: WidgetPosition;
    visible: boolean;
  }[];
}

/**
 * Campaign data for social media management
 */
export interface Campaign {
  id: string;
  name: string;
  description?: string;
  platforms: SocialPlatform[];
  posts: SocialPost[];
  startDate?: Date;
  endDate?: Date;
  status: 'draft' | 'active' | 'paused' | 'completed';
  metrics?: CampaignMetrics;
}

/**
 * Aggregated campaign performance metrics
 */
export interface CampaignMetrics {
  totalReach: number;
  totalEngagements: number;
  totalImpressions: number;
  engagementRate: number;
  platformBreakdown: {
    platform: SocialPlatform;
    reach: number;
    engagements: number;
    impressions: number;
  }[];
}

/**
 * AI content generation request
 */
export interface AIContentRequest {
  type: 'app_writeup' | 'release_notes' | 'social_copy' | 'book_blurb' | 'marketing_copy';
  prompt: string;
  context?: Record<string, string>;
  maxTokens?: number;
  temperature?: number;
  style?: 'professional' | 'casual' | 'creative' | 'technical';
}

/**
 * AI content generation response
 */
export interface AIContentResponse {
  content: string;
  tokensUsed: number;
  estimatedCost: number;
  generatedAt: Date;
}
