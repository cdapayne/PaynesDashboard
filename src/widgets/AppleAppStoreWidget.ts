/**
 * Apple App Store Connect Widget
 * 
 * Provides integration with Apple's App Store Connect API for viewing:
 * - Sales and financial reports
 * - Download trends
 * - App analytics
 * 
 * Authentication: Uses JWT-based authentication with private key
 * API Documentation: https://developer.apple.com/documentation/appstoreconnectapi
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

/**
 * Apple App Store Connect specific configuration
 */
export interface AppleAuthConfig extends AuthConfig {
  credentials: {
    /** Issuer ID from App Store Connect */
    issuerId: string;
    /** Key ID from App Store Connect */
    keyId: string;
    /** Private key content (.p8 file content) */
    privateKey: string;
    /** Vendor number for sales reports */
    vendorNumber?: string;
  };
}

/**
 * Apple App Store Connect Widget Implementation
 */
export class AppleAppStoreWidget extends BaseWidget {
  readonly type = 'apple_app_store';
  readonly name = 'Apple App Store Connect';
  readonly description = 'View sales, downloads, and analytics from Apple App Store Connect';

  private jwtToken?: string;
  private tokenExpiresAt?: Date;
  private baseUrl = 'https://api.appstoreconnect.apple.com/v1';
  private salesReportUrl = 'https://api.appstoreconnect.apple.com/v1/salesReports';

  constructor(config: WidgetConfig) {
    super(config);
  }

  protected async validateAuth(): Promise<void> {
    if (!this.authConfig) {
      throw new Error('Authentication configuration is required');
    }

    const { issuerId, keyId, privateKey } = this.authConfig.credentials;
    if (!issuerId || !keyId || !privateKey) {
      throw new Error('Apple auth requires issuerId, keyId, and privateKey');
    }
  }

  /**
   * Generate JWT token for App Store Connect API
   * Token is valid for 20 minutes per Apple's guidelines
   */
  private async generateJWT(): Promise<string> {
    const credentials = this.authConfig?.credentials as AppleAuthConfig['credentials'];
    if (!credentials) {
      throw new Error('No credentials available');
    }

    // JWT generation would typically use a library like jsonwebtoken
    // For now, we'll store the structure needed
    // In production, use: npm install jsonwebtoken
    
    const now = Math.floor(Date.now() / 1000);
    const expiration = now + 20 * 60; // 20 minutes

    const header = {
      alg: 'ES256',
      kid: credentials.keyId,
      typ: 'JWT',
    };

    const payload = {
      iss: credentials.issuerId,
      exp: expiration,
      aud: 'appstoreconnect-v1',
    };

    // Note: In production, sign this JWT with the private key using ES256
    // This is a placeholder that shows the structure
    const token = `${Buffer.from(JSON.stringify(header)).toString('base64url')}.${Buffer.from(JSON.stringify(payload)).toString('base64url')}.SIGNATURE`;
    
    this.jwtToken = token;
    this.tokenExpiresAt = new Date(expiration * 1000);
    
    return token;
  }

  /**
   * Get valid JWT token, regenerating if expired
   */
  private async getValidToken(): Promise<string> {
    const bufferMs = 60 * 1000; // 1 minute buffer
    if (!this.jwtToken || !this.tokenExpiresAt || new Date() >= new Date(this.tokenExpiresAt.getTime() - bufferMs)) {
      await this.generateJWT();
    }
    return this.jwtToken!;
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      await this.getValidToken();
      return true;
    } catch {
      return false;
    }
  }

  async refreshAuth(): Promise<void> {
    await this.generateJWT();
  }

  async getMetrics(timeRange: TimeRange): Promise<WidgetDataResult<AnalyticsMetrics>> {
    this.ensureInitialized();

    try {
      const token = await this.getValidToken();
      
      // Fetch app analytics overview
      // This would make actual API calls in production
      const response = await this.fetchWithAuth(`${this.baseUrl}/apps`, token);
      
      if (!response.ok) {
        return this.createErrorResult(
          'API_ERROR',
          `Failed to fetch metrics: ${response.status}`,
          true
        );
      }

      // Parse and aggregate metrics from response
      // This is a placeholder structure
      const metrics: AnalyticsMetrics = {
        totalDownloads: 0,
        totalRevenue: 0,
        currency: 'USD',
        trend: [],
      };

      return this.createSuccessResult(metrics);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return this.createErrorResult('FETCH_ERROR', message, true);
    }
  }

  async getSalesData(timeRange: TimeRange): Promise<WidgetDataResult<SalesData[]>> {
    this.ensureInitialized();

    try {
      const token = await this.getValidToken();
      const credentials = this.authConfig?.credentials as AppleAuthConfig['credentials'];
      
      // Format dates for Apple's API (YYYY-MM-DD)
      const reportDate = this.formatDateForApple(timeRange.endDate);
      
      const params = new URLSearchParams({
        'filter[frequency]': 'DAILY',
        'filter[reportDate]': reportDate,
        'filter[reportSubType]': 'SUMMARY',
        'filter[reportType]': 'SALES',
        'filter[vendorNumber]': credentials?.vendorNumber ?? '',
      });

      const response = await this.fetchWithAuth(`${this.salesReportUrl}?${params}`, token);

      if (!response.ok) {
        return this.createErrorResult(
          'API_ERROR',
          `Failed to fetch sales: ${response.status}`,
          true
        );
      }

      // Parse sales report (typically gzipped TSV)
      const salesData: SalesData[] = [];
      
      return this.createSuccessResult(salesData);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return this.createErrorResult('FETCH_ERROR', message, true);
    }
  }

  async getDownloadStats(timeRange: TimeRange): Promise<WidgetDataResult<DownloadStats[]>> {
    this.ensureInitialized();

    try {
      const token = await this.getValidToken();
      
      // App Store Connect Analytics API for download stats
      const response = await this.fetchWithAuth(`${this.baseUrl}/apps`, token);

      if (!response.ok) {
        return this.createErrorResult(
          'API_ERROR',
          `Failed to fetch download stats: ${response.status}`,
          true
        );
      }

      const downloadStats: DownloadStats[] = [];
      
      return this.createSuccessResult(downloadStats);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return this.createErrorResult('FETCH_ERROR', message, true);
    }
  }

  /**
   * Make authenticated request to App Store Connect API
   */
  private async fetchWithAuth(url: string, token: string): Promise<Response> {
    return fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Format date for Apple's API (YYYY-MM-DD)
   */
  private formatDateForApple(date: Date): string {
    return date.toISOString().split('T')[0] ?? '';
  }
}

/**
 * Factory for creating Apple App Store widgets
 */
export class AppleAppStoreWidgetFactory {
  createWidget(config: WidgetConfig): AppleAppStoreWidget {
    return new AppleAppStoreWidget(config);
  }

  getWidgetType(): string {
    return 'apple_app_store';
  }
}
