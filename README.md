# PaynesDashboard

A Dev Hustler's Dashboard - Modular analytics integrations for app and book sales.

## Features

### Analytics Widgets

PaynesDashboard provides modular, interchangeable widgets for viewing analytics from various platforms:

- **Apple App Store Connect** - View app sales, download trends, and analytics
- **Google Play Developer Console** - Track Android app downloads and revenue
- **IngramSpark** - Monitor print book sales and distribution
- **Draft2Digital** - View eBook and print sales across retailers

### Key Capabilities

- **Modular Architecture** - Easily add, remove, or swap analytics sources
- **OAuth2 & JWT Support** - Secure authentication with industry-standard protocols
- **TypeScript** - Full type safety and excellent IDE support
- **Extensible** - Simple API for adding custom data sources

## Installation

```bash
npm install
```

## Quick Start

```typescript
import {
  WidgetRegistry,
  AppleAppStoreWidget,
} from 'paynesdashboard';
import type { WidgetConfig, AuthConfig } from 'paynesdashboard';

// Create a registry
const registry = new WidgetRegistry();

// Configure a widget
const config: WidgetConfig = {
  id: 'my-apple-widget',
  type: 'apple_app_store',
  displayConfig: { title: 'App Store Sales' },
  authConfigId: 'apple-auth',
};

// Configure authentication
const authConfig: AuthConfig = {
  id: 'apple-auth',
  type: 'jwt',
  credentials: {
    issuerId: process.env.APPLE_ISSUER_ID!,
    keyId: process.env.APPLE_KEY_ID!,
    privateKey: process.env.APPLE_PRIVATE_KEY!,
    vendorNumber: process.env.APPLE_VENDOR_NUMBER!,
  },
};

// Create and initialize the widget
const widget = await registry.createWidget(config, authConfig);

// Fetch metrics
const metrics = await widget.getMetrics({
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-01-31'),
});
```

## Available Widgets

### Apple App Store Connect

Requires JWT authentication with:
- Issuer ID from App Store Connect
- Key ID for your private key
- Private key (.p8 file content)
- Vendor number for sales reports

### Google Play Developer Console

Uses OAuth2 authentication with:
- Client ID from Google Cloud Console
- Client Secret
- Package name for your app

### IngramSpark

Uses API key authentication with:
- API key from IngramSpark account
- Publisher ID

### Draft2Digital

Uses API key authentication with:
- API key from Draft2Digital account
- Account ID

## Documentation

- [Adding and Editing Data Sources](./docs/ADDING_DATA_SOURCES.md) - Guide for creating custom widgets

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Type check
npm run lint
```

## Project Structure

```
src/
├── types/           # TypeScript interfaces and types
├── auth/            # Authentication managers
│   └── OAuth2Manager.ts
└── widgets/
    ├── BaseWidget.ts           # Abstract base class
    ├── WidgetRegistry.ts       # Widget factory registry
    ├── AppleAppStoreWidget.ts  # Apple App Store Connect
    ├── GooglePlayWidget.ts     # Google Play Developer Console
    ├── IngramSparkWidget.ts    # IngramSpark book sales
    └── Draft2DigitalWidget.ts  # Draft2Digital eBook sales
```

## License

Apache-2.0
