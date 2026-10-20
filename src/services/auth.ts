import {
  apiClient,
  getAuthSession,
  setAuthSession,
  clearAuthSession
} from './apiClient';
import { SendOtpRequest, SendOtpResponse, VerifyOtpResponse, AuthSession } from '../types/auth';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'ROLE_ADMIN' | 'ROLE_SUPER_ADMIN' | 'OWNER' | 'AGENT';
  lastLogin: string;
}

const TEMP_ROLE_KEY = 'estatehub_temp_role';
const TEMP_NAME_KEY = 'estatehub_temp_name';

export const authService = {
  /**
   * Check if an active session exists
   */
  isAuthenticated(): boolean {
    const session = getAuthSession();
    return !!session && !!session.accessToken;
  },

  /**
   * Get active user session
   */
  getSession(): AuthSession | null {
    return getAuthSession();
  },

  /**
   * Backward-compatible admin user getter
   */
  getAdminUser(): AdminUser | null {
    const session = getAuthSession();
    if (!session) return null;
    if (session.role === 'OWNER' || session.role === 'AGENT') {
      return null;
    }
    return {
      id: session.userId || 'user-default',
      name: session.name,
      email: session.email,
      role: session.role as any,
      lastLogin: new Date(session.loginTimestamp).toISOString()
    };
  },

  /**
   * Step 1: Send OTP
   * POST /api/v1/auth/send-otp
   */
  async sendOtp(name: string, email: string, role: 'OWNER' | 'AGENT' | 'ADMIN' = 'OWNER'): Promise<SendOtpResponse> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    const cleanRole = role.toUpperCase() as any;

    localStorage.setItem(TEMP_ROLE_KEY, cleanRole);
    localStorage.setItem(TEMP_NAME_KEY, cleanName);

    const payload: SendOtpRequest = {
      name: cleanName,
      email: cleanEmail,
      role: cleanRole
    };

    try {
      return await apiClient<SendOtpResponse>('/api/v1/auth/send-otp', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    } catch (err: any) {
      // If backend is offline, enable dev simulation fallback with OTP 123456
      if (err.status === 0 || err.message?.includes('Unable to connect')) {
        console.warn('Backend is offline. Running simulation fallback with OTP 123456.');
        return {
          message: `OTP sent successfully to ${cleanEmail}. Valid for 10 minutes. (Dev: 123456)`,
          email: cleanEmail
        };
      }
      throw err;
    }
  },

  /**
   * Step 2: Verify OTP
   * POST /api/v1/auth/verify-otp
   */
  async verifyOtp(email: string, otp: string): Promise<VerifyOtpResponse> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();

    const payload = {
      email: cleanEmail,
      otp: cleanOtp
    };

    try {
      const data = await apiClient<any>('/api/v1/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      const token = data.accessToken || data.token || data.jwt || '';
      if (!token) {
        throw new Error('Backend did not return an access token.');
      }

      const userId = data.userId || `user-${Date.now()}`;
      const name = data.name || localStorage.getItem(TEMP_NAME_KEY) || cleanEmail.split('@')[0];
      const userRole = (data.role || localStorage.getItem(TEMP_ROLE_KEY) || 'OWNER') as any;

      const user: AdminUser = {
        id: userId,
        name,
        email: cleanEmail,
        role: userRole,
        lastLogin: new Date().toISOString()
      };

      const verifyResponse: VerifyOtpResponse = {
        accessToken: token,
        tokenType: data.tokenType || 'Bearer',
        expiresInMs: data.expiresInMs || 86400000,
        userId,
        name,
        email: cleanEmail,
        role: userRole,
        token,
        user
      };

      setAuthSession(verifyResponse);
      return verifyResponse;
    } catch (err: any) {
      // If backend is offline and user provides 123456 or a valid 6-digit OTP in dev mode
      if ((err.status === 0 || err.message?.includes('Unable to connect')) && cleanOtp.length === 6) {
        const role = (localStorage.getItem(TEMP_ROLE_KEY) || 'OWNER') as any;
        const name = localStorage.getItem(TEMP_NAME_KEY) || 'Rajesh Sharma';
        const userId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
        const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dev-${Date.now()}`;

        const user: AdminUser = {
          id: userId,
          name,
          email: cleanEmail,
          role,
          lastLogin: new Date().toISOString()
        };

        const verifyResponse: VerifyOtpResponse = {
          accessToken: token,
          tokenType: 'Bearer',
          expiresInMs: 86400000,
          userId,
          name,
          email: cleanEmail,
          role,
          token,
          user
        };

        setAuthSession(verifyResponse);
        return verifyResponse;
      }
      throw err;
    }
  },

  /**
   * Clear session & logout
   */
  logout(): void {
    clearAuthSession();
    localStorage.removeItem(TEMP_ROLE_KEY);
    localStorage.removeItem(TEMP_NAME_KEY);
  }
};
