import React, { useState, useEffect } from 'react';
import { Developer, Project, VerificationStatus, CoreExpertise, ProjectType, ProjectStatus } from '../../types';
import { Modal } from '../common/Modal';
import { useToast } from '../common/Toast';
import { ProjectStatusBadge, ProjectTypeBadge } from '../common/Badge';
import {
  X,
  Plus,
  Building2,
  Mail,
  FileText,
  Check,
  FolderPlus,
  Edit2,
  Trash2,
  Layers,
  MapPin,
  Calendar,
  Sparkles
} from 'lucide-react';

interface DeveloperModalProps {
  isOpen: boolean;
  onClose: () => void;
  developerToEdit?: Developer | null;
  onSave: (devData: any) => Promise<void>;
}

const ALL_EXPERTISE: CoreExpertise[] = ['JV', 'JDA', 'OUTRIGHT', 'REDEVELOPMENT'];
const COMMON_AMENITIES = ['Swimming Pool', 'Clubhouse', 'Tennis Court', 'Gymnasium', 'Jogging Track', 'Co-working Lounge', 'Badminton Courts', 'Landscaped Garden'];

export const DeveloperModal: React.FC<DeveloperModalProps> = ({
  isOpen,
  onClose,
  developerToEdit,
  onSave
}) => {
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  // Developer Fields
  const [companyName, setCompanyName] = useState('');
  const [contactPersonName, setContactPersonName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [reraNumber, setReraNumber] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [description, setDescription] = useState('');
  const [establishedYear, setEstablishedYear] = useState<number>(1986);
  const [yearsOfExperience, setYearsOfExperience] = useState<number>(38);
  const [happyCustomers, setHappyCustomers] = useState<number>(50000);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('APPROVED');
  const [coreExpertise, setCoreExpertise] = useState<CoreExpertise[]>(['JV', 'JDA', 'REDEVELOPMENT']);
  const [operatingCities, setOperatingCities] = useState<string[]>(['Bangalore', 'Mumbai', 'Hyderabad']);
  const [newCityInput, setNewCityInput] = useState('');

  // Embedded Projects List (Multiple Projects per Developer)
  const [projects, setProjects] = useState<Project[]>([]);

  // Sub-modal for Add/Edit Project inside Developer
  const [projectSubModalOpen, setProjectSubModalOpen] = useState(false);
  const [editingProjectIndex, setEditingProjectIndex] = useState<number | null>(null);

  // Sub-project form fields
  const [projName, setProjName] = useState('');
  const [projDescription, setProjDescription] = useState('');
  const [projType, setProjType] = useState<ProjectType>('RESIDENTIAL');
  const [projStatus, setProjStatus] = useState<ProjectStatus>('DELIVERED');
  const [projCity, setProjCity] = useState('Bangalore');
  const [projAddress, setProjAddress] = useState('');
  const [projPincode, setProjPincode] = useState('');
  const [projAreaSqFtMin, setProjAreaSqFtMin] = useState<number>(1200);
  const [projAreaSqFtMax, setProjAreaSqFtMax] = useState<number>(4000);
  const [projTotalUnits, setProjTotalUnits] = useState<number>(3426);
  const [projReraNumber, setProjReraNumber] = useState('');
  const [projDeliveredYear, setProjDeliveredYear] = useState<string>('2020');
  const [projAmenities, setProjAmenities] = useState<string[]>(['Swimming Pool', 'Clubhouse', 'Tennis Court']);
  const [amenityInput, setAmenityInput] = useState('');

  useEffect(() => {
    if (developerToEdit) {
      setCompanyName(developerToEdit.companyName || developerToEdit.name || '');
      setContactPersonName(developerToEdit.contactPersonName || developerToEdit.contactPerson?.name || '');
      setContactEmail(developerToEdit.contactEmail || developerToEdit.contactPerson?.email || '');
      setContactPhone(developerToEdit.contactPhone || developerToEdit.contactPerson?.phone || '');
      setWebsiteUrl(developerToEdit.websiteUrl || '');
      setReraNumber(developerToEdit.reraNumber || '');
      setGstNumber(developerToEdit.gstNumber || '');
      setDescription(developerToEdit.description || '');
      setEstablishedYear(developerToEdit.establishedYear || 1986);
      setYearsOfExperience(developerToEdit.yearsOfExperience || 38);
      setHappyCustomers(developerToEdit.happyCustomers || 50000);
      setVerificationStatus(developerToEdit.verificationStatus || 'APPROVED');
      setCoreExpertise(developerToEdit.coreExpertise || ['JV', 'JDA']);
      setOperatingCities(developerToEdit.operatingCities || ['Bangalore', 'Mumbai']);
      
      // Load existing projects
      const existingProjects: Project[] = (developerToEdit.projects || []).map(p => ({
        ...p,
        projectId: p.projectId || p.id,
        projectType: p.projectType || p.type || 'RESIDENTIAL',
        areaSqFtMin: p.areaSqFtMin || p.areaMinSqFt || 1000,
        areaSqFtMax: p.areaSqFtMax || p.areaMaxSqFt || 3000,
        reraProjectNumber: p.reraProjectNumber || p.reraProjectId || '',
      }));
      setProjects(existingProjects);
    } else {
      setCompanyName('');
      setContactPersonName('');
      setContactEmail('');
      setContactPhone('');
      setWebsiteUrl('https://');
      setReraNumber('');
      setGstNumber('');
      setDescription('');
      setEstablishedYear(1995);
      setYearsOfExperience(29);
      setHappyCustomers(25000);
      setVerificationStatus('APPROVED');
      setCoreExpertise(['JV', 'JDA', 'REDEVELOPMENT']);
      setOperatingCities(['Bangalore', 'Mumbai']);
      setProjects([]);
    }
  }, [developerToEdit, isOpen]);

  const toggleExpertise = (exp: CoreExpertise) => {
    if (coreExpertise.includes(exp)) {
      if (coreExpertise.length === 1) return;
      setCoreExpertise(coreExpertise.filter(item => item !== exp));
    } else {
      setCoreExpertise([...coreExpertise, exp]);
    }
  };

  const handleAddCity = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    const trimmed = newCityInput.trim();
    if (!trimmed) return;
    if (!operatingCities.includes(trimmed)) {
      setOperatingCities([...operatingCities, trimmed]);
    }
    setNewCityInput('');
  };

  const handleRemoveCity = (city: string) => {
    if (operatingCities.length === 1) return;
    setOperatingCities(operatingCities.filter(c => c !== city));
  };

  // Open Sub-Project Modal
  const openAddProjectModal = () => {
    setEditingProjectIndex(null);
    setProjName('');
    setProjDescription('');
    setProjType('RESIDENTIAL');
    setProjStatus('DELIVERED');
    setProjCity(operatingCities[0] || 'Bangalore');
    setProjAddress('');
    setProjPincode('');
    setProjAreaSqFtMin(1200);
    setProjAreaSqFtMax(4000);
    setProjTotalUnits(500);
    setProjReraNumber('');
    setProjDeliveredYear('2022');
    setProjAmenities(['Swimming Pool', 'Clubhouse', 'Tennis Court']);
    setProjectSubModalOpen(true);
  };

  const openEditProjectModal = (idx: number) => {
    const p = projects[idx];
    setEditingProjectIndex(idx);
    setProjName(p.name);
    setProjDescription(p.description || '');
    setProjType(p.projectType || p.type || 'RESIDENTIAL');
    setProjStatus(p.status);
    setProjCity(p.city);
    setProjAddress(p.address || '');
    setProjPincode(p.pincode || '');
    setProjAreaSqFtMin(p.areaSqFtMin || p.areaMinSqFt || 1000);
    setProjAreaSqFtMax(p.areaSqFtMax || p.areaMaxSqFt || 3000);
    setProjTotalUnits(p.totalUnits || 100);
    setProjReraNumber(p.reraProjectNumber || p.reraProjectId || '');
    setProjDeliveredYear(p.deliveredYear ? p.deliveredYear.toString() : '');
    setProjAmenities(p.amenities || []);
    setProjectSubModalOpen(true);
  };

  const handleDeleteProject = (idx: number) => {
    setProjects(projects.filter((_, i) => i !== idx));
  };

  const handleSaveSubProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projName.trim() || !projCity.trim()) {
      showToast('error', 'Validation Error', 'Project name and city are required.');
      return;
    }

    const projId = editingProjectIndex !== null ? projects[editingProjectIndex].id : `proj-${Date.now()}`;
    const newProject: Project = {
      id: projId,
      projectId: projId,
      name: projName.trim(),
      description: projDescription.trim(),
      type: projType,
      projectType: projType,
      status: projStatus,
      city: projCity.trim(),
      address: projAddress.trim() || `${projCity.trim()} Prime Corridor`,
      pincode: projPincode.trim(),
      areaSqFtMin: Number(projAreaSqFtMin),
      areaSqFtMax: Number(projAreaSqFtMax),
      areaMinSqFt: Number(projAreaSqFtMin),
      areaMaxSqFt: Number(projAreaSqFtMax),
      totalUnits: Number(projTotalUnits),
      reraProjectNumber: projReraNumber.trim() || `PRM/KA/RERA/${Date.now()}`,
      reraProjectId: projReraNumber.trim() || `PRM/KA/RERA/${Date.now()}`,
      deliveredYear: projDeliveredYear ? Number(projDeliveredYear) : null,
      amenities: projAmenities,
      createdAt: new Date().toISOString()
    };

    if (editingProjectIndex !== null) {
      const updated = [...projects];
      updated[editingProjectIndex] = newProject;
      setProjects(updated);
      showToast('success', 'Project Updated in Form', projName);
    } else {
      setProjects([...projects, newProject]);
      showToast('success', 'Project Added to Developer', projName);
    }
    setProjectSubModalOpen(false);
  };

  const handleAddAmenity = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    const val = amenityInput.trim();
    if (val && !projAmenities.includes(val)) {
      setProjAmenities([...projAmenities, val]);
      setAmenityInput('');
    }
  };

  const togglePresetAmenity = (amenity: string) => {
    if (projAmenities.includes(amenity)) {
      setProjAmenities(projAmenities.filter(a => a !== amenity));
    } else {
      setProjAmenities([...projAmenities, amenity]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) {
      showToast('error', 'Validation Error', 'Company Name is required.');
      return;
    }
    if (!reraNumber.trim()) {
      showToast('error', 'Validation Error', 'RERA Registration Number is required.');
      return;
    }

    setSubmitting(true);
    try {
      const profileId = developerToEdit ? developerToEdit.id : `dev-${Date.now()}`;
      const completedCount = projects.filter(p => p.status === 'DELIVERED').length;
      const upcomingCount = projects.filter(p => p.status === 'UPCOMING').length;

      // Exact user-specified JSON Schema payload!
      const payload = {
        profileId,
        id: profileId,
        name: companyName.trim(),
        companyName: companyName.trim(),
        contactPersonName: contactPersonName.trim() || 'Authorized Representative',
        contactEmail: contactEmail.trim() || 'contact@developer.com',
        contactPhone: contactPhone.trim() || '+919876543210',
        websiteUrl: websiteUrl.trim(),
        reraNumber: reraNumber.trim(),
        gstNumber: gstNumber.trim(),
        description: description.trim(),
        establishedYear: Number(establishedYear),
        coreExpertise,
        operatingCities,
        verificationStatus,
        yearsOfExperience: Number(yearsOfExperience),
        happyCustomers: Number(happyCustomers),
        happyCustomersCount: `${Number(happyCustomers).toLocaleString()}+ Families`,
        projectsCompleted: completedCount,
        upcomingProjects: upcomingCount,
        contactPerson: {
          name: contactPersonName.trim() || 'Authorized Representative',
          email: contactEmail.trim() || 'contact@developer.com',
          phone: contactPhone.trim() || '+919876543210'
        },
        projects,
        createdAt: developerToEdit?.createdAt || new Date().toISOString()
      };

      await onSave(payload);
      onClose();
    } catch (err: any) {
      showToast('error', 'Save Failed', err.message || 'Could not save developer.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={developerToEdit ? `Edit Developer: ${developerToEdit.companyName || developerToEdit.name}` : 'Register New Real Estate Developer'}
        subtitle="Manage developer profile, legal RERA credentials, and associated multiple projects"
        maxWidth="4xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Developer Core Information */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 pb-1 border-b border-slate-100 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              <span>Developer Profile & Legal Details</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Company Name (companyName) *
                </label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  placeholder="e.g. Prestige Group"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  RERA Registration Number (reraNumber) *
                </label>
                <input
                  type="text"
                  required
                  value={reraNumber}
                  onChange={e => setReraNumber(e.target.value)}
                  placeholder="e.g. PRM/KA/RERA/1251/310/PR/170915/000123"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-emerald-800 font-mono font-bold placeholder-slate-400 focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  GST Number (gstNumber)
                </label>
                <input
                  type="text"
                  value={gstNumber}
                  onChange={e => setGstNumber(e.target.value)}
                  placeholder="29AAAAA0000A1Z5"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-800 font-mono placeholder-slate-400 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Website URL (websiteUrl)
                </label>
                <input
                  type="url"
                  value={websiteUrl}
                  onChange={e => setWebsiteUrl(e.target.value)}
                  placeholder="https://www.prestigeconstructions.com"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Verification Status (verificationStatus) *
                </label>
                <select
                  value={verificationStatus}
                  onChange={e => setVerificationStatus(e.target.value as VerificationStatus)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 font-bold"
                >
                  <option value="APPROVED">APPROVED (Verified)</option>
                  <option value="PENDING">PENDING (Review)</option>
                  <option value="REJECTED">REJECTED (Inactive)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Company Description (description)
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Leading real estate developer with luxury residential and commercial developments."
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-600 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Established Year (establishedYear)
                </label>
                <input
                  type="number"
                  value={establishedYear}
                  onChange={e => setEstablishedYear(Number(e.target.value))}
                  min={1850}
                  max={2030}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Years of Experience (yearsOfExperience)
                </label>
                <input
                  type="number"
                  value={yearsOfExperience}
                  onChange={e => setYearsOfExperience(Number(e.target.value))}
                  min={0}
                  max={150}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Happy Customers (happyCustomers)
                </label>
                <input
                  type="number"
                  value={happyCustomers}
                  onChange={e => setHappyCustomers(Number(e.target.value))}
                  placeholder="50000"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Contact Officer */}
          <div className="space-y-4 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 pb-1 border-b border-slate-100 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              <span>Contact Officer Details</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Contact Person Name (contactPersonName)
                </label>
                <input
                  type="text"
                  value={contactPersonName}
                  onChange={e => setContactPersonName(e.target.value)}
                  placeholder="Rajesh Kumar"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Contact Email (contactEmail)
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={e => setContactEmail(e.target.value)}
                  placeholder="contact@prestige.com"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Contact Phone (contactPhone)
                </label>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={e => setContactPhone(e.target.value)}
                  placeholder="+919876543210"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Core Expertise & Operating Cities */}
          <div className="space-y-4 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 pb-1 border-b border-slate-100 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              <span>Expertise & Operating Metros</span>
            </h4>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Core Expertise Models (coreExpertise)
              </label>
              <div className="flex flex-wrap gap-2">
                {ALL_EXPERTISE.map(exp => {
                  const isSelected = coreExpertise.includes(exp);
                  return (
                    <button
                      key={exp}
                      type="button"
                      onClick={() => toggleExpertise(exp)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border ${
                        isSelected
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                      <span>{exp}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Operating Cities (operatingCities)
              </label>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {operatingCities.map(city => (
                    <span
                      key={city}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-white text-slate-800 border border-slate-200 shadow-2xs font-semibold"
                    >
                      <span>{city}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCity(city)}
                        className="text-slate-400 hover:text-rose-600 ml-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newCityInput}
                    onChange={e => setNewCityInput(e.target.value)}
                    onKeyDown={handleAddCity}
                    placeholder="Type city name and press Enter..."
                    className="flex-1 bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600"
                  />
                  <button
                    type="button"
                    onClick={handleAddCity}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add City</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: MULTIPLE ASSOCIATED PROJECTS (Project List & Add Button) */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                <span>Associated Projects ({projects.length})</span>
              </h4>

              {/* Add Project Button */}
              <button
                type="button"
                onClick={openAddProjectModal}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span>+ Add Project</span>
              </button>
            </div>

            {/* List of Multiple Projects */}
            {projects.length === 0 ? (
              <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <p className="text-xs text-slate-500 font-medium">No projects added yet for this developer.</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Click the "+ Add Project" button above to add residential, commercial, or plotted developments.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                {projects.map((proj, idx) => (
                  <div
                    key={proj.id || idx}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 flex flex-col justify-between transition-colors shadow-2xs"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-xs text-slate-900 truncate">{proj.name}</span>
                        <div className="flex items-center gap-1 shrink-0">
                          <ProjectStatusBadge status={proj.status} />
                          <ProjectTypeBadge type={proj.projectType || proj.type || 'RESIDENTIAL'} />
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                        {proj.description || `${proj.city} • ${proj.address}`}
                      </p>

                      <div className="flex items-center justify-between text-[11px] text-slate-600 mt-2 font-medium">
                        <span>Units: {proj.totalUnits}</span>
                        <span>{proj.areaSqFtMin || proj.areaMinSqFt} - {proj.areaSqFtMax || proj.areaMaxSqFt} sq.ft.</span>
                        <span>{proj.deliveredYear ? `Year: ${proj.deliveredYear}` : 'Upcoming'}</span>
                      </div>

                      <p className="text-[10px] font-mono font-bold text-emerald-800 mt-1 truncate">
                        RERA: {proj.reraProjectNumber || proj.reraProjectId}
                      </p>
                    </div>

                    <div className="flex items-center justify-end gap-1.5 pt-2 mt-2 border-t border-slate-200/80">
                      <button
                        type="button"
                        onClick={() => openEditProjectModal(idx)}
                        className="px-2 py-1 rounded bg-white hover:bg-slate-100 text-[11px] font-bold text-slate-700 border border-slate-200 flex items-center gap-1"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteProject(idx)}
                        className="p-1 rounded bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200"
                        title="Delete Project"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Modal Footer Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all disabled:opacity-50"
            >
              {submitting ? 'Saving Developer...' : developerToEdit ? 'Update Developer' : 'Save Developer Profile'}
            </button>
          </div>
        </form>
      </Modal>

      {/* SUB-MODAL: Add / Edit Single Project inside Developer */}
      <Modal
        isOpen={projectSubModalOpen}
        onClose={() => setProjectSubModalOpen(false)}
        title={editingProjectIndex !== null ? `Edit Project: ${projName}` : 'Add Project to Developer'}
        subtitle={`Scoped to ${companyName || 'Developer'}`}
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveSubProject} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Project Name (name) *
              </label>
              <input
                type="text"
                required
                value={projName}
                onChange={e => setProjName(e.target.value)}
                placeholder="Prestige Lakeside Habitat"
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                RERA Project Number (reraProjectNumber) *
              </label>
              <input
                type="text"
                required
                value={projReraNumber}
                onChange={e => setProjReraNumber(e.target.value)}
                placeholder="PRM/KA/RERA/1251/310/PR/170915/000176"
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-emerald-800 font-mono font-bold focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Project Description (description)
            </label>
            <textarea
              rows={2}
              value={projDescription}
              onChange={e => setProjDescription(e.target.value)}
              placeholder="Sprawling luxury township overlooking Varthur Lake."
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Project Type (projectType) *
              </label>
              <select
                value={projType}
                onChange={e => setProjType(e.target.value as ProjectType)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 font-bold"
              >
                <option value="RESIDENTIAL">RESIDENTIAL</option>
                <option value="COMMERCIAL">COMMERCIAL</option>
                <option value="MIXED_USE">MIXED_USE</option>
                <option value="PLOTTED">PLOTTED</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Project Status (status) *
              </label>
              <select
                value={projStatus}
                onChange={e => setProjStatus(e.target.value as ProjectStatus)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 font-bold"
              >
                <option value="DELIVERED">DELIVERED</option>
                <option value="ONGOING">ONGOING</option>
                <option value="UPCOMING">UPCOMING</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                City (city) *
              </label>
              <input
                type="text"
                required
                value={projCity}
                onChange={e => setProjCity(e.target.value)}
                placeholder="Bangalore"
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Site Address (address)
              </label>
              <input
                type="text"
                value={projAddress}
                onChange={e => setProjAddress(e.target.value)}
                placeholder="Whitefield-Sarjapur Road"
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Pincode (pincode)
              </label>
              <input
                type="text"
                value={projPincode}
                onChange={e => setProjPincode(e.target.value)}
                placeholder="560087"
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Area Min (areaSqFtMin)
              </label>
              <input
                type="number"
                value={projAreaSqFtMin}
                onChange={e => setProjAreaSqFtMin(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Area Max (areaSqFtMax)
              </label>
              <input
                type="number"
                value={projAreaSqFtMax}
                onChange={e => setProjAreaSqFtMax(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Total Units (totalUnits)
              </label>
              <input
                type="number"
                value={projTotalUnits}
                onChange={e => setProjTotalUnits(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Delivered Year (deliveredYear)
              </label>
              <input
                type="number"
                value={projDeliveredYear}
                onChange={e => setProjDeliveredYear(e.target.value)}
                placeholder="2020"
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          {/* Amenities Chips Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Amenities (amenities)
            </label>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex flex-wrap gap-1.5">
                {projAmenities.map(amenity => (
                  <span
                    key={amenity}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-white text-slate-800 border border-slate-200 shadow-2xs font-semibold"
                  >
                    <span>{amenity}</span>
                    <button
                      type="button"
                      onClick={() => setProjAmenities(projAmenities.filter(a => a !== amenity))}
                      className="text-slate-400 hover:text-rose-600 ml-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={amenityInput}
                  onChange={e => setAmenityInput(e.target.value)}
                  onKeyDown={handleAddAmenity}
                  placeholder="Type amenity and press Enter..."
                  className="flex-1 bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600"
                />
                <button
                  type="button"
                  onClick={handleAddAmenity}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add</span>
                </button>
              </div>

              {/* Quick Preset Buttons */}
              <div className="pt-2 border-t border-slate-200 flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Presets:</span>
                {COMMON_AMENITIES.map(preset => {
                  const active = projAmenities.includes(preset);
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => togglePresetAmenity(preset)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                        active
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {active ? '✓ ' : '+ '}{preset}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setProjectSubModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm"
            >
              {editingProjectIndex !== null ? 'Save Project Changes' : 'Confirm & Add Project'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};
