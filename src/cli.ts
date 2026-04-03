#!/usr/bin/env node

import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { MCPClient } from './mcp/client';
import { MCPResource } from './mcp/types';
import { SessionManager } from './session/manager';
import { createFileResources } from './utils/files';
import { getDefaultServerUrl, getMcpClientConfig, getConfig } from './config';

const program = new Command();

/**
 * Main CLI Application
 * Handles user interaction and orchestrates MCP communication
 */

program
  .name('khien-ai')
  .description('CLI client for MCP servers')
  .version('0.1.0');

program
  .command('chat')
  .description('Start interactive chat with the MCP server')
  .option('-s, --server <url>', 'MCP server URL', getDefaultServerUrl())
  .option('-f, --files <files...>', 'Attach files to the conversation')
  .action(async (options) => {
    await startInteractiveChat(options.server, options.files || []);
  });

program
  .command('ask <goal>')
  .description('Send a single question to the MCP server')
  .option('-s, --server <url>', 'MCP server URL', getDefaultServerUrl())
  .option('-f, --files <files...>', 'Attach files to provide context')
  .action(async (goal, options) => {
    await sendSingleRequest(options.server, goal, options.files || []);
  });

program
  .command('clear')
  .description('Clear the current session history')
  .action(() => {
    console.log(chalk.green('✓ Session cleared'));
  });

/**
 * Start interactive chat mode
 */
async function startInteractiveChat(serverUrl: string, initialFiles: string[]): Promise<void> {
  const sessionManager = new SessionManager();
  // Override server URL if provided via command line
  const config = getMcpClientConfig();
  if (serverUrl !== getDefaultServerUrl()) {
    config.serverUrl = serverUrl;
  }
  const mcpClient = new MCPClient(config);

  console.log(chalk.blue.bold('\n🤖 Khien AI Console - MCP Client'));
  console.log(chalk.gray(`Connected to: ${serverUrl}`));
  console.log(chalk.gray('Type "exit" to quit, "clear" to clear history\n'));

  // Process initial files if provided
  let currentResources: MCPResource[] = [];
  if (initialFiles.length > 0) {
    const spinner = ora('Loading files...').start();
    try {
      currentResources = createFileResources(initialFiles);
      spinner.succeed(`Loaded ${currentResources.length} file(s)`);
      console.log(chalk.gray('Files: ' + initialFiles.join(', ')));
    } catch (error) {
      spinner.fail(`Failed to load files: ${error}`);
      return;
    }
  }

  // Check server health
  const healthSpinner = ora('Connecting to MCP server...').start();
  try {
    const isHealthy = await mcpClient.checkHealth();
    if (isHealthy) {
      healthSpinner.succeed('Connected to MCP server');
    } else {
      healthSpinner.fail('MCP server is not responding!');
      return;
    }
  } catch (error) {
    healthSpinner.fail(`Failed to connect: ${error}`);
    return;
  }

  // Interactive loop
  while (true) {
    try {
      const { userInput } = await inquirer.prompt([
        {
          type: 'input',
          name: 'userInput',
          message: chalk.cyan('You:'),
          validate: (input) => input.trim().length > 0 || 'Please enter a message',
        },
      ]);

      // Handle special commands
      if (userInput.toLowerCase() === 'exit') {
        console.log(chalk.yellow('👋 Goodbye!'));
        break;
      }

      if (userInput.toLowerCase() === 'clear') {
        sessionManager.clearSession();
        console.log(chalk.green('✓ Session cleared'));
        continue;
      }

      if (userInput.toLowerCase() === 'files') {
        if (currentResources.length === 0) {
          console.log(chalk.gray('No files attached'));
        } else {
          console.log(chalk.blue('Attached files:'));
          currentResources.forEach(resource => {
            console.log(chalk.gray(`  • ${resource.name}`));
          });
        }
        continue;
      }

      // Add user message to session
      sessionManager.addUserMessage(userInput, currentResources);

      // Send request to MCP server
      const spinner = ora('Thinking...').start();
      try {
        const response = await mcpClient.processGoal(
          userInput,
          currentResources,
          sessionManager.getHistoryForMCP().slice(0, -1), // Exclude current message
          sessionManager.getSessionId()
        );

        spinner.stop();

        if (response.status === 'success') {
          console.log(chalk.green.bold('\n🤖 Assistant:'));
          console.log(response.content);

          // Add assistant response to session
          sessionManager.addAssistantMessage(response.content);
        } else {
          console.log(chalk.red.bold('\n❌ Error:'));
          console.log(response.error || 'Unknown error occurred');
        }
      } catch (error) {
        spinner.fail('Request failed');
        console.log(chalk.red(`Error: ${error}`));
      }

      console.log(); // Add spacing

    } catch (error) {
      console.log(chalk.red(`Error: ${error}`));
      break;
    }
  }
}

/**
 * Send a single request and exit
 */
async function sendSingleRequest(serverUrl: string, goal: string, filePaths: string[]): Promise<void> {
  // Override server URL if provided via command line
  const config = getMcpClientConfig();
  if (serverUrl !== getDefaultServerUrl()) {
    config.serverUrl = serverUrl;
  }
  const mcpClient = new MCPClient(config);
  let resources: MCPResource[] = [];

  // Load files if provided
  if (filePaths.length > 0) {
    const spinner = ora('Loading files...').start();
    try {
      resources = createFileResources(filePaths);
      spinner.succeed(`Loaded ${resources.length} file(s)`);
    } catch (error) {
      spinner.fail(`Failed to load files: ${error}`);
      return;
    }
  }

  // Send request
  const spinner = ora('Processing request...').start();
  try {
    const response = await mcpClient.processGoal(goal, resources);

    spinner.stop();

    if (response.status === 'success') {
      console.log(chalk.green(response.content));
    } else {
      console.log(chalk.red(`Error: ${response.error || 'Unknown error occurred'}`));
      process.exit(1);
    }
  } catch (error) {
    spinner.fail('Request failed');
    console.log(chalk.red(`Error: ${error}`));
    process.exit(1);
  }
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.log(chalk.red(`\n❌ Uncaught error: ${error.message}`));
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.log(chalk.red(`\n❌ Unhandled rejection: ${reason}`));
  process.exit(1);
});

// Parse command line arguments
program.parse();
