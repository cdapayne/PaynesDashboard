/**
 * RSS Feed Widget
 * 
 * Provides RSS feed aggregation functionality for displaying:
 * - Multiple RSS feed sources
 * - Configurable refresh intervals
 * - Category filtering
 * 
 * No authentication required for public RSS feeds
 */

import { BaseWidget } from './BaseWidget.js';
import type {
  TimeRange,
  AuthConfig,
  AnalyticsMetrics,
  SalesData,
  DownloadStats,
  WidgetDataResult,
  WidgetConfig,
} from '../types/index.js';
import type { RSSFeedConfig, RSSFeedData, RSSFeedItem } from '../types/social.js';

/**
 * RSS Feed specific configuration
 */
export interface RSSWidgetConfig extends WidgetConfig {
  customConfig: {
    feeds: RSSFeedConfig[];
    refreshInterval?: number;
    maxItemsPerFeed?: number;
    showImages?: boolean;
  };
}

/**
 * RSS Feed Widget Implementation
 */
export class RSSFeedWidget extends BaseWidget {
  readonly type = 'rss_feed';
  readonly name = 'RSS Feed';
  readonly description = 'Aggregate and display RSS feeds from multiple sources';

  private feeds: RSSFeedConfig[] = [];
  private feedData: Map<string, RSSFeedData> = new Map();
  private refreshInterval = 300000; // 5 minutes default
  private maxItemsPerFeed = 10;

  constructor(config: WidgetConfig) {
    super(config);
    const customConfig = config.customConfig as RSSWidgetConfig['customConfig'] | undefined;
    if (customConfig) {
      this.feeds = customConfig.feeds ?? [];
      this.refreshInterval = customConfig.refreshInterval ?? this.refreshInterval;
      this.maxItemsPerFeed = customConfig.maxItemsPerFeed ?? this.maxItemsPerFeed;
    }
  }

  protected async validateAuth(): Promise<void> {
    // RSS feeds typically don't require authentication
    // Just validate that we have at least one feed configured
    if (this.feeds.length === 0) {
      throw new Error('At least one RSS feed must be configured');
    }
  }

  async isAuthenticated(): Promise<boolean> {
    // RSS feeds don't require authentication
    return true;
  }

  async refreshAuth(): Promise<void> {
    // No authentication to refresh
  }

  async getMetrics(timeRange: TimeRange): Promise<WidgetDataResult<AnalyticsMetrics>> {
    this.ensureInitialized();

    try {
      await this.fetchAllFeeds();

      let totalItems = 0;
      for (const feedData of this.feedData.values()) {
        totalItems += feedData.items.length;
      }

      const metrics: AnalyticsMetrics = {
        totalDownloads: totalItems,
        activeUsers: this.feeds.length,
        trend: [],
      };

      return this.createSuccessResult(metrics);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return this.createErrorResult('FETCH_ERROR', message, true);
    }
  }

  async getSalesData(timeRange: TimeRange): Promise<WidgetDataResult<SalesData[]>> {
    // Not applicable for RSS feeds
    return this.createSuccessResult([]);
  }

  async getDownloadStats(timeRange: TimeRange): Promise<WidgetDataResult<DownloadStats[]>> {
    // Not applicable for RSS feeds
    return this.createSuccessResult([]);
  }

  /**
   * Add a new RSS feed to the widget
   */
  addFeed(feed: RSSFeedConfig): void {
    const existing = this.feeds.find(f => f.id === feed.id);
    if (existing) {
      throw new Error(`Feed with id '${feed.id}' already exists`);
    }
    this.feeds.push(feed);
  }

  /**
   * Remove an RSS feed from the widget
   */
  removeFeed(feedId: string): boolean {
    const index = this.feeds.findIndex(f => f.id === feedId);
    if (index !== -1) {
      this.feeds.splice(index, 1);
      this.feedData.delete(feedId);
      return true;
    }
    return false;
  }

  /**
   * Get all configured feeds
   */
  getFeeds(): RSSFeedConfig[] {
    return [...this.feeds];
  }

