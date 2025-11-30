/**
 * Facebook Widget
 * 
 * Provides integration with Facebook Graph API for viewing:
 * - Page likes and followers
 * - Post engagement
 * - Reach and impressions
 * 
 * Authentication: Uses OAuth2 with Facebook Login
 * API Documentation: https://developers.facebook.com/docs/graph-api
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
 * Facebook specific authentication configuration
 */
export interface FacebookAuthConfig extends AuthConfig {
  type: 'oauth2';
  credentials: {
    clientId: string;
    clientSecret: string;
    accessToken?: string;
    refreshToken?: string;
    pageId?: string;
  };
}

/**
 * Facebook page insights
 */
export interface FacebookPageInsights {
  pageLikes: number;
  pageFollowers: number;
  postReach: number;
  postEngagement: number;
  pageViews: number;
}

/**
 * Facebook Widget Implementation
 */
export class FacebookWidget extends BaseWidget {
  readonly type = 'facebook';
  readonly name = 'Facebook';
  readonly description = 'View Facebook page likes, followers, and engagement metrics';

  private oauth2Manager?: OAuth2Manager;
  private baseUrl = 'https://graph.facebook.com/v18.0';
  private pageId?: string;

  constructor(config: WidgetConfig) {
    super(config);
    this.pageId = config.customConfig?.['pageId'] as string | undefined;
  }

  protected async validateAuth(): Promise<void> {
    if (!this.authConfig) {
      throw new Error('Authentication configuration is required');
    }

    const { clientId, clientSecret } = this.authConfig.credentials;
    if (!clientId || !clientSecret) {
      throw new Error('Facebook auth requires clientId and clientSecret');
    }

    const oauth2Config: OAuth2Config = {
      clientId,
      clientSecret,
      redirectUri: 'http://localhost:3000/callback/facebook',
      scope: [
        'pages_show_list',
        'pages_read_engagement',
        'pages_read_user_content',
        'read_insights',
      ],
      authorizationUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
      tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
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

    this.pageId = this.authConfig.credentials['pageId'] ?? this.pageId;
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
      if (!this.pageId) {
        return this.createErrorResult(
          'CONFIG_ERROR',
          'Page ID is required in widget configuration',
          false
        );
      }

      const token = await this.oauth2Manager!.getValidAccessToken();
      const insights = await this.getPageInsights(token, timeRange);

      const metrics: AnalyticsMetrics = {
        totalDownloads: insights.pageLikes,
        activeUsers: insights.pageFollowers,
        trend: [],
      };

      return this.createSuccessResult(metrics);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return this.createErrorResult('FETCH_ERROR', message, true);
    }
  }

  async getSalesData(timeRange: TimeRange): Promise<WidgetDataResult<SalesData[]>> {
    // Facebook doesn't have direct sales data
    return this.createSuccessResult([]);
  }

  async getDownloadStats(timeRange: TimeRange): Promise<WidgetDataResult<DownloadStats[]>> {
    // Not applicable for Facebook
    return this.createSuccessResult([]);
  }

  /**
   * Get social-specific metrics
   */
  async getSocialMetrics(timeRange: TimeRange): Promise<WidgetDataResult<SocialMetrics>> {
    this.ensureInitialized();

    try {
      if (!this.pageId) {
        return this.createErrorResult(
          'CONFIG_ERROR',
          'Page ID is required',
          false
        );
      }

      const token = await this.oauth2Manager!.getValidAccessToken();
      const insights = await this.getPageInsights(token, timeRange);

      const socialMetrics: SocialMetrics = {
        followers: insights.pageFollowers,
        likes: insights.pageLikes,
        views: insights.pageViews,
        engagementRate: insights.postEngagement,
        reachCount: insights.postReach,
      };

      return this.createSuccessResult(socialMetrics);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return this.createErrorResult('FETCH_ERROR', message, true);
    }
  }

  /**
   * Fetch page insights from Facebook Graph API
   */
  private async getPageInsights(token: string, timeRange: TimeRange): Promise<FacebookPageInsights> {
    const since = Math.floor(timeRange.startDate.getTime() / 1000);
    const until = Math.floor(timeRange.endDate.getTime() / 1000);

    const metrics = [
      'page_fans',
      'page_followers_count',
      'page_impressions',
      'page_engaged_users',
      'page_views_total',
    ].join(',');

    const response = await fetch(
      `${this.baseUrl}/${this.pageId}/insights?metric=${metrics}&since=${since}&until=${until}&access_token=${token}`
    );

    if (!response.ok) {
      throw new Error(`Facebook API error: ${response.status}`);
    }

    // Parse response and return insights
    // In production, parse the actual response data
    return {
      pageLikes: 0,
      pageFollowers: 0,
      postReach: 0,
      postEngagement: 0,
      pageViews: 0,
    };
  }
}

/**
 * Factory for creating Facebook widgets
 */
export class FacebookWidgetFactory {
  createWidget(config: WidgetConfig): FacebookWidget {
    return new FacebookWidget(config);
  }

  getWidgetType(): string {
    return 'facebook';
  }
}
