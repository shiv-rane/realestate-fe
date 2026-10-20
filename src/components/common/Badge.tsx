import React from 'react';
import { ProjectStatus, ProjectType, VerificationStatus, CoreExpertise } from '../../types';
import { ShieldCheck, Clock, CheckCircle2, XCircle, Home, Building2, Layers, MapPin } from 'lucide-react';

interface BadgeProps {
  children?: React.ReactNode;
  className?: string;
  variant?: 'emerald' | 'blue' | 'amber' | 'rose' | 'slate' | 'gold';
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ children, className = '', variant = 'slate', icon }) => {
  const variantStyles = {
    emerald: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    blue: 'bg-blue-50 text-blue-800 border-blue-200',
    amber: 'bg-amber-50 text-amber-800 border-amber-200',
    rose: 'bg-rose-50 text-rose-800 border-rose-200',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
    gold: 'bg-amber-50 text-amber-900 border-amber-300'
  }[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${variantStyles} ${className}`}
    >
      {icon}
      {children}
    </span>
  );
};

export const VerificationBadge: React.FC<{ status: VerificationStatus; reraNumber?: string }> = ({
  status,
  reraNumber
}) => {
  if (status === 'APPROVED') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-sm">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>RERA VERIFIED</span>
        {reraNumber && (
          <span className="text-[11px] font-mono text-emerald-900 pl-1 border-l border-emerald-300">
            {reraNumber}
          </span>
        )}
      </span>
    );
  }

  if (status === 'PENDING') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-50 text-amber-800 border border-amber-300">
        <Clock className="w-3.5 h-3.5 text-amber-600" />
        <span>UNDER REVIEW</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-50 text-rose-800 border border-rose-300">
      <XCircle className="w-3.5 h-3.5 text-rose-600" />
      <span>REJECTED</span>
    </span>
  );
};

export const ProjectStatusBadge: React.FC<{ status: ProjectStatus }> = ({ status }) => {
  switch (status) {
    case 'DELIVERED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>DELIVERED</span>
        </span>
      );
    case 'ONGOING':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full bg-blue-50 text-blue-800 border border-blue-300">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
          <span>ONGOING</span>
        </span>
      );
    case 'UPCOMING':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full bg-amber-50 text-amber-800 border border-amber-300">
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          <span>UPCOMING</span>
        </span>
      );
    default:
      return null;
  }
};

export const ProjectTypeBadge: React.FC<{ type: ProjectType }> = ({ type }) => {
  const config = {
    RESIDENTIAL: { label: 'Residential', icon: <Home className="w-3 h-3 text-slate-600" /> },
    COMMERCIAL: { label: 'Commercial', icon: <Building2 className="w-3 h-3 text-slate-600" /> },
    MIXED_USE: { label: 'Mixed-Use', icon: <Layers className="w-3 h-3 text-slate-600" /> },
    PLOTTED: { label: 'Plotted Estates', icon: <MapPin className="w-3 h-3 text-slate-600" /> }
  }[type] || { label: type, icon: null };

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-md bg-slate-100 text-slate-800 border border-slate-200">
      {config.icon}
      <span>{config.label}</span>
    </span>
  );
};

export const ExpertiseBadge: React.FC<{ expertise: CoreExpertise }> = ({ expertise }) => {
  return (
    <span className="inline-flex items-center px-2 py-0.5 text-[11px] font-bold tracking-wider rounded bg-slate-100 text-slate-800 border border-slate-300">
      {expertise}
    </span>
  );
};
