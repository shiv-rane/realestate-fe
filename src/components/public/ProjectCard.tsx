import React, { useState } from 'react';
import { Project } from '../../types';
import { ProjectStatusBadge, ProjectTypeBadge } from '../common/Badge';
import { MapPin, Copy, Check, Sparkles } from 'lucide-react';
import { useToast } from '../common/Toast';

interface ProjectCardProps {
  project: Project;
  onInquire?: (project: Project) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onInquire }) => {
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  const reraNum = project.reraProjectNumber || project.reraProjectId || '';
  const minArea = project.areaSqFtMin ?? project.areaMinSqFt ?? 1000;
  const maxArea = project.areaSqFtMax ?? project.areaMaxSqFt ?? 3000;
  const projType = project.projectType || project.type || 'RESIDENTIAL';

  const handleCopyRera = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(reraNum);
    setCopied(true);
    showToast('success', 'RERA Number Copied', reraNum);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedArea = `${minArea.toLocaleString()} - ${maxArea.toLocaleString()} sq.ft.`;

  return (
    <div className="group rounded-2xl bg-white border border-slate-200 hover:border-emerald-500/50 transition-all duration-300 shadow-sm hover:shadow-xl flex flex-col overflow-hidden">
      {/* Project Image Banner */}
      <div className="relative h-52 sm:h-56 w-full overflow-hidden bg-slate-100">
        <img
          src={project.imageUrl || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80'}
          alt={project.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          <ProjectStatusBadge status={project.status} />
          <ProjectTypeBadge type={projType} />
        </div>

        {/* Starting Price Pill */}
        {project.startingPrice && (
          <div className="absolute bottom-3 right-3 px-3 py-1 rounded-lg bg-white/95 backdrop-blur-md border border-slate-200 text-xs font-extrabold text-emerald-700 shadow-sm">
            {project.startingPrice}
          </div>
        )}
      </div>

      {/* Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Title & Location Snippet */}
          <div className="mb-3">
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors tracking-tight line-clamp-1">
              {project.name}
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">{project.city} • {project.address}</span>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-3 gap-2 py-3 px-3.5 rounded-xl bg-slate-50 border border-slate-200 mb-4 text-center">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Area Range</span>
              <span className="text-xs font-bold text-slate-800 num-tabular truncate block mt-0.5" title={formattedArea}>
                {minArea >= 1000 ? `${(minArea / 1000).toFixed(1)}k - ${(maxArea / 1000).toFixed(1)}k` : `${minArea}-${maxArea}`} sq.ft.
              </span>
            </div>

            <div className="border-x border-slate-200 px-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Total Units</span>
              <span className="text-xs font-bold text-slate-800 num-tabular block mt-0.5">
                {project.totalUnits.toLocaleString()} Units
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Timeline</span>
              <span className="text-xs font-bold text-slate-800 block mt-0.5 truncate">
                {project.deliveredYear
                  ? project.status === 'DELIVERED'
                    ? `Delivered ${project.deliveredYear}`
                    : `Est. ${project.deliveredYear}`
                  : 'On Schedule'}
              </span>
            </div>
          </div>

          {/* RERA Project ID with 1-Click Copy */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200 mb-4">
            <div className="flex items-center gap-2 min-w-0 pr-2">
              <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-widest shrink-0">RERA ID</span>
              <span className="font-mono text-xs text-slate-700 font-medium truncate" title={reraNum}>
                {reraNum}
              </span>
            </div>
            <button
              onClick={handleCopyRera}
              className={`p-1.5 rounded-lg border transition-all text-xs flex items-center gap-1 shrink-0 ${
                copied
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
              }`}
              title="Copy RERA ID"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="text-[11px] font-semibold hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* Amenity Chips */}
          {project.amenities && project.amenities.length > 0 && (
            <div className="mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                Key Amenities
              </span>
              <div className="flex flex-wrap gap-1.5">
                {project.amenities.slice(0, 4).map((amenity, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-medium rounded-md bg-slate-100 text-slate-700 border border-slate-200"
                  >
                    <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                    <span>{amenity}</span>
                  </span>
                ))}
                {project.amenities.length > 4 && (
                  <span className="px-1.5 py-0.5 text-[10px] rounded-md bg-slate-100 text-slate-500 border border-slate-200">
                    +{project.amenities.length - 4} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        {onInquire && (
          <div className="pt-3 mt-2 border-t border-slate-100">
            <button
              onClick={() => onInquire(project)}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-emerald-700 text-white text-xs font-bold tracking-wide transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <span>Explore Projects</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
