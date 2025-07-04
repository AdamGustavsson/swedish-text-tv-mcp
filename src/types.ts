/**
 * Type definitions for the texttv.nu API
 */

export interface PageResponse {
  num: string;
  title: string;
  content: string[] | string;
  content_plain?: string[] | string;
  next_page?: number;
  prev_page?: number;
  date_updated_unix: number;
}

export interface PageNumber {
  value: number;
}

export interface TextTVError {
  message: string;
  code?: string;
}

export interface ApiConfig {
  baseUrl: string;
  appId: string;
  includePlainTextContent: boolean;
}

export interface TextTVContent {
  text: string;
  dateUpdatedUnix: number;
} 