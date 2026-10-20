import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Compass,
  FileText,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  Building,
  Briefcase,
  HelpCircle,
  Percent,
  Layers,
  Sparkles,
  Save
} from 'lucide-react';
import {
  AreaUnit,
  LandParcelPayload,
  LandParcelResponse,
  OwnershipType,
  ProposedDealType,
  ZoningCategory
} from '../../types/land';
import { landApi } from '../../services/landApi';
import { authService } from '../../services/auth';
import { formatIndianCurrency, formatIndianCurrencyFull, getAreaUnitLabel } from '../../utils/formatters';
import { useToast } from '../common/Toast';

interface LandSubmitFormProps {
  editParcelId?: string | null;
  onSuccess: (parcel: LandParcelResponse) => void;
  onCancel: () => void;
}

const TOP_CITIES = ['Gurgaon', 'Noida', 'Bengaluru', 'Mumbai', 'Pune', 'Hyderabad', 'Delhi NCR', 'Chennai', 'Ahmedabad', 'Kolkata'];
const STATES = ['Haryana', 'Uttar Pradesh', 'Karnataka', 'Maharashtra', 'Telangana', 'Delhi', 'Tamil Nadu', 'Gujarat', 'West Bengal', 'Rajasthan'];
const PLOT_FACINGS = [
  'North',
  'East',
  'North-East Corner',
  'North-West Corner',
  'South-East Corner',
  'South-West Corner',
  '2-Side Open',
  '3-Side Open',
  '4-Side Open / Island Plot'
];

