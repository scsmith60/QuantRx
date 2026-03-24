import { useState, useEffect } from 'react';
import PracticePortal from './components/PracticePortal.tsx'
import AdminConsole from './components/AdminConsole.tsx'
import Login from './components/Login.tsx'
import { EliteExitWrapper } from './components/SplashScreen.tsx'
import { switchDetector } from './services/switchDetector';

function App() {
  const [view, setView] = useState<'practice' | 'admin'>('practice');
  const [showSplash, setShowSplash] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Splash Screen Timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 6000); // Extended 6s for maximum brand impact

    return () => clearTimeout(timer);
  }, []);

  // Handle Login Finish
  const handleLogin = () => {
    setIsLoggedIn(true);
    // Start background services after login
    switchDetector.startMonitoring();
  };

  // Global Hotkeys (only active after login)
  useEffect(() => {
    if (!isLoggedIn) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
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
      ) : (
        <div className="w-full h-screen overflow-hidden relative animate-in fade-in duration-1000">
          <div className="fixed bottom-4 left-4 z-50 flex space-x-2">
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
          </div>

          {view === 'practice' ? <PracticePortal /> : <AdminConsole />}
        </div>
      )}
    </EliteExitWrapper>
  )
}

export default App
