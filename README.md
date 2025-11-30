# PaynesDashboard

A Dev Hustler's Dashboard - Comprehensive analytics, social media management, and AI-powered content generation platform.

## Features

### Phase 2: Analytics Widgets

- **Apple App Store Connect** - View app sales, download trends, and analytics
- **Google Play Developer Console** - Track Android app downloads and revenue
- **IngramSpark** - Monitor print book sales and distribution
- **Draft2Digital** - View eBook and print sales across retailers

### Phase 3: Social & RSS Widgets

- **Facebook** - Page likes, followers, and engagement metrics
- **YouTube** - Subscriber counts, views, and channel analytics
- **TikTok** - Followers, likes, and video performance
- **Amazon Affiliate** - Affiliate link analytics and earnings
- **RSS Feed** - Aggregate and display multiple RSS feeds

### Phase 4: Social Media Campaign Management

- **Campaign Manager** - Create, edit, and schedule posts
- **OnlySocial Integration** - Schedule posts via OnlySocial API
- **Postly Integration** - Schedule posts via Postly API
- **Performance Tracking** - Track campaign metrics across platforms

### Phase 5: AI Content Generation

- **OpenAI Integration** - GPT-4/GPT-3.5 powered content generation
- **App Write-ups** - Generate compelling app store descriptions
- **Release Notes** - Create professional release notes and changelogs
- **Social Media Copy** - Platform-optimized social media posts
- **Book Blurbs** - Engaging book descriptions and marketing copy

## Installation

```bash
npm install
```

## Quick Start

### Analytics Widgets

```typescript
import { WidgetRegistry } from 'paynesdashboard';
import type { WidgetConfig, AuthConfig } from 'paynesdashboard';

const registry = new WidgetRegistry();

// Create an Apple App Store widget
const config: WidgetConfig = {
  id: 'apple-sales',
  type: 'apple_app_store',
  displayConfig: { title: 'App Store Sales' },
  authConfigId: 'apple-auth',
};

const authConfig: AuthConfig = {
  id: 'apple-auth',
  type: 'jwt',
  credentials: {
    issuerId: process.env.APPLE_ISSUER_ID!,
    keyId: process.env.APPLE_KEY_ID!,
    privateKey: process.env.APPLE_PRIVATE_KEY!,
  },
};

const widget = await registry.createWidget(config, authConfig);
const metrics = await widget.getMetrics({
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-01-31'),
});
```

### Campaign Management

```typescript
import { CampaignManager, OnlySocialConnector } from 'paynesdashboard';

const campaignManager = new CampaignManager();

// Register a connector
const connector = new OnlySocialConnector();
await connector.initialize({
  id: 'onlysocial-auth',
  type: 'api_key',
  credentials: { apiKey: process.env.ONLYSOCIAL_API_KEY! },
});
campaignManager.registerConnector(connector);

// Create a campaign
const campaign = await campaignManager.createCampaign({
  name: 'Product Launch',
  platforms: ['facebook', 'twitter', 'instagram'],
});

// Add and schedule a post
const post = await campaignManager.addPostToCampaign(
  campaign.id,
  'Exciting news! Our new product is launching tomorrow! 🚀',
  ['facebook', 'twitter']
);

await campaignManager.schedulePost(campaign.id, post.id, {
  scheduledAt: new Date('2024-02-01T09:00:00'),
  platforms: ['facebook', 'twitter'],
});
```

### AI Content Generation

```typescript
import { OpenAIContentGenerator } from 'paynesdashboard';

const generator = new OpenAIContentGenerator();

await generator.initialize({
  id: 'openai-auth',
  type: 'api_key',
  credentials: { apiKey: process.env.OPENAI_API_KEY! },
});

// Generate app write-up
const appWriteup = await generator.generateAppWriteup(
  'TaskMaster Pro',
  ['Task management', 'Calendar sync', 'Team collaboration'],
  'Busy professionals',
  'professional'
);

// Generate social media copy
const socialCopy = await generator.generateSocialCopy(
  'New feature release',
  'twitter',
  'Try it now!'
);

// Generate release notes
const releaseNotes = await generator.generateReleaseNotes(
  'TaskMaster Pro',
  '2.0.0',
  [
    { type: 'feature', description: 'Added team collaboration' },
    { type: 'improvement', description: 'Improved calendar sync' },
    { type: 'fix', description: 'Fixed notification bug' },
  ]
);
```

## Available Widgets

| Widget | Type | Auth Method | Description |
|--------|------|-------------|-------------|
| Apple App Store | `apple_app_store` | JWT | App sales and downloads |
| Google Play | `google_play` | OAuth2 | Android app analytics |
| IngramSpark | `ingramspark` | API Key | Book sales data |
| Draft2Digital | `draft2digital` | API Key | eBook sales and royalties |
| Facebook | `facebook` | OAuth2 | Page metrics |
| YouTube | `youtube` | OAuth2 | Channel analytics |
| TikTok | `tiktok` | OAuth2 | Profile metrics |
| Amazon Affiliate | `amazon_affiliate` | API Key | Affiliate earnings |
| RSS Feed | `rss_feed` | None | Feed aggregation |

## Documentation

- [Adding and Editing Data Sources](./docs/ADDING_DATA_SOURCES.md)
- [Campaign Management Guide](./docs/CAMPAIGN_MANAGEMENT.md)
- [AI Content Generation Guide](./docs/AI_CONTENT.md)

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
├── widgets/         # Analytics widgets
│   ├── BaseWidget.ts
│   ├── WidgetRegistry.ts
│   ├── AppleAppStoreWidget.ts
│   ├── GooglePlayWidget.ts
│   ├── IngramSparkWidget.ts
│   ├── Draft2DigitalWidget.ts
│   ├── FacebookWidget.ts
│   ├── YouTubeWidget.ts
│   ├── TikTokWidget.ts
│   ├── AmazonAffiliateWidget.ts
│   └── RSSFeedWidget.ts
├── campaigns/       # Campaign management
│   ├── CampaignManager.ts
│   ├── OnlySocialConnector.ts
│   └── PostlyConnector.ts
└── ai/              # AI content generation
    └── OpenAIContentGenerator.ts
```

## Environment Variables

Copy `.env.example` to `.env` and configure your credentials:

```bash
# Apple App Store Connect
APPLE_ISSUER_ID=
APPLE_KEY_ID=
APPLE_PRIVATE_KEY=

# Google Play
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Social Media
FACEBOOK_CLIENT_ID=
FACEBOOK_CLIENT_SECRET=
YOUTUBE_CLIENT_ID=
YOUTUBE_CLIENT_SECRET=
TIKTOK_CLIENT_KEY=
TIKTOK_CLIENT_SECRET=

# Campaign Management
ONLYSOCIAL_API_KEY=
POSTLY_API_KEY=

# AI
OPENAI_API_KEY=
```

## License

Apache-2.0
