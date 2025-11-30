# Campaign Management Guide

This guide explains how to use the campaign management features of PaynesDashboard to create, schedule, and track social media campaigns across multiple platforms.

## Overview

The campaign management module provides:
- Campaign creation and management
- Post scheduling across platforms
- Integration with OnlySocial and Postly
- Performance tracking and analytics

## Getting Started

### Initialize Campaign Manager

```typescript
import { CampaignManager } from 'paynesdashboard';

const campaignManager = new CampaignManager();
```

### Register Platform Connectors

Before scheduling posts, you need to register connectors for each platform:

```typescript
import { OnlySocialConnector, PostlyConnector } from 'paynesdashboard';

// OnlySocial connector
const onlySocialConnector = new OnlySocialConnector();
await onlySocialConnector.initialize({
  id: 'onlysocial',
  type: 'api_key',
  credentials: {
    apiKey: process.env.ONLYSOCIAL_API_KEY!,
    accountId: process.env.ONLYSOCIAL_ACCOUNT_ID,
  },
});
campaignManager.registerConnector(onlySocialConnector);

// Postly connector
const postlyConnector = new PostlyConnector();
await postlyConnector.initialize({
  id: 'postly',
  type: 'api_key',
  credentials: {
    apiKey: process.env.POSTLY_API_KEY!,
    workspaceId: process.env.POSTLY_WORKSPACE_ID,
  },
});
campaignManager.registerConnector(postlyConnector);
```

## Campaign Operations

### Create a Campaign

```typescript
const campaign = await campaignManager.createCampaign({
  name: 'Summer Sale 2024',
  description: 'Promotional campaign for summer sale',
  platforms: ['facebook', 'twitter', 'instagram'],
  startDate: new Date('2024-06-01'),
  endDate: new Date('2024-08-31'),
});

console.log(`Created campaign: ${campaign.id}`);
```

### Add Posts to Campaign

```typescript
// Add a draft post
const post = await campaignManager.addPostToCampaign(
  campaign.id,
  '☀️ Summer Sale is HERE! Get 30% off all products! Shop now: https://example.com/sale',
  ['facebook', 'twitter']
);

// Add a scheduled post
const scheduledPost = await campaignManager.addPostToCampaign(
  campaign.id,
  '🔥 Last day of Summer Sale! Don\'t miss out!',
  ['facebook', 'instagram'],
  {
    scheduledAt: new Date('2024-08-31T10:00:00'),
    platforms: ['facebook', 'instagram'],
    autoPublish: true,
  }
);
```

### Schedule a Post

```typescript
await campaignManager.schedulePost(campaign.id, post.id, {
  scheduledAt: new Date('2024-06-01T09:00:00'),
  platforms: ['facebook', 'twitter'],
  timezone: 'America/New_York',
});
```

### Publish Immediately

```typescript
await campaignManager.publishPost(campaign.id, post.id, ['facebook', 'twitter']);
```

### Update Campaign Status

```typescript
// Activate the campaign
await campaignManager.updateCampaignStatus(campaign.id, 'active');

// Pause the campaign
await campaignManager.updateCampaignStatus(campaign.id, 'paused');

// Mark as completed
await campaignManager.updateCampaignStatus(campaign.id, 'completed');
```

## Performance Tracking

### Get Campaign Metrics

```typescript
const metrics = await campaignManager.getCampaignMetrics(campaign.id);

if (metrics.status === 'success' && metrics.data) {
  console.log('Total Reach:', metrics.data.totalReach);
  console.log('Total Engagements:', metrics.data.totalEngagements);
  console.log('Engagement Rate:', `${metrics.data.engagementRate.toFixed(2)}%`);
  
  // Platform breakdown
  for (const platform of metrics.data.platformBreakdown) {
    console.log(`${platform.platform}: ${platform.engagements} engagements`);
  }
}
```

## Supported Platforms

| Platform | OnlySocial | Postly |
|----------|------------|--------|
| Facebook | ✅ | ✅ |
| Twitter | ✅ | ✅ |
| Instagram | ✅ | ✅ |
| TikTok | ✅ | ✅ |
| YouTube | ✅ | ✅ |
| LinkedIn | ✅ | ✅ |

## Best Practices

1. **Plan Ahead**: Create campaigns at least a week in advance
2. **Vary Content**: Don't post identical content across all platforms
3. **Optimal Timing**: Use Postly's AI features for optimal posting times
4. **Monitor Metrics**: Regularly check campaign performance
5. **A/B Testing**: Create variations to test what works best

## Error Handling

```typescript
try {
  const campaign = await campaignManager.createCampaign({
    name: 'Test Campaign',
    platforms: ['facebook'],
  });
} catch (error) {
  if (error instanceof Error) {
    console.error('Campaign creation failed:', error.message);
  }
}

// Check metrics result status
const metrics = await campaignManager.getCampaignMetrics(campaignId);
if (metrics.status === 'error') {
  console.error('Error:', metrics.error?.message);
}
```

## API Reference

### CampaignManager

| Method | Description |
|--------|-------------|
| `registerConnector(connector)` | Register a social platform connector |
| `createCampaign(options)` | Create a new campaign |
| `getCampaign(id)` | Get campaign by ID |
| `getAllCampaigns()` | Get all campaigns |
| `updateCampaignStatus(id, status)` | Update campaign status |
| `deleteCampaign(id)` | Delete a campaign |
| `addPostToCampaign(...)` | Add a post to a campaign |
| `schedulePost(...)` | Schedule a post |
| `publishPost(...)` | Publish a post immediately |
| `getCampaignMetrics(id)` | Get campaign performance metrics |

### SocialConnector Interface

| Method | Description |
|--------|-------------|
| `initialize(authConfig)` | Initialize with authentication |
| `isConnected()` | Check connection status |
| `schedulePost(post)` | Schedule a post |
| `publishPost(post)` | Publish immediately |
| `getPostMetrics(posts)` | Get metrics for posts |
| `deletePost(postId)` | Delete a post |
