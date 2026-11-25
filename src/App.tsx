import React, { useState, useEffect } from 'react';
import { authService } from './services/auth.service';
import { chatService } from './services/chat.service';
import { historyService } from './services/history.service';
import { workoutService } from './services/workout.service';
import { UserProfile } from './models/user.model';
import { Header } from './components/Header';
import { BottomNav, NavTab } from './components/BottomNav';
import { InstructorReferralModal } from './components/InstructorReferralModal';

// Application screens
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { PasswordRecoveryPage } from './pages/PasswordRecoveryPage';
import { PreferencesPage } from './pages/PreferencesPage';
import { DashboardPage } from './pages/DashboardPage';
import { WorkoutPage } from './pages/WorkoutPage';
import { ChatPage } from './pages/ChatPage';
import { HistoryPage } from './pages/HistoryPage';
import { ProfilePage } from './pages/ProfilePage';

export type AppScreen =
  | 'login'
  | 'register'
  | 'recovery'
  | 'preferences'
  | 'home'
  | 'workout'
  | 'chat'
  | 'history'
  | 'profile';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile>(authService.getUser());
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('login');
  const [instructorModalOpen, setInstructorModalOpen] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isWorkoutLoading, setIsWorkoutLoading] = useState(false);
  const [startupError, setStartupError] = useState('');
  const [appError, setAppError] = useState('');
  const [appNotice, setAppNotice] = useState('');

  useEffect(() => {
    let isMounted = true;
    let requestedUserId: string | null | undefined;
    let workoutScopePromise: Promise<void> = Promise.resolve();

    const syncWorkoutScope = (userId: string | null): Promise<void> => {
      if (userId === requestedUserId) return workoutScopePromise;
      requestedUserId = userId;
      setIsWorkoutLoading(userId !== null);
      workoutScopePromise = workoutService.setUserScope(userId)
        .then(() => {
          if (isMounted && requestedUserId === userId) setIsWorkoutLoading(false);
        })
        .catch((error: unknown) => {
          if (isMounted && requestedUserId === userId) {
            setStartupError(error instanceof Error ? error.message : 'Não foi possível carregar seus treinos.');
            setIsWorkoutLoading(false);
          }
          throw error;
        });
      return workoutScopePromise;
    };

    const unsubscribe = authService.subscribe(() => {
      const user = authService.getUser();
      const userId = authService.isAuthenticated() ? user.id : null;
      setCurrentUser(user);
      chatService.setUserScope(userId);
      historyService.setUserScope(userId);
      void syncWorkoutScope(userId).catch(() => undefined);
      if (!authService.isAuthenticated()) {
        setCurrentScreen('login');
      }
    });

    const handleAppError = (event: Event) => {
      const customEvent = event as CustomEvent<string>;
      setAppError(customEvent.detail || 'Não foi possível salvar seus dados.');
    };
    const handleAppNotice = (event: Event) => {
      const customEvent = event as CustomEvent<string>;
      setAppNotice(customEvent.detail || '');
    };
    window.addEventListener('app:error', handleAppError);
    window.addEventListener('app:notice', handleAppNotice);

    authService.initialize()
      .then(async () => {
        const user = authService.getUser();
        const userId = authService.isAuthenticated() ? user.id : null;
        await syncWorkoutScope(userId);
        if (isMounted) {
          const recoveryRequested = new URLSearchParams(window.location.search).get('recovery') === '1';
          setCurrentScreen(
            recoveryRequested ? 'recovery' : authService.isAuthenticated() ? 'home' : 'login',
          );
        }
      })
      .catch((error: unknown) => {
        if (isMounted) {
          setStartupError(error instanceof Error ? error.message : 'Não foi possível conectar ao Supabase.');
        }
      })
      .finally(() => {
        if (isMounted) setIsInitializing(false);
      });

    return () => {
      isMounted = false;
      unsubscribe();
      window.removeEventListener('app:error', handleAppError);
      window.removeEventListener('app:notice', handleAppNotice);
    };
  }, []);

  if (isInitializing || isWorkoutLoading || startupError) {
    return (
      <div className="min-h-screen bg-[#0B0712] flex items-center justify-center p-6 text-white">
        <div className="max-w-md text-center">
          {isInitializing || isWorkoutLoading ? (
            <p className="text-sm text-[#B784E6]">
              {isWorkoutLoading ? 'Carregando seus treinos...' : 'Conectando ao Supabase...'}
            </p>
          ) : (
            <>
              <h1 className="text-lg font-bold mb-2">Não foi possível iniciar o aplicativo</h1>
              <p role="alert" className="text-sm text-red-200">{startupError}</p>
            </>
          )}
        </div>
      </div>
    );
  }

  // Handle bottom navigation tabs
  const handleSelectTab = (tab: NavTab) => {
    setCurrentScreen(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isMainTab = ['home', 'workout', 'chat', 'history', 'profile'].includes(currentScreen);

  return (
    <div className="min-h-screen bg-[#0B0712] text-white flex justify-center overflow-x-hidden">
      {/* Responsive container: strictly calibrated for 360px-430px on mobile, expanding gracefully on tablets (768px-1024px) and desktops (1280px-1440px+) */}
      <div className="w-full max-w-md md:max-w-3xl lg:max-w-5xl xl:max-w-6xl min-h-screen bg-[#0B0712] relative flex flex-col shadow-[0_0_80px_rgba(39,16,68,0.7)] border-x border-white/[0.04] overflow-x-hidden">
        {appError && (
          <div role="alert" className="m-3 rounded-xl border border-red-500/40 bg-red-500/15 px-3 py-2 text-xs text-red-100">
            {appError}
            <button type="button" className="ml-2 underline" onClick={() => setAppError('')}>Fechar</button>
          </div>
        )}
        {appNotice && (
          <div role="status" className="m-3 rounded-xl border border-green-500/30 bg-green-500/10 px-3 py-2 text-xs text-green-100">
            {appNotice}
            <button type="button" className="ml-2 underline" onClick={() => setAppNotice('')}>Fechar</button>
          </div>
        )}
        
        {/* Top Header padronizado e contextual */}
        {isMainTab && (
          <Header
            currentScreen={currentScreen as NavTab}
            user={currentUser}
            onAvatarClick={() => setCurrentScreen('profile')}
            onLogoClick={() => setCurrentScreen('home')}
            onInstructorClick={() => setInstructorModalOpen(true)}
          />
        )}

        {/* Screen Routing com rolagem independente */}
        <main className="flex-1 w-full overflow-x-hidden">
          {currentScreen === 'login' && (
            <LoginPage
              onLoginSuccess={() => setCurrentScreen('home')}
              onNavigateToRegister={() => setCurrentScreen('register')}
            />
          )}

          {currentScreen === 'register' && (
            <RegisterPage
              onNextStep={() => setCurrentScreen('preferences')}
              onBackToLogin={() => setCurrentScreen('login')}
            />
          )}

          {currentScreen === 'recovery' && (
            <PasswordRecoveryPage
              onComplete={() => setCurrentScreen('home')}
              onBackToLogin={() => {
                window.history.replaceState({}, '', window.location.pathname);
                setCurrentScreen('login');
              }}
            />
          )}

          {currentScreen === 'preferences' && (
            <PreferencesPage
              onComplete={() => setCurrentScreen('home')}
              onBack={() => setCurrentScreen('register')}
            />
          )}

          {currentScreen === 'home' && (
            <DashboardPage
              user={currentUser}
              onNavigateTab={(tab) => setCurrentScreen(tab)}
              onOpenInstructorModal={() => setInstructorModalOpen(true)}
            />
          )}

          {currentScreen === 'workout' && (
            <WorkoutPage
              onWorkoutCompleted={() => setCurrentScreen('history')}
            />
          )}

          {currentScreen === 'chat' && (
            <ChatPage
              user={currentUser}
              onNavigateToWorkout={() => setCurrentScreen('workout')}
              onNavigateToHistory={() => setCurrentScreen('history')}
            />
          )}

          {currentScreen === 'history' && (
            <HistoryPage
              onNavigateToChat={() => setCurrentScreen('chat')}
            />
          )}

          {currentScreen === 'profile' && (
            <ProfilePage
              user={currentUser}
              onLogout={() => {
                void authService.logout().catch((error: unknown) => {
                  setAppError(error instanceof Error ? error.message : 'Não foi possível sair da conta.');
                });
              }}
              onOpenPreferences={() => setCurrentScreen('preferences')}
              onOpenInstructorModal={() => setInstructorModalOpen(true)}
            />
          )}
        </main>

        {/* Bottom Navigation com 5 slots garantidos e área segura */}
        {isMainTab && (
          <BottomNav
            currentTab={currentScreen as NavTab}
            onSelectTab={handleSelectTab}
          />
        )}

        {/* Global Instructor Communication Modal */}
        <InstructorReferralModal
          isOpen={instructorModalOpen}
          onClose={() => setInstructorModalOpen(false)}
          user={currentUser}
        />
      </div>
    </div>
  );
}
