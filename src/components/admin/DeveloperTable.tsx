import React, { useState } from 'react';
import { Developer } from '../../types';
import { VerificationBadge } from '../common/Badge';
import {
  Plus,
  Search,
  Filter,
  Eye,
  FolderPlus,
  Edit,
  Trash2,
  Building2
} from 'lucide-react';

interface DeveloperTableProps {
  developers: Developer[];
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  onAddNewDeveloper: () => void;
  onViewProfile: (devId: string) => void;
  onManageProjects: (dev: Developer) => void;
  onEditDeveloper: (dev: Developer) => void;
  onDeleteDeveloper: (dev: Developer) => void;
}

export const DeveloperTable: React.FC<DeveloperTableProps> = ({
  developers,
  statusFilter,
  onStatusFilterChange,
  onAddNewDeveloper,
  onViewProfile,
  onManageProjects,
  onEditDeveloper,
  onDeleteDeveloper
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = developers.filter(dev => {
    // Status filter
    if (statusFilter !== 'ALL' && dev.verificationStatus !== statusFilter) {
      return false;
    }
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = dev.name.toLowerCase().includes(q);
      const matchRera = dev.reraNumber.toLowerCase().includes(q);
      const matchCity = dev.operatingCities.some(c => c.toLowerCase().includes(q));
      return matchName || matchRera || matchCity;
    }
    return true;
  });

  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Left: Search & Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 max-w-2xl">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search developers by name, RERA, city..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition-colors"
            />
          </div>

          {/* Status Filter Dropdown */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={statusFilter}
              onChange={e => onStatusFilterChange(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-emerald-600 font-bold"
            >
              <option value="ALL">Status: All Developers</option>
              <option value="APPROVED">Status: APPROVED</option>
              <option value="PENDING">Status: PENDING</option>
              <option value="REJECTED">Status: REJECTED</option>
            </select>
          </div>
        </div>

        {/* Top Button: + Add New Developer */}
        <button
          onClick={onAddNewDeveloper}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add New Developer</span>
        </button>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-5">Company Name</th>
              <th className="py-3.5 px-4">RERA Number</th>
              <th className="py-3.5 px-4">Operating Cities</th>
              <th className="py-3.5 px-4 text-center">Verification Status</th>
              <th className="py-3.5 px-4 text-center">Total Projects</th>
              <th className="py-3.5 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {filtered.map(dev => {
              const projectCount = dev.projects ? dev.projects.length : 0;
              return (
                <tr
                  key={dev.id}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  {/* Company Name */}
                  <td className="py-4 px-5">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0 text-emerald-800 font-bold text-sm">
                        {dev.name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors block">
                          {dev.name}
                        </span>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5 font-medium">
                          <span>Est. {dev.establishedYear}</span>
                          <span>•</span>
                          <span>{dev.contactPerson?.name || 'Authorized Desk'}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* RERA Number */}
                  <td className="py-4 px-4 font-mono text-[11px] text-slate-700">
                    <span className="px-2 py-1 rounded bg-slate-50 border border-slate-200 inline-block font-semibold">
                      {dev.reraNumber}
                    </span>
                  </td>

                  {/* Operating Cities */}
                  <td className="py-4 px-4 max-w-[200px]">
                    <div className="flex flex-wrap gap-1">
                      {dev.operatingCities.slice(0, 2).map((city, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-700 border border-slate-200 font-medium"
                        >
                          {city}
                        </span>
                      ))}
                      {dev.operatingCities.length > 2 && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-500 font-medium">
                          +{dev.operatingCities.length - 2}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Verification Status badge */}
                  <td className="py-4 px-4 text-center">
                    <VerificationBadge status={dev.verificationStatus} />
                  </td>

                  {/* Total Projects */}
                  <td className="py-4 px-4 text-center">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 border border-slate-200 text-slate-800 num-tabular">
                      {projectCount} {projectCount === 1 ? 'Project' : 'Projects'}
                    </span>
                  </td>

                  {/* Actions: View Profile, Add Project, Edit, Delete */}
                  <td className="py-4 px-5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* View Profile */}
                      <button
                        onClick={() => onViewProfile(dev.id)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 transition-colors"
                        title="View Public Profile Showcase"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {/* Add / Manage Projects */}
                      <button
                        onClick={() => onManageProjects(dev)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-800 border border-slate-200 hover:border-blue-300 transition-colors flex items-center gap-1 text-[11px] font-bold"
                        title="Add / Manage Projects Scoped to Developer"
                      >
                        <FolderPlus className="w-3.5 h-3.5 text-blue-600" />
                        <span className="hidden xl:inline">Projects</span>
                      </button>

                      {/* Edit Developer */}
                      <button
                        onClick={() => onEditDeveloper(dev)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 transition-colors"
                        title="Edit Developer Profile"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete Developer */}
                      <button
                        onClick={() => onDeleteDeveloper(dev)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-700 border border-slate-200 hover:border-rose-300 transition-colors"
                        title="Delete Developer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="p-12 text-center">
          <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 mb-1">No Developers Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            No developers match your status filter or search parameters.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              onStatusFilterChange('ALL');
            }}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 border border-slate-200"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};
