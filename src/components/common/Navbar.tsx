import React, { useState } from 'react';
import {
  Shield,
  User,
  ArrowLeft,
  LogOut,
  LayoutDashboard,
  PlusCircle,
  Menu,
  X,
  Building2,
  Home,
  Globe
} from 'lucide-react';
import { AdminUser } from '../../services/auth';
import { AuthSession } from '../../types/auth';
import { useLanguage } from '../../context/LanguageContext';

export type AppView =
  | 'directory'
  | 'showcase'
  | 'admin'
  | 'admin-login'
  | 'login'
  | 'submit-land'
  | 'my-lands';

interface NavbarProps {
  currentView: AppView;
  onNavigate: (view: AppView, developerId?: string) => void;
  onOpenSignIn: () => void;
  adminUser?: AdminUser | null;
  userSession?: AuthSession | null;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenSignIn,
  adminUser,
  userSession,
  onLogout
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdmin = Boolean(
    adminUser || (userSession?.role && String(userSession.role).toUpperCase().includes('ADMIN'))
  );
  const isPartner = Boolean(userSession && !isAdmin);

  const { language, toggleLanguage, t } = useLanguage();

  const handleNavClick = (view: AppView, id?: string) => {
    onNavigate(view, id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <div
            onClick={() => handleNavClick('directory')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 flex items-center justify-center shadow-md shadow-emerald-900/10 group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold tracking-wider text-base text-slate-900">
                  ESTATE<span className="text-emerald-600">HUB</span>
                </span>
                <span className="px-1.5 py-0.2 text-[9px] font-bold tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-200 rounded uppercase">
                  PORTAL
                </span>
              </div>
              <span className="text-[10px] text-slate-500 block -mt-0.5 tracking-wide">
                {t.nav.portalSubtitle}
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          {(isPartner || isAdmin) && (
            <nav className="hidden lg:flex items-center gap-1 pl-4 border-l border-slate-200">

            {/* Land Submissions (Only for Land Owners & Channel Partners) */}
            {isPartner && (
              <button
                onClick={() => handleNavClick('submit-land')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all cursor-pointer ${
                  currentView === 'submit-land'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t.nav.submitLand}</span>
              </button>
            )}

            {/* Admin Console Tab */}
            {isAdmin && (
              <button
                onClick={() => handleNavClick('admin')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all cursor-pointer flex items-center gap-1.5 ${
                  currentView === 'admin'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>{t.nav.adminConsole}</span>
              </button>
            )}
            </nav>
          )}
        </div>

        {/* Right tools (Desktop) */}
        <div className="hidden sm:flex items-center gap-3">
          {isAdmin ? (
            /* Admin is Logged In */
            <div className="flex items-center gap-2">
              <div
                onClick={() => handleNavClick('admin')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 border border-slate-700 transition-all cursor-pointer shadow-xs"
                title="Admin Management Console"
              >
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold border border-emerald-500/30">
                  <Shield className="w-3.5 h-3.5" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-extrabold text-white leading-none truncate max-w-[120px]">
                    {adminUser?.name || userSession?.name || 'Admin'}
                  </div>
                  <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-wider block mt-0.5">
                    Admin
                  </span>
                </div>
              </div>

              {currentView === 'admin' ? (
                <button
                  onClick={() => handleNavClick('directory')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                  title="View Public Portal Directory"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span className="hidden xl:inline">Public Portal</span>
                </button>
              ) : (
                <button
                  onClick={() => handleNavClick('admin')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer"
                  title="Open Admin Console"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span className="hidden xl:inline">Admin Console</span>
                </button>
              )}

              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all cursor-pointer"
                title="Log out of Admin session"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>
          ) : isPartner && userSession ? (
            /* Partner (Owner / Agent) is Logged In */
            <div className="flex items-center gap-2">
              <div
                onClick={() => handleNavClick('my-lands')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/90 border border-slate-200 hover:bg-slate-200/70 transition-all cursor-pointer"
                title="View your land submissions"
              >
                <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                  {userSession.role === 'AGENT' ? <Building2 className="w-3.5 h-3.5" /> : <Home className="w-3.5 h-3.5" />}
                </div>
                <div className="text-left">
                  <div className="text-xs font-extrabold text-slate-900 leading-none truncate max-w-[120px]">
                    {userSession.name}
                  </div>
                  <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider block mt-0.5">
                    {userSession.role === 'AGENT' ? 'Agent' : 'Owner'}
                  </span>
                </div>
              </div>

              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all cursor-pointer"
                title="Log out of session"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>
          ) : (
            /* Not logged in: Show Login / Register button */
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleNavClick('login')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm shadow-emerald-900/10 transition-all cursor-pointer"
              >
                <User className="w-3.5 h-3.5" />
                <span>{t.nav.signInRegister}</span>
              </button>
            </div>
          )}

          {/* Language Switcher (Desktop) */}
          <button
            id="language-toggle-btn"
            data-testid="language-toggle-btn"
            type="button"
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-all cursor-pointer shadow-2xs"
            title="Switch Language / भाषा बदला"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-semibold">{t.nav.languageToggle}</span>
          </button>
        </div>

        {/* Mobile menu button & quick language switcher */}
        <div className="flex lg:hidden items-center gap-2">
          <button
            id="mobile-language-toggle-btn"
            data-testid="mobile-language-toggle-btn"
            type="button"
            onClick={toggleLanguage}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 shadow-2xs"
            title="Switch Language / भाषा बदला"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t.nav.languageToggle}</span>
          </button>

          {isAdmin ? (
            <div
              onClick={() => handleNavClick('admin')}
              className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 text-emerald-400 flex items-center justify-center text-xs font-bold cursor-pointer"
              title="Admin Console"
            >
              <Shield className="w-4 h-4" />
            </div>
          ) : null}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-2 shadow-lg animate-in slide-in-from-top duration-150">

          {isPartner && (
            <button
              onClick={() => handleNavClick('submit-land')}
              className={`w-full text-left flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold ${
                currentView === 'submit-land' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-emerald-600" />
              <span>{t.nav.submitLand}</span>
            </button>
          )}

          {isAdmin && (
            <button
              onClick={() => handleNavClick('admin')}
              className={`w-full text-left flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold ${
                currentView === 'admin' ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-emerald-500" />
              <span>{t.nav.adminConsole}</span>
            </button>
          )}

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            {isAdmin ? (
              <div className="flex items-center justify-between w-full">
                <div className="text-xs">
                  <span className="font-bold text-slate-900 block">{adminUser?.name || userSession?.name || 'Admin'}</span>
                  <span className="text-[10px] text-emerald-600 font-extrabold uppercase tracking-wide">ADMIN</span>
                </div>
                <button
                  onClick={onLogout}
                  className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold"
                >
                  {t.nav.logout}
                </button>
              </div>
            ) : isPartner && userSession ? (
              <div className="flex items-center justify-between w-full">
                <div className="text-xs">
                  <span className="font-bold text-slate-900 block">{userSession.name}</span>
                  <span className="text-[10px] text-emerald-700 font-bold uppercase">{userSession.role}</span>
                </div>
                <button
                  onClick={onLogout}
                  className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold"
                >
                  {t.nav.logout}
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleNavClick('login')}
                className="w-full py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold text-center shadow-xs"
              >
                {t.nav.signInRegister}
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
