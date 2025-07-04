/**
 * Example usage of the TextTVApiClient
 * This file demonstrates how to use the API client directly
 */

import { TextTVApiClient } from './api-client.js';

async function runExample() {
  const client = new TextTVApiClient();

  try {
    console.log('=== Getting Text TV Page 100 (News) ===');
    const page100 = await client.getPage(100);
    console.log('Page 100 content:');
    console.log(`Updated: ${new Date(page100.dateUpdatedUnix * 1000).toLocaleString()}`);
    console.log(`Content: ${page100.text.substring(0, 200)}...`);
    console.log();

    console.log('=== Getting Multiple Pages ===');
    const pages = await client.getPages([100, 377, 330]);
    console.log('Multiple pages content:');
    pages.forEach((pageContent, index) => {
      console.log(`--- Page ${index + 1} ---`);
      console.log(`Updated: ${new Date(pageContent.dateUpdatedUnix * 1000).toLocaleString()}`);
      console.log(`Content: ${pageContent.text.substring(0, 100)}...`);
    });
    console.log();

    console.log('=== Getting Page Range 100-102 ===');
    const pageRange = await client.getPageRange(100, 102);
    console.log('Page range content:');
    pageRange.forEach((pageContent, index) => {
      console.log(`--- Page ${index + 1} ---`);
      console.log(`Updated: ${new Date(pageContent.dateUpdatedUnix * 1000).toLocaleString()}`);
      console.log(`Content: ${pageContent.text.substring(0, 100)}...`);
    });
    console.log();

    console.log('=== Searching for "väder" across Text TV pages 100-700 ===');
    // Generate page numbers 100-700
    const pageNumbers = [];
    for (let i = 100; i <= 700; i++) {
      pageNumbers.push(i);
    }
    const searchResults = await client.searchPages('väder', pageNumbers);
    if (searchResults.length > 0) {
      console.log(`Found ${searchResults.length} results:`);
      searchResults.forEach((pageContent, index) => {
        console.log(`--- Result ${index + 1} ---`);
        console.log(`Updated: ${new Date(pageContent.dateUpdatedUnix * 1000).toLocaleString()}`);
        console.log(`Content: ${pageContent.text.substring(0, 100)}...`);
      });
    } else {
      console.log('No results found');
    }

  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : String(error));
  }
}

// Run the example if this file is executed directly
// Use: npm run example
// if (import.meta.url === `file://${process.argv[1]}`) {
//   runExample().catch(console.error);
// }

export { runExample }; 