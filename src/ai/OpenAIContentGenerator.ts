/**
 * OpenAI Content Generator
 * 
 * Provides AI-powered content generation for:
 * - App write-ups and descriptions
 * - Release notes and changelogs
 * - Social media copy for campaigns
 * - Book blurbs and marketing copy
 * 
 * API Documentation: https://platform.openai.com/docs/api-reference
 */

import type { AIContentRequest, AIContentResponse } from '../types/social.js';
import type { AuthConfig } from '../types/index.js';

/**
 * OpenAI authentication configuration
 */
export interface OpenAIAuthConfig extends AuthConfig {
  type: 'api_key';
  credentials: {
    apiKey: string;
    organizationId?: string;
  };
}

/**
 * OpenAI model options
 */
export type OpenAIModel = 'gpt-4' | 'gpt-4-turbo' | 'gpt-3.5-turbo';

/**
 * OpenAI configuration
 */
export interface OpenAIConfig {
  model: OpenAIModel;
  defaultMaxTokens: number;
  defaultTemperature: number;
}

/**
 * Content template for different content types
 */
interface ContentTemplate {
  systemPrompt: string;
  maxTokens: number;
  temperature: number;
}

/**
 * Predefined content templates
 */
const CONTENT_TEMPLATES: Record<AIContentRequest['type'], ContentTemplate> = {
  app_writeup: {
    systemPrompt: `You are an expert app store copywriter. Create compelling, concise app descriptions that highlight key features and benefits. Use persuasive language that appeals to potential users. Include relevant keywords for discoverability.`,
    maxTokens: 500,
    temperature: 0.7,
  },
  release_notes: {
    systemPrompt: `You are a technical writer specializing in software release notes. Create clear, organized release notes that communicate changes effectively. Group changes by type (features, improvements, fixes). Use bullet points for readability.`,
    maxTokens: 800,
    temperature: 0.5,
  },
  social_copy: {
    systemPrompt: `You are a social media marketing expert. Create engaging, platform-appropriate social media posts that drive engagement. Keep posts concise, use relevant hashtags, and include calls-to-action when appropriate.`,
    maxTokens: 280,
    temperature: 0.8,
  },
  book_blurb: {
    systemPrompt: `You are a book marketing specialist. Create compelling book blurbs that hook readers and convey the essence of the story without spoilers. Use vivid language and end with an intriguing question or statement.`,
    maxTokens: 300,
    temperature: 0.7,
  },
  marketing_copy: {
    systemPrompt: `You are a professional copywriter specializing in marketing content. Create persuasive marketing copy that highlights value propositions, addresses pain points, and drives conversions. Use clear, benefit-focused language.`,
    maxTokens: 600,
    temperature: 0.7,
  },
};

/**
 * Style modifiers for content generation
 */
const STYLE_MODIFIERS: Record<NonNullable<AIContentRequest['style']>, string> = {
  professional: 'Use a professional, polished tone. Be authoritative and trustworthy.',
  casual: 'Use a friendly, conversational tone. Be approachable and relatable.',
  creative: 'Use creative, imaginative language. Be bold and attention-grabbing.',
  technical: 'Use precise, technical language. Be accurate and detailed.',
};

/**
 * OpenAI Content Generator class
 */
export class OpenAIContentGenerator {
  private apiKey?: string;
  private organizationId?: string;
  private baseUrl = 'https://api.openai.com/v1';
  private model: OpenAIModel = 'gpt-4-turbo';
  private defaultMaxTokens = 500;
  private defaultTemperature = 0.7;
  private initialized = false;

  /**
   * Pricing per 1K tokens (approximate, varies by model)
   */
  private readonly PRICING = {
    'gpt-4': { input: 0.03, output: 0.06 },
    'gpt-4-turbo': { input: 0.01, output: 0.03 },
    'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
  };

  /**
   * Initialize the generator with authentication
   */
  async initialize(authConfig: AuthConfig, config?: Partial<OpenAIConfig>): Promise<void> {
    const { apiKey, organizationId } = authConfig.credentials;
    if (!apiKey) {
      throw new Error('OpenAI requires an API key');
    }

    this.apiKey = apiKey;
    this.organizationId = organizationId;

    if (config) {
      this.model = config.model ?? this.model;
      this.defaultMaxTokens = config.defaultMaxTokens ?? this.defaultMaxTokens;
      this.defaultTemperature = config.defaultTemperature ?? this.defaultTemperature;
    }

    this.initialized = true;
  }

  /**
   * Check if initialized
   */
  isInitialized(): boolean {
    return this.initialized && !!this.apiKey;
  }

