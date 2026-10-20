import React, { createContext, useContext, useState, useCallback } from 'react';
import { ToastMessage } from '../../types';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

interface ToastContextType {
  toasts: ToastMessage[];
  showToast: (type: ToastMessage['type'], title: string, description?: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((type: ToastMessage['type'], title: string, description?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts(prev => [...prev, { id, type, title, description }]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-4 sm:px-0">
        {toasts.map(toast => {
          const config = {
            success: {
              border: 'border-emerald-300',
              bg: 'bg-white',
              icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />,
              glow: 'shadow-emerald-900/10'
            },
            error: {
              border: 'border-rose-300',
              bg: 'bg-white',
              icon: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />,
              glow: 'shadow-rose-900/10'
            },
            warning: {
              border: 'border-amber-300',
              bg: 'bg-white',
              icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />,
              glow: 'shadow-amber-900/10'
            },
            info: {
              border: 'border-blue-300',
              bg: 'bg-white',
              icon: <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />,
              glow: 'shadow-blue-900/10'
            }
          }[toast.type];

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border ${config.border} ${config.bg} shadow-xl ${config.glow} animate-fade-in transition-all`}
            >
              {config.icon}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900">{toast.title}</p>
                {toast.description && (
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{toast.description}</p>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-700 transition-colors p-1 -mr-1"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};
