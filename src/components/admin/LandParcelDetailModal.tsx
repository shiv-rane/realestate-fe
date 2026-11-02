import React, { useState } from 'react';
import { LandParcelResponse, LandParcelStatus } from '../../types/land';
import {
  formatIndianCurrency,
  formatIndianCurrencyFull,
  getAreaUnitLabel,
  getDealTypeLabel,
  getOwnershipLabel,
  getStatusBadgeDetails,
  getZoningLabel
} from '../../utils/formatters';
import {
  X,
  MapPin,
  ExternalLink,
  Shield,
  ShieldCheck,
  AlertCircle,
  FileText,
  Building,
  CheckCircle,
  XCircle,
  MessageSquare,
  Clock,
  Layers
} from 'lucide-react';

interface LandParcelDetailModalProps {
  parcel: LandParcelResponse | null;
  onClose: () => void;
  onUpdateStatusAndNotes: (id: string, status: LandParcelStatus, notes: string) => Promise<void>;
}

export const LandParcelDetailModal: React.FC<LandParcelDetailModalProps> = ({
  parcel,
  onClose,
  onUpdateStatusAndNotes
}) => {
  if (!parcel) return null;

  const [notes, setNotes] = useState(parcel.adminNotes || '');
  const [selectedStatus, setSelectedStatus] = useState<LandParcelStatus>(parcel.status);
  const [saving, setSaving] = useState(false);

  const badge = getStatusBadgeDetails(selectedStatus);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdateStatusAndNotes(parcel.id, selectedStatus, notes);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 text-emerald-800 flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badge.bgClass} ${badge.textClass} ${badge.borderClass}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${badge.dotClass}`} />
                  <span>{badge.label}</span>
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  ID: {parcel.id.slice(0, 12)}...
                </span>
              </div>
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight mt-1">
                {parcel.title}
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{parcel.sector}, {parcel.city}, {parcel.state} - {parcel.pincode}</span>
                {parcel.locationUrl && (
                  <a
                    href={parcel.locationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-600 hover:text-emerald-800 flex items-center gap-0.5 font-semibold text-xs ml-1"
                  >
                    <span>View Map</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Key Metric Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Total Area</span>
              <span className="text-sm font-extrabold text-slate-900">
                {parcel.totalArea} {getAreaUnitLabel(parcel.areaUnit)}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Zoning</span>
              <span className="text-sm font-extrabold text-emerald-700">
                {getZoningLabel(parcel.zoning)}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Proposed Deal</span>
              <span className="text-sm font-extrabold text-slate-900">
                {getDealTypeLabel(parcel.dealType)}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Expected Price</span>
              <span className="text-sm font-extrabold text-slate-900">
                {parcel.expectedPrice ? formatIndianCurrency(parcel.expectedPrice) : 'Negotiable'}
              </span>
            </div>
          </div>

          {/* Technical and Financial Specifications */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Dimensions & Location Specs */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
              <div className="font-bold text-slate-900 border-b border-slate-100 pb-1.5 flex items-center justify-between">
                <span>Land Specs & Demarcation</span>
                <span className="text-[10px] text-slate-400">Technical</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Plot / Survey No:</span>
                <span className="font-semibold text-slate-900">{parcel.plotSurveyNumber || 'Not Specified'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Road Width:</span>
                <span className="font-semibold text-slate-900">{parcel.roadWidthFeet ? `${parcel.roadWidthFeet} Feet` : 'Not Specified'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Plot Facing:</span>
                <span className="font-semibold text-slate-900">{parcel.plotFacing || 'Standard'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Prominent Landmark:</span>
                <span className="font-semibold text-slate-900">{parcel.landmark || 'None'}</span>
              </div>
            </div>

            {/* Legal & Ownership */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
              <div className="font-bold text-slate-900 border-b border-slate-100 pb-1.5 flex items-center justify-between">
                <span>Legal & Ownership Assurances</span>
                <span className="text-[10px] text-slate-400">Compliance</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Title Classification:</span>
                <span className="font-semibold text-slate-900">{getOwnershipLabel(parcel.ownershipType)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Clear Title Status:</span>
                <span className={`font-semibold ${parcel.hasClearTitle ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {parcel.hasClearTitle ? 'Verified Clear Title' : 'Pending Encumbrance Check'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Litigation Free:</span>
                <span className={`font-semibold ${parcel.isLitigationFree ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {parcel.isLitigationFree ? 'Free of Litigation' : 'Litigation Disclosed'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Agency / Channel Broker:</span>
                <span className="font-semibold text-slate-900">
                  {parcel.agencyName ? `${parcel.agencyName} (${parcel.brokeragePercentage || 0}%)` : 'Direct Owner Submission'}
                </span>
              </div>
            </div>
          </div>

          {/* Commercial Details */}
          {(parcel.dealType === 'JOINT_DEVELOPMENT' || parcel.dealType === 'JOINT_VENTURE') && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold block">{parcel.dealType.replace('_', ' ')} Mandate</span>
                  <span className="text-[11px] text-emerald-700">Landowner contributes land; Builder executes with revenue / area share.</span>
                </div>
                <div className="text-right">
                  <span className="text-xs uppercase font-bold text-emerald-700 block">Revenue Share</span>
                  <span className="text-lg font-extrabold text-emerald-900">{parcel.expectedRevenueSharePercentage || 0}%</span>
                </div>
              </div>
              {parcel.expectedSecurityDeposit ? (
                <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between text-xs">
                  <span className="text-emerald-800 font-semibold">Expected Security Deposit:</span>
                  <span className="font-bold font-mono text-emerald-950">{formatIndianCurrency(parcel.expectedSecurityDeposit)} ({formatIndianCurrencyFull(parcel.expectedSecurityDeposit)})</span>
                </div>
              ) : null}
            </div>
          )}

          {parcel.dealType === 'REDEVELOPMENT' && (
            <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 space-y-2">
              <div className="font-bold">Redevelopment Relocation Terms</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                <div>
                  <span className="text-indigo-700 block text-[11px]">Expected Rent (Monthly):</span>
                  <span className="font-bold font-mono text-indigo-950">
                    {parcel.expectedRent ? `${formatIndianCurrency(parcel.expectedRent)} / mo` : 'Not specified'}
                  </span>
                </div>
                <div>
                  <span className="text-indigo-700 block text-[11px]">Shifting / Accommodation:</span>
                  <span className="font-bold font-mono text-indigo-950">
                    {parcel.shiftingCharges ? formatIndianCurrency(parcel.shiftingCharges) : 'Not specified'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          {parcel.description && (
            <div>
              <span className="text-[11px] uppercase font-bold text-slate-500 block mb-1">
                Land Parcel Description & Owner Mandate
              </span>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 leading-relaxed">
                {parcel.description}
              </div>
            </div>
          )}

          {/* Admin Reviewer Action & Notes */}
          <div className="p-4 rounded-xl bg-slate-900 text-white space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Admin Regulatory Review
              </span>
              <span className="text-[11px] text-slate-400">
                Created: {parcel.createdAt ? new Date(parcel.createdAt).toLocaleDateString() : 'Recent'}
              </span>
            </div>

            {/* Status Selector */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-2">
                Set Verification Status
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['PENDING_REVIEW', 'VERIFIED', 'IN_DISCUSSION', 'REJECTED'] as LandParcelStatus[]).map(status => {
                  const b = getStatusBadgeDetails(status);
                  const isSelected = selectedStatus === status;
                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setSelectedStatus(status)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? 'bg-white text-slate-900 shadow-md ring-2 ring-emerald-400'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${b.dotClass}`} />
                      <span>{b.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Reviewer Notes */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                Official Reviewer Notes / Regulatory Clearance Remarks
              </label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Enter title inspection details, zoning validation notes, or rejection rationale..."
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            {saving ? 'Updating...' : 'Save Status & Notes'}
          </button>
        </div>
      </div>
    </div>
  );
};
