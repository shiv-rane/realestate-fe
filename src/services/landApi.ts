import { apiClient } from './apiClient';
import { LandParcelPayload, LandParcelResponse } from '../types/land';

const LOCAL_STORAGE_PARCELS_KEY = 'estatehub_dev_parcels';

function getLocalParcels(): LandParcelResponse[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_PARCELS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }

  // Initial seed parcel matching prompt specification
  const initial: LandParcelResponse[] = [
    {
      id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      userId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      title: 'Prime 3.5 Acre Plot on Main Sector Road',
      city: 'Gurgaon',
      sector: 'Sector 82',
      state: 'Haryana',
      pincode: '122004',
      plotSurveyNumber: 'Khasra No. 142/1',
      landmark: 'Near NH-48 toll exit',
      locationUrl: 'https://maps.google.com/?q=28.39,76.97',
      totalArea: 3.5,
      areaUnit: 'ACRES',
      roadWidthFeet: 60.0,
      plotFacing: 'North-East Corner',
      zoning: 'RESIDENTIAL',
      dealType: 'JOINT_DEVELOPMENT',
      expectedPrice: 250000000,
      pricePerUnit: 71428571,
      isPriceNegotiable: true,
      expectedRevenueSharePercentage: 45.0,
      ownershipType: 'FREEHOLD',
      hasClearTitle: true,
      isLitigationFree: true,
      agencyName: 'Apex Realty Advisors',
      brokeragePercentage: 1.5,
      description: 'Clear title parcel suitable for group housing and high-rise luxury residential development.',
      status: 'VERIFIED',
      adminNotes: 'Title verified against revenue records. RERA compliance clearance granted.',
      createdAt: new Date().toISOString()
    }
  ];

  localStorage.setItem(LOCAL_STORAGE_PARCELS_KEY, JSON.stringify(initial));
  return initial;
}

function saveLocalParcels(parcels: LandParcelResponse[]): void {
  localStorage.setItem(LOCAL_STORAGE_PARCELS_KEY, JSON.stringify(parcels));
}

export const landApi = {
  /**
   * Submit new Land Parcel
   * POST /api/v1/lands
   */
  async submitLand(payload: LandParcelPayload): Promise<LandParcelResponse> {
    try {
      return await apiClient<LandParcelResponse>('/api/v1/lands', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    } catch (err: any) {
      if (err.status === 0 || err.message?.includes('Unable to connect')) {
        console.warn('Backend offline, saving parcel in local store');
        const parcels = getLocalParcels();
        const newParcel: LandParcelResponse = {
          ...payload,
          id: `parcel-${Date.now()}`,
          userId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
          status: 'PENDING_REVIEW',
          createdAt: new Date().toISOString()
        };
        parcels.unshift(newParcel);
        saveLocalParcels(parcels);
        return newParcel;
      }
      throw err;
    }
  },

  /**
   * List all lands submitted by authenticated user
   * GET /api/v1/lands/my-parcels
   */
  async getMyLands(): Promise<LandParcelResponse[]> {
    try {
      const data = await apiClient<LandParcelResponse[]>('/api/v1/lands/my-parcels', {
        method: 'GET'
      });
      return Array.isArray(data) ? data : [];
    } catch (err: any) {
      if (err.status === 0 || err.message?.includes('Unable to connect')) {
        console.warn('Backend offline, loading parcels from local store');
        return getLocalParcels();
      }
      throw err;
    }
  },

  /**
   * Get specific land parcel by ID
   * GET /api/v1/lands/{id}
   */
  async getLandById(id: string): Promise<LandParcelResponse> {
    try {
      return await apiClient<LandParcelResponse>(`/api/v1/lands/${id}`, {
        method: 'GET'
      });
    } catch (err: any) {
      if (err.status === 0 || err.message?.includes('Unable to connect')) {
        const parcels = getLocalParcels();
        const found = parcels.find(p => p.id === id);
        if (found) return found;
        throw new Error(`Land parcel with ID ${id} not found.`);
      }
      throw err;
    }
  },

  /**
   * Update existing land parcel
   * PUT /api/v1/lands/{id}
   */
  async updateLand(id: string, payload: Partial<LandParcelPayload>): Promise<LandParcelResponse> {
    try {
      return await apiClient<LandParcelResponse>(`/api/v1/lands/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
    } catch (err: any) {
      if (err.status === 0 || err.message?.includes('Unable to connect')) {
        const parcels = getLocalParcels();
        const index = parcels.findIndex(p => p.id === id);
        if (index !== -1) {
          parcels[index] = {
            ...parcels[index],
            ...payload,
            updatedAt: new Date().toISOString()
          };
          saveLocalParcels(parcels);
          return parcels[index];
        }
        throw new Error(`Land parcel with ID ${id} not found.`);
      }
      throw err;
    }
  },

  /**
   * Delete land parcel
   * DELETE /api/v1/lands/{id}
   */
  async deleteLand(id: string): Promise<void> {
    try {
      await apiClient<void>(`/api/v1/lands/${id}`, {
        method: 'DELETE'
      });
    } catch (err: any) {
      if (err.status === 0 || err.message?.includes('Unable to connect')) {
        const parcels = getLocalParcels();
        const updated = parcels.filter(p => p.id !== id);
        saveLocalParcels(updated);
        return;
      }
      throw err;
    }
  }
};
