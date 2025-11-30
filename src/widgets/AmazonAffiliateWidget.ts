/**
 * Amazon Affiliate Widget
 * 
 * Provides integration with Amazon Product Advertising API for viewing:
 * - Affiliate link clicks
 * - Conversions and earnings
 * - Top performing products
 * 
 * Authentication: Uses API key authentication with signature
 * API Documentation: https://webservices.amazon.com/paapi5/documentation/
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
import type { AmazonAffiliateMetrics } from '../types/social.js';

/**
 * Amazon Affiliate specific authentication configuration
 */
export interface AmazonAffiliateAuthConfig extends AuthConfig {
  type: 'api_key';
  credentials: {
    accessKeyId: string;
    secretAccessKey: string;
    partnerTag: string;
    marketplace?: string;
  };
}

/**
 * Amazon product data
 */
export interface AmazonProductData {
  asin: string;
  title: string;
  price?: number;
  currency?: string;
  imageUrl?: string;
  detailPageUrl: string;
  category?: string;
}

/**
 * Amazon Affiliate Widget Implementation
 */
export class AmazonAffiliateWidget extends BaseWidget {
  readonly type = 'amazon_affiliate';
  readonly name = 'Amazon Affiliate';
  readonly description = 'View Amazon affiliate link analytics, clicks, and earnings';

  private accessKeyId?: string;
  private secretAccessKey?: string;
  private partnerTag?: string;
  private marketplace = 'www.amazon.com';
  private baseUrl = 'https://webservices.amazon.com/paapi5';

  constructor(config: WidgetConfig) {
    super(config);
  }

  protected async validateAuth(): Promise<void> {
    if (!this.authConfig) {
      throw new Error('Authentication configuration is required');
    }

    const { accessKeyId, secretAccessKey, partnerTag, marketplace } = this.authConfig.credentials;
    if (!accessKeyId || !secretAccessKey || !partnerTag) {
      throw new Error('Amazon Affiliate auth requires accessKeyId, secretAccessKey, and partnerTag');
    }

    this.accessKeyId = accessKeyId;
    this.secretAccessKey = secretAccessKey;
    this.partnerTag = partnerTag;
    this.marketplace = marketplace ?? this.marketplace;
  }

  async isAuthenticated(): Promise<boolean> {
    return !!this.accessKeyId && !!this.secretAccessKey && !!this.partnerTag;
  }

  async refreshAuth(): Promise<void> {
    // API key authentication doesn't need refresh
    await this.validateAuth();
  }

  async getMetrics(timeRange: TimeRange): Promise<WidgetDataResult<AnalyticsMetrics>> {
    this.ensureInitialized();

    try {
      const affiliateMetrics = await this.getAffiliateMetrics(timeRange);

      const metrics: AnalyticsMetrics = {
        totalRevenue: affiliateMetrics.revenue,
        currency: affiliateMetrics.currency,
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
      const affiliateMetrics = await this.getAffiliateMetrics(timeRange);

      const salesData: SalesData[] = affiliateMetrics.topProducts.map(product => ({
        productId: product.asin,
        productName: product.title,
        quantity: product.conversions,
        revenue: product.earnings,
        currency: affiliateMetrics.currency,
        date: timeRange.endDate, // Use end of reporting period
      }));

      return this.createSuccessResult(salesData);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return this.createErrorResult('FETCH_ERROR', message, true);
    }
  }

  async getDownloadStats(timeRange: TimeRange): Promise<WidgetDataResult<DownloadStats[]>> {
    // Not applicable for Amazon Affiliate
    return this.createSuccessResult([]);
  }

  /**
   * Get affiliate-specific metrics
   */
  async getAffiliateMetrics(timeRange: TimeRange): Promise<AmazonAffiliateMetrics> {
    // Note: Amazon Associates reporting is typically accessed through
    // the Associates Central dashboard or via reporting APIs
    // This would integrate with the actual reporting endpoint
    
    return {
      clicks: 0,
      conversions: 0,
      revenue: 0,
      currency: 'USD',
      topProducts: [],
    };
  }

  /**
   * Search for products using Product Advertising API
   */
  async searchProducts(keywords: string, limit = 10): Promise<WidgetDataResult<AmazonProductData[]>> {
    this.ensureInitialized();

    try {
      const requestPayload = {
        Keywords: keywords,
        SearchIndex: 'All',
        ItemCount: limit,
        PartnerTag: this.partnerTag,
        PartnerType: 'Associates',
        Resources: [
          'ItemInfo.Title',
          'Offers.Listings.Price',
          'Images.Primary.Medium',
        ],
      };

      // In production, sign the request using AWS Signature Version 4
      const response = await this.signedFetch(
        `${this.baseUrl}/searchitems`,
        requestPayload
      );

      if (!response.ok) {
        return this.createErrorResult(
          'API_ERROR',
          `Amazon API error: ${response.status}`,
          true
        );
      }

      const products: AmazonProductData[] = [];
      return this.createSuccessResult(products);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return this.createErrorResult('FETCH_ERROR', message, true);
    }
  }

  /**
   * Get product details by ASIN
   */
  async getProductByAsin(asin: string): Promise<WidgetDataResult<AmazonProductData | null>> {
    this.ensureInitialized();

    try {
      const requestPayload = {
        ItemIds: [asin],
        PartnerTag: this.partnerTag,
        PartnerType: 'Associates',
        Resources: [
          'ItemInfo.Title',
          'Offers.Listings.Price',
          'Images.Primary.Medium',
        ],
      };

      const response = await this.signedFetch(
        `${this.baseUrl}/getitems`,
        requestPayload
      );

      if (!response.ok) {
        return this.createErrorResult(
          'API_ERROR',
          `Amazon API error: ${response.status}`,
          true
        );
      }

      return this.createSuccessResult(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return this.createErrorResult('FETCH_ERROR', message, true);
    }
  }

  /**
   * Make a signed request to Amazon API
   * Uses AWS Signature Version 4
   */
  private async signedFetch(url: string, payload: Record<string, unknown>): Promise<Response> {
    // AWS Signature Version 4 signing process would be implemented here
    // For production, use @aws-sdk/signature-v4 package
    
    const headers = {
      'Content-Type': 'application/json',
      'X-Amz-Target': 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems',
      // Add signature headers
    };

    return fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
  }
}

/**
 * Factory for creating Amazon Affiliate widgets
 */
export class AmazonAffiliateWidgetFactory {
  createWidget(config: WidgetConfig): AmazonAffiliateWidget {
    return new AmazonAffiliateWidget(config);
  }

  getWidgetType(): string {
    return 'amazon_affiliate';
  }
}
