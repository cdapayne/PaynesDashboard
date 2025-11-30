/**
 * Tests for Analytics Widget System
 */

import {
  WidgetRegistry,
  AppleAppStoreWidget,
  GooglePlayWidget,
  IngramSparkWidget,
  Draft2DigitalWidget,
} from '../src/widgets/index.js';
import type { WidgetConfig, AuthConfig, TimeRange } from '../src/types/index.js';

describe('WidgetRegistry', () => {
  let registry: WidgetRegistry;

  beforeEach(() => {
    registry = new WidgetRegistry();
  });

  afterEach(async () => {
    await registry.disconnectAll();
  });

  describe('factory registration', () => {
    it('should have all built-in factories registered', () => {
      const types = registry.getRegisteredTypes();
      expect(types).toContain('apple_app_store');
      expect(types).toContain('google_play');
      expect(types).toContain('ingramspark');
      expect(types).toContain('draft2digital');
    });

    it('should check if factory exists', () => {
      expect(registry.hasFactory('apple_app_store')).toBe(true);
      expect(registry.hasFactory('nonexistent')).toBe(false);
    });

    it('should throw when registering duplicate factory', () => {
      const duplicateFactory = {
        createWidget: () => { throw new Error('Should not be called'); },
        getWidgetType: () => 'apple_app_store',
      };
      expect(() => registry.registerFactory(duplicateFactory)).toThrow();
    });

    it('should unregister factory', () => {
      expect(registry.unregisterFactory('apple_app_store')).toBe(true);
      expect(registry.hasFactory('apple_app_store')).toBe(false);
    });
  });

  describe('widget creation', () => {
    it('should create Apple App Store widget without auth', async () => {
      const config: WidgetConfig = {
        id: 'test-apple',
        type: 'apple_app_store',
        displayConfig: { title: 'Apple Sales' },
        authConfigId: 'apple-auth',
      };

      const widget = await registry.createWidget(config);
      expect(widget).toBeInstanceOf(AppleAppStoreWidget);
      expect(widget.type).toBe('apple_app_store');
    });

    it('should create Google Play widget', async () => {
      const config: WidgetConfig = {
        id: 'test-google',
        type: 'google_play',
        displayConfig: { title: 'Google Play Stats' },
        authConfigId: 'google-auth',
        customConfig: { packageName: 'com.example.app' },
      };

      const widget = await registry.createWidget(config);
      expect(widget).toBeInstanceOf(GooglePlayWidget);
      expect(widget.type).toBe('google_play');
    });

    it('should create IngramSpark widget', async () => {
      const config: WidgetConfig = {
        id: 'test-ingram',
        type: 'ingramspark',
        displayConfig: { title: 'Book Sales' },
        authConfigId: 'ingram-auth',
      };

      const widget = await registry.createWidget(config);
      expect(widget).toBeInstanceOf(IngramSparkWidget);
      expect(widget.type).toBe('ingramspark');
    });

    it('should create Draft2Digital widget', async () => {
      const config: WidgetConfig = {
        id: 'test-d2d',
        type: 'draft2digital',
        displayConfig: { title: 'eBook Sales' },
        authConfigId: 'd2d-auth',
      };

      const widget = await registry.createWidget(config);
      expect(widget).toBeInstanceOf(Draft2DigitalWidget);
      expect(widget.type).toBe('draft2digital');
    });

    it('should throw for unknown widget type', async () => {
      const config: WidgetConfig = {
        id: 'test-unknown',
        type: 'unknown_type',
        displayConfig: { title: 'Unknown' },
        authConfigId: 'auth',
      };

      await expect(registry.createWidget(config)).rejects.toThrow();
    });

    it('should store and retrieve widget instance', async () => {
      const config: WidgetConfig = {
        id: 'test-retrieve',
        type: 'apple_app_store',
        displayConfig: { title: 'Test' },
        authConfigId: 'auth',
      };

      await registry.createWidget(config);
      const retrieved = registry.getWidget('test-retrieve');
      expect(retrieved).toBeDefined();
      expect(retrieved?.type).toBe('apple_app_store');
    });

    it('should remove widget instance', async () => {
      const config: WidgetConfig = {
        id: 'test-remove',
        type: 'apple_app_store',
        displayConfig: { title: 'Test' },
        authConfigId: 'auth',
      };

      await registry.createWidget(config);
      const removed = await registry.removeWidget('test-remove');
      expect(removed).toBe(true);
      expect(registry.getWidget('test-remove')).toBeUndefined();
    });
  });
});

