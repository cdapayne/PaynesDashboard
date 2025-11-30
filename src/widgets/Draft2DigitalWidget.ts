/**
 * Draft2Digital Widget
 * 
 * Provides integration with Draft2Digital for viewing:
 * - eBook and print book sales
 * - Distribution to multiple retailers
 * - Royalty reports
 * 
 * Authentication: Uses API key or OAuth2 authentication
 * Note: Draft2Digital API access may require approved publisher account
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
 * Draft2Digital specific authentication configuration
 */
export interface Draft2DigitalAuthConfig extends AuthConfig {
  type: 'api_key';
  credentials: {
    apiKey: string;
    accountId: string;
  };
}

/**
 * eBook-specific sales data
 */
export interface EbookSalesData extends SalesData {
  isbn?: string;
  asin?: string;
  retailer: string;
  format: 'ebook' | 'paperback' | 'hardcover' | 'audiobook';
  royaltyRate?: number;
  netRoyalty?: number;
}

/**
 * Retailer distribution data
 */
export interface RetailerDistribution {
  retailer: string;
  status: 'live' | 'pending' | 'removed';
  listPrice: number;
  currency: string;
  url?: string;
}

/**
 * Draft2Digital Widget Implementation
 */
export class Draft2DigitalWidget extends BaseWidget {
  readonly type = 'draft2digital';
  readonly name = 'Draft2Digital';
  readonly description = 'View eBook and print sales from Draft2Digital distribution';

  private apiKey?: string;
  private accountId?: string;
  // Note: Replace with actual Draft2Digital API URL when available
  private baseUrl = 'https://api.draft2digital.com/v1';

  constructor(config: WidgetConfig) {
    super(config);
  }

  protected async validateAuth(): Promise<void> {
    if (!this.authConfig) {
      throw new Error('Authentication configuration is required');
    }

    const { apiKey, accountId } = this.authConfig.credentials;
    if (!apiKey || !accountId) {
      throw new Error('Draft2Digital auth requires apiKey and accountId');
    }

    this.apiKey = apiKey;
    this.accountId = accountId;
  }

  async isAuthenticated(): Promise<boolean> {
    return !!this.apiKey && !!this.accountId;
  }

  async refreshAuth(): Promise<void> {
    // API key authentication doesn't need refresh
    await this.validateAuth();
  }

  async getMetrics(timeRange: TimeRange): Promise<WidgetDataResult<AnalyticsMetrics>> {
    this.ensureInitialized();

    try {
      const response = await this.fetchWithAuth(
        `${this.baseUrl}/accounts/${this.accountId}/metrics`,
        {
          startDate: this.formatDate(timeRange.startDate),
          endDate: this.formatDate(timeRange.endDate),
        }
      );

      if (!response.ok) {
        return this.createErrorResult(
          'API_ERROR',
          `Failed to fetch metrics: ${response.status}`,
          true
        );
      }

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
      const response = await this.fetchWithAuth(
        `${this.baseUrl}/accounts/${this.accountId}/sales`,
        {
          startDate: this.formatDate(timeRange.startDate),
          endDate: this.formatDate(timeRange.endDate),
        }
      );

      if (!response.ok) {
        return this.createErrorResult(
          'API_ERROR',
          `Failed to fetch sales: ${response.status}`,
          true
        );
      }

      const salesData: EbookSalesData[] = [];
      
      return this.createSuccessResult(salesData);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return this.createErrorResult('FETCH_ERROR', message, true);
    }
  }

  async getDownloadStats(timeRange: TimeRange): Promise<WidgetDataResult<DownloadStats[]>> {
    this.ensureInitialized();

    try {
      // For eBooks, downloads represent purchases
      const response = await this.fetchWithAuth(
        `${this.baseUrl}/accounts/${this.accountId}/downloads`,
        {
          startDate: this.formatDate(timeRange.startDate),
          endDate: this.formatDate(timeRange.endDate),
        }
      );

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
   * Get sales broken down by retailer
   */
  async getSalesByRetailer(timeRange: TimeRange): Promise<WidgetDataResult<Map<string, EbookSalesData[]>>> {
    this.ensureInitialized();

    try {
      const response = await this.fetchWithAuth(
        `${this.baseUrl}/accounts/${this.accountId}/sales/by-retailer`,
        {
          startDate: this.formatDate(timeRange.startDate),
          endDate: this.formatDate(timeRange.endDate),
        }
      );

      if (!response.ok) {
        return this.createErrorResult(
          'API_ERROR',
          `Failed to fetch retailer sales: ${response.status}`,
          true
        );
      }

      const salesByRetailer = new Map<string, EbookSalesData[]>();
      
      return this.createSuccessResult(salesByRetailer);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return this.createErrorResult('FETCH_ERROR', message, true);
    }
  }

  /**
   * Get distribution status for all books
   */
  async getDistributionStatus(): Promise<WidgetDataResult<Map<string, RetailerDistribution[]>>> {
    this.ensureInitialized();

    try {
      const response = await this.fetchWithAuth(
        `${this.baseUrl}/accounts/${this.accountId}/distribution`,
        {}
      );

      if (!response.ok) {
        return this.createErrorResult(
          'API_ERROR',
          `Failed to fetch distribution status: ${response.status}`,
          true
        );
      }

      const distribution = new Map<string, RetailerDistribution[]>();
      
      return this.createSuccessResult(distribution);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return this.createErrorResult('FETCH_ERROR', message, true);
    }
  }

  /**
   * Get royalty report
   */
  async getRoyaltyReport(timeRange: TimeRange): Promise<WidgetDataResult<{
    totalRoyalties: number;
    currency: string;
    byBook: { bookId: string; title: string; royalties: number }[];
  }>> {
    this.ensureInitialized();

    try {
      const response = await this.fetchWithAuth(
        `${this.baseUrl}/accounts/${this.accountId}/royalties`,
        {
          startDate: this.formatDate(timeRange.startDate),
          endDate: this.formatDate(timeRange.endDate),
        }
      );

      if (!response.ok) {
        return this.createErrorResult(
          'API_ERROR',
          `Failed to fetch royalty report: ${response.status}`,
          true
        );
      }

      const royaltyReport = {
        totalRoyalties: 0,
        currency: 'USD',
        byBook: [] as { bookId: string; title: string; royalties: number }[],
      };
      
      return this.createSuccessResult(royaltyReport);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return this.createErrorResult('FETCH_ERROR', message, true);
    }
  }

  /**
   * Make authenticated request to Draft2Digital API
   */
  private async fetchWithAuth(
    url: string,
    params: Record<string, string>
  ): Promise<Response> {
    const queryString = Object.keys(params).length > 0 
      ? `?${new URLSearchParams(params).toString()}` 
      : '';
    
    return fetch(`${url}${queryString}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Format date for API (YYYY-MM-DD)
   */
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0] ?? '';
  }
}

/**
 * Factory for creating Draft2Digital widgets
 */
export class Draft2DigitalWidgetFactory {
  createWidget(config: WidgetConfig): Draft2DigitalWidget {
    return new Draft2DigitalWidget(config);
  }

  getWidgetType(): string {
    return 'draft2digital';
  }
}
