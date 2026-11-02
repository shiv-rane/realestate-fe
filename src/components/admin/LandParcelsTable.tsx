import React, { useState } from 'react';
import { LandParcelResponse, LandParcelStatus, ProposedDealType } from '../../types/land';
import {
  formatIndianCurrency,
  getAreaUnitLabel,
  getDealTypeLabel,
  getOwnershipLabel,
  getStatusBadgeDetails,
  getZoningLabel
} from '../../utils/formatters';
import {
  Search,
  Filter,
  MapPin,
  ExternalLink,
  Eye,
  Trash2,
  Layers,
  CheckCircle,
  XCircle,
  MessageSquare,
  Clock,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

interface LandParcelsTableProps {
  parcels: LandParcelResponse[];
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  onViewParcel: (parcel: LandParcelResponse) => void;
  onUpdateStatus: (parcel: LandParcelResponse, newStatus: LandParcelStatus) => void;
  onDeleteParcel: (parcel: LandParcelResponse) => void;
}

export const LandParcelsTable: React.FC<LandParcelsTableProps> = ({
  parcels,
  statusFilter,
  onStatusFilterChange,
  onViewParcel,
  onUpdateStatus,
  onDeleteParcel
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [dealTypeFilter, setDealTypeFilter] = useState<string>('ALL');

  const filtered = parcels.filter(parcel => {
    // Status filter
    if (statusFilter !== 'ALL' && parcel.status !== statusFilter) {
      return false;
    }
    // Deal type filter
    if (dealTypeFilter !== 'ALL' && parcel.dealType !== dealTypeFilter) {
      return false;
    }
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = parcel.title?.toLowerCase().includes(q) || false;
      const matchCity = parcel.city?.toLowerCase().includes(q) || false;
      const matchSector = parcel.sector?.toLowerCase().includes(q) || false;
      const matchSurvey = parcel.plotSurveyNumber?.toLowerCase().includes(q) || false;
      const matchAgency = parcel.agencyName?.toLowerCase().includes(q) || false;
      return matchTitle || matchCity || matchSector || matchSurvey || matchAgency;
    }
    return true;
  });

  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Left: Search & Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 max-w-3xl">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by title, city, sector, survey number, agency..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition-colors"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={statusFilter}
              onChange={e => onStatusFilterChange(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-emerald-600 font-bold"
            >
              <option value="ALL">Status: All Parcels</option>
              <option value="PENDING_REVIEW">Status: PENDING REVIEW</option>
              <option value="VERIFIED">Status: VERIFIED</option>
              <option value="IN_DISCUSSION">Status: IN DISCUSSION</option>
              <option value="REJECTED">Status: REJECTED</option>
            </select>
          </div>

          {/* Deal Type Filter */}
          <div className="flex items-center gap-2">
            <select
              value={dealTypeFilter}
              onChange={e => setDealTypeFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-emerald-600 font-bold"
            >
              <option value="ALL">Deal: All Deal Types</option>
              <option value="JOINT_DEVELOPMENT">Joint Development (JDA)</option>
              <option value="JOINT_VENTURE">Joint Venture (JV)</option>
              <option value="OUTRIGHT_SALE">Outright Sale</option>
              <option value="REDEVELOPMENT">Redevelopment</option>
            </select>
          </div>
        </div>

        {/* Right: Record count */}
        <div className="text-xs font-semibold text-slate-500 self-center sm:self-auto">
          Showing <span className="font-extrabold text-slate-900">{filtered.length}</span> of {parcels.length} Submissions
        </div>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-5">Parcel & Location</th>
              <th className="py-3.5 px-4">Area & Zoning</th>
              <th className="py-3.5 px-4">Deal & Financials</th>
              <th className="py-3.5 px-4">Ownership & Legal</th>
              <th className="py-3.5 px-4 text-center">Status</th>
              <th className="py-3.5 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {filtered.map(parcel => {
              const badge = getStatusBadgeDetails(parcel.status);
              return (
                <tr
                  key={parcel.id}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  {/* Parcel Title & Location */}
                  <td className="py-4 px-5 max-w-[280px]">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0 text-emerald-800 font-bold text-sm">
                        <Layers className="w-4 h-4 text-emerald-700" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors block truncate">
                          {parcel.title}
                        </span>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                          <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span className="truncate">{parcel.sector}, {parcel.city}</span>
                          {parcel.locationUrl && (
                            <a
                              href={parcel.locationUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-emerald-600 hover:text-emerald-800 shrink-0"
                              title="Open in Google Maps"
                            >
                              <ExternalLink className="w-3 h-3 inline" />
                            </a>
                          )}
                        </div>
                        {parcel.plotSurveyNumber && (
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                            {parcel.plotSurveyNumber}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Area & Zoning */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="font-extrabold text-slate-900 text-xs">
                      {parcel.totalArea} {getAreaUnitLabel(parcel.areaUnit)}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {getZoningLabel(parcel.zoning)}
                      </span>
                      {parcel.roadWidthFeet && (
                        <span className="text-[10px] text-slate-500 font-medium">
                          • {parcel.roadWidthFeet} ft rd
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Deal & Financials */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="font-semibold text-slate-800 text-xs">
                      {parcel.expectedPrice ? formatIndianCurrency(parcel.expectedPrice) : 'Price on Request'}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {getDealTypeLabel(parcel.dealType)}
                    </div>
                    {parcel.expectedRevenueSharePercentage ? (
                      <span className="text-[10px] text-emerald-700 font-bold">
                        {parcel.expectedRevenueSharePercentage}% Rev Share
                      </span>
                    ) : null}
                  </td>

                  {/* Ownership & Legal */}
                  <td className="py-4 px-4">
                    <div className="text-xs font-semibold text-slate-800">
                      {getOwnershipLabel(parcel.ownershipType)}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {parcel.hasClearTitle ? (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-700">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          <span>Clear Title</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-amber-700">
                          <AlertCircle className="w-3 h-3 text-amber-600" />
                          <span>Check Title</span>
                        </span>
                      )}
                      {parcel.agencyName && (
                        <span className="text-[10px] text-slate-400 truncate max-w-[100px]" title={parcel.agencyName}>
                          via {parcel.agencyName}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-4 px-4 text-center whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${badge.bgClass} ${badge.textClass} ${badge.borderClass}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${badge.dotClass}`} />
                      <span>{badge.label}</span>
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* View Details */}
                      <button
                        onClick={() => onViewParcel(parcel)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 transition-colors"
                        title="View Full Parcel Dossier"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {/* Quick Verify */}
                      {parcel.status !== 'VERIFIED' && (
                        <button
                          onClick={() => onUpdateStatus(parcel, 'VERIFIED')}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-emerald-100 text-emerald-700 border border-slate-200 hover:border-emerald-300 transition-colors"
                          title="Mark Verified"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Quick Mark in Discussion */}
                      {parcel.status !== 'IN_DISCUSSION' && (
                        <button
                          onClick={() => onUpdateStatus(parcel, 'IN_DISCUSSION')}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-100 text-blue-700 border border-slate-200 hover:border-blue-300 transition-colors"
                          title="Mark In Discussion"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Quick Reject */}
                      {parcel.status !== 'REJECTED' && (
                        <button
                          onClick={() => onUpdateStatus(parcel, 'REJECTED')}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 text-rose-700 border border-slate-200 hover:border-rose-300 transition-colors"
                          title="Mark Rejected"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Delete */}
                      <button
                        onClick={() => onDeleteParcel(parcel)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-700 border border-slate-200 hover:border-rose-300 transition-colors"
                        title="Delete Parcel Submission"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="p-12 text-center">
          <Layers className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 mb-1">No Land Submissions Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            No land parcels match your selected filters or search terms.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setDealTypeFilter('ALL');
              onStatusFilterChange('ALL');
            }}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 border border-slate-200"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};
