# AI Content Generation Guide

This guide explains how to use OpenAI integration for AI-powered content generation in PaynesDashboard.

## Overview

The AI content generation module provides:
- App store description writing
- Release notes generation
- Social media copy creation
- Book blurbs and marketing copy
- Cost estimation and tracking

## Getting Started

### Initialize the Generator

```typescript
import { OpenAIContentGenerator } from 'paynesdashboard';

const generator = new OpenAIContentGenerator();

await generator.initialize({
  id: 'openai-auth',
  type: 'api_key',
  credentials: {
    apiKey: process.env.OPENAI_API_KEY!,
    organizationId: process.env.OPENAI_ORG_ID, // Optional
  },
});
```

### Configuration Options

```typescript
await generator.initialize(authConfig, {
  model: 'gpt-4-turbo',        // Model to use
  defaultMaxTokens: 500,        // Default max tokens
  defaultTemperature: 0.7,      // Default creativity level
});
```

## Content Types

### App Write-ups

Generate compelling app store descriptions:

```typescript
const result = await generator.generateAppWriteup(
  'TaskMaster Pro',                         // App name
  [                                          // Features
    'Smart task management',
    'Calendar integration',
    'Team collaboration',
    'Cross-platform sync',
  ],
  'Busy professionals and teams',           // Target audience
  'professional'                             // Style
);

console.log(result.content);
console.log(`Tokens used: ${result.tokensUsed}`);
console.log(`Estimated cost: $${result.estimatedCost}`);
```

### Release Notes

Generate professional release notes:

```typescript
const result = await generator.generateReleaseNotes(
  'TaskMaster Pro',     // App name
  '2.5.0',              // Version
  [                     // Changes
    { type: 'feature', description: 'Added dark mode support' },
    { type: 'feature', description: 'New team dashboard' },
    { type: 'improvement', description: 'Faster sync performance' },
    { type: 'improvement', description: 'Reduced battery usage' },
    { type: 'fix', description: 'Fixed calendar sync issues' },
    { type: 'fix', description: 'Resolved notification delays' },
  ]
);
```

### Social Media Copy

Generate platform-optimized social posts:

```typescript
// Twitter post
const twitterPost = await generator.generateSocialCopy(
  'We just launched dark mode!',
  'twitter',
  'Update now!',
  'casual'
);

// LinkedIn post
const linkedinPost = await generator.generateSocialCopy(
  'Our Q4 productivity report is out',
  'linkedin',
  'Download the full report',
  'professional'
);

// Instagram post
const instagramPost = await generator.generateSocialCopy(
  'Behind the scenes of our latest feature',
  'instagram',
  'Link in bio',
  'creative'
);
```

### Book Blurbs

Generate engaging book descriptions:

```typescript
const result = await generator.generateBookBlurb(
  'The Code Whisperer',                    // Title
  'Tech Thriller',                          // Genre
  'A brilliant programmer discovers a hidden message in legacy code that could expose a global conspiracy. As she races to decode the truth, powerful forces will stop at nothing to keep their secrets buried.',
  'Tech enthusiasts and thriller fans'      // Target audience
);
```

### Marketing Copy

Generate persuasive marketing content:

```typescript
const result = await generator.generateMarketingCopy(
  'TaskMaster Pro',                        // Product
  'Manage tasks, not chaos',               // Value proposition
  'Small business owners',                  // Target audience
  'professional'
);
```

## Styles

The generator supports four content styles:

| Style | Description | Best For |
|-------|-------------|----------|
| `professional` | Polished, authoritative | Business apps, B2B |
| `casual` | Friendly, conversational | Consumer apps, social |
| `creative` | Bold, imaginative | Entertainment, games |
| `technical` | Precise, detailed | Developer tools, utilities |

## Advanced Usage

### Custom Content Generation

For full control, use the `generateContent` method:

```typescript
const result = await generator.generateContent({
  type: 'marketing_copy',
  prompt: 'Create a landing page headline for a fitness app',
  context: {
    'App Name': 'FitTrack',
    'Key Feature': 'AI-powered workout recommendations',
    'Target Audience': 'Fitness beginners',
  },
  maxTokens: 100,
  temperature: 0.8,
  style: 'creative',
});
```

### Cost Estimation

Estimate costs before generating:

```typescript
// Estimate based on prompt and expected output length
const estimatedCost = generator.estimateCost(500, 200);
console.log(`Estimated cost: $${estimatedCost}`);
```

### Model Selection

Choose the right model for your needs:

```typescript
// For higher quality, use GPT-4
generator.setModel('gpt-4');

// For faster/cheaper generation, use GPT-3.5
generator.setModel('gpt-3.5-turbo');

// For balanced performance, use GPT-4 Turbo
generator.setModel('gpt-4-turbo');
```

## Pricing

Approximate costs per 1,000 tokens (as of 2024):

| Model | Input | Output |
|-------|-------|--------|
| GPT-4 | $0.03 | $0.06 |
| GPT-4 Turbo | $0.01 | $0.03 |
| GPT-3.5 Turbo | $0.0005 | $0.0015 |

## Best Practices

1. **Be Specific**: Provide detailed prompts for better results
2. **Use Context**: Add relevant context for more accurate content
3. **Choose Appropriate Style**: Match style to your audience
4. **Review and Edit**: AI-generated content should be reviewed
5. **Monitor Costs**: Track token usage to manage API costs
6. **Cache Results**: Store generated content to avoid regeneration

## Error Handling

```typescript
try {
  const result = await generator.generateContent({
    type: 'app_writeup',
    prompt: 'Create description for my app',
  });
  
  console.log(result.content);
} catch (error) {
  if (error instanceof Error) {
    if (error.message.includes('rate limit')) {
      console.log('Rate limited, waiting...');
      // Implement backoff
    } else if (error.message.includes('quota')) {
      console.log('API quota exceeded');
    } else {
      console.error('Generation failed:', error.message);
    }
  }
}
```

## API Reference

### OpenAIContentGenerator

| Method | Description |
|--------|-------------|
| `initialize(auth, config?)` | Initialize with API key |
| `isInitialized()` | Check initialization status |
| `generateContent(request)` | Generate content from request |
| `generateAppWriteup(...)` | Generate app description |
| `generateReleaseNotes(...)` | Generate release notes |
| `generateSocialCopy(...)` | Generate social media post |
| `generateBookBlurb(...)` | Generate book description |
| `generateMarketingCopy(...)` | Generate marketing content |
| `getModel()` | Get current model |
| `setModel(model)` | Set model to use |
| `estimateCost(input, output)` | Estimate generation cost |

### AIContentRequest

```typescript
interface AIContentRequest {
  type: 'app_writeup' | 'release_notes' | 'social_copy' | 'book_blurb' | 'marketing_copy';
  prompt: string;
  context?: Record<string, string>;
  maxTokens?: number;
  temperature?: number;
  style?: 'professional' | 'casual' | 'creative' | 'technical';
}
```

### AIContentResponse

```typescript
interface AIContentResponse {
  content: string;
  tokensUsed: number;
  estimatedCost: number;
  generatedAt: Date;
}
```
