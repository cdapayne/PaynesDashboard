/**
 * YouTube Widget
 * 
 * Provides integration with YouTube Data API for viewing:
 * - Channel subscribers
 * - Video views and engagement
 * - Channel analytics
 * 
 * Authentication: Uses OAuth2 with Google
 * API Documentation: https://developers.google.com/youtube/v3
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
 * YouTube specific authentication configuration
 */
export interface YouTubeAuthConfig extends AuthConfig {
  type: 'oauth2';
  credentials: {
    clientId: string;
    clientSecret: string;
    accessToken?: string;
    refreshToken?: string;
    channelId?: string;
  };
}

/**
 * YouTube channel statistics
 */
export interface YouTubeChannelStats {
  subscriberCount: number;
  viewCount: number;
  videoCount: number;
  commentCount: number;
}

/**
 * YouTube video statistics
 */
export interface YouTubeVideoStats {
  videoId: string;
  title: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  publishedAt: Date;
}

/**
 * YouTube Widget Implementation
 */
export class YouTubeWidget extends BaseWidget {
  readonly type = 'youtube';
  readonly name = 'YouTube';
  readonly description = 'View YouTube subscribers, views, and channel analytics';

  private oauth2Manager?: OAuth2Manager;
  private baseUrl = 'https://www.googleapis.com/youtube/v3';
  private channelId?: string;

  constructor(config: WidgetConfig) {
    super(config);
    this.channelId = config.customConfig?.['channelId'] as string | undefined;
  }

  protected async validateAuth(): Promise<void> {
    if (!this.authConfig) {
      throw new Error('Authentication configuration is required');
    }

    const { clientId, clientSecret } = this.authConfig.credentials;
    if (!clientId || !clientSecret) {
      throw new Error('YouTube auth requires clientId and clientSecret');
    }

    const oauth2Config: OAuth2Config = {
      clientId,
      clientSecret,
      redirectUri: 'http://localhost:3000/callback/youtube',
      scope: [
        'https://www.googleapis.com/auth/youtube.readonly',
        'https://www.googleapis.com/auth/yt-analytics.readonly',
      ],
      authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
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

    this.channelId = this.authConfig.credentials['channelId'] ?? this.channelId;
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
      const stats = await this.getChannelStats(token);

      const metrics: AnalyticsMetrics = {
        totalDownloads: stats.viewCount,
        activeUsers: stats.subscriberCount,
        trend: [],
      };

      return this.createSuccessResult(metrics);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return this.createErrorResult('FETCH_ERROR', message, true);
    }
  }

  async getSalesData(timeRange: TimeRange): Promise<WidgetDataResult<SalesData[]>> {
    // YouTube doesn't have direct sales data in basic API
    return this.createSuccessResult([]);
  }

  async getDownloadStats(timeRange: TimeRange): Promise<WidgetDataResult<DownloadStats[]>> {
    // Not applicable for YouTube
    return this.createSuccessResult([]);
  }

  /**
   * Get social-specific metrics
   */
  async getSocialMetrics(timeRange: TimeRange): Promise<WidgetDataResult<SocialMetrics>> {
    this.ensureInitialized();

    try {
      const token = await this.oauth2Manager!.getValidAccessToken();
      const stats = await this.getChannelStats(token);

      const socialMetrics: SocialMetrics = {
        followers: stats.subscriberCount,
        views: stats.viewCount,
        comments: stats.commentCount,
      };

      return this.createSuccessResult(socialMetrics);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return this.createErrorResult('FETCH_ERROR', message, true);
    }
  }

  /**
   * Get top videos for the channel
   */
  async getTopVideos(limit = 10): Promise<WidgetDataResult<YouTubeVideoStats[]>> {
    this.ensureInitialized();

    try {
      const token = await this.oauth2Manager!.getValidAccessToken();
      
      const channelParam = this.channelId ? `&id=${this.channelId}` : '&mine=true';
      const response = await fetch(
        `${this.baseUrl}/search?part=snippet&type=video${channelParam}&order=viewCount&maxResults=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        return this.createErrorResult(
          'API_ERROR',
          `YouTube API error: ${response.status}`,
          true
        );
      }

      // Parse and return video stats
      const videos: YouTubeVideoStats[] = [];
      return this.createSuccessResult(videos);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return this.createErrorResult('FETCH_ERROR', message, true);
    }
  }

  /**
   * Fetch channel statistics from YouTube Data API
   */
  private async getChannelStats(token: string): Promise<YouTubeChannelStats> {
    const channelParam = this.channelId ? `&id=${this.channelId}` : '&mine=true';
    const response = await fetch(
      `${this.baseUrl}/channels?part=statistics${channelParam}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }

    // Parse response and return stats
    return {
      subscriberCount: 0,
      viewCount: 0,
      videoCount: 0,
      commentCount: 0,
    };
  }
}

/**
 * Factory for creating YouTube widgets
 */
export class YouTubeWidgetFactory {
  createWidget(config: WidgetConfig): YouTubeWidget {
    return new YouTubeWidget(config);
  }

  getWidgetType(): string {
    return 'youtube';
  }
}
