import React, { useState } from 'react';
import { Developer, Project } from '../../types';
import { Modal } from '../common/Modal';
import { useToast } from '../common/Toast';
import { Send, Building2, Phone, Mail, User } from 'lucide-react';

interface InquireModalProps {
  isOpen: boolean;
  onClose: () => void;
  developer: Developer;
  selectedProject?: Project | null;
}

export const InquireModal: React.FC<InquireModalProps> = ({
  isOpen,
  onClose,
  developer,
  selectedProject
}) => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    budget: 'Above ₹2 Cr',
    intent: 'Personal Residence',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) {
      showToast('error', 'Missing Information', 'Please fill in your name, email, and mobile number.');
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      showToast(
        'success',
        'Inquiry Submitted Successfully',
        `Direct dispatch sent to ${developer.contactPerson?.name || developer.name}. An executive will reach out shortly.`
      );
      onClose();
      setFormData({
        name: '',
        email: '',
        phone: '',
        budget: 'Above ₹2 Cr',
        intent: 'Personal Residence',
        message: ''
      });
    }, 600);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Developer Direct Inquiry"
      subtitle={`Connect directly with ${developer.name} sales & alliance desk`}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Scoped Project Banner if opened from specific project card */}
        {selectedProject && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Building2 className="w-4 h-4 text-emerald-700" />
              <div>
                <p className="text-xs font-bold text-slate-900">{selectedProject.name}</p>
                <p className="text-[11px] text-slate-600">{selectedProject.city} • {selectedProject.startingPrice || 'Luxury Unit'}</p>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-white text-emerald-800 border border-emerald-200 shadow-xs">
              Selected
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Full Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="Rohan Sharma"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Contact Phone *
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Official Email Address *
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="email"
              required
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              placeholder="rohan@example.com"
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Investment Budget
            </label>
            <select
              value={formData.budget}
              onChange={e => setFormData({ ...formData, budget: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-emerald-600"
            >
              <option value="₹1 Cr - ₹2.5 Cr">₹1 Cr - ₹2.5 Cr</option>
              <option value="₹2.5 Cr - ₹5 Cr">₹2.5 Cr - ₹5 Cr</option>
              <option value="₹5 Cr - ₹10 Cr">₹5 Cr - ₹10 Cr</option>
              <option value="Above ₹10 Cr Ultra-Luxury">Above ₹10 Cr Ultra-Luxury</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Inquiry Purpose
            </label>
            <select
              value={formData.intent}
              onChange={e => setFormData({ ...formData, intent: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-emerald-600"
            >
              <option value="Personal Residence">Personal Residence</option>
              <option value="Investment / Portfolio">Investment / Portfolio</option>
              <option value="Commercial Leasing">Commercial Leasing</option>
              <option value="Joint Venture / Alliance">Joint Venture / Alliance</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Custom Requirements / Note
          </label>
          <textarea
            rows={3}
            value={formData.message}
            onChange={e => setFormData({ ...formData, message: e.target.value })}
            placeholder="Interested in penthouse units, site inspection schedule, or institutional JV discussion..."
            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 resize-none"
          />
        </div>

        {/* Developer Contact Desk info */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
          <span>Assigned to: <strong className="text-slate-900">{developer.contactPerson?.name || 'Corporate Alliance Desk'}</strong></span>
          <span className="font-mono font-bold text-emerald-700">{developer.contactPerson?.phone || '+91 80000 00000'}</span>
        </div>

        <div className="pt-2 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-900/20 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{submitting ? 'Connecting...' : 'Submit Priority Inquiry'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
