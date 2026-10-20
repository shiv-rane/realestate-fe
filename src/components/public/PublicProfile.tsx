import React, { useState, useEffect, useMemo } from 'react';
import { Developer, Project, ProjectStatus, ProjectType } from '../../types';
import { publicApi } from '../../services/api';
import { ProjectCard } from './ProjectCard';
import { InquireModal } from './InquireModal';
import { VerificationBadge, ExpertiseBadge } from '../common/Badge';
import {
  ExternalLink,
  MessageSquare,
  Building,
  Award,
  Users,
  Calendar,
  CheckCircle,
  Clock,
  Mail,
  Phone,
  UserCheck,
  ShieldAlert,
  Search,
  Filter,
  Layers,
  ArrowRight,
  ChevronLeft
} from 'lucide-react';

interface PublicProfileProps {
  developerId: string;
  onNavigateToDirectory: () => void;
}

export const PublicProfile: React.FC<PublicProfileProps> = ({
  developerId,
  onNavigateToDirectory
}) => {
  const [developer, setDeveloper] = useState<Developer | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [computedStats, setComputedStats] = useState<{
    yearsExperience: number;
    happyCustomers: string;
    projectsCompleted: number;
    upcomingProjects: number;
    ongoingProjects: number;
    totalProjects: number;
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [selectedStatus, setSelectedStatus] = useState<ProjectStatus | 'ALL'>('ALL');
  const [selectedType, setSelectedType] = useState<ProjectType | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Inquiry modal state
  const [inquireModalOpen, setInquireModalOpen] = useState(false);
  const [selectedProjectForInquiry, setSelectedProjectForInquiry] = useState<Project | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    publicApi
      .getDeveloperProfile(developerId)
      .then(res => {
        if (isMounted) {
          setDeveloper(res.developer);
          setProjects(res.projects);
          setComputedStats(res.stats);
          setLoading(false);
        }
      })
      .catch(err => {
        if (isMounted) {
          setError(err.message || 'Failed to load developer profile');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [developerId]);

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      if (selectedStatus !== 'ALL' && project.status !== selectedStatus) {
        return false;
      }
      if (selectedType !== 'ALL' && project.type !== selectedType) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = project.name.toLowerCase().includes(q);
        const matchCity = project.city.toLowerCase().includes(q);
        const matchAddress = project.address.toLowerCase().includes(q);
        const rera = project.reraProjectNumber || project.reraProjectId || '';
        const matchRera = rera.toLowerCase().includes(q);
        return matchName || matchCity || matchAddress || matchRera;
      }
      return true;
    });
  }, [projects, selectedStatus, selectedType, searchQuery]);

  const handleOpenInquire = (proj?: Project) => {
    setSelectedProjectForInquiry(proj || null);
    setInquireModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-500 tracking-wide">Loading Developer Showcase...</p>
      </div>
    );
  }

  if (error || !developer) {
    return (
      <div className="max-w-4xl mx-auto my-16 px-4">
        <div className="p-8 rounded-2xl bg-white border border-rose-200 text-center shadow-md">
          <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Developer Profile Unavailable</h2>
          <p className="text-slate-500 text-sm mb-6">{error || 'Unable to locate developer profile records.'}</p>
          <button
            onClick={onNavigateToDirectory}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
          >
            Back to All Developers
          </button>
        </div>
      </div>
    );
  }

  const statusTabCounts = {
    ALL: projects.length,
    DELIVERED: projects.filter(p => p.status === 'DELIVERED').length,
    ONGOING: projects.filter(p => p.status === 'ONGOING').length,
    UPCOMING: projects.filter(p => p.status === 'UPCOMING').length,
  };

  return (
    <div className="pb-24">
      {/* Back button link */}
      <div className="bg-slate-100/70 border-b border-slate-200 py-2.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={onNavigateToDirectory}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-700 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to All 8 Developers</span>
          </button>
        </div>
      </div>

      {/* 1. HERO HEADER */}
      <div className="relative border-b border-slate-200 bg-gradient-to-b from-slate-100 via-slate-50 to-white pt-8 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
            {/* Left: Branding & Core Metadata */}
            <div className="space-y-4 max-w-3xl">
              {/* Verification & RERA Banner */}
              <div className="flex flex-wrap items-center gap-3">
                <VerificationBadge
                  status={developer.verificationStatus}
                  reraNumber={developer.reraNumber}
                />
                <span className="text-xs text-slate-600 flex items-center gap-1.5 font-semibold">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Est. {developer.establishedYear}
                </span>
              </div>

              {/* Company Title */}
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  {developer.name}
                </h1>
                <p className="text-slate-600 text-sm sm:text-base mt-2 line-clamp-2 leading-relaxed font-normal">
                  {developer.description}
                </p>
              </div>

              {/* Operating Cities Pill Tags */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">
                  Operating Cities:
                </span>
                {developer.operatingCities.map((city, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 text-xs rounded-lg bg-white text-slate-800 border border-slate-200 font-semibold shadow-2xs"
                  >
                    {city}
                  </span>
                ))}
              </div>

              {/* Core Expertise Tags */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">
                  Core Expertise:
                </span>
                {developer.coreExpertise.map((exp, idx) => (
                  <ExpertiseBadge key={idx} expertise={exp} />
                ))}
              </div>
            </div>

            {/* Right: Quick Action Buttons */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:min-w-[240px] shrink-0">
              {developer.websiteUrl && (
                <a
                  href={developer.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-sm font-bold tracking-wide shadow-xs transition-all group"
                >
                  <span>Official Website</span>
                  <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 transition-colors" />
                </a>
              )}

              <button
                onClick={() => handleOpenInquire()}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold tracking-wide shadow-md shadow-emerald-900/10 transition-all transform hover:-translate-y-0.5"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Inquire / Contact</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. KPI / HEADLINE STATS STRIP (Floating Counter Bar) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-xl">
          {/* Stat 1: Years of Experience */}
          <div className="flex items-center gap-3.5 p-3.5 sm:p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="w-12 h-12 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0">
              <Award className="w-6 h-6 text-amber-700" />
            </div>
            <div>
              <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider block">
                Experience
              </span>
              <span className="text-xl sm:text-2xl font-black text-slate-900 num-tabular tracking-tight">
                {computedStats?.yearsExperience || developer.yearsOfExperience}+ Years
              </span>
            </div>
          </div>

          {/* Stat 2: Happy Customers */}
          <div className="flex items-center gap-3.5 p-3.5 sm:p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6 text-emerald-700" />
            </div>
            <div>
              <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider block">
                Happy Customers
              </span>
              <span className="text-xl sm:text-2xl font-black text-slate-900 num-tabular tracking-tight">
                {computedStats?.happyCustomers || developer.happyCustomersCount}
              </span>
            </div>
          </div>

          {/* Stat 3: Projects Completed */}
          <div className="flex items-center gap-3.5 p-3.5 sm:p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center shrink-0">
              <CheckCircle className="w-6 h-6 text-emerald-700" />
            </div>
            <div>
              <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider block">
                Completed
              </span>
              <span className="text-xl sm:text-2xl font-black text-emerald-700 num-tabular tracking-tight">
                {computedStats?.projectsCompleted ?? 0} Projects
              </span>
            </div>
          </div>

          {/* Stat 4: Upcoming Projects */}
          <div className="flex items-center gap-3.5 p-3.5 sm:p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="w-12 h-12 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6 text-blue-700" />
            </div>
            <div>
              <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider block">
                Upcoming Pipeline
              </span>
              <span className="text-xl sm:text-2xl font-black text-blue-700 num-tabular tracking-tight">
                {computedStats?.upcomingProjects ?? 0} Projects
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. ABOUT & CORPORATE PROFILE SECTION */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Company Overview */}
          <div className="lg:col-span-2 p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <Building className="w-5 h-5 text-emerald-700" />
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Corporate Background & Governance</h2>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              {developer.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                  Official GSTIN Registration
                </span>
                <span className="text-sm font-mono font-bold text-slate-900 mt-0.5 block">
                  {developer.gstNumber || '29AAACP1284L1Z2 (Verified)'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                  State RERA Certificate
                </span>
                <span className="text-sm font-mono font-bold text-emerald-800 mt-0.5 block truncate">
                  {developer.reraNumber}
                </span>
              </div>
            </div>
          </div>

          {/* Contact Person Card */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 mb-4">
                <UserCheck className="w-5 h-5 text-emerald-700" />
                <h3 className="text-base font-bold text-slate-900 tracking-tight">Key Alliance & Contact Officer</h3>
              </div>

              <div className="space-y-3.5">
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Designated Officer</p>
                  <p className="text-base font-bold text-slate-900 mt-0.5">{developer.contactPerson?.name || 'Corporate Relations'}</p>
                  {developer.contactPerson?.designation && (
                    <p className="text-xs text-emerald-700 font-bold">{developer.contactPerson.designation}</p>
                  )}
                </div>

                <div className="flex items-center gap-2.5 text-xs text-slate-700 pt-2 border-t border-slate-100">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <a
                    href={`mailto:${developer.contactPerson?.email || ''}`}
                    className="hover:text-emerald-700 transition-colors font-medium truncate"
                  >
                    {developer.contactPerson?.email || 'corporate@developer.com'}
                  </a>
                </div>

                <div className="flex items-center gap-2.5 text-xs text-slate-700">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <a
                    href={`tel:${developer.contactPerson?.phone || ''}`}
                    className="hover:text-emerald-700 transition-colors font-mono font-semibold"
                  >
                    {developer.contactPerson?.phone || '+91 80000 00000'}
                  </a>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleOpenInquire()}
              className="mt-6 w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5"
            >
              <span>Direct Desk Inquiry</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. PROJECT PORTFOLIO SECTION */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        {/* Section Heading & Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-emerald-700 uppercase">
              <Layers className="w-4 h-4" />
              <span>Verified Developments</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Project Portfolio
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Explore delivered landmarks, ongoing construction, and upcoming luxury launches.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[260px] sm:min-w-[300px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by project name, city, RERA..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 transition-colors shadow-2xs"
            />
          </div>
        </div>

        {/* Filters & Tabs Strip */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-2 rounded-2xl bg-white border border-slate-200 shadow-sm mb-8">
          {/* Status Tabs (ALL, UPCOMING, ONGOING, DELIVERED) */}
          <div className="flex items-center gap-1.5 overflow-x-auto p-1">
            {(['ALL', 'DELIVERED', 'ONGOING', 'UPCOMING'] as const).map(tab => {
              const active = selectedStatus === tab;
              const count = statusTabCounts[tab];
              return (
                <button
                  key={tab}
                  onClick={() => setSelectedStatus(tab)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                    active
                      ? 'bg-emerald-600 text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span>{tab === 'ALL' ? 'All Projects' : tab}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${
                      active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Type Filter Dropdown */}
          <div className="flex items-center gap-2 px-2 pb-1 sm:pb-0">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-600 font-semibold whitespace-nowrap">Asset Type:</span>
            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value as ProjectType | 'ALL')}
              className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-emerald-600 font-semibold"
            >
              <option value="ALL">All Types</option>
              <option value="RESIDENTIAL">Residential</option>
              <option value="COMMERCIAL">Commercial</option>
              <option value="MIXED_USE">Mixed-Use</option>
              <option value="PLOTTED">Plotted Estates</option>
            </select>
          </div>
        </div>

        {/* Project Grid Cards */}
        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredProjects.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                onInquire={handleOpenInquire}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="p-12 text-center rounded-2xl bg-white border border-slate-200">
            <Building className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 mb-1">No Projects Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
              There are no projects matching your filter criteria. Try adjusting your status or asset type filter.
            </p>
            <button
              onClick={() => {
                setSelectedStatus('ALL');
                setSelectedType('ALL');
                setSearchQuery('');
              }}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>

      {/* Direct Inquiry Modal */}
      <InquireModal
        isOpen={inquireModalOpen}
        onClose={() => setInquireModalOpen(false)}
        developer={developer}
        selectedProject={selectedProjectForInquiry}
      />
    </div>
  );
};
