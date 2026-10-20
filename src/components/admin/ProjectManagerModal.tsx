import React, { useState, useEffect } from 'react';
import { Developer, Project, ProjectStatus, ProjectType } from '../../types';
import { adminApi } from '../../services/api';
import { Modal } from '../common/Modal';
import { useToast } from '../common/Toast';
import { ProjectStatusBadge, ProjectTypeBadge } from '../common/Badge';
import {
  Building,
  Plus,
  Trash2,
  Edit2,
  X,
  Layers,
  MapPin
} from 'lucide-react';

interface ProjectManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  developer: Developer | null;
  onProjectsChanged: () => void;
}

const COMMON_AMENITY_PRESETS = [
  'Swimming Pool',
  'Clubhouse',
  'Tennis Court',
  'Gym & Spa',
  'Landscaped Gardens',
  'Jogging Track',
  '24x7 Security',
  'EV Charging'
];

export const ProjectManagerModal: React.FC<ProjectManagerModalProps> = ({
  isOpen,
  onClose,
  developer,
  onProjectsChanged
}) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'add' | 'list'>('add');
  const [projectsList, setProjectsList] = useState<Project[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [type, setType] = useState<ProjectType>('RESIDENTIAL');
  const [status, setStatus] = useState<ProjectStatus>('ONGOING');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [areaMinSqFt, setAreaMinSqFt] = useState<number>(1200);
  const [areaMaxSqFt, setAreaMaxSqFt] = useState<number>(3500);
  const [totalUnits, setTotalUnits] = useState<number>(120);
  const [reraProjectId, setReraProjectId] = useState('');
  const [deliveredYear, setDeliveredYear] = useState<string>('2026');
  const [imageUrl, setImageUrl] = useState('');
  const [startingPrice, setStartingPrice] = useState('₹1.95 Cr');

  // Amenities tags
  const [amenities, setAmenities] = useState<string[]>([
    'Swimming Pool',
    'Clubhouse',
    'Tennis Court'
  ]);
  const [amenityInput, setAmenityInput] = useState('');

  // Load developer projects when modal opens or developer changes
  const loadProjects = async () => {
    if (!developer) return;
    setLoadingList(true);
    try {
      const projs = await adminApi.getDeveloperProjects(developer.id);
      setProjectsList(projs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    if (isOpen && developer) {
      loadProjects();
      setCity(developer.operatingCities[0] || 'Bengaluru');
      resetForm();
    }
  }, [isOpen, developer]);

  const resetForm = () => {
    setName('');
    setType('RESIDENTIAL');
    setStatus('ONGOING');
    setCity(developer?.operatingCities[0] || 'Bengaluru');
    setAddress('');
    setPincode('');
    setAreaMinSqFt(1200);
    setAreaMaxSqFt(3500);
    setTotalUnits(150);
    setReraProjectId('');
    setDeliveredYear('2026');
    setImageUrl('');
    setStartingPrice('₹2.25 Cr');
    setAmenities(['Swimming Pool', 'Clubhouse', 'Tennis Court']);
    setEditingProjectId(null);
  };

  const handleEditClick = (p: Project) => {
    setEditingProjectId(p.id);
    setName(p.name);
    setType(p.projectType || p.type || 'RESIDENTIAL');
    setStatus(p.status);
    setCity(p.city);
    setAddress(p.address);
    setPincode(p.pincode || '');
    setAreaMinSqFt(p.areaSqFtMin ?? p.areaMinSqFt ?? 1000);
    setAreaMaxSqFt(p.areaSqFtMax ?? p.areaMaxSqFt ?? 3000);
    setTotalUnits(p.totalUnits);
    setReraProjectId(p.reraProjectNumber || p.reraProjectId || '');
    setDeliveredYear(p.deliveredYear?.toString() || '');
    setImageUrl(p.imageUrl || '');
    setStartingPrice(p.startingPrice || '');
    setAmenities(p.amenities || []);
    setActiveTab('add');
  };

  const handleDeleteClick = async (projectId: string) => {
    if (!developer) return;
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      await adminApi.deleteProject(developer.id, projectId);
      showToast('success', 'Project Deleted', 'Project successfully removed from portfolio.');
      await loadProjects();
      onProjectsChanged();
    } catch (err: any) {
      showToast('error', 'Delete Failed', err.message);
    }
  };

  const handleAddAmenity = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    const val = amenityInput.trim();
    if (!val) return;
    if (!amenities.includes(val)) {
      setAmenities([...amenities, val]);
    }
    setAmenityInput('');
  };

  const handleRemoveAmenity = (item: string) => {
    setAmenities(amenities.filter(a => a !== item));
  };

  const togglePresetAmenity = (preset: string) => {
    if (amenities.includes(preset)) {
      setAmenities(amenities.filter(a => a !== preset));
    } else {
      setAmenities([...amenities, preset]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!developer) return;

    if (!name.trim()) {
      showToast('error', 'Validation Error', 'Project Name is required.');
      return;
    }
    if (!city.trim()) {
      showToast('error', 'Validation Error', 'City is required.');
      return;
    }
    if (!reraProjectId.trim()) {
      showToast('error', 'Validation Error', 'RERA Project Registration ID is required.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        type,
        status,
        city: city.trim(),
        address: address.trim() || `${city.trim()} Prime Corridor`,
        pincode: pincode.trim(),
        areaMinSqFt: Number(areaMinSqFt),
        areaMaxSqFt: Number(areaMaxSqFt),
        totalUnits: Number(totalUnits),
        reraProjectId: reraProjectId.trim(),
        deliveredYear: deliveredYear ? Number(deliveredYear) : undefined,
        amenities,
        imageUrl: imageUrl.trim() || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80',
        startingPrice: startingPrice.trim()
      };

      if (editingProjectId) {
        await adminApi.updateProject(developer.id, editingProjectId, payload);
        showToast('success', 'Project Updated', `${name} has been updated.`);
      } else {
        await adminApi.addProject(developer.id, payload);
        showToast('success', 'Project Added', `${name} added to ${developer.name}.`);
      }

      await loadProjects();
      onProjectsChanged();
      resetForm();
      setActiveTab('list');
    } catch (err: any) {
      showToast('error', 'Save Failed', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!developer) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Project Management Desk`}
      subtitle={`Scoped to: ${developer.name} (${developer.reraNumber})`}
      maxWidth="3xl"
    >
      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-6">
        <button
          onClick={() => {
            setActiveTab('add');
            if (!editingProjectId) resetForm();
          }}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'add'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{editingProjectId ? 'Edit Project' : '+ Add New Project'}</span>
        </button>

        <button
          onClick={() => setActiveTab('list')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'list'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Existing Portfolio ({projectsList.length})</span>
        </button>
      </div>

      {activeTab === 'list' ? (
        <div className="space-y-3">
          {loadingList ? (
            <div className="py-12 text-center text-slate-500 text-xs">Loading developer projects...</div>
          ) : projectsList.length === 0 ? (
            <div className="py-12 text-center rounded-xl bg-slate-50 border border-slate-200">
              <Building className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-900">No projects found for this developer.</p>
              <p className="text-xs text-slate-500 mt-1 mb-4">Click "Add New Project" to add the first real estate asset.</p>
              <button
                onClick={() => setActiveTab('add')}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
              >
                + Add Project
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {projectsList.map(p => (
                <div
                  key={p.id}
                  className="p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors shadow-2xs"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={p.imageUrl || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=200&q=80'}
                      alt={p.name}
                      className="w-14 h-14 rounded-lg object-cover shrink-0 border border-slate-200"
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-slate-900">{p.name}</h4>
                        <ProjectStatusBadge status={p.status} />
                        <ProjectTypeBadge type={p.projectType || p.type || 'RESIDENTIAL'} />
                      </div>
                      <p className="text-xs text-slate-600 mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{p.city} • {p.address}</span>
                      </p>
                      <p className="text-[11px] font-mono font-bold text-emerald-800 mt-1">
                        RERA: {p.reraProjectNumber || p.reraProjectId || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => handleEditClick(p)}
                      className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                      title="Edit Project"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(p.id)}
                      className="p-2 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 transition-colors"
                      title="Delete Project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Project Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Prestige Lavender Residences"
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                RERA Project Registration ID *
              </label>
              <input
                type="text"
                required
                value={reraProjectId}
                onChange={e => setReraProjectId(e.target.value)}
                placeholder="e.g. PRM/KA/RERA/1251/310/PR/230101/008899"
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-emerald-800 font-mono font-bold placeholder-slate-400 focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Project Type *
              </label>
              <select
                value={type}
                onChange={e => setType(e.target.value as ProjectType)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 font-semibold"
              >
                <option value="RESIDENTIAL">RESIDENTIAL</option>
                <option value="COMMERCIAL">COMMERCIAL</option>
                <option value="MIXED_USE">MIXED_USE</option>
                <option value="PLOTTED">PLOTTED</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Project Status *
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as ProjectStatus)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 font-bold"
              >
                <option value="UPCOMING">UPCOMING</option>
                <option value="ONGOING">ONGOING</option>
                <option value="DELIVERED">DELIVERED</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                City *
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={e => setCity(e.target.value)}
                placeholder="e.g. Bengaluru"
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Site Address
              </label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="e.g. Outer Ring Road, Bellandur"
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Pincode
              </label>
              <input
                type="text"
                value={pincode}
                onChange={e => setPincode(e.target.value)}
                placeholder="560103"
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Area Min (sq.ft.)
              </label>
              <input
                type="number"
                value={areaMinSqFt}
                onChange={e => setAreaMinSqFt(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Area Max (sq.ft.)
              </label>
              <input
                type="number"
                value={areaMaxSqFt}
                onChange={e => setAreaMaxSqFt(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Total Units *
              </label>
              <input
                type="number"
                required
                value={totalUnits}
                onChange={e => setTotalUnits(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Delivered / Est. Year
              </label>
              <input
                type="number"
                value={deliveredYear}
                onChange={e => setDeliveredYear(e.target.value)}
                placeholder="2026"
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Image URL
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Starting Price
              </label>
              <input
                type="text"
                value={startingPrice}
                onChange={e => setStartingPrice(e.target.value)}
                placeholder="e.g. ₹2.40 Cr"
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 font-semibold"
              />
            </div>
          </div>

          {/* Amenities Chips / Tag input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Amenities (Chips Input)
            </label>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex flex-wrap gap-1.5">
                {amenities.map(item => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-white text-slate-800 border border-slate-200 shadow-2xs font-medium"
                  >
                    <span>{item}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAmenity(item)}
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

              {/* Quick Presets */}
              <div className="pt-2 border-t border-slate-200 flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Presets:</span>
                {COMMON_AMENITY_PRESETS.map(preset => {
                  const active = amenities.includes(preset);
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

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                if (editingProjectId) {
                  resetForm();
                } else {
                  onClose();
                }
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
            >
              {editingProjectId ? 'Cancel Edit' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all disabled:opacity-50"
            >
              {submitting ? 'Saving Project...' : editingProjectId ? 'Update Project' : 'Save & Publish Project'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
