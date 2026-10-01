import { apiRequest } from './apiClient';
import { UserRole } from '../../types';

export interface AuthUserData {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  role: string;
  operator_type?: UserRole | null;
}

export interface AuthResponseData {
  user: AuthUserData;
  token: string;
}

export const authApi = {
  /**
   * Authenticate user with role verification
   */
  async login(email: string, password: string, role: string): Promise<AuthResponseData> {
    const res = await apiRequest<AuthResponseData>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, role }),
    });
    // Handle both direct object payload and { data: { user, token } } responses
    return (res as any).user ? (res as any) : res.data;
  },

  /**
   * Register a civilian user
   */
  async register(payload: {
    fullName: string;
    email: string;
    phone?: string;
    password: string;
    role?: string;
  }): Promise<AuthResponseData> {
    const res = await apiRequest<AuthResponseData>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return (res as any).user ? (res as any) : res.data;
  },
};
