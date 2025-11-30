/**
 * Tests for AI Content Generation (Phase 5)
 */

import { OpenAIContentGenerator } from '../src/ai/index.js';
import type { AIContentRequest } from '../src/types/social.js';

describe('Phase 5: AI Content Generation', () => {
  let generator: OpenAIContentGenerator;

  beforeEach(() => {
    generator = new OpenAIContentGenerator();
  });

  describe('Initialization', () => {
    it('should not be initialized by default', () => {
      expect(generator.isInitialized()).toBe(false);
    });

    it('should initialize with API key', async () => {
      await generator.initialize({
        id: 'openai-auth',
        type: 'api_key',
        credentials: { apiKey: 'test-key' },
      });

      expect(generator.isInitialized()).toBe(true);
    });

    it('should throw without API key', async () => {
      await expect(generator.initialize({
        id: 'openai-auth',
        type: 'api_key',
        credentials: {},
      })).rejects.toThrow('OpenAI requires an API key');
    });
  });

  describe('Model Configuration', () => {
    it('should use default model', () => {
      expect(generator.getModel()).toBe('gpt-4-turbo');
    });

    it('should allow changing model', () => {
      generator.setModel('gpt-3.5-turbo');
      expect(generator.getModel()).toBe('gpt-3.5-turbo');
    });

    it('should accept model in config', async () => {
      await generator.initialize(
        { id: 'openai-auth', type: 'api_key', credentials: { apiKey: 'test-key' } },
        { model: 'gpt-4', defaultMaxTokens: 1000, defaultTemperature: 0.5 }
      );

      expect(generator.getModel()).toBe('gpt-4');
    });
  });

  describe('Cost Estimation', () => {
    it('should estimate cost for a request', () => {
      const cost = generator.estimateCost(500, 200);
      expect(cost).toBeGreaterThan(0);
      expect(typeof cost).toBe('number');
    });
  });

  describe('Content Generation Methods', () => {
    beforeEach(async () => {
      await generator.initialize({
        id: 'openai-auth',
        type: 'api_key',
        credentials: { apiKey: 'test-key' },
      });
    });

    it('should throw when generating without initialization', async () => {
      const uninitializedGenerator = new OpenAIContentGenerator();
      
      await expect(uninitializedGenerator.generateContent({
        type: 'app_writeup',
        prompt: 'Test prompt',
      })).rejects.toThrow('not initialized');
    });

    // Note: These tests would require mocking fetch for actual API calls
    // In a real scenario, we'd mock the API responses

    it('should have generateAppWriteup method', () => {
      expect(typeof generator.generateAppWriteup).toBe('function');
    });

    it('should have generateReleaseNotes method', () => {
      expect(typeof generator.generateReleaseNotes).toBe('function');
    });

    it('should have generateSocialCopy method', () => {
      expect(typeof generator.generateSocialCopy).toBe('function');
    });

    it('should have generateBookBlurb method', () => {
      expect(typeof generator.generateBookBlurb).toBe('function');
    });

    it('should have generateMarketingCopy method', () => {
      expect(typeof generator.generateMarketingCopy).toBe('function');
    });
  });
});
