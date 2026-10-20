import { getApiBaseUrl } from '../config/env';
import { AuthSession, VerifyOtpResponse } from '../types/auth';

export const AUTH_STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  ROLE: 'role',
  NAME: 'name',
  USER_ID: 'userId',
  EMAIL: 'email',
  TOKEN_TYPE: 'tokenType',
  EXPIRES_IN: 'expiresInMs',
  LOGIN_TIMESTAMP: 'loginTimestamp',
  // Backward compatibility keys
  LEGACY_JWT: 'estatehub_jwt_token',
  LEGACY_USER: 'estatehub_admin_user'
};

export const UNAUTHORIZED_EVENT = 'estatehub:unauthorized';

/**
 * Retrieve active authenticated session from localStorage
 */
export function getAuthSession(): AuthSession | null {
  try {
    const accessToken =
      localStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN) ||
      localStorage.getItem(AUTH_STORAGE_KEYS.LEGACY_JWT);

    if (!accessToken) return null;

    const role = (localStorage.getItem(AUTH_STORAGE_KEYS.ROLE) || 'OWNER') as AuthSession['role'];
    const name = localStorage.getItem(AUTH_STORAGE_KEYS.NAME) || 'Verified User';
    const userId = localStorage.getItem(AUTH_STORAGE_KEYS.USER_ID) || '';
    const email = localStorage.getItem(AUTH_STORAGE_KEYS.EMAIL) || '';
    const tokenType = localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN_TYPE) || 'Bearer';
    const expiresInMs = parseInt(localStorage.getItem(AUTH_STORAGE_KEYS.EXPIRES_IN) || '86400000', 10);
    const loginTimestamp = parseInt(localStorage.getItem(AUTH_STORAGE_KEYS.LOGIN_TIMESTAMP) || `${Date.now()}`, 10);

    // Optional expiry check (if token is older than expiresInMs)
    if (expiresInMs && Date.now() - loginTimestamp > expiresInMs) {
      clearAuthSession();
      return null;
    }

    return {
      accessToken,
      tokenType,
      expiresInMs,
      userId,
      name,
      email,
      role,
      loginTimestamp
    };
  } catch {
    return null;
  }
}

/**
 * Persist authenticated user session from OTP verification response
 */
export function setAuthSession(data: VerifyOtpResponse): AuthSession {
  const token = data.accessToken;
  const tokenType = data.tokenType || 'Bearer';
  const expiresInMs = data.expiresInMs || 86400000;
  const now = Date.now();

  localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, token);
  localStorage.setItem(AUTH_STORAGE_KEYS.ROLE, data.role);
  localStorage.setItem(AUTH_STORAGE_KEYS.NAME, data.name);
  localStorage.setItem(AUTH_STORAGE_KEYS.USER_ID, data.userId);
  localStorage.setItem(AUTH_STORAGE_KEYS.EMAIL, data.email);
  localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN_TYPE, tokenType);
  localStorage.setItem(AUTH_STORAGE_KEYS.EXPIRES_IN, expiresInMs.toString());
  localStorage.setItem(AUTH_STORAGE_KEYS.LOGIN_TIMESTAMP, now.toString());

  // Also sync legacy token keys for backward compatibility
  localStorage.setItem(AUTH_STORAGE_KEYS.LEGACY_JWT, token);

  const session: AuthSession = {
    accessToken: token,
    tokenType,
    expiresInMs,
    userId: data.userId,
    name: data.name,
    email: data.email,
    role: data.role,
    loginTimestamp: now
  };

  // Dispatch auth state change event
  window.dispatchEvent(new CustomEvent('estatehub:auth-changed', { detail: session }));

  return session;
}

/**
 * Clear stored auth credentials and notify listeners
 */
export function clearAuthSession(): void {
  localStorage.removeItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(AUTH_STORAGE_KEYS.ROLE);
  localStorage.removeItem(AUTH_STORAGE_KEYS.NAME);
  localStorage.removeItem(AUTH_STORAGE_KEYS.USER_ID);
  localStorage.removeItem(AUTH_STORAGE_KEYS.EMAIL);
  localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN_TYPE);
  localStorage.removeItem(AUTH_STORAGE_KEYS.EXPIRES_IN);
  localStorage.removeItem(AUTH_STORAGE_KEYS.LOGIN_TIMESTAMP);
  localStorage.removeItem(AUTH_STORAGE_KEYS.LEGACY_JWT);

  // Dispatch auth cleared event
  window.dispatchEvent(new CustomEvent('estatehub:auth-changed', { detail: null }));
}

/**
 * Custom Error class with status code
 */
export class ApiError extends Error {
  status: number;
  data?: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Unified API Client with Bearer token interceptor and 401 unauthorized handling
 */
export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${baseUrl}${cleanEndpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  // Automatically inject Bearer Authorization header if token exists
  const session = getAuthSession();
  if (session?.accessToken && !headers['Authorization']) {
    const cleanToken = session.accessToken.startsWith('Bearer ')
      ? session.accessToken
      : `Bearer ${session.accessToken}`;
    headers['Authorization'] = cleanToken;
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers
    });
  } catch (err: any) {
    if (err.name === 'TypeError' || err.message?.includes('fetch') || err.message?.includes('Failed to fetch')) {
      throw new ApiError(
        `Unable to connect to backend server at ${baseUrl}. Please ensure Spring Boot is running on port 8080.`,
        0
      );
    }
    throw new ApiError(err.message || 'Network request failed', 0);
  }

  // Handle 401 Unauthorized: clear storage and route back to /login
  if (response.status === 401) {
    clearAuthSession();
    window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT));
    
    // Smoothly redirect to /login if not already on /login
    if (window.location.pathname !== '/login') {
      window.history.pushState({}, '', '/login');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
    
    throw new ApiError('Session expired or unauthorized. Please log in again.', 401);
  }

  // Handle other HTTP errors
  if (!response.ok) {
    let errorMessage = `Request failed (${response.status} ${response.statusText})`;
    let errorJson: any = null;
    try {
      errorJson = await response.json();
      errorMessage = errorJson.message || errorJson.error || errorMessage;
    } catch {
      // Body is not JSON
    }
    throw new ApiError(errorMessage, response.status, errorJson);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  // Check content type for JSON
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return (await response.json()) as T;
  }

  return {} as T;
}