describe('AppleAppStoreWidget', () => {
  let widget: AppleAppStoreWidget;
  const config: WidgetConfig = {
    id: 'apple-test',
    type: 'apple_app_store',
    displayConfig: { title: 'Apple Test' },
    authConfigId: 'apple-auth',
  };

  beforeEach(() => {
    widget = new AppleAppStoreWidget(config);
  });

  it('should have correct type and name', () => {
    expect(widget.type).toBe('apple_app_store');
    expect(widget.name).toBe('Apple App Store Connect');
  });

  it('should throw when getting metrics without initialization', async () => {
    const timeRange: TimeRange = {
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-31'),
    };

    await expect(widget.getMetrics(timeRange)).rejects.toThrow('not initialized');
  });

  it('should require valid auth credentials', async () => {
    const invalidAuth: AuthConfig = {
      id: 'invalid',
      type: 'jwt',
      credentials: {},
    };

    await expect(widget.initialize(invalidAuth)).rejects.toThrow();
  });
});

describe('GooglePlayWidget', () => {
  let widget: GooglePlayWidget;
  const config: WidgetConfig = {
    id: 'google-test',
    type: 'google_play',
    displayConfig: { title: 'Google Test' },
    authConfigId: 'google-auth',
    customConfig: { packageName: 'com.test.app' },
  };

  beforeEach(() => {
    widget = new GooglePlayWidget(config);
  });

  it('should have correct type and name', () => {
    expect(widget.type).toBe('google_play');
    expect(widget.name).toBe('Google Play Developer Console');
  });

  it('should throw when getting metrics without initialization', async () => {
    const timeRange: TimeRange = {
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-31'),
    };

    await expect(widget.getMetrics(timeRange)).rejects.toThrow('not initialized');
  });
});

describe('IngramSparkWidget', () => {
  let widget: IngramSparkWidget;
  const config: WidgetConfig = {
    id: 'ingram-test',
    type: 'ingramspark',
    displayConfig: { title: 'IngramSpark Test' },
    authConfigId: 'ingram-auth',
  };

  beforeEach(() => {
    widget = new IngramSparkWidget(config);
  });

  it('should have correct type and name', () => {
    expect(widget.type).toBe('ingramspark');
    expect(widget.name).toBe('IngramSpark');
  });

  it('should return empty download stats (physical books)', async () => {
    const validAuth: AuthConfig = {
      id: 'valid',
      type: 'api_key',
      credentials: {
        apiKey: 'test-key',
        publisherId: 'test-publisher',
      },
    };

    await widget.initialize(validAuth);

    const timeRange: TimeRange = {
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-31'),
    };

    const result = await widget.getDownloadStats(timeRange);
    expect(result.status).toBe('success');
    expect(result.data).toEqual([]);
  });
});

describe('Draft2DigitalWidget', () => {
  let widget: Draft2DigitalWidget;
  const config: WidgetConfig = {
    id: 'd2d-test',
    type: 'draft2digital',
    displayConfig: { title: 'D2D Test' },
    authConfigId: 'd2d-auth',
  };

  beforeEach(() => {
    widget = new Draft2DigitalWidget(config);
  });

  it('should have correct type and name', () => {
    expect(widget.type).toBe('draft2digital');
    expect(widget.name).toBe('Draft2Digital');
  });

  it('should throw when getting metrics without initialization', async () => {
    const timeRange: TimeRange = {
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-31'),
    };

    await expect(widget.getMetrics(timeRange)).rejects.toThrow('not initialized');
  });
});
