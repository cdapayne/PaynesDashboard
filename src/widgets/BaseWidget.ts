/**
 * Base Widget Interface
 * 
 * This interface defines the contract that all analytics widgets must implement.
 * Widgets are modular and interchangeable components that fetch and display
 * analytics data from various sources.
 */

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
 * Abstract base interface for all analytics widgets
 */
export interface AnalyticsWidget {
  /** Unique identifier for the widget type */
  readonly type: string;

  /** Human-readable name of the widget */
  readonly name: string;

  /** Description of what data this widget provides */
  readonly description: string;

  /** Current configuration */
  config: WidgetConfig;

  /**
   * Initialize the widget with authentication
   * @param authConfig - Authentication configuration for the service
   */
  initialize(authConfig: AuthConfig): Promise<void>;

  /**
   * Check if the widget is properly authenticated
   */
  isAuthenticated(): Promise<boolean>;

  /**
   * Refresh authentication tokens if needed
   */
  refreshAuth(): Promise<void>;

  /**
   * Fetch overall analytics metrics for a time range
   * @param timeRange - The time period to fetch metrics for
   */
  getMetrics(timeRange: TimeRange): Promise<WidgetDataResult<AnalyticsMetrics>>;

  /**
   * Fetch sales data for a time range
   * @param timeRange - The time period to fetch sales for
   */
  getSalesData(timeRange: TimeRange): Promise<WidgetDataResult<SalesData[]>>;

  /**
   * Fetch download/install statistics
   * @param timeRange - The time period to fetch stats for
   */
  getDownloadStats(timeRange: TimeRange): Promise<WidgetDataResult<DownloadStats[]>>;

  /**
   * Clean up resources and disconnect
   */
  disconnect(): Promise<void>;
}

/**
 * Factory interface for creating widget instances
 */
export interface WidgetFactory {
  /**
   * Create a new widget instance
   * @param config - Widget configuration
   */
  createWidget(config: WidgetConfig): AnalyticsWidget;

  /**
   * Get the widget type this factory creates
   */
  getWidgetType(): string;
}

/**
 * Abstract base class providing common widget functionality
 */
export abstract class BaseWidget implements AnalyticsWidget {
  abstract readonly type: string;
  abstract readonly name: string;
  abstract readonly description: string;

  config: WidgetConfig;
  protected authConfig?: AuthConfig;
  protected initialized = false;

  constructor(config: WidgetConfig) {
    this.config = config;
  }

  async initialize(authConfig: AuthConfig): Promise<void> {
    this.authConfig = authConfig;
    await this.validateAuth();
    this.initialized = true;
  }

  protected abstract validateAuth(): Promise<void>;

  abstract isAuthenticated(): Promise<boolean>;
  abstract refreshAuth(): Promise<void>;
  abstract getMetrics(timeRange: TimeRange): Promise<WidgetDataResult<AnalyticsMetrics>>;
  abstract getSalesData(timeRange: TimeRange): Promise<WidgetDataResult<SalesData[]>>;
  abstract getDownloadStats(timeRange: TimeRange): Promise<WidgetDataResult<DownloadStats[]>>;

  async disconnect(): Promise<void> {
    this.initialized = false;
    this.authConfig = undefined;
  }

  protected ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error(`Widget ${this.type} is not initialized. Call initialize() first.`);
    }
  }

  protected createSuccessResult<T>(data: T): WidgetDataResult<T> {
    return {
      status: 'success',
      data,
      lastUpdated: new Date(),
    };
  }

  protected createErrorResult<T>(code: string, message: string, recoverable = true): WidgetDataResult<T> {
    return {
      status: 'error',
      error: {
        code,
        message,
        timestamp: new Date(),
        recoverable,
      },
      lastUpdated: new Date(),
    };
  }
}
