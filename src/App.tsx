import { useState, useEffect } from 'react';
import { ToastProvider, useToast } from './components/common/Toast';
import { Navbar, AppView } from './components/common/Navbar';
import { PublicProfile } from './components/public/PublicProfile';
import { PublicDirectory } from './components/public/PublicDirectory';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminLogin } from './components/admin/AdminLogin';
import { SignInModal } from './components/common/SignInModal';
import { LoginScreen } from './components/auth/LoginScreen';
import { LandSubmitForm } from './components/lands/LandSubmitForm';
import { MyLandsDashboard } from './components/lands/MyLandsDashboard';
import type { Developer } from './types';
import type { AuthSession } from './types/auth';
import { publicApi } from './services/api';
import { authService, AdminUser } from './services/auth';
import { UNAUTHORIZED_EVENT } from './services/apiClient';
import { Shield, CheckCircle2 } from 'lucide-react';

function AppContent() {
  const { showToast } = useToast();

  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [activeDeveloperId, setActiveDeveloperId] = useState<string>('');
  const [currentView, setCurrentView] = useState<AppView>('directory');
  const [signInOpen, setSignInOpen] = useState(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => authService.getAdminUser());
  const [userSession, setUserSession] = useState<AuthSession | null>(() => authService.getSession());
  const [editParcelId, setEditParcelId] = useState<string | null>(null);

  // Sync with browser URL pathname on mount and popstate
  useEffect(() => {
    const handleUrlRoute = () => {
      const path = window.location.pathname;
      const session = authService.getSession();
      const currentAdmin = authService.getAdminUser();

      setUserSession(session);
      setAdminUser(currentAdmin);

      if (path === '/login') {
        setCurrentView('login');
      } else if (path === '/submit-land') {
        // Protected route: check authentication
        if (!session && !currentAdmin) {
          showToast('info', 'Authentication Required', 'Please sign in to submit a land parcel.');
          handleNavigate('login');
        } else {
          setCurrentView('submit-land');
        }
      } else if (path === '/my-lands') {
        // Protected route: check authentication
        if (!session && !currentAdmin) {
          showToast('info', 'Authentication Required', 'Please sign in to view your land submissions.');
          handleNavigate('login');
        } else {
          setCurrentView('my-lands');
        }
      } else if (path === '/admin/login') {
        setCurrentView('admin-login');
      } else if (path === '/admin' || path.startsWith('/admin')) {
        setCurrentView('admin');
      } else if (path.startsWith('/developers/')) {
        const id = path.replace('/developers/', '').trim();
        if (id) {
          setActiveDeveloperId(id);
          setCurrentView('showcase');
        } else {
          setCurrentView('directory');
        }
      } else {
        setCurrentView('directory');
      }
    };

    handleUrlRoute();
    window.addEventListener('popstate', handleUrlRoute);

    // 401 Unauthorized Interceptor Event
    const handleUnauthorized = () => {
      setUserSession(null);
      setAdminUser(null);
      showToast('error', 'Session Expired', 'Your session has expired or is unauthorized. Please sign in again.');
      handleNavigate('login');
    };

    // Auth state changed listener
    const handleAuthChange = (e: any) => {
      setUserSession(e.detail || null);
      setAdminUser(authService.getAdminUser());
    };

    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    window.addEventListener('estatehub:auth-changed', handleAuthChange);

    return () => {
      window.removeEventListener('popstate', handleUrlRoute);
      window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
      window.removeEventListener('estatehub:auth-changed', handleAuthChange);
    };
  }, []);

  // Fetch developers list for directory from public API
  const refreshDevelopers = async () => {
    try {
      const list = await publicApi.getDevelopers();
      setDevelopers(list);
      if (list.length > 0 && !list.find(d => d.id === activeDeveloperId)) {
        setActiveDeveloperId(list[0].id);
      }
    } catch (err) {
      console.error('Failed to load developers from API', err);
    }
  };

  useEffect(() => {
    refreshDevelopers();
  }, []);

  const handleNavigate = (view: AppView, devId?: string) => {
    setCurrentView(view);
    if (devId) {
      setActiveDeveloperId(devId);
    }

    let newPath = '/';
    if (view === 'showcase') {
      newPath = `/developers/${devId || activeDeveloperId}`;
    } else if (view === 'directory') {
      newPath = '/';
    } else if (view === 'login') {
      newPath = '/login';
    } else if (view === 'submit-land') {
      newPath = '/submit-land';
    } else if (view === 'my-lands') {
      newPath = '/my-lands';
    } else if (view === 'admin') {
      newPath = '/admin';
    } else if (view === 'admin-login') {
      newPath = '/admin/login';
    }

    if (window.location.pathname !== newPath) {
      window.history.pushState({}, '', newPath);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = (targetRedirectPath: string) => {
    const session = authService.getSession();
    setUserSession(session);
    setAdminUser(authService.getAdminUser());

    if (targetRedirectPath === '/my-lands') {
      handleNavigate('my-lands');
    } else {
      setEditParcelId(null);
      handleNavigate('submit-land');
    }
  };

  const handleAdminLoginSuccess = (user: AdminUser) => {
    setAdminUser(user);
    handleNavigate('admin');
  };

  const handleLogout = () => {
    authService.logout();
    setUserSession(null);
    setAdminUser(null);
    showToast('info', 'Signed Out', 'You have been safely signed out.');
    handleNavigate('directory');
  };

  const handleEditParcel = (id: string) => {
    setEditParcelId(id);
    handleNavigate('submit-land');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-emerald-500/20 selection:text-emerald-900">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenSignIn={() => handleNavigate('login')}
        adminUser={adminUser}
        userSession={userSession}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Page 1: Role-Based Login Screen */}
        {currentView === 'login' && (
          <LoginScreen
            onSuccess={handleLoginSuccess}
            onNavigateHome={() => handleNavigate('directory')}
          />
        )}

        {/* Page 2: Land Submission Form */}
        {currentView === 'submit-land' && (
          <LandSubmitForm
            editParcelId={editParcelId}
            onSuccess={() => {
              setEditParcelId(null);
              handleNavigate('my-lands');
            }}
            onCancel={() => {
              setEditParcelId(null);
              handleNavigate('my-lands');
            }}
          />
        )}

        {/* Page 3: "My Land Submissions" Dashboard */}
        {currentView === 'my-lands' && (
          <MyLandsDashboard
            onNavigateToSubmit={() => {
              setEditParcelId(null);
              handleNavigate('submit-land');
            }}
            onEditParcel={handleEditParcel}
          />
        )}

        {/* Public Directory */}
        {currentView === 'directory' && (
          <PublicDirectory
            developers={developers}
            onSelectDeveloper={id => handleNavigate('showcase', id)}
          />
        )}

        {/* Developer Showcase */}
        {currentView === 'showcase' && (
          <PublicProfile
            developerId={activeDeveloperId}
            onNavigateToDirectory={() => handleNavigate('directory')}
          />
        )}

        {/* Admin Section */}
        {(currentView === 'admin' || currentView === 'admin-login') && (
          adminUser ? (
            <AdminDashboard
              onViewPublicProfile={devId => handleNavigate('showcase', devId)}
              adminUser={adminUser}
              onLogout={handleLogout}
            />
          ) : (
            <AdminLogin
              onLoginSuccess={handleAdminLoginSuccess}
              onNavigateHome={() => handleNavigate('directory')}
            />
          )
        )}
      </main>

      {/* Legacy Sign In Modal (Public Partners Only) */}
      <SignInModal
        isOpen={signInOpen}
        onClose={() => setSignInOpen(false)}
      />

      {/* Clean Institutional Footer */}
      <footer className="border-t border-slate-200 bg-white text-xs text-slate-500 py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 pb-8 border-b border-slate-100">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                  <Shield className="w-4 h-4" />
                </div>
                <span className="font-extrabold text-slate-900 text-base tracking-wide">
                  ESTATE<span className="text-emerald-600">HUB</span> PORTAL
                </span>
              </div>
              <p className="text-slate-500 text-xs leading-relaxed">
                Institutional real estate developer alliance network. Connecting verified land parcels and development mandates with India's Tier-1 RERA accredited builders.
              </p>
              <div className="flex items-center gap-2 text-[11px] text-emerald-700 font-bold pt-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>RERA Compliant • 100% Authenticated Developer Registry</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Alliances & Mandates</h4>
              <ul className="space-y-2 text-slate-600">
                <li>Joint Venture (JV) Structuring</li>
                <li>Joint Development Agreement (JDA)</li>
                <li>Prime Land Parcel Sourcing</li>
                <li>Urban Cluster Redevelopment</li>
                <li>Outright Land Acquisitions</li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Compliance & Legal</h4>
              <ul className="space-y-2 text-slate-500">
                <li>Real Estate (Regulation and Development) Act, 2016</li>
                <li>GSTIN Registration Validation</li>
                <li>Clear Title Verification Standards</li>
                <li>Escrow Account Auditing</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
            <p>© 2026 ESTATEHUB. All rights reserved. Real Estate Developer & Land Alliance Suite.</p>
            <div className="flex items-center gap-4">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
              <span>RERA Disclosures</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
