/**
 * MCP (Model Context Protocol) Type Definitions
 * This file defines the core types for communicating with MCP servers
 */

export interface MCPResource {
  uri: string;
  name: string;
  mimeType?: string;
  content: string;
}

export interface MCPMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  resources?: MCPResource[];
}

export interface MCPRequest {
  goal: string;
  resources?: MCPResource[];
  history?: MCPMessage[];
  sessionId?: string;
}

export interface MCPResponse {
  content: string;
  sessionId?: string;
  status: 'success' | 'error';
  error?: string;
}

export interface MCPClientConfig {
  serverUrl: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export interface MCPSessionState {
  sessionId: string;
  messages: MCPMessage[];
  createdAt: Date;
}