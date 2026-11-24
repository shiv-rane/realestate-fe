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

export function formatDeveloperRequest(data: any): any {
  return {
    companyName: (data.companyName || data.name || '').trim(),
    contactPersonName: (data.contactPersonName || data.contactPerson?.name || '').trim(),
    contactEmail: (data.contactEmail || data.contactPerson?.email || '').trim(),
    contactPhone: (data.contactPhone || data.contactPerson?.phone || '').trim(),
    websiteUrl: (data.websiteUrl || '').trim(),
    reraNumber: (data.reraNumber || '').trim(),
    gstNumber: (data.gstNumber || '').trim(),
    description: (data.description || '').trim(),
    establishedYear: data.establishedYear ? Number(data.establishedYear) : null,
    yearsOfExperience: Math.max(0, Number(data.yearsOfExperience || 0)),
    happyCustomers: Math.max(0, Number(data.happyCustomers || 0)),
    coreExpertise: Array.isArray(data.coreExpertise) && data.coreExpertise.length > 0 ? data.coreExpertise : ['JV', 'JDA'],
    operatingCities: Array.isArray(data.operatingCities) && data.operatingCities.length > 0 ? data.operatingCities : ['Bengaluru'],
    verificationStatus: data.verificationStatus || 'APPROVED'
  };
}

export function formatProjectRequest(p: any): any {
  const projectType = p.projectType || p.type || 'RESIDENTIAL';
  const status = p.status || 'ONGOING';
  const city = (p.city || '').trim();
  const name = (p.name || '').trim();
  const address = (p.address || (city ? `${city} Prime Corridor` : '')).trim();
  const pincode = (p.pincode || '').trim();
  const areaSqFtMin = Number(p.areaSqFtMin ?? p.areaMinSqFt ?? 1000);
  const areaSqFtMax = Number(p.areaSqFtMax ?? p.areaMaxSqFt ?? 3000);
  const totalUnits = Math.max(1, Number(p.totalUnits || 1));
  const reraProjectNumber = (p.reraProjectNumber || p.reraProjectId || '').trim();
  const deliveredYear = p.deliveredYear ? Number(p.deliveredYear) : null;
  const amenities = Array.isArray(p.amenities) ? p.amenities : [];

  return {
    name,
    description: (p.description || '').trim(),
    projectType,
    status,
    city,
    address,
    pincode,
    areaSqFtMin,
    areaSqFtMax,
    totalUnits,
    reraProjectNumber,
    deliveredYear,
    amenities
  };
}

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
    const payload = formatDeveloperRequest(data);
    const created = await apiRequest<any>('/api/v1/admin/developers', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return {
      ...created,
      id: created.id || created.profileId,
      name: created.companyName || created.name,
      companyName: created.companyName || created.name,
      projects: created.projects || []
    };
  },

  /**
   * PUT /api/v1/admin/developers/{id}
   * Update developer details
   */
  async updateDeveloper(id: string, updates: any): Promise<Developer> {
    const payload = formatDeveloperRequest(updates);
    const updated = await apiRequest<any>(`/api/v1/admin/developers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
    return {
      ...updated,
      id: updated.id || updated.profileId || id,
      name: updated.companyName || updated.name,
      companyName: updated.companyName || updated.name,
      projects: updated.projects || []
    };
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
    try {
      const data = await apiRequest<any[]>(`/api/v1/admin/developers/${devId}/projects`);
      if (Array.isArray(data)) {
        return data.map((p: any) => ({
          ...p,
          id: p.id || p.projectId,
          projectId: p.projectId || p.id,
          projectType: p.projectType || p.type || 'RESIDENTIAL',
          areaSqFtMin: p.areaSqFtMin ?? p.areaMinSqFt ?? 1000,
          areaSqFtMax: p.areaSqFtMax ?? p.areaMaxSqFt ?? 3000,
          reraProjectNumber: p.reraProjectNumber || p.reraProjectId || ''
        }));
      }
    } catch {
      // Backend AdminController does not have a dedicated GET /projects; fallback to developer profile
      try {
        const profile = await publicApi.getDeveloperProfile(devId);
        return (profile.projects || []).map((p: any) => ({
          ...p,
          id: p.id || p.projectId,
          projectId: p.projectId || p.id,
          projectType: p.projectType || p.type || 'RESIDENTIAL',
          areaSqFtMin: p.areaSqFtMin ?? p.areaMinSqFt ?? 1000,
          areaSqFtMax: p.areaSqFtMax ?? p.areaMaxSqFt ?? 3000,
          reraProjectNumber: p.reraProjectNumber || p.reraProjectId || ''
        }));
      } catch {
        try {
          const devs = await adminApi.getDevelopers();
          const found = devs.find(d => d.id === devId || d.profileId === devId);
          return (found?.projects || []).map((p: any) => ({
            ...p,
            id: p.id || p.projectId,
            projectId: p.projectId || p.id
          }));
        } catch {
          // ignore
        }
      }
    }
    return [];
  },

  /**
   * POST /api/v1/admin/developers/{devId}/projects
   * Add project scoped to developer
   */
  async addProject(
    devId: string,
    data: any
  ): Promise<Project> {
    const payload = formatProjectRequest(data);
    const res = await apiRequest<any>(`/api/v1/admin/developers/${devId}/projects`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return {
      ...res,
      id: res.id || res.projectId,
      projectId: res.projectId || res.id
    };
  },

  /**
   * PUT /api/v1/admin/developers/{devId}/projects/{projectId}
   * Edit project
   */
  async updateProject(
    devId: string,
    projectId: string,
    updates: any
  ): Promise<Project> {
    const payload = formatProjectRequest(updates);
    const res = await apiRequest<any>(`/api/v1/admin/developers/${devId}/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
    return {
      ...res,
      id: res.id || res.projectId || projectId,
      projectId: res.projectId || res.id || projectId
    };
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
