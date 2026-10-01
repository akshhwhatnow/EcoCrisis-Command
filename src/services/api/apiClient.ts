/**
 * EcoCrisis Command - Frontend API Client Layer
 * Authoritative API client connecting Frontend UI to Phase 1-4 Backend REST Services.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '/api/v1';

export interface ApiResponse<T = any> {
  data: T;
  meta?: Record<string, any>;
  correlationId?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export class ApiError extends Error {
  public code: string;
  public status: number;
  public details?: any;

  constructor(message: string, status: number = 500, code: string = 'API_ERROR', details?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const correlationId = `FE-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Correlation-ID': correlationId,
    ...(options.headers as Record<string, string> || {}),
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data: ApiResponse<T> = await response.json();

    if (!response.ok) {
      const rawError = (data as any)?.error;
      const errorMsg =
        (typeof rawError === 'string' ? rawError : rawError?.message) ||
        `HTTP ${response.status} ${response.statusText}`;
      const errorCode =
        typeof rawError === 'object' && rawError?.code
          ? rawError.code
          : `HTTP_${response.status}`;
      const errorDetails = typeof rawError === 'object' ? rawError?.details : undefined;
      throw new ApiError(errorMsg, response.status, errorCode, errorDetails);
    }

    return data;
  } catch (err: any) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(
      err.message || 'Network request failed',
      500,
      'NETWORK_ERROR',
      err
    );
  }
}
