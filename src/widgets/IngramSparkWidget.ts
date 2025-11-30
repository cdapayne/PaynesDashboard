/**
 * IngramSpark Widget
 * 
 * Provides integration with IngramSpark for viewing:
 * - Book sales data
 * - Print-on-demand orders
 * - Distribution reports
 * 
 * Authentication: Uses API key authentication
 * Note: IngramSpark's API access may require publisher account approval
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
 * IngramSpark specific authentication configuration
 */
export interface IngramSparkAuthConfig extends AuthConfig {
  type: 'api_key';
  credentials: {
    apiKey: string;
    publisherId: string;
  };
}

/**
 * Book-specific sales data
 */
export interface BookSalesData extends SalesData {
  isbn: string;
  format: 'hardcover' | 'paperback' | 'ebook';
  channel?: string;
  royalty?: number;
}

/**
 * IngramSpark Widget Implementation
 */
export class IngramSparkWidget extends BaseWidget {
  readonly type = 'ingramspark';
  readonly name = 'IngramSpark';
  readonly description = 'View book sales and distribution data from IngramSpark';

  private apiKey?: string;
  private publisherId?: string;
  // Note: Replace with actual IngramSpark API URL when available
  private baseUrl = 'https://api.ingramspark.com/v1';

  constructor(config: WidgetConfig) {
    super(config);
  }

  protected async validateAuth(): Promise<void> {
    if (!this.authConfig) {
      throw new Error('Authentication configuration is required');
    }

    const { apiKey, publisherId } = this.authConfig.credentials;
    if (!apiKey || !publisherId) {
      throw new Error('IngramSpark auth requires apiKey and publisherId');
    }

    this.apiKey = apiKey;
    this.publisherId = publisherId;
  }

  async isAuthenticated(): Promise<boolean> {
    return !!this.apiKey && !!this.publisherId;
  }

  async refreshAuth(): Promise<void> {
    // API key authentication doesn't need refresh
    // Re-validate the current credentials
    await this.validateAuth();
  }

  async getMetrics(timeRange: TimeRange): Promise<WidgetDataResult<AnalyticsMetrics>> {
    this.ensureInitialized();

    try {
      const response = await this.fetchWithAuth(
        `${this.baseUrl}/publishers/${this.publisherId}/metrics`,
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

      // Aggregate book sales metrics
      const metrics: AnalyticsMetrics = {
        totalDownloads: 0, // Not applicable for physical books
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
        `${this.baseUrl}/publishers/${this.publisherId}/sales`,
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

      // Parse book sales data
      const salesData: BookSalesData[] = [];
      
      return this.createSuccessResult(salesData);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return this.createErrorResult('FETCH_ERROR', message, true);
    }
  }

  async getDownloadStats(timeRange: TimeRange): Promise<WidgetDataResult<DownloadStats[]>> {
    // IngramSpark is primarily for physical book sales
    // Return empty array as downloads don't apply
    return this.createSuccessResult([]);
  }

  /**
   * Get book-specific sales data with additional details
   */
  async getBookSalesData(timeRange: TimeRange, isbn?: string): Promise<WidgetDataResult<BookSalesData[]>> {
    this.ensureInitialized();

    try {
      const params: Record<string, string> = {
        startDate: this.formatDate(timeRange.startDate),
        endDate: this.formatDate(timeRange.endDate),
      };

      if (isbn) {
        params['isbn'] = isbn;
      }

      const response = await this.fetchWithAuth(
        `${this.baseUrl}/publishers/${this.publisherId}/books/sales`,
        params
      );

      if (!response.ok) {
        return this.createErrorResult(
          'API_ERROR',
          `Failed to fetch book sales: ${response.status}`,
          true
        );
      }

      const bookSales: BookSalesData[] = [];
      
      return this.createSuccessResult(bookSales);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return this.createErrorResult('FETCH_ERROR', message, true);
    }
  }

  /**
   * Get distribution channel breakdown
   */
  async getDistributionData(timeRange: TimeRange): Promise<WidgetDataResult<Record<string, number>>> {
    this.ensureInitialized();

    try {
      const response = await this.fetchWithAuth(
        `${this.baseUrl}/publishers/${this.publisherId}/distribution`,
        {
          startDate: this.formatDate(timeRange.startDate),
          endDate: this.formatDate(timeRange.endDate),
        }
      );

      if (!response.ok) {
        return this.createErrorResult(
          'API_ERROR',
          `Failed to fetch distribution data: ${response.status}`,
          true
        );
      }

      const distribution: Record<string, number> = {};
      
      return this.createSuccessResult(distribution);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return this.createErrorResult('FETCH_ERROR', message, true);
    }
  }

  /**
   * Make authenticated request to IngramSpark API
   */
  private async fetchWithAuth(
    url: string,
    params?: Record<string, string>
  ): Promise<Response> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    
    return fetch(`${url}${queryString}`, {
      headers: {
        'X-API-Key': this.apiKey ?? '',
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
 * Factory for creating IngramSpark widgets
 */
export class IngramSparkWidgetFactory {
  createWidget(config: WidgetConfig): IngramSparkWidget {
    return new IngramSparkWidget(config);
  }

  getWidgetType(): string {
    return 'ingramspark';
  }
}
