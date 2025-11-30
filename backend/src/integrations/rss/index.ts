/**
 * RSS Feed Integration
 * 
 * This module handles:
 * - RSS feed aggregation
 * - Feed parsing and normalization
 * - Caching and refresh management
 */

import Parser from 'rss-parser';

export interface RSSFeedItem {
  title: string;
  description: string;
  link: string;
  pubDate: Date;
  source: string;
  author?: string;
  categories?: string[];
}

export interface RSSFeed {
  url: string;
  title: string;
  description?: string;
  items: RSSFeedItem[];
  lastFetched: Date;
}

export interface RSSConfig {
  feedUrls: string[];
  refreshInterval: number; // in minutes
  maxItems: number;
}

export class RSSService {
  private parser: Parser;
  private feeds: Map<string, RSSFeed> = new Map();
  private feedUrls: string[] = [];

  constructor() {
    this.parser = new Parser({
      timeout: 10000,
      customFields: {
        item: ['author', 'dc:creator'],
      },
    });

    // Load feed URLs from environment
    const envUrls = process.env.RSS_FEED_URLS;
    if (envUrls) {
      this.feedUrls = envUrls.split(',').map(url => url.trim()).filter(Boolean);
    }
  }

  async fetchFeed(url: string): Promise<RSSFeed | null> {
    try {
      const feed = await this.parser.parseURL(url);
      
      const rssFeed: RSSFeed = {
        url,
        title: feed.title || 'Unknown Feed',
        description: feed.description,
        items: feed.items.map(item => ({
          title: item.title || 'Untitled',
          description: item.contentSnippet || item.content || '',
          link: item.link || '',
          pubDate: item.pubDate ? new Date(item.pubDate) : new Date(),
          source: feed.title || url,
          author: item.creator || item.author,
          categories: item.categories,
        })),
        lastFetched: new Date(),
      };

      this.feeds.set(url, rssFeed);
      return rssFeed;
    } catch (error) {
      console.error(`Error fetching RSS feed from ${url}:`, error);
      return null;
    }
  }

  async fetchAllFeeds(): Promise<RSSFeed[]> {
    const results = await Promise.allSettled(
      this.feedUrls.map(url => this.fetchFeed(url))
    );

    return results
      .filter((result): result is PromiseFulfilledResult<RSSFeed | null> => 
        result.status === 'fulfilled' && result.value !== null
      )
      .map(result => result.value as RSSFeed);
  }

  async addFeed(url: string): Promise<boolean> {
    if (this.feedUrls.includes(url)) {
      return false;
    }

    const feed = await this.fetchFeed(url);
    if (feed) {
      this.feedUrls.push(url);
      return true;
    }
    return false;
  }

  async removeFeed(url: string): Promise<boolean> {
    const index = this.feedUrls.indexOf(url);
    if (index === -1) {
      return false;
    }

    this.feedUrls.splice(index, 1);
    this.feeds.delete(url);
    return true;
  }

  getAggregatedItems(limit: number = 20): RSSFeedItem[] {
    const allItems: RSSFeedItem[] = [];

    for (const feed of this.feeds.values()) {
      allItems.push(...feed.items);
    }

    // Sort by date (newest first) and limit
    return allItems
      .sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime())
      .slice(0, limit);
  }

  getFeedUrls(): string[] {
    return [...this.feedUrls];
  }

  getCachedFeeds(): RSSFeed[] {
    return Array.from(this.feeds.values());
  }
}

export const rssService = new RSSService();
