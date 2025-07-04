/**
 * API client for texttv.nu
 */

import { PageResponse, PageNumber, TextTVError, ApiConfig, TextTVContent } from './types.js';

interface CacheEntry {
  content: TextTVContent;
  timestamp: number;
}

export class TextTVApiClient {
  private config: ApiConfig;
  private cache: Map<number, CacheEntry> = new Map();
  private readonly CACHE_DURATION_MS = 30 * 1000; // 30 seconds

  constructor(config: Partial<ApiConfig> = {}) {
    this.config = {
      baseUrl: 'https://texttv.nu/api',
      appId: 'swedish-text-tv-mcp',
      includePlainTextContent: true,
      ...config
    };
  }

  /**
   * Validate page number
   */
  private validatePageNumber(pageNumber: number): void {
    if (!Number.isInteger(pageNumber) || pageNumber < 100 || pageNumber > 999) {
      throw new Error(`Invalid page number: ${pageNumber}. Page numbers must be between 100 and 999.`);
    }
  }

  /**
   * Check if page is in cache and not expired
   */
  private getCachedPage(pageNumber: number): TextTVContent | null {
    const entry = this.cache.get(pageNumber);
    if (!entry) {
      return null;
    }

    const now = Date.now();
    if (now - entry.timestamp > this.CACHE_DURATION_MS) {
      // Cache expired, remove it
      this.cache.delete(pageNumber);
      return null;
    }

    return entry.content;
  }

  /**
   * Store page in cache
   */
  private setCachedPage(pageNumber: number, content: TextTVContent): void {
    this.cache.set(pageNumber, {
      content,
      timestamp: Date.now()
    });
  }

  /**
   * Clear expired cache entries (optional cleanup)
   */
  private cleanupExpiredCache(): void {
    const now = Date.now();
    for (const [pageNumber, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.CACHE_DURATION_MS) {
        this.cache.delete(pageNumber);
      }
    }
  }

  /**
   * Get a single page from texttv.nu. If the API returns multiple
   * pages, the first one in order is returned.
   */
  async getPage(pageNumber: number): Promise<TextTVContent> {
    this.validatePageNumber(pageNumber);
    
    // Check cache first
    const cachedContent = this.getCachedPage(pageNumber);
    if (cachedContent) {
      return cachedContent;
    }

    // Clean up expired cache entries occasionally (every 10th request)
    if (Math.random() < 0.1) {
      this.cleanupExpiredCache();
    }
    
    const url = `${this.config.baseUrl}/get/${pageNumber}`;
    const params = new URLSearchParams({
      app: this.config.appId,
      includePlainTextContent: this.config.includePlainTextContent ? '1' : '0'
    });

    try {
      const response = await fetch(`${url}?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Check if the response is actually JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || (!contentType.includes('application/json') && !contentType.includes('text/json'))) {
        throw new Error(`Page ${pageNumber} does not exist or is not available`);
      }

      let pages: PageResponse[];
      try {
        pages = await response.json() as PageResponse[];
      } catch (jsonError) {
        // If JSON parsing fails, it's likely an HTML error page
        throw new Error(`Page ${pageNumber} does not exist or is not available`);
      }
      
      if (pages.length === 0) {
        throw new Error(`Page ${pageNumber} does not exist or is not available`);
      }

      const page = pages[0];
      
      // Extract text content - it might be an array or string
      let textContent = '';
      if (page.content_plain) {
        if (Array.isArray(page.content_plain)) {
          textContent = page.content_plain.join('\n');
        } else {
          textContent = page.content_plain;
        }
      } else if (page.content) {
        if (Array.isArray(page.content)) {
          textContent = page.content.join('\n');
        } else {
          textContent = page.content;
        }
      }
      
      const content = {
        text: textContent,
        dateUpdatedUnix: page.date_updated_unix || 0
      };

      // Store in cache
      this.setCachedPage(pageNumber, content);
      
      return content;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch page ${pageNumber}: ${error.message}`);
      }
      throw new Error(`Failed to fetch page ${pageNumber}: Unknown error`);
    }
  }

  /**
   * Get multiple pages
   */
  async getPages(pageNumbers: number[]): Promise<TextTVContent[]> {
    const promises = pageNumbers.map(async (num) => {
      try {
        return await this.getPage(num);
      } catch (error) {
        // Return a placeholder for failed pages instead of failing the entire request
        return {
          text: `Error: Page ${num} could not be retrieved - ${error instanceof Error ? error.message : 'Unknown error'}`,
          dateUpdatedUnix: 0
        };
      }
    });
    return Promise.all(promises);
  }

  /**
   * Get page range
   */
  async getPageRange(start: number, end: number): Promise<TextTVContent[]> {
    const pageNumbers = [];
    for (let i = start; i <= end; i++) {
      pageNumbers.push(i);
    }
    return this.getPages(pageNumbers);
  }

  /**
   * Search for pages containing specific text
   */
  async searchPages(query: string, pageNumbers: number[]): Promise<TextTVContent[]> {
    const pages = await this.getPages(pageNumbers);
    return pages.filter(pageContent => 
      pageContent.text.toLowerCase().includes(query.toLowerCase())
    );
  }

  /**
   * Clear all cached pages
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; entries: { pageNumber: number; age: number }[] } {
    const now = Date.now();
    const entries = Array.from(this.cache.entries()).map(([pageNumber, entry]) => ({
      pageNumber,
      age: Math.round((now - entry.timestamp) / 1000) // Age in seconds
    }));

    return {
      size: this.cache.size,
      entries
    };
  }
} 