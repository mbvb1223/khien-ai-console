import { MCPTransport } from './transport';
import { MCPRequest, MCPResponse, MCPResource, MCPClientConfig } from './types';
import { getMimeType } from '../utils/files';

/**
 * MCP Client - High-level client for interacting with MCP servers
 * Provides a clean interface for sending requests and managing communication
 */
export class MCPClient {
  private transport: MCPTransport;

  constructor(config: MCPClientConfig) {
    this.transport = new MCPTransport(config);
  }

  /**
   * Send a user goal to the MCP server with optional resources and history
   */
  async processGoal(
    goal: string,
    resources: MCPResource[] = [],
    history: Array<{ role: 'user' | 'assistant'; content: string }> = [],
    sessionId?: string
  ): Promise<MCPResponse> {
    const request: MCPRequest = {
      goal,
      resources: resources.length > 0 ? resources : undefined,
      history: history.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: new Date(),
      })),
      sessionId,
    };

    return await this.transport.sendRequest(request);
  }

  /**
   * Check if the MCP server is healthy and accessible
   */
  async checkHealth(): Promise<boolean> {
    return await this.transport.healthCheck();
  }

  /**
   * Create a resource from a file path
   */
  createResource(filePath: string, content: string): MCPResource {
    return {
      uri: `file://${filePath}`,
      name: filePath.split('/').pop() || filePath,
      mimeType: getMimeType(filePath),
      content,
    };
  }
}