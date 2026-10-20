import React, { useState, useEffect, useCallback } from 'react';
import { Developer, AdminStats } from '../../types';
import { adminApi } from '../../services/api';
import { StatsCards } from './StatsCards';
import { DeveloperTable } from './DeveloperTable';
import { DeveloperModal } from './DeveloperModal';
import { ProjectManagerModal } from './ProjectManagerModal';
import { Modal } from '../common/Modal';
import { useToast } from '../common/Toast';
import { ShieldCheck, RefreshCw, AlertTriangle, Trash2 } from 'lucide-react';
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

  const [stats, setStats] = useState<AdminStats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals state
  const [devModalOpen, setDevModalOpen] = useState(false);
  const [developerToEdit, setDeveloperToEdit] = useState<Developer | null>(null);

  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [selectedDeveloperForProjects, setSelectedDeveloperForProjects] = useState<Developer | null>(null);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [developerToDelete, setDeveloperToDelete] = useState<Developer | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsData, devsData] = await Promise.all([
        adminApi.getStats(),
        adminApi.getDevelopers(statusFilter as any)
      ]);
      setStats(statsData);
      setDevelopers(devsData);
    } catch (err: any) {
      showToast('error', 'Failed to load Admin data', err.message);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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

  const handleConfirmDelete = async () => {
    if (!developerToDelete) return;
    setDeleting(true);
    try {
      await adminApi.deleteDeveloper(developerToDelete.id);
      showToast('success', 'Developer Deleted', `${developerToDelete.name} has been removed.`);
      setDeleteModalOpen(false);
      setDeveloperToDelete(null);
      await loadData();
    } catch (err: any) {
      showToast('error', 'Delete Failed', err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Banner / Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-emerald-700 uppercase">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Developer Regulatory Registry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Admin Management Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Validate state RERA credentials, manage real estate developer portfolios, and oversee compliance statuses.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
          {adminUser && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-semibold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
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

      {/* 1. TOP METRIC CARDS */}
      <StatsCards
        stats={stats}
        selectedFilter={statusFilter}
        onFilterSelect={setStatusFilter}
      />

      {/* 2. DEVELOPER MANAGEMENT TABLE */}
      <DeveloperTable
        developers={developers}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
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
          setDeleteModalOpen(true);
        }}
      />

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

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
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
              onClick={() => setDeleteModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDelete}
              disabled={deleting}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{deleting ? 'Deleting...' : 'Confirm & Delete'}</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
