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
import { useLanguage } from '../../context/LanguageContext';

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
  const { t, language } = useLanguage();
  const session = authService.getSession();
  const isAgent = session?.role === 'AGENT';

  const getZoningCategoryLabel = (cat: ZoningCategory) => {
    switch (cat) {
      case 'RESIDENTIAL': return t.form.zoningRes;
      case 'COMMERCIAL': return t.form.zoningComm;
      case 'INDUSTRIAL': return t.form.zoningInd;
      case 'AGRICULTURAL': return t.form.zoningAgri;
      case 'PROPOSED': return t.form.zoningProp;
      default: return cat;
    }
  };

  const getOwnershipLabelText = (type: OwnershipType) => {
    if (language === 'mr') {
      switch (type) {
        case 'FREEHOLD': return 'फ्रीहोल्ड (Freehold)';
        case 'LEASEHOLD': return 'लीजहोल्ड (Leasehold)';
        case 'ANCESTRAL': return 'वडिलोपार्जित (Ancestral)';
        case 'POWER_OF_ATTORNEY': return 'कुलमुखत्यारपत्र (POA)';
        default: return type;
      }
    }
    return type.replace('_', ' ');
  };

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
    ownerName: '',
    ownerPhone: '',
    city: 'Pune',
    sector: '',
    sectorNumber: '',
    state: 'Maharashtra',
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
    expectedSecurityDeposit: undefined,
    expectedRent: undefined,
    shiftingCharges: undefined,
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
        .then(raw => {
          const data = (raw as any)?.data || (raw as any)?.parcel || raw;
          setFormData({
            title: data.title || '',
            ownerName: data.ownerName || data.title || '',
            ownerPhone: data.ownerPhone || '',
            city: data.city || 'Pune',
            sector: data.sector || '',
            sectorNumber: data.sectorNumber || '',
            state: data.state || 'Maharashtra',
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
            expectedSecurityDeposit: data.expectedSecurityDeposit || undefined,
            expectedRent: data.expectedRent || undefined,
            shiftingCharges: data.shiftingCharges || undefined,
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
      ownerName: 'Ramesh Patil',
      ownerPhone: '9876543210',
      city: 'Pune',
      sector: 'Hinjewadi Phase 1',
      sectorNumber: 'S-42',
      state: 'Maharashtra',
      pincode: '411057',
      plotSurveyNumber: 'Gat No. 142/1',
      landmark: '',
      locationUrl: 'https://maps.google.com/?q=18.59,73.73',
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
    if (!formData.ownerName?.trim()) {
      showToast('error', 'Owner Name Required', 'Please enter the land owner name.');
      return false;
    }
    if (!formData.city.trim()) {
      showToast('error', 'City Required', 'Please specify the city location.');
      return false;
    }
    if (!formData.sector.trim()) {
      showToast('error', 'Land Location Required', 'Please specify the land location.');
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

  const handleNextStep = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (currentStep === 1 && !validateSectionA()) return;
    if (currentStep === 2 && !validateSectionB()) return;
    if (currentStep === 3 && !validateSectionC()) return;

    if (currentStep < 4) {
      setCurrentStep((prev) => (prev + 1) as any);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Wizard mode can ONLY be submitted when user is actually on step 4
    if (viewMode === 'wizard' && currentStep !== 4) {
      return;
    }

    if (!validateAll()) return;

    // Derive title from ownerName for backend compatibility
    const payload = { ...formData, title: formData.ownerName?.trim() || formData.title };

    setIsLoading(true);
    try {
      let result: LandParcelResponse;
      if (editParcelId) {
        result = await landApi.updateLand(editParcelId, payload);
        showToast('success', 'Parcel Updated', 'Land parcel specifications updated successfully.');
      } else {
        result = await landApi.submitLand(payload);
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
              {isAgent ? t.form.channelPartnerPortal : t.form.landownerAlliance}
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">
              {editParcelId ? t.form.editExisting : t.form.directMandate}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {editParcelId ? t.form.titleEdit : t.form.titleNew}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {t.form.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle View Mode */}
          <button
            type="button"
            onClick={() => setViewMode(viewMode === 'wizard' ? 'all' : 'wizard')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <span>{viewMode === 'wizard' ? t.form.viewAll : t.form.stepWizard}</span>
          </button>
        </div>
      </div>

      {/* Step Progress Pills (in Wizard mode) */}
      {viewMode === 'wizard' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-8">
          {[
            { step: 1, label: t.form.step1Label, icon: MapPin },
            { step: 2, label: t.form.step2Label, icon: Compass },
            { step: 3, label: t.form.step3Label, icon: DollarSign },
            { step: 4, label: t.form.step4Label, icon: ShieldCheck }
          ].map(item => {
            const Icon = item.icon;
            const isActive = currentStep === item.step;
            const isCompleted = currentStep > item.step;

            return (
              <button
                key={item.step}
                type="button"
                onClick={() => {
                  // Validate current sections before jumping forward
                  if (item.step > currentStep) {
                    if (currentStep >= 1 && !validateSectionA()) return;
                    if (currentStep >= 2 && item.step > 2 && !validateSectionB()) return;
                    if (currentStep >= 3 && item.step > 3 && !validateSectionC()) return;
                  }
                  setCurrentStep(item.step as any);
                }}
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
                    {language === 'mr' ? 'विभाग' : 'Section'} {item.step}
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
      <form onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); }} className="space-y-6">

        {/* SECTION A: LOCATION DETAILS */}
        {(viewMode === 'all' || currentStep === 1) && (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs">
            <div className="flex items-center gap-3 pb-4 mb-5 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900">
                  {language === 'mr' ? 'विभाग १: स्थान तपशील' : 'Section A: Location Details'}
                </h2>
                <p className="text-xs text-slate-500">
                  {t.form.step1Desc}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Land Owner Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.form.ownerName} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.ownerName || ''}
                    onChange={e => setFormData({ ...formData, ownerName: e.target.value })}
                    placeholder={t.form.ownerNamePlaceholder}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.form.ownerPhone}
                  </label>
                  <input
                    type="tel"
                    value={formData.ownerPhone || ''}
                    onChange={e => setFormData({ ...formData, ownerPhone: e.target.value.replace(/[^0-9+\-\s]/g, '') })}
                    placeholder={t.form.ownerPhonePlaceholder}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all font-mono font-medium"
                  />
                </div>
              </div>

              {/* City & Land Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.form.city} <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      list="cities-list"
                      required
                      value={formData.city}
                      onChange={e => setFormData({ ...formData, city: e.target.value })}
                      placeholder={t.form.cityPlaceholder}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all font-medium"
                    />
                    <datalist id="cities-list">
                      {TOP_CITIES.map(c => <option key={c} value={c} />)}
                    </datalist>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.form.landLocation} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.sector}
                    onChange={e => setFormData({ ...formData, sector: e.target.value })}
                    placeholder={t.form.landLocationPlaceholder}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all font-medium"
                  />
                </div>
              </div>

              {/* Sector Number & Pincode */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.form.sectorNumber}
                  </label>
                  <input
                    type="text"
                    value={formData.sectorNumber || ''}
                    onChange={e => setFormData({ ...formData, sectorNumber: e.target.value })}
                    placeholder={t.form.sectorNumberPlaceholder}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.form.pincode} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={formData.pincode}
                    onChange={e => setFormData({ ...formData, pincode: e.target.value.replace(/[^0-9]/g, '') })}
                    placeholder="411057"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all font-mono font-medium"
                  />
                </div>
              </div>

              {/* Gat Number / Survey Number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.form.gatSurvey}
                </label>
                <input
                  type="text"
                  value={formData.plotSurveyNumber || ''}
                  onChange={e => setFormData({ ...formData, plotSurveyNumber: e.target.value })}
                  placeholder={t.form.gatSurveyPlaceholder}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all font-medium"
                />
              </div>

              {/* Google Maps Link */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>{t.form.googleMaps}</span>
                  {formData.locationUrl && (
                    <a
                      href={formData.locationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-emerald-600 hover:text-emerald-700 flex items-center gap-1 font-semibold"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>{language === 'mr' ? 'लिंक तपासा' : 'Test Link'}</span>
                    </a>
                  )}
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="url"
                    value={formData.locationUrl || ''}
                    onChange={e => setFormData({ ...formData, locationUrl: e.target.value })}
                    placeholder={t.form.googleMapsPlaceholder}
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
                  {language === 'mr' ? 'विभाग २: क्षेत्रफळ व झोनिंग' : 'Section B: Dimensions & Zoning'}
                </h2>
                <p className="text-xs text-slate-500">
                  {t.form.step2Desc}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Total Area & Area Unit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.form.totalArea} <span className="text-rose-500">*</span>
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
                    {t.form.areaUnit} <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.areaUnit}
                    onChange={e => setFormData({ ...formData, areaUnit: e.target.value as AreaUnit })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all font-medium cursor-pointer"
                  >
                    <option value="SQ_METERS">{t.form.unitSqMeters}</option>
                    <option value="SQ_FEET">{t.form.unitSqFeet}</option>
                    <option value="GUNTHA">{t.form.unitGuntha}</option>
                    <option value="ACRES">{t.form.unitAcres}</option>
                  </select>
                </div>
              </div>

              {/* Road Width & Plot Facing */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.form.roadWidth}
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
                    {language === 'mr' ? 'संस्थात्मक बिल्डर्स सामान्यतः ४०+ फूट रुंद रस्ता प्राधान्य देतात.' : 'Institutional builders typically require 40ft+ road frontage.'}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.form.plotFacing}
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
                  {t.form.zoning} <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {(['RESIDENTIAL', 'COMMERCIAL', 'INDUSTRIAL', 'AGRICULTURAL', 'PROPOSED'] as ZoningCategory[]).map(cat => (
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
                      {getZoningCategoryLabel(cat)}
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
                  {language === 'mr' ? 'विभाग ३: आर्थिक व करार रचना' : 'Section C: Proposal Structure & Commercials'}
                </h2>
                <p className="text-xs text-slate-500">
                  {t.form.step3Desc}
                </p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Proposed Deal Type */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  {t.form.dealStructure} <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { id: 'JOINT_DEVELOPMENT', title: t.form.dealJdaTitle, desc: t.form.dealJdaDesc },
                    { id: 'JOINT_VENTURE', title: t.form.dealJvTitle, desc: t.form.dealJvDesc },
                    { id: 'OUTRIGHT_SALE', title: t.form.dealOutrightTitle, desc: t.form.dealOutrightDesc },
                    { id: 'REDEVELOPMENT', title: t.form.dealRedevTitle, desc: t.form.dealRedevDesc }
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

              {/* Dynamic Revenue Share % and Security Deposit (Visible if JDA or JV) */}
              {(formData.dealType === 'JOINT_DEVELOPMENT' || formData.dealType === 'JOINT_VENTURE') && (
                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 transition-all space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                        <Percent className="w-3.5 h-3.5 text-emerald-700" />
                        <span>{t.form.revenueShare}</span>
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
                      <span>{language === 'mr' ? '१०% (बिल्डर अनुकूल)' : '10% (Builder Favored)'}</span>
                      <span>{language === 'mr' ? '४५% - ५०% (प्रमाणित मार्केट प्रमाण)' : '45% - 50% (Standard Tier-1 Market Ratio)'}</span>
                      <span>{language === 'mr' ? '८०% (उच्च जमीन मूल्य)' : '80% (High Land Value)'}</span>
                    </div>
                  </div>

                  {/* Expected Security Deposit */}
                  <div className="pt-3 border-t border-emerald-200/70">
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      {t.form.securityDeposit}
                    </label>
                    <input
                      type="number"
                      step="50000"
                      min="0"
                      value={formData.expectedSecurityDeposit ?? ''}
                      onChange={e => setFormData({ ...formData, expectedSecurityDeposit: e.target.value ? parseFloat(e.target.value) : undefined })}
                      placeholder="e.g. 5000000 (50 Lakhs)"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 transition-all font-mono font-medium"
                    />
                    {formData.expectedSecurityDeposit ? (
                      <div className="mt-1.5 flex items-center gap-2 text-xs">
                        <span className="font-bold text-emerald-700 font-mono bg-white px-2 py-0.5 rounded border border-emerald-200">
                          {formatIndianCurrency(formData.expectedSecurityDeposit)}
                        </span>
                        <span className="text-slate-500 text-[11px] font-mono">
                          ({formatIndianCurrencyFull(formData.expectedSecurityDeposit)})
                        </span>
                      </div>
                    ) : null}
                    <p className="text-[10px] text-slate-500 mt-1">
                      {t.form.securityDepositDesc}
                    </p>
                  </div>
                </div>
              )}

              {/* Dynamic Redevelopment Terms (Visible if REDEVELOPMENT) */}
              {formData.dealType === 'REDEVELOPMENT' && (
                <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200/80 transition-all space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-950">
                    <Building className="w-4 h-4 text-indigo-700" />
                    <span>{t.form.redevelopmentHeader}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Expected Rent */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        {t.form.expectedRent}
                      </label>
                      <input
                        type="number"
                        step="1000"
                        min="0"
                        value={formData.expectedRent ?? ''}
                        onChange={e => setFormData({ ...formData, expectedRent: e.target.value ? parseFloat(e.target.value) : undefined })}
                        placeholder="e.g. 45000"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 transition-all font-mono font-medium"
                      />
                      {formData.expectedRent ? (
                        <div className="mt-1.5 flex items-center gap-2 text-xs">
                          <span className="font-bold text-indigo-700 font-mono bg-white px-2 py-0.5 rounded border border-indigo-200">
                            {formatIndianCurrency(formData.expectedRent)} / mo
                          </span>
                          <span className="text-slate-500 text-[11px] font-mono">
                            ({formatIndianCurrencyFull(formData.expectedRent)} / month)
                          </span>
                        </div>
                      ) : null}
                      <p className="text-[10px] text-slate-500 mt-1">
                        {t.form.expectedRentDesc}
                      </p>
                    </div>

                    {/* Shifting Charges / Accommodation */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        {t.form.shiftingCharges}
                      </label>
                      <input
                        type="number"
                        step="5000"
                        min="0"
                        value={formData.shiftingCharges ?? ''}
                        onChange={e => setFormData({ ...formData, shiftingCharges: e.target.value ? parseFloat(e.target.value) : undefined })}
                        placeholder="e.g. 100000"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 transition-all font-mono font-medium"
                      />
                      {formData.shiftingCharges ? (
                        <div className="mt-1.5 flex items-center gap-2 text-xs">
                          <span className="font-bold text-indigo-700 font-mono bg-white px-2 py-0.5 rounded border border-indigo-200">
                            {formatIndianCurrency(formData.shiftingCharges)}
                          </span>
                          <span className="text-slate-500 text-[11px] font-mono">
                            ({formatIndianCurrencyFull(formData.shiftingCharges)})
                          </span>
                        </div>
                      ) : null}
                      <p className="text-[10px] text-slate-500 mt-1">
                        {t.form.shiftingChargesDesc}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Expected Total Price with Indian Currency Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.form.totalPrice}
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
                    {t.form.pricePerUnit} {getAreaUnitLabel(formData.areaUnit)} ({language === 'mr' ? 'हिशोबानुसार' : 'Calculated'})
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
                  <span className="text-xs font-bold text-slate-800 block">{t.form.priceNegotiable}</span>
                  <span className="text-[11px] text-slate-500">{t.form.priceNegotiableDesc}</span>
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
                  {language === 'mr' ? 'विभाग ४: कायदेशीर पडताळणी व प्रतिनिधी तपशील' : 'Section D: Legal Assurances & Representative Details'}
                </h2>
                <p className="text-xs text-slate-500">
                  {t.form.step4Desc}
                </p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Ownership Type */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.form.ownershipType} <span className="text-rose-500">*</span>
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
                      {getOwnershipLabelText(type)}
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
                    <span className="text-xs font-bold text-slate-900 block">{t.form.clearTitle}</span>
                    <span className="text-[11px] text-slate-500">{t.form.clearTitleDesc}</span>
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
                    <span className="text-xs font-bold text-slate-900 block">{t.form.litigationFree}</span>
                    <span className="text-[11px] text-slate-500">{t.form.litigationFreeDesc}</span>
                  </div>
                </label>
              </div>

              {/* Dynamic Agent Fields (Visible if logged-in user is AGENT) */}
              {isAgent && (
                <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                    <Briefcase className="w-4 h-4 text-amber-700" />
                    <span>{t.form.agentTerms}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {t.form.agencyName}
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
                        {t.form.brokeragePct}
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
                  {t.form.description}
                </label>
                <textarea
                  rows={3}
                  value={formData.description || ''}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder={t.form.descriptionPlaceholder}
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
              <span>{t.form.prevStep}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-bold transition-all cursor-pointer"
            >
              {t.form.cancel}
            </button>
          )}

          <div className="flex items-center gap-3">
            {viewMode === 'wizard' && currentStep < 4 ? (
              <button
                key="wizard-continue-button"
                type="button"
                onClick={handleNextStep}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-900/10 transition-all cursor-pointer"
              >
                <span>{t.form.continueTo} {currentStep + 1}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                key="wizard-submit-button"
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white text-xs font-bold tracking-wide shadow-lg shadow-emerald-900/20 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{t.form.submitting}</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>{editParcelId ? t.form.updateBtn : t.form.submitBtn}</span>
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
              {editParcelId
                ? (language === 'mr' ? 'जमिनीची माहिती यशस्वीरीत्या अपडेट केली' : 'Parcel Successfully Updated')
                : (language === 'mr' ? 'जमीन पुनरावलोकनासाठी यशस्वीपणे दाखल केली!' : 'Land Submitted for Review!')}
            </h3>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              {language === 'mr' ? (
                <>आपला जमिनीचा प्रस्ताव <span className="font-bold text-slate-800">"{submittedParcel.title}"</span> संदर्भ क्रमांक <span className="font-mono text-emerald-700 font-bold">{submittedParcel.id}</span> अंतर्गत नोंदवला गेला आहे.</>
              ) : (
                <>Your land parcel <span className="font-bold text-slate-800">"{submittedParcel.title}"</span> has been logged under reference ID <span className="font-mono text-emerald-700 font-bold">{submittedParcel.id}</span>.</>
              )}
            </p>

            <div className="bg-slate-50 rounded-2xl p-4 text-left border border-slate-100 mb-5 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">{language === 'mr' ? 'स्थान:' : 'Location:'}</span>
                <span className="font-semibold text-slate-800">{submittedParcel.sector}, {submittedParcel.city}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{language === 'mr' ? 'क्षेत्रफळ व झोनिंग:' : 'Area & Zoning:'}</span>
                <span className="font-semibold text-slate-800">{submittedParcel.totalArea} {submittedParcel.areaUnit} ({submittedParcel.zoning})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{language === 'mr' ? 'करार रचना:' : 'Deal Structure:'}</span>
                <span className="font-semibold text-emerald-700">{submittedParcel.dealType.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{language === 'mr' ? 'सद्यस्थिती:' : 'Initial Status:'}</span>
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
              {language === 'mr' ? 'माझ्या दाखल केलेल्या जमिनी पहा' : 'Go to My Land Submissions'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
