import React, { useState, useEffect, useCallback } from 'react';
import { Developer, AdminStats } from '../../types';
import { LandParcelResponse, LandParcelStatus } from '../../types/land';
import { adminApi } from '../../services/api';
import { landApi } from '../../services/landApi';
import { StatsCards } from './StatsCards';
import { DeveloperTable } from './DeveloperTable';
import { DeveloperModal } from './DeveloperModal';
import { ProjectManagerModal } from './ProjectManagerModal';
import { LandStatsCards } from './LandStatsCards';
import { LandParcelsTable } from './LandParcelsTable';
import { LandParcelDetailModal } from './LandParcelDetailModal';
import { Modal } from '../common/Modal';
import { useToast } from '../common/Toast';
import {
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
  Trash2,
  Building2,
  Layers
} from 'lucide-react';
import { AdminUser } from '../../services/auth';

interface AdminDashboardProps {
  onViewPublicProfile: (developerId: string) => void;
  adminUser?: AdminUser;
  onLogout?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onViewPublicProfile,
  adminUser,
  onLogout
}) => {
  const { showToast } = useToast();

  // Active Section Tab: 'developers' vs 'lands'
  const [activeTab, setActiveTab] = useState<'developers' | 'lands'>('developers');

  // Developer state
  const [stats, setStats] = useState<AdminStats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [devStatusFilter, setDevStatusFilter] = useState<string>('ALL');

  // Land Submissions state
  const [parcels, setParcels] = useState<LandParcelResponse[]>([]);
  const [landStatusFilter, setLandStatusFilter] = useState<string>('ALL');
  const [selectedParcelForDetail, setSelectedParcelForDetail] = useState<LandParcelResponse | null>(null);

  // Common loading state
  const [loading, setLoading] = useState(true);

  // Modals for Developer
  const [devModalOpen, setDevModalOpen] = useState(false);
  const [developerToEdit, setDeveloperToEdit] = useState<Developer | null>(null);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [selectedDeveloperForProjects, setSelectedDeveloperForProjects] = useState<Developer | null>(null);
  const [deleteDevModalOpen, setDeleteDevModalOpen] = useState(false);
  const [developerToDelete, setDeveloperToDelete] = useState<Developer | null>(null);
  const [deletingDev, setDeletingDev] = useState(false);

  // Modals for Land Parcel
  const [deleteParcelModalOpen, setDeleteParcelModalOpen] = useState(false);
  const [parcelToDelete, setParcelToDelete] = useState<LandParcelResponse | null>(null);
  const [deletingParcel, setDeletingParcel] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsData, devsData, landsData] = await Promise.all([
        adminApi.getStats(),
        adminApi.getDevelopers(devStatusFilter as any),
        landApi.getAllLands()
      ]);
      setStats(statsData);
      setDevelopers(devsData);
      setParcels(landsData);
    } catch (err: any) {
      showToast('error', 'Failed to load Admin data', err.message);
    } finally {
      setLoading(false);
    }
  }, [devStatusFilter, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Developer Handlers
  const handleCreateOrUpdateDeveloper = async (formData: any) => {
    if (developerToEdit) {
      await adminApi.updateDeveloper(developerToEdit.id, formData);
      showToast('success', 'Developer Updated', `${formData.name} was successfully updated.`);
    } else {
      const created = await adminApi.createDeveloper(formData);
      showToast('success', 'Developer Created', `${created.name} registered under ${created.reraNumber}`);
    }
    await loadData();
  };

  const handleConfirmDeleteDeveloper = async () => {
    if (!developerToDelete) return;
    setDeletingDev(true);
    try {
      await adminApi.deleteDeveloper(developerToDelete.id);
      showToast('success', 'Developer Deleted', `${developerToDelete.name} has been removed.`);
      setDeleteDevModalOpen(false);
      setDeveloperToDelete(null);
      await loadData();
    } catch (err: any) {
      showToast('error', 'Delete Failed', err.message);
    } finally {
      setDeletingDev(false);
    }
  };

  // Land Parcel Handlers
  const handleQuickUpdateParcelStatus = async (
    parcel: LandParcelResponse,
    newStatus: LandParcelStatus
  ) => {
    try {
      const updated = await landApi.updateLandStatus(parcel.id, newStatus);
      showToast('success', 'Status Updated', `Parcel "${parcel.title}" marked as ${newStatus}.`);
      setParcels(prev => prev.map(p => (p.id === parcel.id ? updated : p)));
    } catch (err: any) {
      showToast('error', 'Update Failed', err.message || 'Could not update status.');
    }
  };

  const handleSaveParcelDetailAndNotes = async (
    id: string,
    status: LandParcelStatus,
    notes: string
  ) => {
    try {
      const updated = await landApi.updateLandStatus(id, status, notes);
      showToast('success', 'Review Saved', `Parcel updated to ${status} with reviewer remarks.`);
      setParcels(prev => prev.map(p => (p.id === id ? updated : p)));
    } catch (err: any) {
      showToast('error', 'Update Failed', err.message || 'Could not save review.');
    }
  };

  const handleConfirmDeleteParcel = async () => {
    if (!parcelToDelete) return;
    setDeletingParcel(true);
    try {
      await landApi.deleteLand(parcelToDelete.id);
      showToast('success', 'Parcel Removed', `Parcel "${parcelToDelete.title}" has been removed.`);
      setDeleteParcelModalOpen(false);
      setParcelToDelete(null);
      setParcels(prev => prev.filter(p => p.id !== parcelToDelete.id));
    } catch (err: any) {
      showToast('error', 'Delete Failed', err.message || 'Could not delete parcel.');
    } finally {
      setDeletingParcel(false);
    }
  };

  const pendingParcelsCount = parcels.filter(p => p.status === 'PENDING_REVIEW').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Banner / Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-emerald-700 uppercase">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>EstateHub Alliance Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Admin Management Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Validate state RERA credentials, oversee user land parcel submissions, and orchestrate developer alliances.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
          {adminUser && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-semibold shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="truncate max-w-[150px] sm:max-w-none">{adminUser.email}</span>
            </div>
          )}

          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:border-slate-400 text-xs font-bold text-slate-700 hover:text-slate-900 transition-colors shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
            <span>Refresh Records</span>
          </button>
        </div>
      </div>

      {/* SECTION TABS: Developers Registry vs Land Submissions */}
      <div className="flex items-center gap-3 mb-8 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('developers')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'developers'
              ? 'bg-slate-900 text-white shadow-sm ring-1 ring-slate-900'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Building2 className={`w-4 h-4 ${activeTab === 'developers' ? 'text-emerald-400' : 'text-slate-500'}`} />
          <span>Developers Registry</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
              activeTab === 'developers' ? 'bg-slate-800 text-emerald-400' : 'bg-slate-100 text-slate-700'
            }`}
          >
            {developers.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('lands')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'lands'
              ? 'bg-slate-900 text-white shadow-sm ring-1 ring-slate-900'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Layers className={`w-4 h-4 ${activeTab === 'lands' ? 'text-emerald-400' : 'text-slate-500'}`} />
          <span>Land Submissions</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
              activeTab === 'lands' ? 'bg-slate-800 text-emerald-400' : 'bg-slate-100 text-slate-700'
            }`}
          >
            {parcels.length}
          </span>
          {pendingParcelsCount > 0 && (
            <span
              className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-slate-900 animate-pulse"
              title={`${pendingParcelsCount} submissions pending review`}
            >
              {pendingParcelsCount} Pending
            </span>
          )}
        </button>
      </div>

      {/* VIEW 1: DEVELOPERS REGISTRY */}
      {activeTab === 'developers' && (
        <>
          {/* Top Metric Cards for Developers */}
          <StatsCards
            stats={stats}
            selectedFilter={devStatusFilter}
            onFilterSelect={setDevStatusFilter}
          />

          {/* Developer Management Table */}
          <DeveloperTable
            developers={developers}
            statusFilter={devStatusFilter}
            onStatusFilterChange={setDevStatusFilter}
            onAddNewDeveloper={() => {
              setDeveloperToEdit(null);
              setDevModalOpen(true);
            }}
            onViewProfile={onViewPublicProfile}
            onManageProjects={dev => {
              setSelectedDeveloperForProjects(dev);
              setProjectModalOpen(true);
            }}
            onEditDeveloper={dev => {
              setDeveloperToEdit(dev);
              setDevModalOpen(true);
            }}
            onDeleteDeveloper={dev => {
              setDeveloperToDelete(dev);
              setDeleteDevModalOpen(true);
            }}
          />
        </>
      )}

      {/* VIEW 2: USER LAND SUBMISSIONS */}
      {activeTab === 'lands' && (
        <>
          {/* Top Metric Cards for Lands */}
          <LandStatsCards
            parcels={parcels}
            selectedFilter={landStatusFilter}
            onFilterSelect={setLandStatusFilter}
          />

          {/* Land Parcels Table */}
          <LandParcelsTable
            parcels={parcels}
            statusFilter={landStatusFilter}
            onStatusFilterChange={setLandStatusFilter}
            onViewParcel={parcel => setSelectedParcelForDetail(parcel)}
            onUpdateStatus={handleQuickUpdateParcelStatus}
            onDeleteParcel={parcel => {
              setParcelToDelete(parcel);
              setDeleteParcelModalOpen(true);
            }}
          />
        </>
      )}

      {/* MODAL 1: Create / Edit Developer Modal */}
      <DeveloperModal
        isOpen={devModalOpen}
        onClose={() => setDevModalOpen(false)}
        developerToEdit={developerToEdit}
        onSave={handleCreateOrUpdateDeveloper}
      />

      {/* MODAL 2: Add / Manage Projects Modal (Scoped to Developer) */}
      <ProjectManagerModal
        isOpen={projectModalOpen}
        onClose={() => setProjectModalOpen(false)}
        developer={selectedDeveloperForProjects}
        onProjectsChanged={loadData}
      />

      {/* MODAL 3: Land Parcel Inspection & Regulatory Review Modal */}
      <LandParcelDetailModal
        parcel={selectedParcelForDetail}
        onClose={() => setSelectedParcelForDetail(null)}
        onUpdateStatusAndNotes={handleSaveParcelDetailAndNotes}
      />

      {/* Delete Developer Confirmation Modal */}
      <Modal
        isOpen={deleteDevModalOpen}
        onClose={() => setDeleteDevModalOpen(false)}
        title="Confirm Developer Removal"
        subtitle="This action cannot be undone"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-900 leading-relaxed">
              Are you sure you want to delete <strong className="font-bold">{developerToDelete?.name}</strong>?
              All associated projects and portfolio items will be cascade deleted from the database.
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              onClick={() => setDeleteDevModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDeleteDeveloper}
              disabled={deletingDev}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{deletingDev ? 'Deleting...' : 'Confirm & Delete'}</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Land Parcel Confirmation Modal */}
      <Modal
        isOpen={deleteParcelModalOpen}
        onClose={() => setDeleteParcelModalOpen(false)}
        title="Confirm Parcel Removal"
        subtitle="This action cannot be undone"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-900 leading-relaxed">
              Are you sure you want to delete <strong className="font-bold">{parcelToDelete?.title}</strong>?
              This land submission will be permanently removed from the alliance registry.
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              onClick={() => setDeleteParcelModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDeleteParcel}
              disabled={deletingParcel}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{deletingParcel ? 'Deleting...' : 'Confirm & Delete'}</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
