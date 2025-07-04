#!/usr/bin/env node

/**
 * Swedish Text TV MCP Server
 * Provides access to Swedish Text TV content via the texttv.nu API
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
  CallToolRequest,
} from '@modelcontextprotocol/sdk/types.js';
import { TextTVApiClient } from './api-client.js';
import { TextTVContent } from './types.js';

class SwedishTextTVServer {
  private server: Server;
  private apiClient: TextTVApiClient;

  constructor() {
    this.server = new Server(
      {
        name: 'swedish-text-tv-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.apiClient = new TextTVApiClient();
    this.setupToolHandlers();
  }

  private setupToolHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'get_text_tv_page',
            description: 'Get a specific page from Swedish Text TV',
            inputSchema: {
              type: 'object',
              properties: {
                pageNumber: {
                  type: 'number',
                  description: 'The page number to retrieve (100-999, e.g., 100 for news, 377 for sports)',
                  minimum: 100,
                  maximum: 999,
                },
              },
              required: ['pageNumber'],
            },
          },
          {
            name: 'get_text_tv_pages',
            description: 'Get multiple pages from Swedish Text TV',
            inputSchema: {
              type: 'object',
              properties: {
                pageNumbers: {
                  type: 'array',
                  items: {
                    type: 'number',
                    minimum: 100,
                    maximum: 999,
                  },
                  description: 'Array of page numbers to retrieve (100-999)',
                },
              },
              required: ['pageNumbers'],
            },
          },
          {
            name: 'get_text_tv_page_range',
            description: 'Get a range of pages from Swedish Text TV',
            inputSchema: {
              type: 'object',
              properties: {
                startPage: {
                  type: 'number',
                  description: 'Starting page number (100-999)',
                  minimum: 100,
                  maximum: 999,
                },
                endPage: {
                  type: 'number',
                  description: 'Ending page number (100-999)',
                  minimum: 100,
                  maximum: 999,
                },
              },
              required: ['startPage', 'endPage'],
            },
          },
          {
            name: 'search_text_tv',
            description: 'Search for content in Swedish Text TV pages (searches pages 100-700)',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'Search query to look for in page content',
                  minLength: 1,
                },
              },
              required: ['query'],
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'get_text_tv_page':
            return await this.handleGetPage(args);
          case 'get_text_tv_pages':
            return await this.handleGetPages(args);
          case 'get_text_tv_page_range':
            return await this.handleGetPageRange(args);
          case 'search_text_tv':
            return await this.handleSearchPages(args);
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }
      } catch (error) {
        if (error instanceof McpError) {
          throw error;
        }
        throw new McpError(
          ErrorCode.InternalError,
          `Error executing tool ${name}: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    });
  }

  private async handleGetPage(args: any) {
    const { pageNumber } = args;
    
    if (typeof pageNumber !== 'number') {
      throw new McpError(ErrorCode.InvalidParams, 'pageNumber must be a number');
    }

    if (!Number.isInteger(pageNumber) || pageNumber < 100 || pageNumber > 999) {
      throw new McpError(ErrorCode.InvalidParams, 'pageNumber must be between 100 and 999');
    }

    const pageContent = await this.apiClient.getPage(pageNumber);
    
    return {
      content: [
        {
          type: 'text',
          text: this.formatContent(pageContent),
        },
      ],
    };
  }

  private async handleGetPages(args: any) {
    const { pageNumbers } = args;
    
    if (!Array.isArray(pageNumbers)) {
      throw new McpError(ErrorCode.InvalidParams, 'pageNumbers must be an array');
    }

    if (pageNumbers.length === 0) {
      throw new McpError(ErrorCode.InvalidParams, 'pageNumbers array cannot be empty');
    }



    // Validate each page number
    for (const pageNumber of pageNumbers) {
      if (typeof pageNumber !== 'number' || !Number.isInteger(pageNumber) || pageNumber < 100 || pageNumber > 999) {
        throw new McpError(ErrorCode.InvalidParams, `Invalid page number: ${pageNumber}. All page numbers must be between 100 and 999.`);
      }
    }

    const pages = await this.apiClient.getPages(pageNumbers);
    
    return {
      content: [
        {
          type: 'text',
          text: pages.map(page => this.formatContent(page)).join('\n\n---\n\n'),
        },
      ],
    };
  }

  private async handleGetPageRange(args: any) {
    const { startPage, endPage } = args;
    
    if (typeof startPage !== 'number' || typeof endPage !== 'number') {
      throw new McpError(ErrorCode.InvalidParams, 'startPage and endPage must be numbers');
    }

    if (!Number.isInteger(startPage) || startPage < 100 || startPage > 999) {
      throw new McpError(ErrorCode.InvalidParams, 'startPage must be between 100 and 999');
    }

    if (!Number.isInteger(endPage) || endPage < 100 || endPage > 999) {
      throw new McpError(ErrorCode.InvalidParams, 'endPage must be between 100 and 999');
    }

    if (startPage > endPage) {
      throw new McpError(ErrorCode.InvalidParams, 'startPage must be less than or equal to endPage');
    }



    const pages = await this.apiClient.getPageRange(startPage, endPage);
    
    return {
      content: [
        {
          type: 'text',
          text: pages.map(page => this.formatContent(page)).join('\n\n---\n\n'),
        },
      ],
    };
  }

  private async handleSearchPages(args: any) {
    const { query } = args;
    
    if (typeof query !== 'string') {
      throw new McpError(ErrorCode.InvalidParams, 'query must be a string');
    }

    if (query.trim().length === 0) {
      throw new McpError(ErrorCode.InvalidParams, 'query cannot be empty');
    }

    // Generate page numbers 100-700
    const pageNumbers = [];
    for (let i = 100; i <= 700; i++) {
      pageNumbers.push(i);
    }

    const pages = await this.apiClient.searchPages(query, pageNumbers);
    
    return {
      content: [
        {
          type: 'text',
          text: pages.length > 0 
            ? pages.map(page => this.formatContent(page)).join('\n\n---\n\n')
            : `No results found for query: "${query}" in pages 100-700`,
        },
      ],
    };
  }

  private formatContent(content: TextTVContent): string {
    const date = new Date(content.dateUpdatedUnix * 1000);
    const formattedDate = date.toLocaleString();
    
    return `Updated: ${formattedDate}\n\n${content.text}`;
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Swedish Text TV MCP server running on stdio');
  }
}

// Start the server
async function main(): Promise<void> {
  const server = new SwedishTextTVServer();
  await server.run();
}

main().catch((error) => {
  console.error('Fatal error running server:', error);
  process.exit(1);
}); 