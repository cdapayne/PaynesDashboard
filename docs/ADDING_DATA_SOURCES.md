# Adding and Editing Data Sources

This document explains how to add new analytics data sources (widgets) to the PaynesDashboard and how to edit existing ones.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Adding a New Data Source](#adding-a-new-data-source)
3. [Authentication Methods](#authentication-methods)
4. [Editing Existing Widgets](#editing-existing-widgets)
5. [Widget Configuration](#widget-configuration)
6. [Testing Widgets](#testing-widgets)
7. [Best Practices](#best-practices)

## Architecture Overview

The dashboard uses a modular widget architecture:

```
src/
├── types/           # TypeScript interfaces and types
├── auth/            # Authentication managers (OAuth2, JWT, API Key)
└── widgets/
    ├── BaseWidget.ts        # Abstract base class
    ├── WidgetRegistry.ts    # Widget factory registry
    ├── AppleAppStoreWidget.ts
    ├── GooglePlayWidget.ts
    ├── IngramSparkWidget.ts
    └── Draft2DigitalWidget.ts
```

### Key Concepts

- **Widget**: A module that fetches and provides analytics data from a specific service
- **WidgetFactory**: Creates widget instances
- **WidgetRegistry**: Manages factory registration and widget lifecycle
- **AuthConfig**: Service-specific authentication configuration

## Adding a New Data Source

### Step 1: Create the Widget Class

Create a new file in `src/widgets/` following this template:

```typescript
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

// Define service-specific auth configuration
export interface MyServiceAuthConfig extends AuthConfig {
  type: 'api_key' | 'oauth2' | 'jwt';
  credentials: {
    // Add required credentials
    apiKey: string;
    // ... other fields
  };
}

export class MyServiceWidget extends BaseWidget {
  readonly type = 'my_service';
  readonly name = 'My Service Name';
  readonly description = 'Description of what this widget provides';

  constructor(config: WidgetConfig) {
    super(config);
  }

  protected async validateAuth(): Promise<void> {
    if (!this.authConfig) {
      throw new Error('Authentication configuration is required');
    }
    // Validate required credentials
    const { apiKey } = this.authConfig.credentials;
    if (!apiKey) {
      throw new Error('MyService auth requires apiKey');
    }
  }

  async isAuthenticated(): Promise<boolean> {
    // Return true if authentication is valid
    return !!this.authConfig?.credentials['apiKey'];
  }

  async refreshAuth(): Promise<void> {
    // Refresh tokens if applicable
  }

  async getMetrics(timeRange: TimeRange): Promise<WidgetDataResult<AnalyticsMetrics>> {
    this.ensureInitialized();
    try {
      // Fetch metrics from API
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
      const downloadStats: DownloadStats[] = [];
      return this.createSuccessResult(downloadStats);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return this.createErrorResult('FETCH_ERROR', message, true);
    }
  }
}

// Factory for creating widget instances
export class MyServiceWidgetFactory {
  createWidget(config: WidgetConfig): MyServiceWidget {
    return new MyServiceWidget(config);
  }

  getWidgetType(): string {
    return 'my_service';
  }
}
```

### Step 2: Register the Widget Factory

Add your factory to `WidgetRegistry.ts`:

```typescript
import { MyServiceWidgetFactory } from './MyServiceWidget.js';

// In registerBuiltInFactories():
private registerBuiltInFactories(): void {
  // ... existing factories
  this.registerFactory(new MyServiceWidgetFactory());
}
```

### Step 3: Export from Index

Update `src/widgets/index.ts`:

```typescript
export { MyServiceWidget, MyServiceWidgetFactory } from './MyServiceWidget.js';
export type { MyServiceAuthConfig } from './MyServiceWidget.js';
```

### Step 4: Add Tests

Create tests in `tests/`:

```typescript
describe('MyServiceWidget', () => {
  it('should have correct type and name', () => {
    const widget = new MyServiceWidget(config);
    expect(widget.type).toBe('my_service');
  });
  // ... more tests
});
```

## Authentication Methods

### OAuth2 Authentication

For services using OAuth2 (e.g., Google Play):

```typescript
import { OAuth2Manager } from '../auth/OAuth2Manager.js';

protected async validateAuth(): Promise<void> {
  const oauth2Config: OAuth2Config = {
    clientId: this.authConfig.credentials['clientId'],
    clientSecret: this.authConfig.credentials['clientSecret'],
    redirectUri: 'http://localhost:3000/callback',
    scope: ['required_scope'],
    authorizationUrl: 'https://service.com/oauth/authorize',
    tokenUrl: 'https://service.com/oauth/token',
  };
  this.oauth2Manager = new OAuth2Manager(oauth2Config);
}

// Get authorization URL for user
getAuthorizationUrl(): string {
  return this.oauth2Manager.getAuthorizationUrl();
}

// Handle callback
async handleCallback(code: string): Promise<void> {
  await this.oauth2Manager.exchangeCodeForToken(code);
}
```

### JWT Authentication

For services using JWT (e.g., Apple App Store Connect):

```typescript
private async generateJWT(): Promise<string> {
  const header = { alg: 'ES256', kid: keyId, typ: 'JWT' };
  const payload = {
    iss: issuerId,
    exp: Math.floor(Date.now() / 1000) + 20 * 60,
    aud: 'service-v1',
  };
  // Sign with private key
  return signedToken;
}
```

### API Key Authentication

For services using API keys (e.g., IngramSpark, Draft2Digital):

```typescript
private async fetchWithAuth(url: string): Promise<Response> {
  return fetch(url, {
    headers: {
      'X-API-Key': this.apiKey,
      'Content-Type': 'application/json',
    },
  });
}
```

## Editing Existing Widgets

### Modifying API Endpoints

1. Locate the widget file in `src/widgets/`
2. Update the `baseUrl` or specific endpoint URLs
3. Modify the fetch methods as needed
4. Run tests to verify changes

### Adding New Methods

1. Add the method to your widget class
2. If it's a common operation, consider adding to `BaseWidget` or `AnalyticsWidget` interface
3. Update exports and add tests

### Changing Authentication

1. Update the auth config interface
2. Modify `validateAuth()` and related methods
3. Update documentation with new credential requirements

## Widget Configuration

### WidgetConfig Structure

```typescript
interface WidgetConfig {
  id: string;           // Unique identifier for this widget instance
  type: string;         // Widget type (e.g., 'apple_app_store')
  displayConfig: {
    title: string;      // Display title
    refreshInterval?: number;  // Auto-refresh interval in ms
    showTrend?: boolean;
    chartType?: 'line' | 'bar' | 'pie';
  };
  authConfigId: string; // Reference to auth configuration
  customConfig?: {      // Service-specific options
    packageName?: string;
    // ... other options
  };
}
```

### AuthConfig Structure

```typescript
interface AuthConfig {
  id: string;
  type: 'oauth2' | 'api_key' | 'jwt';
  credentials: Record<string, string>;
}
```

## Testing Widgets

### Unit Tests

```typescript
describe('MyWidget', () => {
  it('should initialize with valid auth', async () => {
    const widget = new MyWidget(config);
    await widget.initialize(validAuthConfig);
    expect(await widget.isAuthenticated()).toBe(true);
  });

  it('should handle API errors gracefully', async () => {
    // Mock fetch to return error
    const result = await widget.getMetrics(timeRange);
    expect(result.status).toBe('error');
    expect(result.error?.recoverable).toBe(true);
  });
});
```

### Integration Tests

Test actual API calls in a separate test suite with real credentials:

```typescript
describe.skip('MyWidget Integration', () => {
  it('should fetch real data', async () => {
    const widget = new MyWidget(config);
    await widget.initialize(realAuthConfig);
    const result = await widget.getMetrics(timeRange);
    expect(result.status).toBe('success');
  });
});
```

## Best Practices

### Error Handling

- Always use `try/catch` in async methods
- Return `WidgetDataResult` with appropriate error codes
- Set `recoverable: true` for transient errors (network, rate limiting)
- Set `recoverable: false` for configuration errors

### Rate Limiting

- Implement rate limiting for APIs with quotas
- Cache responses when appropriate
- Use exponential backoff for retries

### Security

- Never store credentials in code
- Use environment variables for sensitive data
- Validate all user input
- Use HTTPS for all API calls

### Performance

- Implement pagination for large datasets
- Use batch requests when available
- Cache auth tokens appropriately

### Documentation

- Document all required credentials
- Include API reference links
- Provide example configurations
- Note any service-specific limitations
