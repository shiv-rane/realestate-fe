import React from 'react';
import { Layers, Clock, ShieldCheck, MessageSquare, XCircle } from 'lucide-react';
import { LandParcelResponse } from '../../types/land';

interface LandStatsCardsProps {
  parcels: LandParcelResponse[];
  selectedFilter: string;
  onFilterSelect: (filter: string) => void;
}

export const LandStatsCards: React.FC<LandStatsCardsProps> = ({
  parcels,
  selectedFilter,
  onFilterSelect
}) => {
  const total = parcels.length;
  const pending = parcels.filter(p => p.status === 'PENDING_REVIEW').length;
  const verified = parcels.filter(p => p.status === 'VERIFIED').length;
  const inDiscussion = parcels.filter(p => p.status === 'IN_DISCUSSION').length;
  const rejected = parcels.filter(p => p.status === 'REJECTED').length;

  const cards = [
    {
      id: 'ALL',
      title: 'Total Parcels',
      count: total,
      desc: 'All registered land parcels',
      icon: Layers,
      color: 'slate',
      bgGlow: 'from-slate-500/10 to-transparent',
      borderColor: selectedFilter === 'ALL' ? 'border-slate-800 ring-2 ring-slate-800/10' : 'border-slate-200'
    },
    {
      id: 'PENDING_REVIEW',
      title: 'Pending Review',
      count: pending,
      desc: 'Awaiting regulatory clearance',
      icon: Clock,
      color: 'amber',
      bgGlow: 'from-amber-500/10 to-transparent',
      borderColor: selectedFilter === 'PENDING_REVIEW' ? 'border-amber-600 ring-2 ring-amber-600/10' : 'border-slate-200'
    },
    {
      id: 'VERIFIED',
      title: 'Verified Parcels',
      count: verified,
      desc: 'Title & RERA verified',
      icon: ShieldCheck,
      color: 'emerald',
      bgGlow: 'from-emerald-500/10 to-transparent',
      borderColor: selectedFilter === 'VERIFIED' ? 'border-emerald-600 ring-2 ring-emerald-600/10' : 'border-slate-200'
    },
    {
      id: 'IN_DISCUSSION',
      title: 'In Discussion',
      count: inDiscussion,
      desc: 'Active developer talks',
      icon: MessageSquare,
      color: 'blue',
      bgGlow: 'from-blue-500/10 to-transparent',
      borderColor: selectedFilter === 'IN_DISCUSSION' ? 'border-blue-600 ring-2 ring-blue-600/10' : 'border-slate-200'
    },
    {
      id: 'REJECTED',
      title: 'Rejected',
      count: rejected,
      desc: 'Legal or title impediments',
      icon: XCircle,
      color: 'rose',
      bgGlow: 'from-rose-500/10 to-transparent',
      borderColor: selectedFilter === 'REJECTED' ? 'border-rose-600 ring-2 ring-rose-600/10' : 'border-slate-200'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 mb-8">
      {cards.map(card => {
        const Icon = card.icon;
        const isSelected = selectedFilter === card.id;

        return (
          <div
            key={card.id}
            onClick={() => onFilterSelect(card.id)}
            className={`p-4 rounded-2xl bg-white border ${card.borderColor} shadow-xs hover:shadow-md transition-all cursor-pointer relative overflow-hidden group`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${card.bgGlow} opacity-60 pointer-events-none`} />

            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 tracking-wide uppercase">
                {card.title}
              </span>
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                  card.color === 'emerald'
                    ? 'bg-emerald-50 text-emerald-600'
                    : card.color === 'amber'
                    ? 'bg-amber-50 text-amber-600'
                    : card.color === 'blue'
                    ? 'bg-blue-50 text-blue-600'
                    : card.color === 'rose'
                    ? 'bg-rose-50 text-rose-600'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="text-2xl font-black text-slate-900 tracking-tight num-tabular">
              {card.count}
            </div>

            <div className="text-[11px] text-slate-500 mt-0.5 truncate">
              {card.desc}
            </div>

            {isSelected && (
              <div className="mt-2 text-[10px] font-extrabold text-emerald-700 uppercase tracking-widest flex items-center gap-1">
                <span>Active Filter</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