export const LandSubmitForm: React.FC<LandSubmitFormProps> = ({
  editParcelId,
  onSuccess,
  onCancel
}) => {
  const { showToast } = useToast();
  const session = authService.getSession();
  const isAgent = session?.role === 'AGENT';

  // Active Wizard Step: 1 = Location, 2 = Dimensions & Zoning, 3 = Proposal & Commercials, 4 = Legal & Broker
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [viewMode, setViewMode] = useState<'wizard' | 'all'>('wizard');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingInitial, setIsFetchingInitial] = useState(false);

  // Confirmation Modal
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submittedParcel, setSubmittedParcel] = useState<LandParcelResponse | null>(null);

  // Form State
  const [formData, setFormData] = useState<LandParcelPayload>({
    title: '',
    city: 'Gurgaon',
    sector: '',
    state: 'Haryana',
    pincode: '',
    plotSurveyNumber: '',
    landmark: '',
    locationUrl: '',
    totalArea: 3.5,
    areaUnit: 'ACRES',
    roadWidthFeet: 60,
    plotFacing: 'North-East Corner',
    zoning: 'RESIDENTIAL',
    dealType: 'JOINT_DEVELOPMENT',
    expectedPrice: 250000000,
    pricePerUnit: 71428571,
    isPriceNegotiable: true,
    expectedRevenueSharePercentage: 45,
    ownershipType: 'FREEHOLD',
    hasClearTitle: true,
    isLitigationFree: true,
    agencyName: isAgent ? 'Apex Realty Advisors' : '',
    brokeragePercentage: isAgent ? 1.5 : 0,
    description: ''
  });

  // Load existing parcel details if in edit mode
  useEffect(() => {
    if (editParcelId) {
      setIsFetchingInitial(true);
      landApi.getLandById(editParcelId)
        .then(data => {
          setFormData({
            title: data.title || '',
            city: data.city || 'Gurgaon',
            sector: data.sector || '',
            state: data.state || 'Haryana',
            pincode: data.pincode || '',
            plotSurveyNumber: data.plotSurveyNumber || '',
            landmark: data.landmark || '',
            locationUrl: data.locationUrl || '',
            totalArea: data.totalArea || 0,
            areaUnit: data.areaUnit || 'ACRES',
            roadWidthFeet: data.roadWidthFeet || 0,
            plotFacing: data.plotFacing || 'North',
            zoning: data.zoning || 'RESIDENTIAL',
            dealType: data.dealType || 'JOINT_DEVELOPMENT',
            expectedPrice: data.expectedPrice || 0,
            pricePerUnit: data.pricePerUnit || 0,
            isPriceNegotiable: data.isPriceNegotiable ?? true,
            expectedRevenueSharePercentage: data.expectedRevenueSharePercentage || 45,
            ownershipType: data.ownershipType || 'FREEHOLD',
            hasClearTitle: data.hasClearTitle ?? true,
            isLitigationFree: data.isLitigationFree ?? true,
            agencyName: data.agencyName || (isAgent ? 'Apex Realty Advisors' : ''),
            brokeragePercentage: data.brokeragePercentage || (isAgent ? 1.5 : 0),
            description: data.description || ''
          });
        })
        .catch(err => {
          showToast('error', 'Failed to load land details', err.message);
        })
        .finally(() => {
          setIsFetchingInitial(false);
        });
    }
  }, [editParcelId, isAgent, showToast]);

  // Recalculate pricePerUnit dynamically when price or area changes
  const handlePriceChange = (value: number) => {
    const area = formData.totalArea > 0 ? formData.totalArea : 1;
    const unitPrice = Math.round(value / area);
    setFormData(prev => ({
      ...prev,
      expectedPrice: value,
      pricePerUnit: unitPrice
    }));
  };

  const handleAreaChange = (area: number) => {
    const validArea = area > 0 ? area : 1;
    const price = formData.expectedPrice || 0;
    const unitPrice = Math.round(price / validArea);
    setFormData(prev => ({
      ...prev,
      totalArea: area,
      pricePerUnit: unitPrice
    }));
  };

  // Sample data filler for quick testing/demo
  const fillSampleData = () => {
    setFormData({
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
      agencyName: isAgent ? 'Apex Realty Advisors' : '',
      brokeragePercentage: isAgent ? 1.5 : 0,
      description: 'Clear title parcel suitable for group housing and high-rise luxury residential development.'
    });
    showToast('info', 'Demo Data Filled', 'Sample parcel specifications populated successfully.');
  };

  // Validation per section
  const validateSectionA = (): boolean => {
    if (!formData.title.trim()) {
      showToast('error', 'Title Required', 'Please enter a descriptive proposal title.');
      return false;
    }
    if (!formData.city.trim()) {
      showToast('error', 'City Required', 'Please specify the city location.');
      return false;
    }
    if (!formData.sector.trim()) {
      showToast('error', 'Sector / Locality Required', 'Please specify sector or locality.');
      return false;
    }
    if (!formData.pincode.trim() || !/^\d{6}$/.test(formData.pincode.trim())) {
      showToast('error', 'Valid 6-Digit Pincode Required', 'Pincode must be exactly 6 digits.');
      return false;
    }
    return true;
  };

  const validateSectionB = (): boolean => {
    if (!formData.totalArea || formData.totalArea <= 0) {
      showToast('error', 'Area Required', 'Total area must be greater than zero.');
      return false;
    }
    return true;
  };

  const validateSectionC = (): boolean => {
    if ((formData.dealType === 'JOINT_DEVELOPMENT' || formData.dealType === 'JOINT_VENTURE') &&
        (formData.expectedRevenueSharePercentage === undefined || formData.expectedRevenueSharePercentage < 0 || formData.expectedRevenueSharePercentage > 100)) {
      showToast('error', 'Share Percentage Invalid', 'Revenue/Area share percentage must be between 0% and 100%.');
      return false;
    }
    return true;
  };

  const validateAll = (): boolean => {
    return validateSectionA() && validateSectionB() && validateSectionC();
  };

  const handleNextStep = () => {
    if (currentStep === 1 && !validateSectionA()) return;
    if (currentStep === 2 && !validateSectionB()) return;
    if (currentStep === 3 && !validateSectionC()) return;

    if (currentStep < 4) {
      setCurrentStep((prev) => (prev + 1) as any);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAll()) return;

    setIsLoading(true);
    try {
      let result: LandParcelResponse;
      if (editParcelId) {
        result = await landApi.updateLand(editParcelId, formData);
        showToast('success', 'Parcel Updated', 'Land parcel specifications updated successfully.');
      } else {
        result = await landApi.submitLand(formData);
        showToast('success', 'Parcel Submitted', 'Land parcel submitted for institutional review.');
      }
      setSubmittedParcel(result);
      setShowSuccessModal(true);
    } catch (err: any) {
      showToast('error', 'Submission Failed', err.message || 'Unable to submit land parcel.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetchingInitial) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <h3 className="text-base font-bold text-slate-800">Loading Land Parcel Specifications...</h3>
        <p className="text-xs text-slate-500 mt-1">Fetching verified record from database.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Page Title & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black tracking-widest text-emerald-700 uppercase bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {isAgent ? 'Channel Partner Portal' : 'Landowner Alliance'}
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">
              {editParcelId ? 'Edit Existing Submission' : 'Direct Developer Mandate'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {editParcelId ? 'Edit Land Parcel' : 'Submit Land for Review'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Publish parcel specs to accredited Tier-1 developers for Joint Development, JV, or Outright Acquisition.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Fill Sample Data for easy demo */}
          <button
            type="button"
            onClick={fillSampleData}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
            title="Auto-fill with sample parcel details"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Load Sample Data</span>
          </button>

          {/* Toggle View Mode */}
          <button
            type="button"
            onClick={() => setViewMode(viewMode === 'wizard' ? 'all' : 'wizard')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <span>{viewMode === 'wizard' ? 'View All Sections' : 'Step-by-Step Wizard'}</span>
          </button>
        </div>
      </div>

      {/* Step Progress Pills (in Wizard mode) */}
      {viewMode === 'wizard' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-8">
          {[
            { step: 1, label: 'Location Details', icon: MapPin },
            { step: 2, label: 'Dimensions & Zoning', icon: Compass },
            { step: 3, label: 'Commercials & Deal', icon: DollarSign },
            { step: 4, label: 'Legal & Assurances', icon: ShieldCheck }
          ].map(item => {
            const Icon = item.icon;
            const isActive = currentStep === item.step;
            const isCompleted = currentStep > item.step;

            return (
              <button
                key={item.step}
                type="button"
                onClick={() => setCurrentStep(item.step as any)}
                className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-900/10'
                    : isCompleted
                    ? 'bg-emerald-50/70 text-emerald-900 border-emerald-200 hover:bg-emerald-100/50'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : item.step}
                </div>
                <div className="min-w-0">
                  <span className={`block text-[10px] uppercase font-bold tracking-wider ${isActive ? 'text-emerald-100' : 'text-slate-400'}`}>
                    Section {item.step}
                  </span>
                  <span className="block text-xs font-bold truncate">
                    {item.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Main Submission Form */}
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* SECTION A: LOCATION DETAILS */}
        {(viewMode === 'all' || currentStep === 1) && (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs">
            <div className="flex items-center gap-3 pb-4 mb-5 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900">
                  Section A: Location Details
                </h2>
                <p className="text-xs text-slate-500">
                  Exact geography, survey references, and road connectivity.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Proposal Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Parcel Title / Listing Headline <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Prime 3.5 Acre Plot on Main Sector Road"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all font-medium"
                />
              </div>

              {/* City & Sector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    City <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      list="cities-list"
                      required
                      value={formData.city}
                      onChange={e => setFormData({ ...formData, city: e.target.value })}
                      placeholder="e.g. Gurgaon"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all font-medium"
                    />
                    <datalist id="cities-list">
                      {TOP_CITIES.map(c => <option key={c} value={c} />)}
                    </datalist>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Sector / Locality <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.sector}
                    onChange={e => setFormData({ ...formData, sector: e.target.value })}
                    placeholder="e.g. Sector 82"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all font-medium"
                  />
                </div>
              </div>

              {/* State & Pincode */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    State <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.state}
                    onChange={e => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all font-medium cursor-pointer"
                  >
                    {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Pincode (6 Digits) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={formData.pincode}
                    onChange={e => setFormData({ ...formData, pincode: e.target.value.replace(/[^0-9]/g, '') })}
                    placeholder="122004"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all font-mono font-medium"
                  />
                </div>
              </div>

              {/* Plot Survey / Khasra Number & Landmark */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Plot / Khasra / Survey Number
                  </label>
                  <input
                    type="text"
                    value={formData.plotSurveyNumber || ''}
                    onChange={e => setFormData({ ...formData, plotSurveyNumber: e.target.value })}
                    placeholder="e.g. Khasra No. 142/1"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Prominent Landmark
                  </label>
                  <input
                    type="text"
                    value={formData.landmark || ''}
                    onChange={e => setFormData({ ...formData, landmark: e.target.value })}
                    placeholder="e.g. Near NH-48 toll exit"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all font-medium"
                  />
                </div>
              </div>

              {/* Google Maps Link */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Google Maps Pin / Link</span>
                  {formData.locationUrl && (
                    <a
                      href={formData.locationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-emerald-600 hover:text-emerald-700 flex items-center gap-1 font-semibold"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Test Link</span>
                    </a>
                  )}
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="url"
                    value={formData.locationUrl || ''}
                    onChange={e => setFormData({ ...formData, locationUrl: e.target.value })}
                    placeholder="https://maps.google.com/?q=28.39,76.97"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION B: DIMENSIONS & ZONING */}
        {(viewMode === 'all' || currentStep === 2) && (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs">
            <div className="flex items-center gap-3 pb-4 mb-5 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900">
                  Section B: Dimensions & Zoning
                </h2>
                <p className="text-xs text-slate-500">
                  Land measurements, road width facing the parcel, and master plan zoning.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Total Area & Area Unit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Total Area <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={formData.totalArea || ''}
                    onChange={e => handleAreaChange(parseFloat(e.target.value) || 0)}
                    placeholder="3.5"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all font-mono font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Area Unit <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.areaUnit}
                    onChange={e => setFormData({ ...formData, areaUnit: e.target.value as AreaUnit })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all font-medium cursor-pointer"
                  >
                    <option value="ACRES">Acres</option>
                    <option value="SQ_YARDS">Sq. Yards (Gaj)</option>
                    <option value="SQ_FEET">Sq. Feet</option>
                    <option value="HECTARES">Hectares</option>
                    <option value="BIGHA">Bigha</option>
                    <option value="GUNTHA">Guntha</option>
                  </select>
                </div>
              </div>

              {/* Road Width & Plot Facing */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Road Width Facing Plot (Feet)
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="10"
                    value={formData.roadWidthFeet || ''}
                    onChange={e => setFormData({ ...formData, roadWidthFeet: parseFloat(e.target.value) || 0 })}
                    placeholder="e.g. 60"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all font-mono font-medium"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Institutional builders typically require 40ft+ road frontage.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Plot Facing / Orientation
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      list="plot-facings"
                      value={formData.plotFacing || ''}
                      onChange={e => setFormData({ ...formData, plotFacing: e.target.value })}
                      placeholder="e.g. North-East Corner"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all font-medium"
                    />
                    <datalist id="plot-facings">
                      {PLOT_FACINGS.map(f => <option key={f} value={f} />)}
                    </datalist>
                  </div>
                </div>
              </div>

              {/* Zoning Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Master Plan Zoning Category <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {(['RESIDENTIAL', 'COMMERCIAL', 'INDUSTRIAL', 'AGRICULTURAL', 'MIXED_USE'] as ZoningCategory[]).map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setFormData({ ...formData, zoning: cat })}
                      className={`py-2 px-2.5 rounded-xl border text-center transition-all cursor-pointer text-xs font-bold ${
                        formData.zoning === cat
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-slate-50/80 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {cat.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION C: PROPOSAL STRUCTURE & COMMERCIALS */}
        {(viewMode === 'all' || currentStep === 3) && (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs">
            <div className="flex items-center gap-3 pb-4 mb-5 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900">
                  Section C: Proposal Structure & Commercials
                </h2>
                <p className="text-xs text-slate-500">
                  Deal structure (JDA, JV, Outright), revenue share %, and valuation expectations.
                </p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Proposed Deal Type */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Proposed Deal Structure <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { id: 'JOINT_DEVELOPMENT', title: 'Joint Development (JDA)', desc: 'Landowner contributes land; Builder executes and shares finished area or revenue.' },
                    { id: 'JOINT_VENTURE', title: 'Joint Venture (JV)', desc: 'Special Purpose Vehicle (SPV) formed with joint equity participation.' },
                    { id: 'OUTRIGHT_SALE', title: 'Outright Sale', desc: '100% upfront asset transfer against institutional cash payout.' },
                    { id: 'LONG_TERM_LEASE', title: 'Long Term Lease', desc: 'Commercial ground lease (30 – 99 years) with periodic escalations.' }
                  ].map(option => (
                    <div
                      key={option.id}
                      onClick={() => setFormData({ ...formData, dealType: option.id as ProposedDealType })}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        formData.dealType === option.id
                          ? 'bg-emerald-50/50 border-emerald-600 ring-1 ring-emerald-600 shadow-2xs'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{option.title}</span>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          formData.dealType === option.id
                            ? 'border-emerald-600 bg-emerald-600'
                            : 'border-slate-300'
                        }`}>
                          {formData.dealType === option.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{option.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic Revenue Share % (Visible if JDA or JV) */}
              {(formData.dealType === 'JOINT_DEVELOPMENT' || formData.dealType === 'JOINT_VENTURE') && (
                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                      <Percent className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Expected Revenue / Area Share % for Landowner</span>
                    </label>
                    <div className="text-base font-extrabold text-emerald-700 font-mono bg-white px-2.5 py-0.5 rounded-lg border border-emerald-300 shadow-2xs">
                      {formData.expectedRevenueSharePercentage || 45}%
                    </div>
                  </div>

                  {/* Range Slider */}
                  <input
                    type="range"
                    min="10"
                    max="80"
                    step="0.5"
                    value={formData.expectedRevenueSharePercentage || 45}
                    onChange={e => setFormData({ ...formData, expectedRevenueSharePercentage: parseFloat(e.target.value) })}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                    <span>10% (Builder Favored)</span>
                    <span>45% - 50% (Standard Tier-1 Market Ratio)</span>
                    <span>80% (High Land Value)</span>
                  </div>
                </div>
              )}

              {/* Expected Total Price with Indian Currency Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Expected Total Price (₹)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="100000"
                      min="0"
                      value={formData.expectedPrice || ''}
                      onChange={e => handlePriceChange(parseFloat(e.target.value) || 0)}
                      placeholder="e.g. 250000000"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all font-mono font-medium"
                    />
                  </div>

                  {/* Live Indian Format Preview */}
                  {formData.expectedPrice ? (
                    <div className="mt-1.5 flex items-center gap-2 text-xs">
                      <span className="font-bold text-emerald-700 font-mono bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {formatIndianCurrency(formData.expectedPrice)}
                      </span>
                      <span className="text-slate-400 text-[11px] font-mono">
                        ({formatIndianCurrencyFull(formData.expectedPrice)})
                      </span>
                    </div>
                  ) : null}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Price per {getAreaUnitLabel(formData.areaUnit)} (Calculated)
                  </label>
                  <input
                    type="number"
                    value={formData.pricePerUnit || ''}
                    onChange={e => setFormData({ ...formData, pricePerUnit: parseFloat(e.target.value) || 0 })}
                    placeholder="Auto-calculated"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all font-mono font-medium"
                  />
                  {formData.pricePerUnit ? (
                    <div className="mt-1.5 text-xs text-slate-600 font-mono">
                      ≈ {formatIndianCurrency(formData.pricePerUnit)} / {getAreaUnitLabel(formData.areaUnit)}
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Price Negotiable Switch */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Price Negotiability</span>
                  <span className="text-[11px] text-slate-500">Is the expected valuation open for institutional structuring?</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPriceNegotiable ?? true}
                    onChange={e => setFormData({ ...formData, isPriceNegotiable: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* SECTION D: LEGAL & BROKER DETAILS */}
        {(viewMode === 'all' || currentStep === 4) && (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs">
            <div className="flex items-center gap-3 pb-4 mb-5 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900">
                  Section D: Legal Assurances & Representative Details
                </h2>
                <p className="text-xs text-slate-500">
                  Title certification, ownership documentation, and channel partner representation.
                </p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Ownership Type */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Title & Ownership Classification <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['FREEHOLD', 'LEASEHOLD', 'ANCESTRAL', 'POWER_OF_ATTORNEY'] as OwnershipType[]).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({ ...formData, ownershipType: type })}
                      className={`py-2 px-2.5 rounded-xl border text-center transition-all cursor-pointer text-xs font-bold ${
                        formData.ownershipType === type
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-slate-50/80 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {type.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Legal Checkboxes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex items-start gap-3 p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 cursor-pointer hover:bg-slate-50 transition-all">
                  <input
                    type="checkbox"
                    checked={formData.hasClearTitle}
                    onChange={e => setFormData({ ...formData, hasClearTitle: e.target.checked })}
                    className="w-4 h-4 mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Clear & Marketable Title</span>
                    <span className="text-[11px] text-slate-500">Single/Joint ownership deed with unencumbered chain of mutation.</span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 cursor-pointer hover:bg-slate-50 transition-all">
                  <input
                    type="checkbox"
                    checked={formData.isLitigationFree}
                    onChange={e => setFormData({ ...formData, isLitigationFree: e.target.checked })}
                    className="w-4 h-4 mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">100% Litigation Free</span>
                    <span className="text-[11px] text-slate-500">No active stay orders, court disputes, or revenue appeals.</span>
                  </div>
                </label>
              </div>

              {/* Dynamic Agent Fields (Visible if logged-in user is AGENT) */}
              {isAgent && (
                <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                    <Briefcase className="w-4 h-4 text-amber-700" />
                    <span>Real Estate Channel Partner Terms</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Agency / Advisory Company Name
                      </label>
                      <input
                        type="text"
                        value={formData.agencyName || ''}
                        onChange={e => setFormData({ ...formData, agencyName: e.target.value })}
                        placeholder="e.g. Apex Realty Advisors"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-amber-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Expected Institutional Brokerage % (0% - 5%)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="5"
                        value={formData.brokeragePercentage || ''}
                        onChange={e => setFormData({ ...formData, brokeragePercentage: parseFloat(e.target.value) || 0 })}
                        placeholder="1.5"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-amber-600 font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Additional Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Parcel Description & Strategic Highlights
                </label>
                <textarea
                  rows={3}
                  value={formData.description || ''}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. Clear title parcel suitable for group housing. Direct frontage on 60ft master road with quick access to highway corridor."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all leading-relaxed"
                />
              </div>
            </div>
          </div>
        )}

        {/* Wizard Footer Controls */}
        <div className="flex items-center justify-between pt-4">
          {viewMode === 'wizard' && currentStep > 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => (prev - 1) as any)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous Section</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>
          )}

          <div className="flex items-center gap-3">
            {viewMode === 'wizard' && currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-900/10 transition-all cursor-pointer"
              >
                <span>Continue to Section {currentStep + 1}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white text-xs font-bold tracking-wide shadow-lg shadow-emerald-900/20 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Submitting Parcel Specs...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>{editParcelId ? 'Update Land Parcel' : 'Submit Land for Review'}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Confirmation Dialog / Success Modal */}
      {showSuccessModal && submittedParcel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-100 shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-lg font-black text-slate-900 mb-1">
              {editParcelId ? 'Parcel Successfully Updated' : 'Land Submitted for Review!'}
            </h3>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              Your land parcel <span className="font-bold text-slate-800">"{submittedParcel.title}"</span> has been logged under reference ID <span className="font-mono text-emerald-700 font-bold">{submittedParcel.id}</span>.
            </p>

            <div className="bg-slate-50 rounded-2xl p-4 text-left border border-slate-100 mb-5 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Location:</span>
                <span className="font-semibold text-slate-800">{submittedParcel.sector}, {submittedParcel.city}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Area & Zoning:</span>
                <span className="font-semibold text-slate-800">{submittedParcel.totalArea} {submittedParcel.areaUnit} ({submittedParcel.zoning})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Deal Structure:</span>
                <span className="font-semibold text-emerald-700">{submittedParcel.dealType.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Initial Status:</span>
                <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {submittedParcel.status || 'PENDING_REVIEW'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowSuccessModal(false);
                onSuccess(submittedParcel);
              }}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-900/10 cursor-pointer"
            >
              Go to My Land Submissions
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