  /**
   * Fetch all RSS feeds and update data
   */
  async fetchAllFeeds(): Promise<WidgetDataResult<RSSFeedData[]>> {
    this.ensureInitialized();

    try {
      const fetchPromises = this.feeds.map(feed => this.fetchFeed(feed));
      const results = await Promise.allSettled(fetchPromises);

      const feedDataArray: RSSFeedData[] = [];

      results.forEach((result, index) => {
        const feed = this.feeds[index];
        if (!feed) return;

        if (result.status === 'fulfilled') {
          this.feedData.set(feed.id, result.value);
          feedDataArray.push(result.value);
        } else {
          const errorData: RSSFeedData = {
            feed,
            items: [],
            lastFetched: new Date(),
            error: result.reason instanceof Error ? result.reason.message : 'Unknown error',
          };
          this.feedData.set(feed.id, errorData);
          feedDataArray.push(errorData);
        }
      });

      return this.createSuccessResult(feedDataArray);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return this.createErrorResult('FETCH_ERROR', message, true);
    }
  }

  /**
   * Get cached feed data
   */
  getCachedFeedData(): Map<string, RSSFeedData> {
    return new Map(this.feedData);
  }

  /**
   * Get all items from all feeds, sorted by date
   */
  async getAllItems(limit?: number): Promise<WidgetDataResult<RSSFeedItem[]>> {
    this.ensureInitialized();

    try {
      await this.fetchAllFeeds();

      const allItems: RSSFeedItem[] = [];
      for (const feedData of this.feedData.values()) {
        allItems.push(...feedData.items);
      }

      // Sort by publish date, newest first
      allItems.sort((a, b) => {
        const dateA = a.pubDate?.getTime() ?? 0;
        const dateB = b.pubDate?.getTime() ?? 0;
        return dateB - dateA;
      });

      const limitedItems = limit ? allItems.slice(0, limit) : allItems;
      return this.createSuccessResult(limitedItems);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return this.createErrorResult('FETCH_ERROR', message, true);
    }
  }

  /**
   * Fetch a single RSS feed
   */
  private async fetchFeed(feed: RSSFeedConfig): Promise<RSSFeedData> {
    const response = await fetch(feed.url);

    if (!response.ok) {
      throw new Error(`Failed to fetch RSS feed: ${response.status}`);
    }

    const text = await response.text();
    const items = this.parseRSSFeed(text, feed);

    return {
      feed,
      items: items.slice(0, feed.maxItems ?? this.maxItemsPerFeed),
      lastFetched: new Date(),
    };
  }

  /**
   * Parse RSS/Atom feed XML into items
   */
  private parseRSSFeed(xml: string, feed: RSSFeedConfig): RSSFeedItem[] {
    // Basic XML parsing - in production, use a proper XML parser like xml2js
    const items: RSSFeedItem[] = [];

    // Simple regex-based parsing for RSS 2.0 format
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
    const titleRegex = /<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i;
    const linkRegex = /<link>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/i;
    const descriptionRegex = /<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i;
    const pubDateRegex = /<pubDate>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/pubDate>/i;
    const authorRegex = /<(?:author|dc:creator)>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/(?:author|dc:creator)>/i;

    let match;
    let index = 0;
    while ((match = itemRegex.exec(xml)) !== null) {
      const itemXml = match[1] ?? '';
      
      const titleMatch = titleRegex.exec(itemXml);
      const linkMatch = linkRegex.exec(itemXml);
      const descMatch = descriptionRegex.exec(itemXml);
      const pubDateMatch = pubDateRegex.exec(itemXml);
      const authorMatch = authorRegex.exec(itemXml);

      const item: RSSFeedItem = {
        id: `${feed.id}-${index++}`,
        title: titleMatch?.[1]?.trim() ?? 'Untitled',
        link: linkMatch?.[1]?.trim() ?? '',
        description: descMatch?.[1]?.trim(),
        pubDate: pubDateMatch?.[1] ? new Date(pubDateMatch[1]) : undefined,
        author: authorMatch?.[1]?.trim(),
      };

      items.push(item);
    }

    return items;
  }
}

/**
 * Factory for creating RSS Feed widgets
 */
export class RSSFeedWidgetFactory {
  createWidget(config: WidgetConfig): RSSFeedWidget {
    return new RSSFeedWidget(config);
  }

  getWidgetType(): string {
    return 'rss_feed';
  }
}
