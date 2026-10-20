import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { adminApi, publicApi, getAuthToken, setAuthToken, getBackendUrl, setBackendUrl } from '../../services/api';
import { Play, ChevronRight, Copy, Check, Key, Globe, Shield } from 'lucide-react';
import { useToast } from './Toast';

interface ApiDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiDocsModal: React.FC<ApiDocsModalProps> = ({ isOpen, onClose }) => {
  const { showToast } = useToast();
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('public-list');
  const [responseOutput, setResponseOutput] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Live backend and auth token config
  const [backendUrlInput, setBackendUrlInput] = useState('');
  const [tokenInput, setTokenInput] = useState('');

  useEffect(() => {
    if (isOpen) {
      setBackendUrlInput(getBackendUrl());
      setTokenInput(getAuthToken());
    }
  }, [isOpen]);

  const handleSaveBackendConfig = () => {
    setBackendUrl(backendUrlInput.trim());
    setAuthToken(tokenInput.trim());
    showToast('success', 'Backend Configuration Saved', backendUrlInput ? `Configured target: ${backendUrlInput}` : 'Reset to local production dataset');
  };

  const endpoints = [
    {
      id: 'auth-send-otp',
      method: 'POST',
      path: '/api/v1/auth/send-otp',
      desc: 'Step 1: Request 6-digit OTP code for Admin authentication',
      sampleBody: {
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'ADMIN'
      }
    },
    {
      id: 'auth-verify-otp',
      method: 'POST',
      path: '/api/v1/auth/verify-otp',
      desc: 'Step 2: Verify 6-digit OTP and receive Admin JWT token',
      sampleBody: {
        email: 'admin@example.com',
        otp: '582194'
      }
    },
    {
      id: 'public-list',
      method: 'GET',
      path: '/api/v1/developers',
      desc: 'Public list of all approved developers and their projects',
      handler: async () => await publicApi.getDevelopers()
    },
    {
      id: 'public-profile',
      method: 'GET',
      path: '/api/v1/developers/dev-1',
      desc: 'Full profile with projects and computed stats',
      handler: async () => await publicApi.getDeveloperProfile('dev-1')
    },
    {
      id: 'admin-stats',
      method: 'GET',
      path: '/api/v1/admin/stats',
      desc: 'Retrieve aggregated developer verification counts',
      handler: async () => await adminApi.getStats()
    },
    {
      id: 'admin-list-devs',
      method: 'GET',
      path: '/api/v1/admin/developers?status=APPROVED',
      desc: 'List developers filtered by status',
      handler: async () => await adminApi.getDevelopers('APPROVED')
    },
    {
      id: 'admin-create-dev',
      method: 'POST',
      path: '/api/v1/admin/developers',
      desc: 'Create developer schema specification',
      sampleBody: {
        companyName: 'Prestige Estates Projects Ltd',
        reraNumber: 'KA/RERA/DEV/2017/000042',
        gstNumber: '29AAACP1284L1Z2',
        operatingCities: ['Bengaluru', 'Mumbai'],
        coreExpertise: ['JV', 'JDA', 'REDEVELOPMENT'],
        verificationStatus: 'APPROVED'
      }
    },
    {
      id: 'admin-add-proj',
      method: 'POST',
      path: '/api/v1/admin/developers/{devId}/projects',
      desc: 'Add project scoped to developer',
      sampleBody: {
        name: 'Prestige Kingfisher Towers',
        type: 'RESIDENTIAL',
        status: 'DELIVERED',
        city: 'Bengaluru',
        totalUnits: 82,
        areaMinSqFt: 8321,
        areaMaxSqFt: 9500,
        reraProjectId: 'PRM/KA/RERA/1251/310/PR/170915/000122'
      }
    },
    {
      id: 'admin-update-dev',
      method: 'PUT',
      path: '/api/v1/admin/developers/{id}',
      desc: 'Update developer legal credentials or metadata'
    },
    {
      id: 'admin-delete-dev',
      method: 'DELETE',
      path: '/api/v1/admin/developers/{id}',
      desc: 'Cascade delete developer and scoped projects'
    }
  ];

  const currentEp = endpoints.find(e => e.id === selectedEndpoint) || endpoints[0];

