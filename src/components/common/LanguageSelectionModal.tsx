import React, { useState, useEffect } from 'react';
import { Globe, Check, ArrowRight, X, Sparkles, Building2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { Language } from '../../i18n/translations';

const SESSION_KEY = 'estatehub_lang_prompt_shown';

export const LanguageSelectionModal: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState<Language>(language);

  // Detect whether this navigation is a browser refresh (reload) vs newly opened tab/session
  const isPageRefresh = (): boolean => {
    try {
      const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      if (navEntries && navEntries.length > 0) {
        return navEntries[0].type === 'reload';
      }
      if (window.performance && (window.performance as any).navigation) {
        return (window.performance as any).navigation.type === 1; // TYPE_RELOAD = 1
      }
    } catch {
      // fallback
    }
    return false;
  };

  useEffect(() => {
    try {
      const alreadyShown = sessionStorage.getItem(SESSION_KEY);
      const isRefresh = isPageRefresh();

      // If already shown in this session OR if this is a page refresh, do not show
      if (alreadyShown === 'true' || isRefresh) {
        sessionStorage.setItem(SESSION_KEY, 'true');
        return;
      }

      // Website newly opened in this tab/window: show popup
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 400);

      return () => clearTimeout(timer);
    } catch {
      // ignore storage errors
    }
  }, []);

  const handleConfirm = () => {
    try {
      sessionStorage.setItem(SESSION_KEY, 'true');
    } catch {
      // ignore
    }
    setLanguage(selectedLang);
    setIsOpen(false);
  };

  const handleDismiss = () => {
    try {
      sessionStorage.setItem(SESSION_KEY, 'true');
    } catch {
      // ignore
    }
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Blurred Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity animate-in fade-in duration-300"
        onClick={handleDismiss}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200 z-10">
        {/* Top Decorative Gradient Accent Bar */}
        <div className="h-2 w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600" />

        {/* Dismiss Button */}
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 flex items-center justify-center transition-all cursor-pointer"
          title="Close / बंद करा"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 sm:p-8">
          {/* Header Badge & Title */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-2xs">
              <Globe className="w-5 h-5 text-emerald-600 animate-spin-slow" />
            </div>
            <span className="text-[11px] font-black tracking-widest text-emerald-800 uppercase bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              Language Preference • भाषा निवड
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
            Select Your Language <span className="text-emerald-700 font-extrabold">/ भाषा निवडा</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
            Choose your preferred language for Maharashtra land parcels, developer joint ventures, and mandate terms.
            <br />
            <span className="text-slate-600 font-medium">
              महाराष्ट्र जमीन व्यवहार व विकासक भागीदारीसाठी आपली भाषा निवडा.
            </span>
          </p>

          {/* Interactive Language Selection Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-6">
            {/* Option 1: English */}
            <div
              onClick={() => setSelectedLang('en')}
              className={`relative p-4 rounded-2xl border-2 transition-all cursor-pointer text-left ${
                selectedLang === 'en'
                  ? 'border-emerald-600 bg-emerald-50/60 shadow-md shadow-emerald-900/5 ring-1 ring-emerald-600'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold tracking-wider bg-white border border-slate-200 text-slate-700 uppercase">
                  English
                </span>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    selectedLang === 'en'
                      ? 'border-emerald-600 bg-emerald-600 text-white'
                      : 'border-slate-300 bg-white'
                  }`}
                >
                  {selectedLang === 'en' && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>

              <div className="text-base font-black text-slate-900">
                English
              </div>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                Corporate real estate terms, Joint Ventures (JV), JDA mandates & RERA documentation.
              </p>
            </div>

            {/* Option 2: Marathi */}
            <div
              onClick={() => setSelectedLang('mr')}
              className={`relative p-4 rounded-2xl border-2 transition-all cursor-pointer text-left ${
                selectedLang === 'mr'
                  ? 'border-emerald-600 bg-emerald-50/60 shadow-md shadow-emerald-900/5 ring-1 ring-emerald-600'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold tracking-wider bg-amber-50 border border-amber-200 text-amber-900 uppercase">
                  मराठी
                </span>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    selectedLang === 'mr'
                      ? 'border-emerald-600 bg-emerald-600 text-white'
                      : 'border-slate-300 bg-white'
                  }`}
                >
                  {selectedLang === 'mr' && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>

              <div className="text-base font-black text-slate-900">
                मराठी <span className="text-xs text-emerald-700 font-bold">(Marathi)</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                अस्सल मराठी ७/१२ फेरफार, गट नंबर, संयुक्त विकास करार (JDA), पुनर्विकास व थेट खरेदी.
              </p>
            </div>
          </div>

          {/* Action Footer */}
          <div className="mt-7 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
            <span className="text-[11px] text-slate-400 text-center sm:text-left">
              {selectedLang === 'mr'
                ? 'वर दिलेल्या [ 🌐 भाषा ] बटणावरून आपण कधीही भाषा बदलू शकता.'
                : 'You can change language anytime from the top navigation bar.'}
            </span>

            <button
              type="button"
              onClick={handleConfirm}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white text-xs font-black tracking-wide shadow-lg shadow-emerald-900/15 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>{selectedLang === 'mr' ? 'सुरू ठेवा / Continue' : 'Continue in English'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
