/**
 * Global Application & Environment Configuration
 *
 * Centralizes all environment variables and API URLs so changes
 * can be made in one place (.env) without modifying individual files.
 */

export const BACKEND_URL_STORAGE_KEY = 'estatehub_backend_url';

export const DEFAULT_API_URL: string = (
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:8080'
).trim().replace(/\/+$/, '');

/**
 * Returns the currently active backend URL.
 * Checks localStorage first for temporary runtime overrides, then falls back to .env VITE_API_URL.
 */
export const getApiBaseUrl = (): string => {
  try {
    const override = localStorage.getItem(BACKEND_URL_STORAGE_KEY);
    if (override && override.trim()) {
      return override.trim().replace(/\/+$/, '');
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
