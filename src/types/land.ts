export type AreaUnit = 'ACRES' | 'SQ_YARDS' | 'SQ_FEET' | 'HECTARES' | 'BIGHA' | 'GUNTHA';

export type ZoningCategory =
  | 'RESIDENTIAL'
  | 'COMMERCIAL'
  | 'INDUSTRIAL'
  | 'AGRICULTURAL'
  | 'MIXED_USE';

export type ProposedDealType =
  | 'JOINT_DEVELOPMENT'
  | 'JOINT_VENTURE'
  | 'OUTRIGHT_SALE'
  | 'LONG_TERM_LEASE';

export type OwnershipType =
  | 'FREEHOLD'
  | 'LEASEHOLD'
  | 'ANCESTRAL'
  | 'POWER_OF_ATTORNEY';

export type LandParcelStatus =
  | 'PENDING_REVIEW'
  | 'VERIFIED'
  | 'REJECTED'
  | 'IN_DISCUSSION';

export interface LandParcelPayload {
  title: string;
  city: string;
  sector: string;
  state: string;
  pincode: string;
  plotSurveyNumber?: string;
  landmark?: string;
  locationUrl?: string;
  totalArea: number;
  areaUnit: AreaUnit;
  roadWidthFeet?: number;
  plotFacing?: string;
  zoning: ZoningCategory;
  dealType: ProposedDealType;
  expectedPrice?: number;
  pricePerUnit?: number;
  isPriceNegotiable?: boolean;
  expectedRevenueSharePercentage?: number;
  ownershipType: OwnershipType;
  hasClearTitle: boolean;
  isLitigationFree: boolean;
  agencyName?: string;
  brokeragePercentage?: number;
  description?: string;
}

export interface LandParcelResponse extends LandParcelPayload {
  id: string;
  userId?: string;
  status: LandParcelStatus;
  adminNotes?: string;
  createdAt?: string;
  updatedAt?: string;
}
