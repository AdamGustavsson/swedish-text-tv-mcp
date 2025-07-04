/**
 * Test script to verify error handling improvements
 */

import { TextTVApiClient } from './api-client.js';

async function testErrorHandling() {
  const client = new TextTVApiClient();

  console.log('=== Testing Error Handling ===\n');

  // Test 1: Invalid page number (too low)
  console.log('Test 1: Invalid page number (too low)');
  try {
    await client.getPage(50);
    console.log('❌ Should have thrown error');
  } catch (error) {
    console.log('✅ Correctly caught error:', error instanceof Error ? error.message : String(error));
  }
  console.log();

  // Test 2: Invalid page number (too high)
  console.log('Test 2: Invalid page number (too high)');
  try {
    await client.getPage(1500);
    console.log('❌ Should have thrown error');
  } catch (error) {
    console.log('✅ Correctly caught error:', error instanceof Error ? error.message : String(error));
  }
  console.log();

  // Test 3: Non-existent page (should exist but might not have content)
  console.log('Test 3: Non-existent page (264)');
  try {
    const result = await client.getPage(264);
    console.log('✅ Successfully handled page 264:', result.text ? 'Has content' : 'No content');
  } catch (error) {
    console.log('✅ Correctly handled non-existent page:', error instanceof Error ? error.message : String(error));
  }
  console.log();

  // Test 4: Multiple pages with some invalid
  console.log('Test 4: Multiple pages with some invalid');
  try {
    const results = await client.getPages([100, 264, 377]);
    console.log('✅ Successfully handled mixed pages:');
    results.forEach((result, index) => {
      const pageNum = [100, 264, 377][index];
      console.log(`  Page ${pageNum}: ${result.text.substring(0, 50)}...`);
    });
  } catch (error) {
    console.log('❌ Unexpected error:', error instanceof Error ? error.message : String(error));
  }
  console.log();

  // Test 5: Valid page (should work)
  console.log('Test 5: Valid page (100)');
  try {
    const result = await client.getPage(100);
    console.log('✅ Successfully retrieved page 100:', result.text.substring(0, 50) + '...');
  } catch (error) {
    console.log('❌ Unexpected error:', error instanceof Error ? error.message : String(error));
  }
  console.log();

  console.log('=== Error Handling Tests Complete ===');
}

// Run the test
testErrorHandling().catch(console.error); 