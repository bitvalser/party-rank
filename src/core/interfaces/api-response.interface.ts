export interface ApiResponse<T = null> {
  ok: boolean;
  message?: string;
  stack?: string;
  metadata?: {
    limit?: number;
    count?: number;
    offset?: number;
    [key: string]: number | string | boolean;
  };
  data: T;
}
