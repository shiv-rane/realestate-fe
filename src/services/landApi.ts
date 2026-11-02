import { apiClient } from './apiClient';
import { LandParcelPayload, LandParcelResponse, LandParcelStatus } from '../types/land';

// Clean up any legacy demo parcels from browser storage
try {
  localStorage.removeItem('estatehub_dev_parcels');
} catch {
  // ignore
}

export const landApi = {
  /**
   * Submit new Land Parcel to production backend
   * POST /api/v1/lands
   */
  async submitLand(payload: LandParcelPayload): Promise<LandParcelResponse> {
    return await apiClient<LandParcelResponse>('/api/v1/lands', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  /**
   * List lands submitted by current authenticated user
   * GET /api/v1/lands/my-parcels
   */
  async getMyLands(): Promise<LandParcelResponse[]> {
    const data = await apiClient<LandParcelResponse[]>('/api/v1/lands/my-parcels', {
      method: 'GET'
    });
    return Array.isArray(data) ? data : [];
  },

  /**
   * Admin: List all submitted land parcels from database
   * GET /api/v1/admin/lands
   */
  async getAllLands(status?: string): Promise<LandParcelResponse[]> {
    const query = status && status !== 'ALL' ? `?status=${encodeURIComponent(status)}` : '';
    try {
      const data = await apiClient<any>(`/api/v1/admin/lands${query}`, {
        method: 'GET'
      });
      let list: LandParcelResponse[] = [];
      if (Array.isArray(data)) {
        list = data;
      } else if (data && Array.isArray(data.content)) {
        list = data.content;
      } else if (data && Array.isArray(data.data)) {
        list = data.data;
      } else if (data && Array.isArray(data.parcels)) {
        list = data.parcels;
      }
      if (status && status !== 'ALL') {
        return list.filter(p => p.status === status);
      }
      return list;
    } catch (err) {
      console.error('Failed to load admin land parcels from /api/v1/admin/lands:', err);
      return [];
    }
  },

  /**
   * Get specific land parcel by ID from database
   * GET /api/v1/lands/{id}
   */
  async getLandById(id: string): Promise<LandParcelResponse> {
    const res = await apiClient<any>(`/api/v1/lands/${id}`, {
      method: 'GET'
    });
    return res?.data || res?.parcel || res;
  },

  /**
   * Update existing land parcel
   * PUT /api/v1/lands/{id}
   */
  async updateLand(id: string, payload: Partial<LandParcelPayload>): Promise<LandParcelResponse> {
    return await apiClient<LandParcelResponse>(`/api/v1/lands/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },

  /**
   * Admin: Update parcel verification status and review notes
   * PATCH /api/v1/admin/lands/{id}/status
   */
  async updateLandStatus(
    id: string,
    status: LandParcelStatus,
    adminNotes?: string
  ): Promise<LandParcelResponse> {
    return await apiClient<LandParcelResponse>(`/api/v1/admin/lands/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, adminNotes })
    });
  },

  /**
   * Delete land parcel from database
   * DELETE /api/v1/lands/{id}
   */
  async deleteLand(id: string): Promise<void> {
    await apiClient<void>(`/api/v1/lands/${id}`, {
      method: 'DELETE'
    });
  }
};
