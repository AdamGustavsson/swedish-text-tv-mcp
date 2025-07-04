/**
 * Test script to demonstrate the 30-second cache functionality
 */

import { TextTVApiClient } from './api-client.js';

async function testCache() {
  const client = new TextTVApiClient();

  console.log('=== Testing 30-Second Cache ===\n');

  // Test 1: First request (should fetch from API)
  console.log('Test 1: First request to page 100');
  const start1 = Date.now();
  try {
    const result1 = await client.getPage(100);
    const end1 = Date.now();
    console.log('✅ First request completed');
    console.log(`⏱️  Time taken: ${end1 - start1}ms`);
    console.log(`📄 Content length: ${result1.text.length}`);
    console.log(`📊 Cache stats:`, client.getCacheStats());
    console.log();
  } catch (error) {
    console.log('❌ Error:', error instanceof Error ? error.message : String(error));
    return;
  }

  // Test 2: Immediate second request (should use cache)
  console.log('Test 2: Immediate second request to page 100 (should be cached)');
  const start2 = Date.now();
  try {
    const result2 = await client.getPage(100);
    const end2 = Date.now();
    console.log('✅ Second request completed');
    console.log(`⏱️  Time taken: ${end2 - start2}ms (should be much faster)`);
    console.log(`📄 Content length: ${result2.text.length}`);
    console.log(`📊 Cache stats:`, client.getCacheStats());
    console.log();
  } catch (error) {
    console.log('❌ Error:', error instanceof Error ? error.message : String(error));
    return;
  }

  // Test 3: Different page (should fetch from API)
  console.log('Test 3: Request to different page 377 (should fetch from API)');
  const start3 = Date.now();
  try {
    const result3 = await client.getPage(377);
    const end3 = Date.now();
    console.log('✅ Different page request completed');
    console.log(`⏱️  Time taken: ${end3 - start3}ms`);
    console.log(`📄 Content length: ${result3.text.length}`);
    console.log(`📊 Cache stats:`, client.getCacheStats());
    console.log();
  } catch (error) {
    console.log('❌ Error:', error instanceof Error ? error.message : String(error));
    return;
  }

  // Test 4: Multiple requests to cached pages
  console.log('Test 4: Multiple requests to cached pages');
  const start4 = Date.now();
  try {
    const promises = [
      client.getPage(100),
      client.getPage(377),
      client.getPage(100),
      client.getPage(377)
    ];
    await Promise.all(promises);
    const end4 = Date.now();
    console.log('✅ Multiple requests completed');
    console.log(`⏱️  Time taken for 4 requests: ${end4 - start4}ms`);
    console.log(`📊 Final cache stats:`, client.getCacheStats());
    console.log();
  } catch (error) {
    console.log('❌ Error:', error instanceof Error ? error.message : String(error));
    return;
  }

  console.log('⏳ Waiting 5 seconds to show cache aging...');
  await new Promise(resolve => setTimeout(resolve, 5000));
  console.log(`📊 Cache stats after 5 seconds:`, client.getCacheStats());
  console.log();

  console.log('🧹 Testing cache clear');
  client.clearCache();
  console.log(`📊 Cache stats after clear:`, client.getCacheStats());
  console.log();

  console.log('=== Cache Test Complete ===');
}

// Run the test
testCache().catch(console.error); 