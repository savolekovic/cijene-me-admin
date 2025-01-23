export interface PaginatedResponse<T> {
  total_count: number;
  data: T[];
} 