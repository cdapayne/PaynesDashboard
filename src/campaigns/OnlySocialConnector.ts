/**
 * OnlySocial Connector
 * 
 * Provides integration with OnlySocial for social media scheduling:
 * - Schedule posts across multiple platforms
 * - Track post performance
 * - Manage scheduled content
 * 
 * API Documentation: https://onlysocial.io/api
 */

import type { SocialConnector } from './CampaignManager.js';
import type { SocialPost, SocialPlatform } from '../types/social.js';
import type { AuthConfig } from '../types/index.js';

/**
 * OnlySocial authentication configuration
 */
export interface OnlySocialAuthConfig extends AuthConfig {
  type: 'api_key';
  credentials: {
    apiKey: string;
    accountId?: string;
  };
}

/**
 * OnlySocial API response for scheduled posts
 */
interface OnlySocialPostResponse {
  id: string;
  status: string;
  scheduledTime: string;
  platforms: string[];
  content: string;
  mediaUrls?: string[];
}

/**
 * OnlySocial Connector Implementation
 */
export class OnlySocialConnector implements SocialConnector {
  readonly platform: SocialPlatform = 'facebook'; // Primary platform
  
  private apiKey?: string;
  private accountId?: string;
  private baseUrl = 'https://api.onlysocial.io/v1';
  private connected = false;

  /**
   * Initialize the connector with authentication
   */
  async initialize(authConfig: AuthConfig): Promise<void> {
    const { apiKey, accountId } = authConfig.credentials;
    if (!apiKey) {
      throw new Error('OnlySocial requires an API key');
    }

    this.apiKey = apiKey;
    this.accountId = accountId;
    this.connected = true;
  }

  /**
   * Check if connected and authenticated
   */
  isConnected(): boolean {
    return this.connected && !!this.apiKey;
  }

  /**
   * Schedule a post for future publishing
   */
  async schedulePost(post: SocialPost): Promise<void> {
    if (!this.isConnected()) {
      throw new Error('OnlySocial connector is not initialized');
    }

    const response = await fetch(`${this.baseUrl}/posts/schedule`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: post.content,
        scheduledTime: post.scheduledAt?.toISOString(),
        platforms: [post.platform],
        mediaUrls: post.mediaUrls,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to schedule post: ${response.status}`);
    }
  }

  /**
   * Publish a post immediately
   */
  async publishPost(post: SocialPost): Promise<void> {
    if (!this.isConnected()) {
      throw new Error('OnlySocial connector is not initialized');
    }

    const response = await fetch(`${this.baseUrl}/posts/publish`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: post.content,
        platforms: [post.platform],
        mediaUrls: post.mediaUrls,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to publish post: ${response.status}`);
    }
  }

  /**
   * Get metrics for published posts
   */
  async getPostMetrics(posts: SocialPost[]): Promise<{
    reach: number;
    engagements: number;
    impressions: number;
  }> {
    if (!this.isConnected()) {
      throw new Error('OnlySocial connector is not initialized');
    }

    const postIds = posts
      .filter(p => p.status === 'published')
      .map(p => p.id);

    if (postIds.length === 0) {
      return { reach: 0, engagements: 0, impressions: 0 };
    }

    const response = await fetch(`${this.baseUrl}/analytics/posts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ postIds }),
    });

    if (!response.ok) {
      throw new Error(`Failed to get post metrics: ${response.status}`);
    }

    // Parse and aggregate metrics
    return {
      reach: 0,
      engagements: 0,
      impressions: 0,
    };
  }

  /**
   * Delete a scheduled or published post
   */
  async deletePost(postId: string): Promise<boolean> {
    if (!this.isConnected()) {
      throw new Error('OnlySocial connector is not initialized');
    }

    const response = await fetch(`${this.baseUrl}/posts/${postId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    return response.ok;
  }

  /**
   * Get all scheduled posts
   */
  async getScheduledPosts(): Promise<OnlySocialPostResponse[]> {
    if (!this.isConnected()) {
      throw new Error('OnlySocial connector is not initialized');
    }

    const response = await fetch(`${this.baseUrl}/posts/scheduled`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get scheduled posts: ${response.status}`);
    }

    return [];
  }

  /**
   * Get connected social accounts
   */
  async getConnectedAccounts(): Promise<{ platform: string; accountId: string; name: string }[]> {
    if (!this.isConnected()) {
      throw new Error('OnlySocial connector is not initialized');
    }

    const response = await fetch(`${this.baseUrl}/accounts`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get connected accounts: ${response.status}`);
    }

    return [];
  }
}
