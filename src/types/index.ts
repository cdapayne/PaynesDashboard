/**
 * Core types for the PaynesDashboard analytics widgets
 */

/**
 * Time range for fetching analytics data
 */
export interface TimeRange {
  startDate: Date;
  endDate: Date;
}

/**
 * Authentication configuration for each service
 */
export interface AuthConfig {
  /** Unique identifier for this authentication configuration */
  id: string;
  /** The type of authentication method used */
  type: 'oauth2' | 'api_key' | 'jwt';
  /** Service-specific credentials */
  credentials: Record<string, string>;
}

/**
 * OAuth2 configuration for services that support OAuth
 */
export interface OAuth2Config {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scope: string[];
  authorizationUrl: string;
  tokenUrl: string;
  refreshToken?: string;
  accessToken?: string;
  expiresAt?: Date;
}

/**
 * Base data point for analytics metrics
 */
export interface DataPoint {
  date: Date;
  value: number;
  label?: string;
}

/**
 * Sales data from any platform
 */
export interface SalesData {
  productId: string;
  productName: string;
  quantity: number;
  revenue: number;
  currency: string;
  date: Date;
  region?: string;
}

/**
 * Download/install statistics
 */
export interface DownloadStats {
  date: Date;
  downloads: number;
  updates?: number;
  region?: string;
  platform?: string;
}

/**
 * Generic analytics metrics
 */
export interface AnalyticsMetrics {
  totalDownloads?: number;
  totalRevenue?: number;
  currency?: string;
  activeUsers?: number;
  ratings?: {
    average: number;
    count: number;
  };
  trend?: DataPoint[];
}

/**
 * Widget display configuration
 */
export interface WidgetDisplayConfig {
  title: string;
  refreshInterval?: number;
  showTrend?: boolean;
  chartType?: 'line' | 'bar' | 'pie';
}

/**
 * Widget state for tracking status
 */
export type WidgetStatus = 'idle' | 'loading' | 'success' | 'error';

/**
 * Error information for widget operations
 */
export interface WidgetError {
  code: string;
  message: string;
  timestamp: Date;
  recoverable: boolean;
}

/**
 * Widget data result
 */
export interface WidgetDataResult<T> {
  status: WidgetStatus;
  data?: T;
  error?: WidgetError;
  lastUpdated?: Date;
}

/**
 * Configuration for a widget instance
 */
export interface WidgetConfig {
  id: string;
  type: string;
  displayConfig: WidgetDisplayConfig;
  authConfigId: string;
  customConfig?: Record<string, unknown>;
}

// Re-export social types
export * from './social.js';
