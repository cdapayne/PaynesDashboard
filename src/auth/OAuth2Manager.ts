/**
 * OAuth2 Authentication Manager
 * 
 * Provides OAuth2 authentication support for services that use OAuth.
 * Handles token storage, refresh, and authorization code flow.
 */

import type { OAuth2Config } from '../types/index.js';

/**
 * Token response from OAuth2 token endpoint
 */
export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
}

/**
 * OAuth2 Manager for handling authentication flows
 */
export class OAuth2Manager {
  private config: OAuth2Config;

  constructor(config: OAuth2Config) {
    this.config = { ...config };
  }

  /**
   * Generate the authorization URL for OAuth2 authorization code flow
   * @param state - Optional state parameter for CSRF protection
   */
  getAuthorizationUrl(state?: string): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      scope: this.config.scope.join(' '),
    });

    if (state) {
      params.set('state', state);
    }

    return `${this.config.authorizationUrl}?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   * @param code - Authorization code from callback
   */
  async exchangeCodeForToken(code: string): Promise<TokenResponse> {
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      redirect_uri: this.config.redirectUri,
    });

    const response = await fetch(this.config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Token exchange failed: ${response.status} - ${errorText}`);
    }

    const tokenResponse = await response.json() as TokenResponse;
    this.updateTokens(tokenResponse);
    return tokenResponse;
  }

  /**
   * Refresh the access token using refresh token
   */
  async refreshAccessToken(): Promise<TokenResponse> {
    if (!this.config.refreshToken) {
      throw new Error('No refresh token available');
    }

    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: this.config.refreshToken,
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
    });

    const response = await fetch(this.config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Token refresh failed: ${response.status} - ${errorText}`);
    }

    const tokenResponse = await response.json() as TokenResponse;
    this.updateTokens(tokenResponse);
    return tokenResponse;
  }

  /**
   * Update stored tokens from token response
   */
  private updateTokens(tokenResponse: TokenResponse): void {
    this.config.accessToken = tokenResponse.access_token;
    if (tokenResponse.refresh_token) {
      this.config.refreshToken = tokenResponse.refresh_token;
    }
    if (tokenResponse.expires_in) {
      this.config.expiresAt = new Date(Date.now() + tokenResponse.expires_in * 1000);
    }
  }

  /**
   * Check if the current access token is expired or about to expire
   * @param bufferSeconds - Seconds before expiry to consider as expired
   */
  isTokenExpired(bufferSeconds = 60): boolean {
    if (!this.config.expiresAt) {
      return false;
    }
    return new Date() >= new Date(this.config.expiresAt.getTime() - bufferSeconds * 1000);
  }

  /**
   * Get the current access token, refreshing if necessary
   */
  async getValidAccessToken(): Promise<string> {
    if (!this.config.accessToken) {
      throw new Error('No access token available. Please authenticate first.');
    }

    if (this.isTokenExpired()) {
      await this.refreshAccessToken();
    }

    return this.config.accessToken;
  }

  /**
   * Check if authentication is complete
   */
  isAuthenticated(): boolean {
    return !!this.config.accessToken;
  }

  /**
   * Set tokens manually (e.g., from stored credentials)
   */
  setTokens(accessToken: string, refreshToken?: string, expiresAt?: Date): void {
    this.config.accessToken = accessToken;
    if (refreshToken) {
      this.config.refreshToken = refreshToken;
    }
    if (expiresAt) {
      this.config.expiresAt = expiresAt;
    }
  }

  /**
   * Get current OAuth2 config state
   */
  getConfig(): OAuth2Config {
    return { ...this.config };
  }
}
