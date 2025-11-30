/**
 * Widgets Module Index
 * 
 * Export all widget-related classes and interfaces
 */

// Base widget types
export { BaseWidget } from './BaseWidget.js';
export type { AnalyticsWidget, WidgetFactory } from './BaseWidget.js';

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

// Widget Registry
export { WidgetRegistry, defaultRegistry } from './WidgetRegistry.js';
