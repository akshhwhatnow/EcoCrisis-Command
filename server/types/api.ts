export interface ApiResponse<T = any> {
  data: T;
  meta?: {
    count?: number;
    total?: number;
    [key: string]: any;
  };
  correlationId: string;
}

export interface ApiErrorDetail {
  field?: string;
  message: string;
  code?: string;
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: ApiErrorDetail[];
  };
  correlationId: string;
  timestamp: string;
}

export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public details?: ApiErrorDetail[];

  constructor(message: string, statusCode = 500, code = 'INTERNAL_ERROR', details?: ApiErrorDetail[]) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}
