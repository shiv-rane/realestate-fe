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
    const roleUpper = String(session.role || '').toUpperCase();
    if (!roleUpper.includes('ADMIN')) {
      return null;
    }
    return {
      id: session.userId || 'admin-default',
      name: session.name,
      email: session.email,
      role: 'ADMIN',
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

    // Real production API call to Spring Boot backend
    const res = await apiClient<SendOtpResponse>('/api/v1/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    return {
      message: res.message || `OTP sent successfully to ${cleanEmail}. Valid for 10 minutes.`,
      email: res.email || cleanEmail
    };
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

    // Real production API call to Spring Boot backend
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
    const tempRole = localStorage.getItem(TEMP_ROLE_KEY);
    let resolvedRole: 'OWNER' | 'AGENT' | 'ADMIN' = 'OWNER';
    const roleCandidate = data.role || (Array.isArray(data.roles) && data.roles[0]) || tempRole;
    if (roleCandidate) {
      const upper = String(roleCandidate).toUpperCase();
      if (upper.includes('ADMIN')) {
        resolvedRole = 'ADMIN';
      } else if (upper.includes('AGENT')) {
        resolvedRole = 'AGENT';
      } else {
        resolvedRole = 'OWNER';
      }
    }

    const user: AdminUser = {
      id: userId,
      name,
      email: cleanEmail,
      role: resolvedRole,
      lastLogin: new Date().toISOString()
    };

    const verifyResponse: VerifyOtpResponse = {
      accessToken: token,
      tokenType: data.tokenType || 'Bearer',
      expiresInMs: data.expiresInMs || 86400000,
      userId,
      name,
      email: cleanEmail,
      role: resolvedRole,
      token,
      user
    };

    // Store accessToken, role, name, and userId in localStorage
    setAuthSession(verifyResponse);

    return verifyResponse;
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
