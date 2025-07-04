/**
 * Test script to verify page 100 works correctly
 */

import { TextTVApiClient } from './api-client.js';

async function testPage100() {
  const client = new TextTVApiClient();

  console.log('=== Testing Page 100 ===');
  
  try {
    const result = await client.getPage(100);
    console.log('✅ Page 100 retrieved successfully!');
    console.log('Text length:', result.text.length);
    console.log('Date updated:', new Date(result.dateUpdatedUnix * 1000).toLocaleString());
    console.log('Content preview:', result.text.substring(0, 200) + '...');
  } catch (error) {
    console.log('❌ Error retrieving page 100:', error instanceof Error ? error.message : String(error));
  }
}

// Run the test
testPage100().catch(console.error); 