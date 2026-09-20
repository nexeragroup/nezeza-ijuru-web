export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp?: string;
}

export interface ApiErrorPayload {
  statusCode?: number;
  message?: string | string[];
  error?: string;
  code?: string;
  details?: unknown;
  requestId?: string;
  timestamp?: string;
  path?: string;
}

export interface PageResult<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
