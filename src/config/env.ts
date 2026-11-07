/**
 * Global Application & Environment Configuration
 *
 * Centralizes all environment variables and API URLs so changes
 * can be made in one place (.env) without modifying individual files.
 */

export const BACKEND_URL_STORAGE_KEY = 'estatehub_backend_url';
export const PROD_BACKEND_URL = 'https://realestate-be-hur9.onrender.com';

const rawApiUrl = (
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  ''
).trim().replace(/\/+$/, '');

export const DEFAULT_API_URL: string = (() => {
  if (rawApiUrl) {
    // If in production mode, avoid accidental localhost baked-in URLs
    if (import.meta.env.PROD && (rawApiUrl.includes('localhost') || rawApiUrl.includes('127.0.0.1'))) {
      return PROD_BACKEND_URL;
    }
    return rawApiUrl;
  }
  return import.meta.env.PROD ? PROD_BACKEND_URL : 'http://localhost:8080';
})();

/**
 * Returns the currently active backend URL.
 * Checks localStorage first for temporary runtime overrides, then falls back to .env VITE_API_URL.
 */
export const getApiBaseUrl = (): string => {
  try {
    const override = localStorage.getItem(BACKEND_URL_STORAGE_KEY);
    if (override && override.trim()) {
      const trimmed = override.trim().replace(/\/+$/, '');
      // When deployed in production, disregard stale localhost overrides saved in browser localStorage
      if (import.meta.env.PROD && (trimmed.includes('localhost') || trimmed.includes('127.0.0.1'))) {
        localStorage.removeItem(BACKEND_URL_STORAGE_KEY);
      } else {
        return trimmed;
      }
    }
  } catch {
    // Ignore storage errors in restricted contexts
  }
  return DEFAULT_API_URL;
};

/**
 * Helper to build complete API endpoints cleanly.
 * Example: buildApiUrl('/api/v1/developers') => 'http://localhost:8080/api/v1/developers'
 */
export const buildApiUrl = (path: string): string => {
  const base = getApiBaseUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${cleanPath}`;
};

export const ENV = {
  API_URL: DEFAULT_API_URL,
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
  MODE: import.meta.env.MODE,
} as const;

export default ENV;
