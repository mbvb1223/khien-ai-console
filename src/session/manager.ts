import { randomUUID } from 'crypto';
import { MCPMessage, MCPSessionState } from '../mcp/types';

/**
 * Session Manager - Handles in-memory conversation state
 * Maintains conversation history during a CLI session
 */
export class SessionManager {
  private session: MCPSessionState;

  constructor() {
    this.session = this.createNewSession();
  }

  /**
   * Create a new session with a unique ID
   */
  private createNewSession(): MCPSessionState {
    return {
      sessionId: this.generateSessionId(),
      messages: [],
      createdAt: new Date(),
    };
  }

  /**
   * Generate a simple session ID
   */
  private generateSessionId(): string {
    return `session_${randomUUID()}`;
  }

  /**
   * Add a user message to the session
   */
  addUserMessage(content: string, resources?: any[]): void {
    const message: MCPMessage = {
      role: 'user',
      content,
      timestamp: new Date(),
      resources,
    };
    this.session.messages.push(message);
  }

  /**
   * Add an assistant message to the session
   */
  addAssistantMessage(content: string): void {
    const message: MCPMessage = {
      role: 'assistant',
      content,
      timestamp: new Date(),
    };
    this.session.messages.push(message);
  }

  /**
   * Get all messages in the session
   */
  getMessages(): MCPMessage[] {
    return this.session.messages;
  }

  /**
   * Get the session ID
   */
  getSessionId(): string {
    return this.session.sessionId;
  }

  /**
   * Get message history formatted for MCP requests
   */
  getHistoryForMCP(): Array<{ role: 'user' | 'assistant'; content: string }> {
    return this.session.messages.map(msg => ({
      role: msg.role,
      content: msg.content,
    }));
  }

  /**
   * Clear the current session and start fresh
   */
  clearSession(): void {
    this.session = this.createNewSession();
  }

  /**
   * Get session statistics
   */
  getSessionStats(): { messageCount: number; createdAt: Date } {
    return {
      messageCount: this.session.messages.length,
      createdAt: this.session.createdAt,
    };
  }
}