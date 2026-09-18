export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  error?: string;
  statusCode?: number;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  error?: string;
  statusCode?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
