# Swedish Text TV MCP Server

A Model Context Protocol (MCP) server that provides access to Swedish Text TV content via the [texttv.nu](https://texttv.nu) API.

## Features

- **Get single page**: Retrieve text content and update timestamp from a specific Text TV page
- **Get multiple pages**: Retrieve text content and update timestamps from multiple pages at once
- **Get page range**: Retrieve text content and update timestamps from a range of consecutive pages
- **Search pages**: Search for content across pages 100-700 and return matching text with timestamps
- **30-second caching**: In-memory cache reduces API calls and improves response times

## Installation

```bash
npm install
```

## Quick Reference

### Available Scripts
- `npm run build` - Build the TypeScript project
- `npm run start` - Start the production server
- `npm run dev` - Start the development server
- `npm run example` - Run usage examples
- `npm run test-cache` - Test the 30-second cache functionality
- `npm run test-error-handling` - Test error handling scenarios
- `npm run test-page-100` - Test a specific page retrieval
- `npm run generate-cursor-config` - Generate Cursor configuration
- `npm run clean` - Clean build files

## Usage

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

### Integration with Cursor

To use this MCP server with Cursor, you'll need to add it to your Cursor configuration:

1. **Build the project first:**
   ```bash
   npm run build
   ```

2. **Quick setup (automatic path detection):**
   ```bash
   npm run generate-cursor-config
   ```
   This creates a `cursor-config-generated.json` file with the correct paths.

3. **Manual setup - Add to your Cursor configuration file** (usually `~/.cursor/mcp_config.json` or similar):
   ```json
   {
     "mcpServers": {
       "swedish-text-tv": {
         "command": "node",
         "args": ["dist/index.js"],
         "cwd": "/path/to/your/swedish-text-tv-mcp",
         "env": {
           "NODE_ENV": "production"
         }
       }
     }
   }
   ```

3. **For development mode** (using TypeScript directly):
   ```json
   {
     "mcpServers": {
       "swedish-text-tv": {
         "command": "npx",
         "args": ["tsx", "src/index.ts"],
         "cwd": "/path/to/your/swedish-text-tv-mcp",
         "env": {
           "NODE_ENV": "development"
         }
       }
     }
   }
   ```

4. **Restart Cursor** to load the new MCP server configuration.

Once configured, you can use the Swedish Text TV tools in Cursor:
- Ask for specific Text TV pages: "Get Text TV page 100"
- Search for content: "Search for 'väder' in Text TV"
- Get multiple pages: "Get Text TV pages 100, 377, and 330"

> **📋 For detailed setup instructions, see [CURSOR_SETUP.md](CURSOR_SETUP.md)**

## MCP Tools

The server provides the following tools:

### `get_text_tv_page`
Get a specific page from Swedish Text TV.

**Parameters:**
- `pageNumber` (number): The page number to retrieve (100-999)

**Example:**
```json
{
  "pageNumber": 100
}
```

**Response Format:**
```
Updated: 2024-01-15 14:30:25

[Page content text here...]
```

### `get_text_tv_pages`
Get multiple pages from Swedish Text TV.

**Parameters:**
- `pageNumbers` (array): Array of page numbers to retrieve

**Example:**
```json
{
  "pageNumbers": [100, 377, 330]
}
```

### `get_text_tv_page_range`
Get a range of pages from Swedish Text TV.

**Parameters:**
- `startPage` (number): Starting page number
- `endPage` (number): Ending page number

**Example:**
```json
{
  "startPage": 100,
  "endPage": 105
}
```

### `search_text_tv`
Search for content in Swedish Text TV pages (automatically searches pages 100-700).

**Parameters:**
- `query` (string): Search query

**Example:**
```json
{
  "query": "väder"
}
```

## Popular Text TV Pages

- **Page 100**: Main news (Löpsedeln)
- **Page 377**: Sports results
- **Page 330**: Stock market results (Resultatbörsen)
- **Page 551**: Stryktipset (Swedish football pools)

## API Configuration

The server uses the following default configuration:
- Base URL: `https://texttv.nu/api`
- App ID: `swedish-text-tv-mcp`
- Include plain text content: `true`

## Technical Details

### Project Structure
```
src/
├── index.ts                    # Main MCP server implementation
├── api-client.ts               # Text TV API client
├── types.ts                    # TypeScript type definitions
└── example.ts                  # Usage examples
scripts/
└── generate-cursor-config.js   # Auto-generate Cursor configuration
dist/                           # Compiled JavaScript files
cursor-config.json              # Basic Cursor configuration  
cursor-config-examples.json     # Advanced configuration examples
cursor-config-generated.json    # Auto-generated configuration (created by script)
CURSOR_SETUP.md                 # Detailed Cursor setup guide
```

### Dependencies
- `@modelcontextprotocol/sdk`: MCP SDK for creating the server
- Built-in Node.js `fetch` API for HTTP requests

### Response Format
Each page response includes:
- **Text content**: Clean plain text from the Text TV page
- **Update timestamp**: When the page was last updated (Unix timestamp converted to local time)

### Caching System
- **30-second in-memory cache**: Each page is cached for 30 seconds after first request
- **Performance improvement**: Cached responses return in ~0ms vs ~100-200ms for API calls
- **Automatic cleanup**: Expired cache entries are automatically removed
- **Per-page caching**: Each page number is cached independently

### TypeScript Configuration
- Target: ES2022
- Module: ES2022
- Strict type checking enabled
- DOM types included for fetch API

## Error Handling

The server includes comprehensive error handling:

### Page Number Validation
- Page numbers must be between 100 and 999
- Page numbers must be integers
- Non-existent pages return clear error messages

### Request Limits
- Search queries cannot be empty

### API Response Handling
- Handles HTML error pages gracefully (when pages don't exist)
- Returns informative error messages for invalid pages
- Continues processing other pages when some fail in multi-page requests

### Network and JSON Errors
- Validates response content type
- Handles malformed JSON responses
- Provides clear error messages for network failures

## License

MIT

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Links

- [texttv.nu](https://texttv.nu) - Swedish Text TV website
- [Model Context Protocol](https://modelcontextprotocol.io) - MCP specification
