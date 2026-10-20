import React from 'react';
import { AdminStats } from '../../types';
import { Building2, Clock, CheckCircle2, XCircle } from 'lucide-react';

interface StatsCardsProps {
  stats: AdminStats;
  selectedFilter: string;
  onFilterSelect: (filter: string) => void;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  stats,
  selectedFilter,
  onFilterSelect
}) => {
  const cards = [
    {
      id: 'ALL',
      title: 'Total Developers',
      count: stats.total,
      label: 'All registered entities',
      icon: <Building2 className="w-5 h-5 text-slate-700" />,
      border: 'hover:border-slate-300',
      activeBorder: 'border-slate-400 bg-slate-50',
      badgeClass: 'text-slate-800 bg-slate-100'
    },
    {
      id: 'PENDING',
      title: 'Pending Review',
      count: stats.pending,
      label: 'Requires compliance review',
      icon: <Clock className="w-5 h-5 text-amber-600" />,
      border: 'hover:border-amber-300',
      activeBorder: 'border-amber-400 bg-amber-50/50',
      badgeClass: 'text-amber-800 bg-amber-100'
    },
    {
      id: 'APPROVED',
      title: 'RERA Approved',
      count: stats.approved,
      label: 'Live verified portals',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
      border: 'hover:border-emerald-300',
      activeBorder: 'border-emerald-400 bg-emerald-50/50',
      badgeClass: 'text-emerald-800 bg-emerald-100'
    },
    {
      id: 'REJECTED',
      title: 'Rejected / Inactive',
      count: stats.rejected,
      label: 'Failed credential checks',
      icon: <XCircle className="w-5 h-5 text-rose-600" />,
      border: 'hover:border-rose-300',
      activeBorder: 'border-rose-400 bg-rose-50/50',
      badgeClass: 'text-rose-800 bg-rose-100'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map(card => {
        const isSelected = selectedFilter === card.id;
        return (
          <div
            key={card.id}
            onClick={() => onFilterSelect(card.id)}
            className={`cursor-pointer rounded-2xl p-5 bg-white border transition-all duration-150 shadow-sm ${
              isSelected ? card.activeBorder : `border-slate-200 ${card.border}`
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {card.title}
              </span>
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                {card.icon}
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 num-tabular tracking-tight">
                {card.count}
              </span>
              <span className="text-xs text-slate-400 font-semibold">records</span>
            </div>

            <div className="mt-2 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
              <span className="truncate">{card.label}</span>
              {isSelected && (
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                  Filtered
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
