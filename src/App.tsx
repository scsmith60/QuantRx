import { useState, useEffect, Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import PracticePortal from './components/PracticePortal.tsx'
import AdminConsole from './components/AdminConsole.tsx'
import Login from './components/Login.tsx'
import { EliteExitWrapper } from './components/SplashScreen.tsx'
import { Shield } from 'lucide-react';
import { supabase } from './services/cmsService';
import { switchDetector } from './services/switchDetector';

interface UserProfile {
  id: string;
  organization_id: string;
  role: 'SUPER_ADMIN' | 'OFFICE_ADMIN' | 'OFFICE_STAFF';
  full_name: string;
}

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[CRITICAL] Component Crash Caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-full bg-black flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
                <Shield className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-xl font-bold text-white mb-2" id="error-boundary-msg">Dashboard Incident Detected</h1>
            <p className="text-sm text-muted-foreground max-w-md">
                A component failure occurred (likely due to a 406 Network Rejection). Our resilience layer is attempting recovery. 
                Please switch tabs or refresh the page.
            </p>
            <button 
                onClick={() => window.location.reload()}
                className="mt-6 px-6 py-2 bg-red-500 text-white rounded-lg text-xs font-bold uppercase"
            >
                Hard Refresh
            </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  const [view, setView] = useState<'practice' | 'admin'>('practice');
  const [showSplash, setShowSplash] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [tempAuthId, setTempAuthId] = useState<string | null>(null);

  // 1. Auth & Session Listener
  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        handleAuthSuccess(session.user.id);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        handleAuthSuccess(session.user.id);
      } else {
        setIsLoggedIn(false);
        setUserProfile(null);
        setTempAuthId(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuthSuccess = async (userId: string) => {
    setTempAuthId(userId); // Store for bootstrap display
    
    // Helpful log for the user to copy-paste into SQL
    console.log("------------------------------------------");
    console.log("QUANT_RX SECURITY BOOTSTRAP ID:");
    console.log(userId);
    console.log("------------------------------------------");

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error("Profile Fetch Error:", error.message);
      return;
    }

    if (data) {
      setUserProfile(data);
      setIsLoggedIn(true);
      switchDetector.startMonitoring();
      
      if (data.role === 'SUPER_ADMIN') {
        setView('admin');
      }
    } else {
      setIsLoggedIn(true);
      console.warn("User logged in but no profile record found in 'user_profiles' table.");
    }
  };


  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setUserProfile(null);
    setView('practice');
  };

  // Splash Screen Timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 6000); 

    return () => clearTimeout(timer);
  }, []);

  // Handle Login Finish (Legacy trigger, now handled by session listener)
  const handleLogin = () => {
    // Real logic moved to handleAuthSuccess
  };

  // Global Hotkeys (only active after login)
  useEffect(() => {
    if (!isLoggedIn) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent hotkeys when user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      if (e.key === 'p') setView('practice');
      if (e.key === 'a') setView('admin');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLoggedIn]);

  return (
    <EliteExitWrapper show={showSplash}>
      {!isLoggedIn ? (
        <Login onLogin={handleLogin} />
      ) : !userProfile ? (
        <div className="w-full h-screen bg-[#020204] flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-white/5 border border-[#39FF14]/20 rounded-2xl p-8 backdrop-blur-xl text-center space-y-6">
            <div className="w-16 h-16 bg-[#39FF14]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-[#39FF14]" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">Security Bootstrap Required</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your account is authenticated, but you are not yet linked to an organization. 
              Please provide this ID to your system administrator:
            </p>
            <div className="p-4 bg-black/50 border border-white/10 rounded-xl font-mono text-[10px] text-[#39FF14] break-all select-all">
              {tempAuthId || 'FETCHING_ID...'}
            </div>
            <p className="text-[10px] text-white/40 italic">
              (Tip: Check your browser console for a copy-pasteable version)
            </p>
            <button 
              onClick={handleSignOut}
              className="w-full py-3 text-xs font-bold text-white/60 hover:text-white transition-colors"
            >
              Sign Out & Retry
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full h-screen overflow-hidden relative animate-in fade-in duration-1000 bg-[#020204]">
          <div className="fixed bottom-6 right-8 z-50 flex space-x-2 items-center bg-black/40 backdrop-blur-xl border border-white/10 p-1.5 rounded-xl shadow-2xl">

            <button 
              onClick={() => setView('practice')}
              className={`px-3 py-1 text-[10px] font-bold rounded border ${view === 'practice' ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary text-muted-foreground border-border'}`}
            >
              [P] PRACTICE VIEW
            </button>
            <button 
              onClick={() => setView('admin')}
              className={`px-3 py-1 text-[10px] font-bold rounded border ${view === 'admin' ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary text-muted-foreground border-border'}`}
            >
              [A] ADMIN VIEW
            </button>
            <div className="w-px h-4 bg-white/10 mx-2" />
            <button 
              onClick={handleSignOut}
              className="px-3 py-1 text-[10px] font-bold rounded border bg-black/40 text-red-400 border-red-500/30 hover:bg-red-500/10 transition-colors"
            >
              SIGN OUT
            </button>
          </div>

          <ErrorBoundary>
            {view === 'practice' ? <PracticePortal organizationId={userProfile.organization_id} /> : <AdminConsole />}
          </ErrorBoundary>
        </div>
      )}
    </EliteExitWrapper>
  )
}

export default App
