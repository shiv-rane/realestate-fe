import {
  AdminStats,
  Developer,
  DeveloperProfileResponse,
  Project,
  VerificationStatus
} from '../types';
import {
  DEFAULT_API_URL,
  getApiBaseUrl,
  buildApiUrl,
  ENV,
  BACKEND_URL_STORAGE_KEY
} from '../config/env';

export { DEFAULT_API_URL, buildApiUrl, ENV };
export const API_BASE_URL = DEFAULT_API_URL;

const AUTH_TOKEN_KEY = 'estatehub_jwt_token';
const ADMIN_TOKEN_KEY = 'estatehub_admin_jwt';
const BACKEND_URL_KEY = BACKEND_URL_STORAGE_KEY;

export const getAuthToken = (): string => {
  return localStorage.getItem(AUTH_TOKEN_KEY) || localStorage.getItem(ADMIN_TOKEN_KEY) || '';
};

export const setAuthToken = (token: string): void => {
  if (token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(ADMIN_TOKEN_KEY);
  }
};

export const getBackendUrl = (): string => {
  return getApiBaseUrl();
};

export const setBackendUrl = (url: string): void => {
  if (url) {
    localStorage.setItem(BACKEND_URL_KEY, url);
  } else {
    localStorage.removeItem(BACKEND_URL_KEY);
  }
};

// Helper for standard authenticated JSON requests
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const backendUrl = getBackendUrl();
  const token = getAuthToken();

  const url = `${backendUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    const cleanToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    headers['Authorization'] = cleanToken;
  }

  const res = await fetch(url, {
    ...options,
    headers
  });

  if (!res.ok) {
    let errorMsg = `Request failed (${res.status} ${res.statusText})`;
    try {
      const errorJson = await res.json();
      errorMsg = errorJson.message || errorJson.error || errorMsg;
    } catch {
      // not JSON
    }

    throw new Error(errorMsg);
  }

  // Handle empty responses (e.g. 204 No Content or void DELETE)
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await res.json();
  }
  return {} as T;
}

/**
 * Production Public API Client (/api/v1/developers)
 */
export const publicApi = {
  /**
   * GET /api/v1/developers
   * Returns approved developers from the database
   */
  async getDevelopers(): Promise<Developer[]> {
    const data = await apiRequest<any[]>('/api/v1/developers');
    if (!Array.isArray(data)) return [];
    
    return data.map((d: any) => ({
      ...d,
      id: d.id || d.profileId,
      name: d.companyName || d.name,
      companyName: d.companyName || d.name,
      projects: d.projects || [],
      contactPerson: d.contactPerson || {
        name: d.contactPersonName || 'Authorized Officer',
        email: d.contactEmail || '',
        phone: d.contactPhone || ''
      }
    }));
  },

  /**
   * GET /api/v1/developers/{profileId}
   * Full profile with projects & stats
   */
  async getDeveloperProfile(profileId: string): Promise<DeveloperProfileResponse> {
    const data = await apiRequest<any>(`/api/v1/developers/${profileId}`);
    const devProjects: Project[] = data.projects || [];

    const projectsCompleted = devProjects.filter((p: any) => p.status === 'DELIVERED').length;
    const upcomingProjects = devProjects.filter((p: any) => p.status === 'UPCOMING').length;
    const ongoingProjects = devProjects.filter((p: any) => p.status === 'ONGOING').length;

    return {
      developer: {
        ...data,
        id: data.id || data.profileId || profileId,
        name: data.companyName || data.name,
        companyName: data.companyName || data.name,
        contactPerson: data.contactPerson || {
          name: data.contactPersonName || 'Authorized Officer',
          email: data.contactEmail || '',
          phone: data.contactPhone || ''
        }
      },
      projects: devProjects,
      stats: {
        yearsExperience: data.yearsOfExperience || (data.establishedYear ? new Date().getFullYear() - data.establishedYear : 0),
        happyCustomers: typeof data.happyCustomers === 'number' ? `${data.happyCustomers.toLocaleString()}+ Families` : (data.happyCustomersCount || '0 Families'),
        projectsCompleted,
        upcomingProjects,
        ongoingProjects,
        totalProjects: devProjects.length
      }
    };
  }
};

/**
 * Production Admin API Client (/api/v1/admin)
 */
export const adminApi = {
  /**
   * GET /api/v1/admin/stats
   * Aggregated developer counts from database
   */
  async getStats(): Promise<AdminStats> {
    return await apiRequest<AdminStats>('/api/v1/admin/stats');
  },

  /**
   * GET /api/v1/admin/developers?status=
   * List developers with project count
   */
  async getDevelopers(status?: VerificationStatus | 'ALL'): Promise<Developer[]> {
    const query = status && status !== 'ALL' ? `?status=${encodeURIComponent(status)}` : '';
    const data = await apiRequest<any[]>(`/api/v1/admin/developers${query}`);
    if (!Array.isArray(data)) return [];

    return data.map((d: any) => ({
      ...d,
      id: d.id || d.profileId,
      name: d.companyName || d.name,
      companyName: d.companyName || d.name,
      projects: d.projects || [],
      contactPerson: d.contactPerson || {
        name: d.contactPersonName || 'Authorized Officer',
        email: d.contactEmail || '',
        phone: d.contactPhone || ''
      }
    }));
  },

  /**
   * POST /api/v1/admin/developers
   * Create new developer record in database
   */
  async createDeveloper(data: any): Promise<Developer> {
    return await apiRequest<Developer>('/api/v1/admin/developers', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  /**
   * PUT /api/v1/admin/developers/{id}
   * Update developer details
   */
  async updateDeveloper(id: string, updates: any): Promise<Developer> {
    return await apiRequest<Developer>(`/api/v1/admin/developers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  /**
   * DELETE /api/v1/admin/developers/{id}
   * Delete developer from database
   */
  async deleteDeveloper(id: string): Promise<{ success: boolean; id: string }> {
    await apiRequest(`/api/v1/admin/developers/${id}`, {
      method: 'DELETE'
    });
    return { success: true, id };
  },

  /**
   * GET /api/v1/admin/developers/{devId}/projects
   */
  async getDeveloperProjects(devId: string): Promise<Project[]> {
    const data = await apiRequest<Project[]>(`/api/v1/admin/developers/${devId}/projects`);
    return Array.isArray(data) ? data : [];
  },

  /**
   * POST /api/v1/admin/developers/{devId}/projects
   * Add project scoped to developer
   */
  async addProject(
    devId: string,
    data: Omit<Project, 'id' | 'developerId' | 'createdAt' | 'updatedAt'>
  ): Promise<Project> {
    return await apiRequest<Project>(`/api/v1/admin/developers/${devId}/projects`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  /**
   * PUT /api/v1/admin/developers/{devId}/projects/{projectId}
   * Edit project
   */
  async updateProject(
    devId: string,
    projectId: string,
    updates: Partial<Project>
  ): Promise<Project> {
    return await apiRequest<Project>(`/api/v1/admin/developers/${devId}/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  /**
   * DELETE /api/v1/admin/developers/{devId}/projects/{projectId}
   * Delete project
   */
  async deleteProject(devId: string, projectId: string): Promise<{ success: boolean; projectId: string }> {
    await apiRequest(`/api/v1/admin/developers/${devId}/projects/${projectId}`, {
      method: 'DELETE'
    });
    return { success: true, projectId };
  }
};
