import React, { useState } from 'react';
import { Developer } from '../../types';
import { VerificationBadge, ExpertiseBadge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { useToast } from '../common/Toast';
import {
  Building2,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Search,
  Filter,
  Award,
  Users,
  Handshake,
  LandPlot,
  Briefcase,
  CheckCircle2,
  Send,
  Building,
  Phone,
  User
} from 'lucide-react';

interface PublicDirectoryProps {
  developers: Developer[];
  onSelectDeveloper: (id: string) => void;
}

export const PublicDirectory: React.FC<PublicDirectoryProps> = ({
  developers,
  onSelectDeveloper
}) => {
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('ALL');
  const [expertiseFilter, setExpertiseFilter] = useState('ALL');
  const [landModalOpen, setLandModalOpen] = useState(false);

  // Land owner / Agent submission state
  const [landForm, setLandForm] = useState({
    userType: 'LAND_OWNER',
    name: '',
    phone: '',
    email: '',
    city: 'Bengaluru',
    parcelSize: '',
    transactionType: 'JV',
    notes: ''
  });
  const [submittingLand, setSubmittingLand] = useState(false);

  // Collect all unique cities
  const allCities = Array.from(
    new Set(developers.flatMap(d => d.operatingCities))
  ).sort();

  const filtered = developers.filter(d => {
    const matchSearch =
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.reraNumber.toLowerCase().includes(search.toLowerCase()) ||
      d.operatingCities.some(c => c.toLowerCase().includes(search.toLowerCase()));

    const matchCity =
      cityFilter === 'ALL' || d.operatingCities.includes(cityFilter);

    const matchExpertise =
      expertiseFilter === 'ALL' || (d.coreExpertise as string[]).includes(expertiseFilter);

    return matchSearch && matchCity && matchExpertise;
  });

  const handleLandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!landForm.name || !landForm.phone) {
      showToast('error', 'Missing Information', 'Please provide your name and phone number.');
      return;
    }

    setSubmittingLand(true);
    setTimeout(() => {
      setSubmittingLand(false);
      showToast(
        'success',
        'Mandate Submitted Successfully',
        'Our institutional alliance director will review your parcel details and connect you with matching Tier-1 developers.'
      );
      setLandModalOpen(false);
      setLandForm({
        userType: 'LAND_OWNER',
        name: '',
        phone: '',
        email: '',
        city: 'Bengaluru',
        parcelSize: '',
        transactionType: 'JV',
        notes: ''
      });
    }, 600);
  };

  return (
    <div className="pb-20">
      {/* 1. HERO SECTION: WHAT WE DO (CONNECT TRUSTED DEVELOPERS TO LAND OWNERS & AGENTS) */}
      <section className="relative bg-gradient-to-b from-slate-100 via-white to-slate-50 border-b border-slate-200 pt-14 pb-16 overflow-hidden">
        <div className="absolute top-0 right-10 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-blue-100/30 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-4 shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Institutional Real Estate Alliance Network</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
              We Connect <span className="text-emerald-700">Trusted Developers</span> to Land Owners and Agents
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 mt-4 leading-relaxed font-normal">
              Accelerate high-value Joint Ventures (JV), Joint Development Agreements (JDA), Outright Acquisitions, and Urban Redevelopment. Directly matching verified land parcels with India's Tier-1 RERA-accredited builders.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mt-8">
              <a
                href="#developers-section"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-md shadow-emerald-900/10 flex items-center justify-center gap-2 transition-all"
              >
                <Building2 className="w-4 h-4" />
                <span>Explore Trusted Developers</span>
              </a>
            </div>
          </div>

          {/* 3 Value Pillars: What We Do */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-14 max-w-6xl mx-auto">
            {/* Pillar 1: Land Owners */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-4 text-emerald-700">
                <LandPlot className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">For Land Owners</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Monetize your prime land parcel through structured Joint Ventures (JV) or outright buyout with India's most credible builders. Zero brokers clutter, audited financials, and guaranteed project delivery.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-[11px] font-bold text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Direct Access to Tier-1 Capital</span>
              </div>
            </div>

            {/* Pillar 2: Real Estate Agents */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center mb-4 text-blue-700">
                <Briefcase className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">For Real Estate Agents</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Bring your client mandates directly to the decision-makers. Protected alliance agreements, transparent underwriting criteria, faster closing cycles, and guaranteed channel incentives.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-[11px] font-bold text-blue-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Protected Mandate Rights</span>
              </div>
            </div>

            {/* Pillar 3: Trusted Developers */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center mb-4 text-amber-700">
                <Building className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">For Trusted Developers</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Source pre-screened, title-clear land opportunities, institutional parcels, and strategic redevelopment clusters across Bengaluru, Mumbai, NCR, Pune, and Hyderabad corridors.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-[11px] font-bold text-amber-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>100% RERA Verified Standards</span>
              </div>
            </div>
          </div>

          {/* Platform Trust & Deal Pillars Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-sm mt-10 max-w-5xl mx-auto text-center">
            <div>
              <span className="text-2xl sm:text-3xl font-black text-slate-900">Direct JV & JDA</span>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mt-0.5">Development Alliances</span>
            </div>
            <div className="border-l border-slate-100">
              <span className="text-2xl sm:text-3xl font-black text-emerald-700">100% Verified</span>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mt-0.5">State RERA Compliant</span>
            </div>
            <div className="border-l border-slate-100">
              <span className="text-2xl sm:text-3xl font-black text-slate-900">Clear Title</span>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mt-0.5">Owner & Agent Parcels</span>
            </div>
            <div className="border-l border-slate-100">
              <span className="text-2xl sm:text-3xl font-black text-slate-900">Zero Middlemen</span>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mt-0.5">Direct Developer Desks</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. DEVELOPERS CARD SECTION (REPLACES PROJECT DETAILS) */}
      <section id="developers-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-emerald-700 uppercase">
              <Building2 className="w-4 h-4" />
              <span>Tier-1 Builder Partners</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Trusted Real Estate Developers
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Select any developer to inspect their full delivery portfolio, active construction, and RERA credentials.
            </p>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-white border border-slate-200 shadow-sm mb-8">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search developers by company name, operating city, or RERA license..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={cityFilter}
                onChange={e => setCityFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-semibold focus:outline-none focus:border-emerald-600"
              >
                <option value="ALL">All Metropolitan Cities</option>
                {allCities.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={expertiseFilter}
                onChange={e => setExpertiseFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-semibold focus:outline-none focus:border-emerald-600"
              >
                <option value="ALL">All Expertise Models</option>
                <option value="JV">Joint Venture (JV)</option>
                <option value="JDA">Joint Development (JDA)</option>
                <option value="OUTRIGHT">Outright Purchase</option>
                <option value="REDEVELOPMENT">Redevelopment</option>
              </select>
            </div>
          </div>
        </div>

        {/* Developers Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map(dev => {
            const projectCount = dev.projects ? dev.projects.length : 0;
            return (
              <div
                key={dev.id}
                className="group rounded-2xl bg-white border border-slate-200 hover:border-emerald-500/60 p-5 flex flex-col justify-between transition-all duration-200 shadow-sm hover:shadow-xl"
              >
                <div>
                  {/* Top Header: Badge & Established */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <VerificationBadge status={dev.verificationStatus} />
                    <span className="text-[11px] font-mono text-slate-500 font-bold">
                      Est. {dev.establishedYear}
                    </span>
                  </div>

                  {/* Company Name */}
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors tracking-tight line-clamp-1">
                    {dev.name}
                  </h3>

                  <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                    {dev.description}
                  </p>

                  {/* Key Metrics Strip */}
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-amber-500" />
                        Experience:
                      </span>
                      <span className="font-bold text-slate-800">{dev.yearsOfExperience}+ Years</span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                        Portfolio:
                      </span>
                      <span className="font-bold text-emerald-700">{projectCount} Projects</span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-blue-500" />
                        Happy Customers:
                      </span>
                      <span className="font-semibold text-slate-700">{dev.happyCustomersCount}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-600 pt-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{dev.operatingCities.join(', ')}</span>
                    </div>
                  </div>

                  {/* Expertise Tags */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {dev.coreExpertise.slice(0, 3).map((exp, idx) => (
                      <ExpertiseBadge key={idx} expertise={exp} />
                    ))}
                  </div>
                </div>

                {/* Primary Card Button: EXPLORE PROJECTS */}
                <div className="mt-5 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => onSelectDeveloper(dev.id)}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white text-xs font-bold tracking-wide transition-all shadow-sm flex items-center justify-center gap-2 group-hover:bg-emerald-600"
                  >
                    <span>Explore Projects</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <p className="text-[10px] font-mono text-slate-400 text-center mt-2 truncate">
                    RERA: {dev.reraNumber}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 mt-6">
            <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 mb-1">
              {developers.length === 0 ? 'No Developers Currently Listed' : 'No Developers Match Your Filter'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
              {developers.length === 0
                ? 'The verified developer network is being updated with approved partners. Land owners and agents can register parcel mandates below.'
                : 'Try resetting the city or core expertise filter.'}
            </p>
            {developers.length === 0 ? (
              <button
                onClick={() => setLandModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white shadow-sm cursor-pointer"
              >
                Submit Land Parcel Mandate
              </button>
            ) : (
              <button
                onClick={() => {
                  setSearch('');
                  setCityFilter('ALL');
                  setExpertiseFilter('ALL');
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>
        )}
      </section>

      {/* 3. LAND MANDATE / INQUIRY MODAL (FOR LAND OWNERS & AGENTS) */}
      <Modal
        isOpen={landModalOpen}
        onClose={() => setLandModalOpen(false)}
        title="Submit Land Parcel or Alliance Mandate"
        subtitle="Connect your land opportunity directly with verified Tier-1 builders"
        maxWidth="lg"
      >
        <form onSubmit={handleLandSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              I am a:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setLandForm({ ...landForm, userType: 'LAND_OWNER' })}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  landForm.userType === 'LAND_OWNER'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <LandPlot className="w-4 h-4 text-emerald-600" />
                <span>Land Owner / Title Holder</span>
              </button>

              <button
                type="button"
                onClick={() => setLandForm({ ...landForm, userType: 'AGENT' })}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  landForm.userType === 'AGENT'
                    ? 'bg-blue-50 border-blue-500 text-blue-800 shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Briefcase className="w-4 h-4 text-blue-600" />
                <span>Real Estate Agent / Broker</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Your Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={landForm.name}
                  onChange={e => setLandForm({ ...landForm, name: e.target.value })}
                  placeholder="e.g. Rajesh Patil"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Phone Number *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  required
                  value={landForm.phone}
                  onChange={e => setLandForm({ ...landForm, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                City / Location
              </label>
              <input
                type="text"
                value={landForm.city}
                onChange={e => setLandForm({ ...landForm, city: e.target.value })}
                placeholder="Bengaluru"
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Parcel Size / Area
              </label>
              <input
                type="text"
                value={landForm.parcelSize}
                onChange={e => setLandForm({ ...landForm, parcelSize: e.target.value })}
                placeholder="e.g. 5.5 Acres or 50,000 sq.ft."
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Preferred Deal Structure
              </label>
              <select
                value={landForm.transactionType}
                onChange={e => setLandForm({ ...landForm, transactionType: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 font-semibold"
              >
                <option value="JV">Joint Venture (JV)</option>
                <option value="JDA">Joint Development (JDA)</option>
                <option value="OUTRIGHT">Outright Sale</option>
                <option value="REDEVELOPMENT">Redevelopment</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Parcel Details & Specifications
            </label>
            <textarea
              rows={3}
              value={landForm.notes}
              onChange={e => setLandForm({ ...landForm, notes: e.target.value })}
              placeholder="Zoning (Residential/Commercial), road width, clear title status, current encumbrances..."
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setLandModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingLand}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submittingLand ? 'Submitting...' : 'Submit Deal Mandate'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