  const handleTestRequest = async () => {
    if (!currentEp.handler) {
      setResponseOutput(
        JSON.stringify(
          {
            status: 200,
            message: 'Endpoint schema active',
            samplePayload: currentEp.sampleBody || { success: true }
          },
          null,
          2
        )
      );
      return;
    }

    setLoading(true);
    try {
      const data = await currentEp.handler();
      setResponseOutput(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setResponseOutput(JSON.stringify({ error: err.message }, null, 2));
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!responseOutput) return;
    navigator.clipboard.writeText(responseOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="API Specification & Live REST Inspector"
      subtitle="Interactive verification for /api/v1 endpoints with Spring Boot backend configuration"
      maxWidth="4xl"
    >
      <div className="space-y-6">
        {/* Backend & Auth Configuration Box */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
            <Key className="w-4 h-4 text-emerald-600" />
            <span>Backend Integration & JWT Auth Setup</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Backend Base URL (Optional, e.g. http://localhost:8080)
              </label>
              <div className="relative">
                <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={backendUrlInput}
                  onChange={e => setBackendUrlInput(e.target.value)}
                  placeholder="http://localhost:8080"
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Admin JWT Bearer Token (Optional, for authenticated calls)
              </label>
              <div className="relative">
                <Shield className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  value={tokenInput}
                  onChange={e => setTokenInput(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsIn..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-[11px] text-slate-500">
              When configured, requests go directly to your Spring Boot server. If empty, uses the persistent local registry.
            </span>
            <button
              onClick={handleSaveBackendConfig}
              className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors"
            >
              Save Configuration
            </button>
          </div>
        </div>

        {/* Endpoints Directory & Runner */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column: Endpoints Directory */}
          <div className="md:col-span-5 space-y-1.5 max-h-[460px] overflow-y-auto pr-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              Endpoints
            </p>
            {endpoints.map(ep => {
              const isSelected = ep.id === selectedEndpoint;
              return (
                <button
                  key={ep.id}
                  onClick={() => {
                    setSelectedEndpoint(ep.id);
                    setResponseOutput(null);
                  }}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all text-xs flex items-center justify-between ${
                    isSelected
                      ? 'bg-emerald-50 border-emerald-300 text-slate-900 font-bold'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono ${
                          ep.method === 'GET'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : ep.method === 'POST'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : ep.method === 'PUT'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {ep.method}
                      </span>
                      <span className="font-mono text-[11px] truncate">{ep.path}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 truncate">{ep.desc}</p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </button>
              );
            })}
          </div>

          {/* Right Column: Endpoint Runner & Response Viewer */}
          <div className="md:col-span-7 flex flex-col justify-between rounded-xl bg-slate-50 border border-slate-200 p-4">
            <div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500">Target</span>
                  <p className="font-mono text-xs text-slate-900 font-bold mt-0.5">
                    {currentEp.method} {currentEp.path}
                  </p>
                </div>

                <button
                  onClick={handleTestRequest}
                  disabled={loading}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>{loading ? 'Running...' : 'Run Query'}</span>
                </button>
              </div>

              <p className="text-xs text-slate-600 mb-3">{currentEp.desc}</p>

              {currentEp.sampleBody && (
                <div className="mb-3">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Sample Request Body:
                  </span>
                  <pre className="p-2.5 rounded-lg bg-white border border-slate-200 text-[11px] text-slate-800 font-mono overflow-x-auto">
                    {JSON.stringify(currentEp.sampleBody, null, 2)}
                  </pre>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Serialized Response Output:
                  </span>
                  {responseOutput && (
                    <button
                      onClick={copyToClipboard}
                      className="text-[11px] text-slate-500 hover:text-slate-900 flex items-center gap-1 font-semibold"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'Copied' : 'Copy JSON'}</span>
                    </button>
                  )}
                </div>

                <div className="h-52 rounded-lg bg-white border border-slate-200 p-3 overflow-y-auto font-mono text-[11px] text-slate-800 shadow-2xs">
                  {loading ? (
                    <span className="text-slate-400">Executing request...</span>
                  ) : responseOutput ? (
                    <pre>{responseOutput}</pre>
                  ) : (
                    <span className="text-slate-400 italic">
                      Click "Run Query" above to test this endpoint live.
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
