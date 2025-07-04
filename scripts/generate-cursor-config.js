#!/usr/bin/env node

/**
 * Generate Cursor configuration for Swedish Text TV MCP server
 * This script creates the correct configuration with the current project path
 */

import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { writeFileSync } from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');

function generateConfig() {
  const config = {
    mcpServers: {
      'swedish-text-tv': {
        command: 'node',
        args: ['dist/index.js'],
        cwd: projectRoot,
        env: {
          NODE_ENV: 'production'
        }
      }
    }
  };

  const configJson = JSON.stringify(config, null, 2);
  
  // Write the configuration file
  const configPath = resolve(projectRoot, 'cursor-config-generated.json');
  writeFileSync(configPath, configJson);
  
  console.log('✅ Generated Cursor configuration!');
  console.log(`📁 Project path: ${projectRoot}`);
  console.log(`📄 Configuration saved to: ${configPath}`);
  console.log('');
  console.log('📋 Next steps:');
  console.log('1. Copy the configuration from cursor-config-generated.json');
  console.log('2. Add it to your Cursor MCP servers configuration');
  console.log('3. Restart Cursor');
  console.log('');
  console.log('💡 Configuration content:');
  console.log(configJson);
  console.log('');
  console.log('📚 For detailed setup instructions, see CURSOR_SETUP.md');
}

// Run the generator
generateConfig(); 