  /**
   * Generate content based on request
   */
  async generateContent(request: AIContentRequest): Promise<AIContentResponse> {
    if (!this.isInitialized()) {
      throw new Error('OpenAI generator is not initialized');
    }

    const template = CONTENT_TEMPLATES[request.type];
    const styleModifier = request.style ? STYLE_MODIFIERS[request.style] : '';

    const systemPrompt = styleModifier 
      ? `${template.systemPrompt}\n\nStyle guidance: ${styleModifier}`
      : template.systemPrompt;

    let userPrompt = request.prompt;
    if (request.context) {
      const contextStr = Object.entries(request.context)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');
      userPrompt = `${request.prompt}\n\nContext:\n${contextStr}`;
    }

    const maxTokens = request.maxTokens ?? template.maxTokens;
    const temperature = request.temperature ?? template.temperature;

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...(this.organizationId && { 'OpenAI-Organization': this.organizationId }),
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: maxTokens,
        temperature,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})) as { error?: { message?: string } };
      const errorMessage = errorData?.error?.message ?? 'API request failed';
      throw new Error(`OpenAI API error: ${response.status} - ${errorMessage}`);
    }

    const data = await response.json() as {
      choices: { message: { content: string } }[];
      usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
    };

    const content = data.choices[0]?.message?.content ?? '';
    const tokensUsed = data.usage?.total_tokens ?? 0;
    const estimatedCost = this.calculateCost(
      data.usage?.prompt_tokens ?? 0,
      data.usage?.completion_tokens ?? 0
    );

    return {
      content,
      tokensUsed,
      estimatedCost,
      generatedAt: new Date(),
    };
  }

  /**
   * Generate app write-up
   */
  async generateAppWriteup(
    appName: string,
    features: string[],
    targetAudience?: string,
    style?: AIContentRequest['style']
  ): Promise<AIContentResponse> {
    return this.generateContent({
      type: 'app_writeup',
      prompt: `Create an app store description for "${appName}".`,
      context: {
        'App Name': appName,
        'Key Features': features.join(', '),
        ...(targetAudience && { 'Target Audience': targetAudience }),
      },
      style,
    });
  }

  /**
   * Generate release notes
   */
  async generateReleaseNotes(
    appName: string,
    version: string,
    changes: { type: 'feature' | 'improvement' | 'fix'; description: string }[]
  ): Promise<AIContentResponse> {
    const changesSummary = changes
      .map(c => `[${c.type}] ${c.description}`)
      .join('\n');

    return this.generateContent({
      type: 'release_notes',
      prompt: `Create release notes for ${appName} version ${version}.`,
      context: {
        'App Name': appName,
        'Version': version,
        'Changes': changesSummary,
      },
      style: 'professional',
    });
  }

  /**
   * Generate social media copy
   */
  async generateSocialCopy(
    topic: string,
    platform: 'facebook' | 'twitter' | 'instagram' | 'linkedin',
    callToAction?: string,
    style?: AIContentRequest['style']
  ): Promise<AIContentResponse> {
    const platformGuidelines: Record<string, string> = {
      facebook: 'Optimize for engagement with questions and reactions. Can be longer form.',
      twitter: 'Keep under 280 characters. Use hashtags sparingly but effectively.',
      instagram: 'Focus on visual storytelling language. Use relevant hashtags.',
      linkedin: 'Professional tone. Focus on industry insights and value.',
    };

    return this.generateContent({
      type: 'social_copy',
      prompt: `Create a ${platform} post about: ${topic}`,
      context: {
        'Platform': platform,
        'Guidelines': platformGuidelines[platform] ?? '',
        ...(callToAction && { 'Call to Action': callToAction }),
      },
      style: style ?? 'casual',
    });
  }

  /**
   * Generate book blurb
   */
  async generateBookBlurb(
    title: string,
    genre: string,
    plotSummary: string,
    targetAudience?: string
  ): Promise<AIContentResponse> {
    return this.generateContent({
      type: 'book_blurb',
      prompt: `Create a compelling book blurb for "${title}".`,
      context: {
        'Title': title,
        'Genre': genre,
        'Plot Summary': plotSummary,
        ...(targetAudience && { 'Target Audience': targetAudience }),
      },
      style: 'creative',
    });
  }

  /**
   * Generate marketing copy
   */
  async generateMarketingCopy(
    product: string,
    valueProposition: string,
    targetAudience: string,
    style?: AIContentRequest['style']
  ): Promise<AIContentResponse> {
    return this.generateContent({
      type: 'marketing_copy',
      prompt: `Create marketing copy for ${product}.`,
      context: {
        'Product': product,
        'Value Proposition': valueProposition,
        'Target Audience': targetAudience,
      },
      style: style ?? 'professional',
    });
  }

  /**
   * Calculate estimated cost based on token usage
   */
  private calculateCost(inputTokens: number, outputTokens: number): number {
    const pricing = this.PRICING[this.model];
    const inputCost = (inputTokens / 1000) * pricing.input;
    const outputCost = (outputTokens / 1000) * pricing.output;
    return Math.round((inputCost + outputCost) * 10000) / 10000; // Round to 4 decimal places
  }

  /**
   * Get current model
   */
  getModel(): OpenAIModel {
    return this.model;
  }

  /**
   * Set model
   */
  setModel(model: OpenAIModel): void {
    this.model = model;
  }

  /**
   * Estimate cost for a request
   */
  estimateCost(promptLength: number, expectedOutputLength: number): number {
    // Rough estimate: 1 token ≈ 4 characters
    const estimatedInputTokens = Math.ceil(promptLength / 4);
    const estimatedOutputTokens = Math.ceil(expectedOutputLength / 4);
    return this.calculateCost(estimatedInputTokens, estimatedOutputTokens);
  }
}

/**
 * Default OpenAI content generator singleton
 */
export const defaultContentGenerator = new OpenAIContentGenerator();
