/**
 * Widget Registry
 * 
 * Central registry for managing widget factories and creating widget instances.
 * This enables the modular and interchangeable widget architecture.
 */

import type { AnalyticsWidget, WidgetFactory } from './BaseWidget.js';
import type { WidgetConfig, AuthConfig } from '../types/index.js';
// Phase 2: Analytics Widgets
import { AppleAppStoreWidgetFactory } from './AppleAppStoreWidget.js';
import { GooglePlayWidgetFactory } from './GooglePlayWidget.js';
import { IngramSparkWidgetFactory } from './IngramSparkWidget.js';
import { Draft2DigitalWidgetFactory } from './Draft2DigitalWidget.js';
// Phase 3: Social & RSS Widgets
import { FacebookWidgetFactory } from './FacebookWidget.js';
import { YouTubeWidgetFactory } from './YouTubeWidget.js';
import { TikTokWidgetFactory } from './TikTokWidget.js';
import { AmazonAffiliateWidgetFactory } from './AmazonAffiliateWidget.js';
import { RSSFeedWidgetFactory } from './RSSFeedWidget.js';

/**
 * Widget instance with its configuration
 */
interface WidgetInstance {
  widget: AnalyticsWidget;
  config: WidgetConfig;
  authConfig?: AuthConfig;
}

/**
 * Registry for managing widget factories and instances
 */
export class WidgetRegistry {
  private factories = new Map<string, WidgetFactory>();
  private instances = new Map<string, WidgetInstance>();

  constructor() {
    this.registerBuiltInFactories();
  }

  /**
   * Register all built-in widget factories
   */
  private registerBuiltInFactories(): void {
    // Phase 2: Analytics Widgets
    this.registerFactory(new AppleAppStoreWidgetFactory());
    this.registerFactory(new GooglePlayWidgetFactory());
    this.registerFactory(new IngramSparkWidgetFactory());
    this.registerFactory(new Draft2DigitalWidgetFactory());
    // Phase 3: Social & RSS Widgets
    this.registerFactory(new FacebookWidgetFactory());
    this.registerFactory(new YouTubeWidgetFactory());
    this.registerFactory(new TikTokWidgetFactory());
    this.registerFactory(new AmazonAffiliateWidgetFactory());
    this.registerFactory(new RSSFeedWidgetFactory());
  }

  /**
   * Register a custom widget factory
   * @param factory - The widget factory to register
   */
  registerFactory(factory: WidgetFactory): void {
    const type = factory.getWidgetType();
    if (this.factories.has(type)) {
      throw new Error(`Widget factory for type '${type}' is already registered`);
    }
    this.factories.set(type, factory);
  }

  /**
   * Unregister a widget factory
   * @param type - The widget type to unregister
   */
  unregisterFactory(type: string): boolean {
    return this.factories.delete(type);
  }

  /**
   * Get all registered widget types
   */
  getRegisteredTypes(): string[] {
    return Array.from(this.factories.keys());
  }

  /**
   * Check if a widget type is registered
   * @param type - The widget type to check
   */
  hasFactory(type: string): boolean {
    return this.factories.has(type);
  }

  /**
   * Create a new widget instance
   * @param config - Widget configuration
   * @param authConfig - Optional authentication configuration
   */
  async createWidget(config: WidgetConfig, authConfig?: AuthConfig): Promise<AnalyticsWidget> {
    const factory = this.factories.get(config.type);
    if (!factory) {
      throw new Error(`No factory registered for widget type '${config.type}'`);
    }

    const widget = factory.createWidget(config);
    
    if (authConfig) {
      await widget.initialize(authConfig);
    }

    this.instances.set(config.id, {
      widget,
      config,
      authConfig,
    });

    return widget;
  }

  /**
   * Get an existing widget instance by ID
   * @param id - Widget instance ID
   */
  getWidget(id: string): AnalyticsWidget | undefined {
    return this.instances.get(id)?.widget;
  }

  /**
   * Remove a widget instance
   * @param id - Widget instance ID
   */
  async removeWidget(id: string): Promise<boolean> {
    const instance = this.instances.get(id);
    if (instance) {
      await instance.widget.disconnect();
      return this.instances.delete(id);
    }
    return false;
  }

  /**
   * Get all active widget instances
   */
  getAllWidgets(): Map<string, AnalyticsWidget> {
    const widgets = new Map<string, AnalyticsWidget>();
    for (const [id, instance] of this.instances) {
      widgets.set(id, instance.widget);
    }
    return widgets;
  }

  /**
   * Disconnect all widgets
   */
  async disconnectAll(): Promise<void> {
    const disconnectPromises = Array.from(this.instances.values())
      .map(instance => instance.widget.disconnect());
    await Promise.all(disconnectPromises);
    this.instances.clear();
  }
}

/**
 * Default singleton registry instance
 */
export const defaultRegistry = new WidgetRegistry();
