import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Trash2,
  Edit3,
  MapPin,
  ExternalLink,
  Shield,
  Clock,
  CheckCircle,
  AlertTriangle,
  MessageSquare,
  Search,
  Filter,
  User,
  Building2,
  Calendar,
  Layers,
  Sparkles,
  RefreshCw,
  Eye,
  Info
} from 'lucide-react';
import { LandParcelResponse, LandParcelStatus } from '../../types/land';
import { landApi } from '../../services/landApi';
import { authService } from '../../services/auth';
import {
  formatIndianCurrency,
  formatIndianCurrencyFull,
  getAreaUnitLabel,
  getDealTypeLabel,
  getOwnershipLabel,
  getStatusBadgeDetails,
  getZoningLabel
} from '../../utils/formatters';
import { useToast } from '../common/Toast';

interface MyLandsDashboardProps {
  onNavigateToSubmit: () => void;
  onEditParcel: (id: string) => void;
}

export const MyLandsDashboard: React.FC<MyLandsDashboardProps> = ({
  onNavigateToSubmit,
  onEditParcel
}) => {
  const { showToast } = useToast();
  const session = authService.getSession();

  const [parcels, setParcels] = useState<LandParcelResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Delete modal state
  const [parcelToDelete, setParcelToDelete] = useState<LandParcelResponse | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // View details modal
  const [selectedParcel, setSelectedParcel] = useState<LandParcelResponse | null>(null);

  const fetchParcels = async () => {
    setLoading(true);
    try {
      const data = await landApi.getMyLands();
      setParcels(data);
    } catch (err: any) {
      showToast('error', 'Failed to load parcels', err.message || 'Unable to load your land parcels.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParcels();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!parcelToDelete) return;
    setIsDeleting(true);
    try {
      await landApi.deleteLand(parcelToDelete.id);
      showToast('success', 'Parcel Deleted', `Land parcel "${parcelToDelete.title}" has been removed.`);
      setParcels(prev => prev.filter(p => p.id !== parcelToDelete.id));
      setParcelToDelete(null);
    } catch (err: any) {
      showToast('error', 'Delete Failed', err.message || 'Could not delete parcel.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered parcels
  const filteredParcels = useMemo(() => {
    return parcels.filter(p => {
      const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
      const term = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !term ||
        p.title.toLowerCase().includes(term) ||
        p.city.toLowerCase().includes(term) ||
        p.sector.toLowerCase().includes(term) ||
        p.pincode?.includes(term) ||
        p.zoning.toLowerCase().includes(term);

      return matchesStatus && matchesSearch;
    });
  }, [parcels, statusFilter, searchQuery]);

  // Status counts
  const counts = useMemo(() => {
    return {
      all: parcels.length,
      verified: parcels.filter(p => p.status === 'VERIFIED').length,
      pending: parcels.filter(p => p.status === 'PENDING_REVIEW').length,
      inDiscussion: parcels.filter(p => p.status === 'IN_DISCUSSION').length,
      rejected: parcels.filter(p => p.status === 'REJECTED').length
    };
  }, [parcels]);

  const renderStatusBadge = (status: LandParcelStatus) => {
    const badge = getStatusBadgeDetails(status);
    let Icon = Clock;
    if (status === 'VERIFIED') Icon = CheckCircle;
    if (status === 'IN_DISCUSSION') Icon = MessageSquare;
    if (status === 'REJECTED') Icon = AlertTriangle;

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${badge.bgClass} ${badge.textClass} ${badge.borderClass}`}
      >
        <Icon className="w-3.5 h-3.5" />
        <span>{badge.label}</span>
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* User Profile Summary Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-slate-900/10 mb-8 border border-slate-700/60 relative overflow-hidden">
        {/* Decorative blur rings */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 shrink-0">
              {session?.role === 'AGENT' ? <Building2 className="w-7 h-7" /> : <User className="w-7 h-7" />}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  {session?.name || 'Authorized Partner'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {session?.role === 'AGENT' ? 'Real Estate Agent (AGENT)' : 'Landowner (OWNER)'}
                </span>
              </div>
              <p className="text-xs text-slate-300 flex flex-wrap items-center gap-3">
                <span>{session?.email || 'Authenticated User'}</span>
                {session?.userId && (
                  <>
                    <span className="text-slate-600">•</span>
                    <span className="font-mono text-slate-400 text-[11px]">ID: {session.userId.slice(0, 8)}...</span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Action: Submit Another Land */}
          <div className="flex items-center gap-3">
            <button
              onClick={fetchParcels}
              disabled={loading}
              className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition-all cursor-pointer"
              title="Refresh submissions"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onNavigateToSubmit}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold tracking-wide shadow-lg shadow-emerald-900/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Submit Another Land</span>
            </button>
          </div>
        </div>

        {/* Stats Pill Row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-6 border-t border-slate-700/80">
          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Total Parcels</span>
            <span className="text-lg font-black text-white">{counts.all}</span>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
            <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-wider">Pending Review</span>
            <span className="text-lg font-black text-amber-400">{counts.pending}</span>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
            <span className="text-[10px] uppercase font-bold text-emerald-400 block tracking-wider">Verified</span>
            <span className="text-lg font-black text-emerald-400">{counts.verified}</span>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
            <span className="text-[10px] uppercase font-bold text-blue-400 block tracking-wider">In Discussion</span>
            <span className="text-lg font-black text-blue-400">{counts.inDiscussion}</span>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
            <span className="text-[10px] uppercase font-bold text-rose-400 block tracking-wider">Rejected</span>
            <span className="text-lg font-black text-rose-400">{counts.rejected}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by title, city, sector, or zoning..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 shadow-2xs font-medium"
          />
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'ALL', label: 'All' },
            { id: 'PENDING_REVIEW', label: 'Pending' },
            { id: 'VERIFIED', label: 'Verified' },
            { id: 'IN_DISCUSSION', label: 'In Discussion' },
            { id: 'REJECTED', label: 'Rejected' }
          ].map(filter => (
            <button
              key={filter.id}
              onClick={() => setStatusFilter(filter.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === filter.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs animate-pulse space-y-4">
              <div className="h-4 bg-slate-200 rounded w-3/4" />
              <div className="h-3 bg-slate-100 rounded w-1/2" />
              <div className="h-20 bg-slate-100 rounded-2xl" />
              <div className="h-8 bg-slate-200 rounded-xl" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredParcels.length === 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-xs">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-100">
            <Layers className="w-8 h-8" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900 mb-1">
            {parcels.length === 0 ? 'No Land Parcels Submitted Yet' : 'No Parcels Match Your Filters'}
          </h3>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            {parcels.length === 0
              ? 'Submit your land details to connect directly with accredited Tier-1 builders for Joint Development (JDA) or Outright Sale.'
              : 'Try clearing your search query or switching your status filter.'}
          </p>
          {parcels.length === 0 ? (
            <button
              onClick={onNavigateToSubmit}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-900/10 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Submit Your First Land</span>
            </button>
          ) : (
            <button
              onClick={() => { setSearchQuery(''); setStatusFilter('ALL'); }}
              className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      )}

      {/* Grid of Cards */}
      {!loading && filteredParcels.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredParcels.map(parcel => {
            const proposalText =
              parcel.dealType === 'JOINT_DEVELOPMENT' || parcel.dealType === 'JOINT_VENTURE'
                ? `${parcel.dealType.replace('_', ' ')} (${parcel.expectedRevenueSharePercentage || 45}% share)`
                : formatIndianCurrency(parcel.expectedPrice);

            return (
              <div
                key={parcel.id}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
              >
                {/* Card Top */}
                <div className="p-6">
                  {/* Status & ID Badge */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    {renderStatusBadge(parcel.status)}
                    <span className="text-[10px] font-mono text-slate-400">
                      #{parcel.id.slice(0, 8)}
                    </span>
                  </div>

                  {/* Title & Location Badge */}
                  <h3 className="text-base font-extrabold text-slate-900 leading-snug mb-2 group-hover:text-emerald-700 transition-colors">
                    {parcel.title}
                  </h3>

                  <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold mb-4">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{parcel.sector}, {parcel.city}</span>
                    {parcel.state && <span className="text-slate-400">({parcel.state})</span>}
                  </div>

                  {/* Area & Zoning Pill */}
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 mb-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Area & Zoning:</span>
                      <span className="font-extrabold text-slate-900">
                        {parcel.totalArea} {getAreaUnitLabel(parcel.areaUnit)} | {getZoningLabel(parcel.zoning)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Proposal Structure:</span>
                      <span className="font-extrabold text-emerald-700">
                        {proposalText}
                      </span>
                    </div>

                    {parcel.roadWidthFeet ? (
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                        <span>Road Frontage:</span>
                        <span className="font-mono font-semibold text-slate-700">{parcel.roadWidthFeet} Ft</span>
                      </div>
                    ) : null}
                  </div>

                  {/* Admin Notes Alert Box (If rejected or remark provided) */}
                  {parcel.adminNotes && (
                    <div className={`p-3 rounded-2xl mb-4 text-xs border ${
                      parcel.status === 'REJECTED'
                        ? 'bg-rose-50 border-rose-200 text-rose-800'
                        : 'bg-amber-50 border-amber-200 text-amber-800'
                    }`}>
                      <div className="flex items-center gap-1.5 font-bold mb-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Institutional Review Notes:</span>
                      </div>
                      <p className="text-[11px] leading-relaxed">{parcel.adminNotes}</p>
                    </div>
                  )}

                  {/* Description Snippet */}
                  {parcel.description && (
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
                      {parcel.description}
                    </p>
                  )}
                </div>

                {/* Card Actions Footer */}
                <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedParcel(parcel)}
                    className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Specs</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEditParcel(parcel.id)}
                      className="p-2 rounded-xl text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 border border-slate-200 transition-all cursor-pointer"
                      title="Edit land parcel"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setParcelToDelete(parcel)}
                      className="p-2 rounded-xl text-slate-600 hover:text-rose-700 hover:bg-rose-50 border border-slate-200 transition-all cursor-pointer"
                      title="Delete land parcel"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Popup */}
      {parcelToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3 border border-rose-100">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-base font-extrabold text-slate-900 mb-1">
              Confirm Parcel Deletion
            </h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-slate-800">"{parcelToDelete.title}"</span>? This action cannot be undone.
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setParcelToDelete(null)}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-900/10 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Parcel Details Modal */}
      {selectedParcel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 mb-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {renderStatusBadge(selectedParcel.status)}
                  <span className="text-xs text-slate-400 font-mono">ID: {selectedParcel.id}</span>
                </div>
                <h3 className="text-lg font-black text-slate-900">{selectedParcel.title}</h3>
                <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{selectedParcel.sector}, {selectedParcel.city}, {selectedParcel.state} - {selectedParcel.pincode}</span>
                </p>
              </div>

              <button
                onClick={() => setSelectedParcel(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Spec Table */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs mb-6">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="font-bold text-slate-900 border-b border-slate-200/60 pb-1.5">Dimensions & Zoning</div>
                <div className="flex justify-between"><span className="text-slate-500">Total Area:</span> <span className="font-bold">{selectedParcel.totalArea} {getAreaUnitLabel(selectedParcel.areaUnit)}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Road Frontage:</span> <span className="font-bold">{selectedParcel.roadWidthFeet || 'N/A'} Ft</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Zoning:</span> <span className="font-bold">{getZoningLabel(selectedParcel.zoning)}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Plot Facing:</span> <span className="font-bold">{selectedParcel.plotFacing || 'N/A'}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Survey/Khasra:</span> <span className="font-bold font-mono">{selectedParcel.plotSurveyNumber || 'N/A'}</span></div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="font-bold text-slate-900 border-b border-slate-200/60 pb-1.5">Commercials & Deal</div>
                <div className="flex justify-between"><span className="text-slate-500">Deal Structure:</span> <span className="font-bold text-emerald-700">{getDealTypeLabel(selectedParcel.dealType)}</span></div>
                {selectedParcel.expectedRevenueSharePercentage ? (
                  <div className="flex justify-between"><span className="text-slate-500">Revenue Share:</span> <span className="font-bold text-emerald-700">{selectedParcel.expectedRevenueSharePercentage}%</span></div>
                ) : null}
                <div className="flex justify-between"><span className="text-slate-500">Expected Total:</span> <span className="font-bold font-mono">{formatIndianCurrency(selectedParcel.expectedPrice)}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Unit Rate:</span> <span className="font-mono">{formatIndianCurrency(selectedParcel.pricePerUnit)} / {getAreaUnitLabel(selectedParcel.areaUnit)}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Negotiable:</span> <span className="font-semibold">{selectedParcel.isPriceNegotiable ? 'Yes' : 'Firm'}</span></div>
              </div>
            </div>

            {/* Legal Status */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs mb-6">
              <div className="font-bold text-slate-900 border-b border-slate-200/60 pb-1.5 mb-2">Legal & Ownership Assurances</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <span className="text-slate-500 block text-[11px]">Ownership:</span>
                  <span className="font-semibold">{getOwnershipLabel(selectedParcel.ownershipType)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Title Assurance:</span>
                  <span className="font-semibold text-emerald-700">{selectedParcel.hasClearTitle ? '✓ Clear Title' : 'Pending Verification'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Litigation Status:</span>
                  <span className="font-semibold text-emerald-700">{selectedParcel.isLitigationFree ? '✓ 100% Free' : 'Under Review'}</span>
                </div>
              </div>
            </div>

            {/* Channel Partner Representation */}
            {selectedParcel.agencyName && (
              <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200 text-xs mb-6">
                <span className="text-amber-900 font-bold block mb-1">Channel Partner Representation</span>
                <p className="text-slate-700">
                  Agency: <span className="font-bold">{selectedParcel.agencyName}</span> | Brokerage: <span className="font-bold font-mono">{selectedParcel.brokeragePercentage}%</span>
                </p>
              </div>
            )}

            {/* Description & Links */}
            {selectedParcel.description && (
              <div className="mb-6">
                <span className="text-xs font-bold text-slate-800 block mb-1">Highlights & Remarks:</span>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {selectedParcel.description}
                </p>
              </div>
            )}

            {selectedParcel.locationUrl && (
              <a
                href={selectedParcel.locationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 mb-4"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Google Maps Pin</span>
              </a>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => {
                  const id = selectedParcel.id;
                  setSelectedParcel(null);
                  onEditParcel(id);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit This Parcel</span>
              </button>
              <button
                onClick={() => setSelectedParcel(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
