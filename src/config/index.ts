import dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env file
dotenv.config();

export interface Config {
  mcpServerUrl: string;
  mcpTimeout: number;
  mcpHeaders?: Record<string, string>;
  defaultFiles?: string[];
}

/**
 * Get configuration from environment variables
 */
export function getConfig(): Config {
  const config: Config = {
    mcpServerUrl: process.env.MCP_SERVER_URL || 'http://localhost:3000',
    mcpTimeout: parseInt(process.env.MCP_TIMEOUT || '30000', 10),
  };

  // Parse optional headers from environment
  if (process.env.MCP_HEADERS) {
    try {
      config.mcpHeaders = JSON.parse(process.env.MCP_HEADERS);
    } catch (error) {
      console.warn('Warning: Invalid MCP_HEADERS JSON format');
    }
  }

  // Parse default files from environment
  if (process.env.DEFAULT_FILES) {
    config.defaultFiles = process.env.DEFAULT_FILES
      .split(',')
      .map(file => file.trim())
      .filter(file => file.length > 0);
  }

  return config;
}

/**
 * Get default server URL from environment
 */
export function getDefaultServerUrl(): string {
  return getConfig().mcpServerUrl;
}

/**
 * Get MCP client configuration
 */
export function getMcpClientConfig() {
  const config = getConfig();
  return {
    serverUrl: config.mcpServerUrl,
    timeout: config.mcpTimeout,
    headers: config.mcpHeaders,
  };
}