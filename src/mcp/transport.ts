import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { MCPRequest, MCPResponse, MCPClientConfig } from './types';

/**
 * HTTP Transport Layer for MCP Communication
 * Handles the low-level HTTP communication with MCP servers
 */
export class MCPTransport {
  private client: AxiosInstance;

  constructor(config: MCPClientConfig) {
    this.client = axios.create({
      baseURL: config.serverUrl,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
    });
  }

  /**
   * Send a request to the MCP server
   */
  async sendRequest(request: MCPRequest): Promise<MCPResponse> {
    try {
      const response: AxiosResponse<MCPResponse> = await this.client.post(
        '/mcp/process',
        request
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `MCP Server Error: ${error.response?.status} ${error.response?.data?.error || error.message}`
        );
      }
      throw error;
    }
  }

  /**
   * Health check for the MCP server
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.client.get('/');
      return true;
    } catch {
      return false;
    }
  }
}
