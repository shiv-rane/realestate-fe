export type VerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type CoreExpertise = 'JV' | 'JDA' | 'OUTRIGHT' | 'REDEVELOPMENT';

export type ProjectStatus = 'UPCOMING' | 'ONGOING' | 'DELIVERED';

export type ProjectType = 'RESIDENTIAL' | 'COMMERCIAL' | 'MIXED_USE' | 'PLOTTED';

export interface Project {
  id: string;
  projectId?: string;
  developerId?: string;
  name: string;
  description?: string;
  type?: ProjectType;
  projectType?: ProjectType;
  status: ProjectStatus;
  city: string;
  address: string;
  pincode?: string;
  areaMinSqFt?: number;
  areaMaxSqFt?: number;
  areaSqFtMin?: number;
  areaSqFtMax?: number;
  totalUnits: number;
  reraProjectId?: string;
  reraProjectNumber?: string;
  deliveredYear?: number | string | null;
  amenities: string[];
  imageUrl?: string;
  startingPrice?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ContactPerson {
  name: string;
  email: string;
  phone: string;
  designation?: string;
}

export interface Developer {
  id: string;
  profileId?: string;
  name: string;
  companyName: string;
  contactPersonName: string;
  contactEmail: string;
  contactPhone: string;
  websiteUrl: string;
  reraNumber: string;
  gstNumber?: string;
  description: string;
  establishedYear: number;
  yearsOfExperience: number;
  happyCustomers: number;
  happyCustomersCount?: string;
  coreExpertise: CoreExpertise[];
  operatingCities: string[];
  verificationStatus: VerificationStatus;
  projectsCompleted?: number;
  upcomingProjects?: number;
  contactPerson?: ContactPerson;
  logoUrl?: string;
  coverImageUrl?: string;
  projects?: Project[];
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export interface ComputedDeveloperStats {
  yearsExperience: number;
  happyCustomers: string;
  projectsCompleted: number;
  upcomingProjects: number;
  ongoingProjects: number;
  totalProjects: number;
}

export interface DeveloperProfileResponse {
  developer: Developer;
  projects: Project[];
  stats: ComputedDeveloperStats;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  description?: string;
}
