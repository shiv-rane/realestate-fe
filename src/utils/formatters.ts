import { AreaUnit, LandParcelStatus, OwnershipType, ProposedDealType, ZoningCategory } from '../types/land';

/**
 * Format a number to Indian currency format with Cr / L notation.
 * Examples:
 * 250000000 -> "₹25.0 Cr"
 * 71428571  -> "₹7.14 Cr"
 * 4500000   -> "₹45.0 L"
 * 85000     -> "₹85,000"
 */
export function formatIndianCurrency(amount?: number | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '₹0';
  }

  const absAmount = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  // 1 Crore = 1,00,00,000
  if (absAmount >= 10000000) {
    const crValue = absAmount / 10000000;
    const formatted = crValue % 1 === 0 ? crValue.toFixed(1) : crValue.toFixed(2).replace(/\.?0+$/, '');
    return `${sign}₹${formatted} Cr`;
  }

  // 1 Lakh = 1,00,000
  if (absAmount >= 100000) {
    const lValue = absAmount / 100000;
    const formatted = lValue % 1 === 0 ? lValue.toFixed(1) : lValue.toFixed(2).replace(/\.?0+$/, '');
    return `${sign}₹${formatted} L`;
  }

  // Under 1 Lakh: Standard Indian numbering system (e.g. ₹85,000)
  return `${sign}₹${absAmount.toLocaleString('en-IN')}`;
}

/**
 * Full Indian numbering system string (e.g. 250000000 -> "₹25,00,00,000")
 */
export function formatIndianCurrencyFull(amount?: number | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '₹0';
  }
  return `₹${amount.toLocaleString('en-IN')}`;
}

/**
 * Format raw numbers with Indian comma separation
 */
export function formatIndianNumber(value?: number | null): string {
  if (value === undefined || value === null || isNaN(value)) {
    return '0';
  }
  return value.toLocaleString('en-IN');
}

/**
 * Human readable label for AreaUnit
 */
export function getAreaUnitLabel(unit: AreaUnit): string {
  const map: Record<AreaUnit, string> = {
    ACRES: 'Acres',
    SQ_YARDS: 'Sq. Yards',
    SQ_FEET: 'Sq. Feet',
    HECTARES: 'Hectares',
    BIGHA: 'Bigha',
    GUNTHA: 'Guntha'
  };
  return map[unit] || unit;
}

/**
 * Human readable label for ZoningCategory
 */
export function getZoningLabel(zoning: ZoningCategory): string {
  const map: Record<ZoningCategory, string> = {
    RESIDENTIAL: 'Residential',
    COMMERCIAL: 'Commercial',
    INDUSTRIAL: 'Industrial',
    AGRICULTURAL: 'Agricultural',
    MIXED_USE: 'Mixed Use'
  };
  return map[zoning] || zoning;
}

/**
 * Human readable label for ProposedDealType
 */
export function getDealTypeLabel(dealType: ProposedDealType): string {
  const map: Record<ProposedDealType, string> = {
    JOINT_DEVELOPMENT: 'Joint Development (JDA)',
    JOINT_VENTURE: 'Joint Venture (JV)',
    OUTRIGHT_SALE: 'Outright Sale',
    LONG_TERM_LEASE: 'Long Term Lease'
  };
  return map[dealType] || dealType;
}

/**
 * Human readable label for OwnershipType
 */
export function getOwnershipLabel(ownership: OwnershipType): string {
  const map: Record<OwnershipType, string> = {
    FREEHOLD: 'Freehold',
    LEASEHOLD: 'Leasehold',
    ANCESTRAL: 'Ancestral',
    POWER_OF_ATTORNEY: 'Power of Attorney (POA)'
  };
  return map[ownership] || ownership;
}

/**
 * Styling and badge details for LandParcelStatus
 */
export function getStatusBadgeDetails(status: LandParcelStatus): {
  label: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  dotClass: string;
} {
  switch (status) {
    case 'VERIFIED':
      return {
        label: 'Verified Parcel',
        bgClass: 'bg-emerald-50',
        textClass: 'text-emerald-700',
        borderClass: 'border-emerald-200',
        dotClass: 'bg-emerald-500'
      };
    case 'PENDING_REVIEW':
      return {
        label: 'Pending Review',
        bgClass: 'bg-amber-50',
        textClass: 'text-amber-800',
        borderClass: 'border-amber-200',
        dotClass: 'bg-amber-500'
      };
    case 'IN_DISCUSSION':
      return {
        label: 'In Discussion',
        bgClass: 'bg-blue-50',
        textClass: 'text-blue-700',
        borderClass: 'border-blue-200',
        dotClass: 'bg-blue-500'
      };
    case 'REJECTED':
      return {
        label: 'Rejected',
        bgClass: 'bg-rose-50',
        textClass: 'text-rose-700',
        borderClass: 'border-rose-200',
        dotClass: 'bg-rose-500'
      };
    default:
      return {
        label: status,
        bgClass: 'bg-slate-100',
        textClass: 'text-slate-700',
        borderClass: 'border-slate-200',
        dotClass: 'bg-slate-400'
      };
  }
}
