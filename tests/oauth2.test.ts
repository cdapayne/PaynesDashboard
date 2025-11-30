/**
 * Tests for OAuth2Manager
 */

import { OAuth2Manager } from '../src/auth/OAuth2Manager.js';
import type { OAuth2Config } from '../src/types/index.js';

describe('OAuth2Manager', () => {
  const baseConfig: OAuth2Config = {
    clientId: 'test-client-id',
    clientSecret: 'test-client-secret',
    redirectUri: 'http://localhost:3000/callback',
    scope: ['read', 'write'],
    authorizationUrl: 'https://auth.example.com/authorize',
    tokenUrl: 'https://auth.example.com/token',
  };

  describe('authorization URL', () => {
    it('should generate correct authorization URL', () => {
      const manager = new OAuth2Manager(baseConfig);
      const url = manager.getAuthorizationUrl();

      expect(url).toContain('https://auth.example.com/authorize');
      expect(url).toContain('client_id=test-client-id');
      expect(url).toContain('redirect_uri=');
      expect(url).toContain('response_type=code');
      expect(url).toContain('scope=read+write');
    });

    it('should include state parameter when provided', () => {
      const manager = new OAuth2Manager(baseConfig);
      const url = manager.getAuthorizationUrl('my-state');

      expect(url).toContain('state=my-state');
    });
  });

  describe('authentication status', () => {
    it('should return false when not authenticated', () => {
      const manager = new OAuth2Manager(baseConfig);
      expect(manager.isAuthenticated()).toBe(false);
    });

    it('should return true after setting tokens', () => {
      const manager = new OAuth2Manager(baseConfig);
      manager.setTokens('access-token');
      expect(manager.isAuthenticated()).toBe(true);
    });
  });

  describe('token expiration', () => {
    it('should return false when no expiry set', () => {
      const manager = new OAuth2Manager(baseConfig);
      manager.setTokens('access-token');
      expect(manager.isTokenExpired()).toBe(false);
    });

    it('should return true when token is expired', () => {
      const manager = new OAuth2Manager(baseConfig);
      const pastDate = new Date(Date.now() - 1000);
      manager.setTokens('access-token', undefined, pastDate);
      expect(manager.isTokenExpired()).toBe(true);
    });

    it('should return false when token is not expired', () => {
      const manager = new OAuth2Manager(baseConfig);
      const futureDate = new Date(Date.now() + 3600000);
      manager.setTokens('access-token', undefined, futureDate);
      expect(manager.isTokenExpired()).toBe(false);
    });

    it('should respect buffer time', () => {
      const manager = new OAuth2Manager(baseConfig);
      // Token expires in 30 seconds
      const almostExpired = new Date(Date.now() + 30000);
      manager.setTokens('access-token', undefined, almostExpired);
      // With 60 second buffer, it should be considered expired
      expect(manager.isTokenExpired(60)).toBe(true);
      // With 10 second buffer, it should not be expired
      expect(manager.isTokenExpired(10)).toBe(false);
    });
  });

  describe('token management', () => {
    it('should set and preserve refresh token', () => {
      const manager = new OAuth2Manager(baseConfig);
      manager.setTokens('access-token', 'refresh-token');
      const config = manager.getConfig();
      expect(config.accessToken).toBe('access-token');
      expect(config.refreshToken).toBe('refresh-token');
    });

    it('should throw when getting valid token without authentication', async () => {
      const manager = new OAuth2Manager(baseConfig);
      await expect(manager.getValidAccessToken()).rejects.toThrow('No access token');
    });

    it('should return access token when valid', async () => {
      const manager = new OAuth2Manager(baseConfig);
      const futureDate = new Date(Date.now() + 3600000);
      manager.setTokens('my-access-token', undefined, futureDate);
      
      const token = await manager.getValidAccessToken();
      expect(token).toBe('my-access-token');
    });
  });

  describe('config isolation', () => {
    it('should return a copy of config', () => {
      const manager = new OAuth2Manager(baseConfig);
      const config1 = manager.getConfig();
      const config2 = manager.getConfig();
      expect(config1).not.toBe(config2);
      expect(config1).toEqual(config2);
    });
  });
});
