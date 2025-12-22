import * as fs from 'fs';
import * as path from 'path';
import { MCPResource } from '../mcp/types';

/**
 * File utilities for handling file operations and resource creation
 */

/**
 * Check if a file exists
 */
export function fileExists(filePath: string): boolean {
  try {
    return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
  } catch {
    return false;
  }
}

/**
 * Read file content
 */
export function readFileContent(filePath: string): string {
  if (!fileExists(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    throw new Error(`Failed to read file ${filePath}: ${error}`);
  }
}

/**
 * Create an MCP resource from a file path
 */
export function createFileResource(filePath: string): MCPResource {
  const absolutePath = path.resolve(filePath);
  const content = readFileContent(absolutePath);
  const fileName = path.basename(absolutePath);

  return {
    uri: `file://${absolutePath}`,
    name: fileName,
    mimeType: getMimeType(fileName),
    content,
  };
}

/**
 * Create resources from multiple file paths
 */
export function createFileResources(filePaths: string[]): MCPResource[] {
  return filePaths.map(filePath => {
    try {
      return createFileResource(filePath);
    } catch (error) {
      console.warn(`Warning: Could not process file ${filePath}: ${error}`);
      return null;
    }
  }).filter((resource): resource is MCPResource => resource !== null);
}

/**
 * Get MIME type based on file extension
 */
export function getMimeType(fileName: string): string {
  const ext = path.extname(fileName).slice(1).toLowerCase();
  const mimeTypes: Record<string, string> = {
    'js': 'text/javascript',
    'ts': 'text/typescript',
    'json': 'application/json',
    'md': 'text/markdown',
    'txt': 'text/plain',
    'py': 'text/x-python',
    'html': 'text/html',
    'css': 'text/css',
    'yaml': 'text/yaml',
    'yml': 'text/yaml',
    'xml': 'application/xml',
    'sh': 'application/x-sh',
    'zsh': 'application/x-sh',
    'bash': 'application/x-sh',
    'sql': 'application/sql',
    'csv': 'text/csv',
    'tsv': 'text/tab-separated-values',
  };
  return mimeTypes[ext] || 'text/plain';
}