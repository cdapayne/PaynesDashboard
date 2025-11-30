/**
 * AI Integration
 * 
 * This module handles:
 * - OpenAI API integration
 * - Content generation for:
 *   - App store descriptions
 *   - Release notes
 *   - Marketing copy
 *   - Social media posts
 */

import OpenAI from 'openai';

export interface AIGenerationRequest {
  type: 'app-description' | 'release-notes' | 'marketing-copy' | 'social-post';
  context: string;
  tone?: 'professional' | 'casual' | 'enthusiastic';
  maxTokens?: number;
}

export interface AIGenerationResponse {
  content: string;
  tokensUsed: number;
  model: string;
  generatedAt: Date;
}

export interface OpenAIConfig {
  apiKey: string;
  model: string;
  maxTokens: number;
}

const SYSTEM_PROMPTS: Record<AIGenerationRequest['type'], string> = {
  'app-description': `You are an expert app store copywriter. Generate compelling, SEO-optimized app descriptions that highlight features and benefits. Be concise but persuasive.`,
  'release-notes': `You are a technical writer creating release notes. Be clear, concise, and highlight what's new, improved, and fixed. Use bullet points when appropriate.`,
  'marketing-copy': `You are a marketing copywriter. Create engaging, persuasive copy that drives conversions. Focus on benefits and emotional appeal.`,
  'social-post': `You are a social media expert. Create engaging posts that drive engagement. Use appropriate tone for the platform and include relevant emojis when suitable.`,
};

const TONE_INSTRUCTIONS: Record<string, string> = {
  professional: 'Use a professional, formal tone.',
  casual: 'Use a casual, friendly, conversational tone.',
  enthusiastic: 'Use an enthusiastic, energetic, and exciting tone.',
};

export class AIService {
  private client: OpenAI | null = null;
  private model: string = 'gpt-3.5-turbo';
  private maxTokens: number = 1000;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      this.client = new OpenAI({ apiKey });
    }
  }

  isConfigured(): boolean {
    return this.client !== null;
  }

  async generateContent(request: AIGenerationRequest): Promise<AIGenerationResponse | null> {
    if (!this.client) {
      console.warn('OpenAI API key not configured');
      return null;
    }

    try {
      const systemPrompt = SYSTEM_PROMPTS[request.type];
      const toneInstruction = request.tone ? TONE_INSTRUCTIONS[request.tone] : '';
      
      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: `${systemPrompt} ${toneInstruction}`.trim(),
          },
          {
            role: 'user',
            content: request.context,
          },
        ],
        max_tokens: request.maxTokens || this.maxTokens,
        temperature: 0.7,
      });

      const content = completion.choices[0]?.message?.content || '';
      const tokensUsed = completion.usage?.total_tokens || 0;

      return {
        content,
        tokensUsed,
        model: this.model,
        generatedAt: new Date(),
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      return null;
    }
  }

  async generateAppDescription(appName: string, features: string[]): Promise<string | null> {
    const context = `Generate an app store description for "${appName}" with these features:\n${features.map(f => `- ${f}`).join('\n')}`;
    
    const response = await this.generateContent({
      type: 'app-description',
      context,
      tone: 'enthusiastic',
    });

    return response?.content || null;
  }

  async generateReleaseNotes(version: string, changes: string[]): Promise<string | null> {
    const context = `Generate release notes for version ${version} with these changes:\n${changes.map(c => `- ${c}`).join('\n')}`;
    
    const response = await this.generateContent({
      type: 'release-notes',
      context,
      tone: 'professional',
    });

    return response?.content || null;
  }

  async generateMarketingCopy(product: string, audience: string): Promise<string | null> {
    const context = `Create marketing copy for "${product}" targeting ${audience}.`;
    
    const response = await this.generateContent({
      type: 'marketing-copy',
      context,
      tone: 'enthusiastic',
    });

    return response?.content || null;
  }

  async generateSocialPost(topic: string, platform: string): Promise<string | null> {
    const context = `Create a ${platform} post about: ${topic}. Follow ${platform}'s best practices for engagement.`;
    
    const response = await this.generateContent({
      type: 'social-post',
      context,
      tone: 'casual',
    });

    return response?.content || null;
  }
}

export const aiService = new AIService();
