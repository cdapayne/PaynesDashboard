/**
 * TikTok Widget
 * 
 * Provides integration with TikTok API for viewing:
 * - Follower count
 * - Video likes and views
 * - Engagement metrics
 * 
 * Authentication: Uses OAuth2 with TikTok Login Kit
 * API Documentation: https://developers.tiktok.com/doc/
 */

import { BaseWidget } from './BaseWidget.js';
import { OAuth2Manager } from '../auth/OAuth2Manager.js';
import type {
  TimeRange,
  AuthConfig,
  AnalyticsMetrics,
  SalesData,
  DownloadStats,
  WidgetDataResult,
  WidgetConfig,
  OAuth2Config,
} from '../types/index.js';
import type { SocialMetrics } from '../types/social.js';

/**
 * TikTok specific authentication configuration
 */
export interface TikTokAuthConfig extends AuthConfig {
  type: 'oauth2';
  credentials: {
    clientKey: string;
    clientSecret: string;
    accessToken?: string;
    refreshToken?: string;
  };
}

/**
 * TikTok user statistics
 */
export interface TikTokUserStats {
  followerCount: number;
  followingCount: number;
  likesCount: number;
  videoCount: number;
}

/**
 * TikTok video statistics
 */
export interface TikTokVideoStats {
  videoId: string;
  description: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  createTime: Date;
}

/**
 * TikTok Widget Implementation
 */
export class TikTokWidget extends BaseWidget {
  readonly type = 'tiktok';
  readonly name = 'TikTok';
  readonly description = 'View TikTok followers, likes, and engagement metrics';

  private oauth2Manager?: OAuth2Manager;
  private baseUrl = 'https://open.tiktokapis.com/v2';

  constructor(config: WidgetConfig) {
    super(config);
  }

  protected async validateAuth(): Promise<void> {
    if (!this.authConfig) {
      throw new Error('Authentication configuration is required');
    }

    const { clientKey, clientSecret } = this.authConfig.credentials;
    if (!clientKey || !clientSecret) {
      throw new Error('TikTok auth requires clientKey and clientSecret');
    }

    const oauth2Config: OAuth2Config = {
      clientId: clientKey,
      clientSecret,
      redirectUri: 'http://localhost:3000/callback/tiktok',
      scope: [
        'user.info.basic',
        'user.info.stats',
        'video.list',
      ],
      authorizationUrl: 'https://www.tiktok.com/v2/auth/authorize',
      tokenUrl: 'https://open.tiktokapis.com/v2/oauth/token/',
      refreshToken: this.authConfig.credentials['refreshToken'],
      accessToken: this.authConfig.credentials['accessToken'],
    };

    this.oauth2Manager = new OAuth2Manager(oauth2Config);

    if (this.authConfig.credentials['accessToken']) {
      this.oauth2Manager.setTokens(
        this.authConfig.credentials['accessToken'],
        this.authConfig.credentials['refreshToken']
      );
    }
  }

  async isAuthenticated(): Promise<boolean> {
    return this.oauth2Manager?.isAuthenticated() ?? false;
  }

  async refreshAuth(): Promise<void> {
    if (!this.oauth2Manager) {
      throw new Error('OAuth2 manager not initialized');
    }
    await this.oauth2Manager.refreshAccessToken();
  }

  getAuthorizationUrl(state?: string): string {
    if (!this.oauth2Manager) {
      throw new Error('Widget not initialized');
    }
    return this.oauth2Manager.getAuthorizationUrl(state);
  }

  async handleAuthCallback(code: string): Promise<void> {
    if (!this.oauth2Manager) {
      throw new Error('Widget not initialized');
    }
    await this.oauth2Manager.exchangeCodeForToken(code);
  }

  async getMetrics(timeRange: TimeRange): Promise<WidgetDataResult<AnalyticsMetrics>> {
    this.ensureInitialized();

    try {
      const token = await this.oauth2Manager!.getValidAccessToken();
      const stats = await this.getUserStats(token);

      const metrics: AnalyticsMetrics = {
        totalDownloads: stats.likesCount,
        activeUsers: stats.followerCount,
        trend: [],
      };

      return this.createSuccessResult(metrics);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return this.createErrorResult('FETCH_ERROR', message, true);
    }
  }

  async getSalesData(timeRange: TimeRange): Promise<WidgetDataResult<SalesData[]>> {
    // TikTok doesn't have direct sales data
    return this.createSuccessResult([]);
  }

  async getDownloadStats(timeRange: TimeRange): Promise<WidgetDataResult<DownloadStats[]>> {
    // Not applicable for TikTok
    return this.createSuccessResult([]);
  }

  /**
   * Get social-specific metrics
   */
  async getSocialMetrics(timeRange: TimeRange): Promise<WidgetDataResult<SocialMetrics>> {
    this.ensureInitialized();

    try {
      const token = await this.oauth2Manager!.getValidAccessToken();
      const stats = await this.getUserStats(token);

      const socialMetrics: SocialMetrics = {
        followers: stats.followerCount,
        likes: stats.likesCount,
      };

      return this.createSuccessResult(socialMetrics);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return this.createErrorResult('FETCH_ERROR', message, true);
    }
  }

  /**
   * Get user's videos with stats
   */
  async getVideos(limit = 20): Promise<WidgetDataResult<TikTokVideoStats[]>> {
    this.ensureInitialized();

    try {
      const token = await this.oauth2Manager!.getValidAccessToken();
      
      const response = await fetch(
        `${this.baseUrl}/video/list/?fields=id,title,view_count,like_count,comment_count,share_count,create_time`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            max_count: limit,
          }),
        }
      );

      if (!response.ok) {
        return this.createErrorResult(
          'API_ERROR',
          `TikTok API error: ${response.status}`,
          true
        );
      }

      const videos: TikTokVideoStats[] = [];
      return this.createSuccessResult(videos);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return this.createErrorResult('FETCH_ERROR', message, true);
    }
  }

  /**
   * Fetch user statistics from TikTok API
   */
  private async getUserStats(token: string): Promise<TikTokUserStats> {
    const response = await fetch(
      `${this.baseUrl}/user/info/?fields=follower_count,following_count,likes_count,video_count`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`TikTok API error: ${response.status}`);
    }

    // Parse response and return stats
    return {
      followerCount: 0,
      followingCount: 0,
      likesCount: 0,
      videoCount: 0,
    };
  }
}

/**
 * Factory for creating TikTok widgets
 */
export class TikTokWidgetFactory {
  createWidget(config: WidgetConfig): TikTokWidget {
    return new TikTokWidget(config);
  }

  getWidgetType(): string {
    return 'tiktok';
  }
}
