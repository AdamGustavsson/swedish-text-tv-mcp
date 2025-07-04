/**
 * Debug script to test the raw API response
 */

async function debugApi() {
  const baseUrl = 'https://texttv.nu/api';
  const pageNumber = 100;
  const params = new URLSearchParams({
    app: 'swedish-text-tv-mcp',
    includePlainTextContent: '1'
  });

  console.log('=== Debugging API Response ===');
  console.log(`URL: ${baseUrl}/get/${pageNumber}?${params}`);
  console.log();

  try {
    const response = await fetch(`${baseUrl}/get/${pageNumber}?${params}`);
    
    console.log('Response status:', response.status);
    console.log('Response headers:');
    response.headers.forEach((value, key) => {
      console.log(`  ${key}: ${value}`);
    });
    console.log();

    const contentType = response.headers.get('content-type');
    console.log('Content-Type:', contentType);
    console.log('Is JSON?', contentType?.includes('application/json'));
    console.log();

    // Get raw response text
    const responseText = await response.text();
    console.log('Response length:', responseText.length);
    console.log('Response start:', responseText.substring(0, 200));
    console.log();

    // Try to parse as JSON
    try {
      const json = JSON.parse(responseText);
      console.log('JSON parsed successfully');
      console.log('JSON type:', typeof json);
      console.log('JSON is array?', Array.isArray(json));
      if (Array.isArray(json)) {
        console.log('Array length:', json.length);
        if (json.length > 0) {
          console.log('First item keys:', Object.keys(json[0]));
          console.log('First item sample:', {
            num: json[0].num,
            title: json[0].title,
            content_plain: typeof json[0].content_plain + ' - length: ' + (json[0].content_plain?.length || 0),
            content_plain_value: json[0].content_plain,
            content_exists: json[0].content ? 'exists' : 'missing',
            content_length: json[0].content?.length || 0,
            date_updated_unix: json[0].date_updated_unix
          });
        }
      }
    } catch (jsonError) {
      console.log('JSON parsing failed:', jsonError instanceof Error ? jsonError.message : String(jsonError));
    }

  } catch (error) {
    console.error('Fetch error:', error instanceof Error ? error.message : String(error));
  }
}

// Run the debug
debugApi().catch(console.error); 