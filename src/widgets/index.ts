/**
 * Widgets Module Index
 * 
 * Export all widget-related classes and interfaces
 */

// Base widget types
export { BaseWidget } from './BaseWidget.js';
export type { AnalyticsWidget, WidgetFactory } from './BaseWidget.js';

// Phase 2: Analytics Widgets
// Apple App Store Connect
export { AppleAppStoreWidget, AppleAppStoreWidgetFactory } from './AppleAppStoreWidget.js';
export type { AppleAuthConfig } from './AppleAppStoreWidget.js';

// Google Play Developer Console
export { GooglePlayWidget, GooglePlayWidgetFactory } from './GooglePlayWidget.js';
export type { GooglePlayAuthConfig } from './GooglePlayWidget.js';

// IngramSpark
export { IngramSparkWidget, IngramSparkWidgetFactory } from './IngramSparkWidget.js';
export type { IngramSparkAuthConfig, BookSalesData } from './IngramSparkWidget.js';

// Draft2Digital
export { Draft2DigitalWidget, Draft2DigitalWidgetFactory } from './Draft2DigitalWidget.js';
export type { Draft2DigitalAuthConfig, EbookSalesData, RetailerDistribution } from './Draft2DigitalWidget.js';

// Phase 3: Social & RSS Widgets
// Facebook
export { FacebookWidget, FacebookWidgetFactory } from './FacebookWidget.js';
export type { FacebookAuthConfig, FacebookPageInsights } from './FacebookWidget.js';

// YouTube
export { YouTubeWidget, YouTubeWidgetFactory } from './YouTubeWidget.js';
export type { YouTubeAuthConfig, YouTubeChannelStats, YouTubeVideoStats } from './YouTubeWidget.js';

// TikTok
export { TikTokWidget, TikTokWidgetFactory } from './TikTokWidget.js';
export type { TikTokAuthConfig, TikTokUserStats, TikTokVideoStats } from './TikTokWidget.js';

// Amazon Affiliate
export { AmazonAffiliateWidget, AmazonAffiliateWidgetFactory } from './AmazonAffiliateWidget.js';
export type { AmazonAffiliateAuthConfig, AmazonProductData } from './AmazonAffiliateWidget.js';

// RSS Feed
export { RSSFeedWidget, RSSFeedWidgetFactory } from './RSSFeedWidget.js';
export type { RSSWidgetConfig } from './RSSFeedWidget.js';

// Widget Registry
export { WidgetRegistry, defaultRegistry } from './WidgetRegistry.js';
