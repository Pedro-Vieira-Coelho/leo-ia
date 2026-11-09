import React, { useState, useEffect } from 'react';
import { authService } from './services/auth.service';
import { UserProfile } from './models/user.model';
import { Header } from './components/Header';
import { BottomNav, NavTab } from './components/BottomNav';
import { InstructorReferralModal } from './components/InstructorReferralModal';

// 8 Required Screens
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { PreferencesPage } from './pages/PreferencesPage';
import { DashboardPage } from './pages/DashboardPage';
import { WorkoutPage } from './pages/WorkoutPage';
import { ChatPage } from './pages/ChatPage';
import { HistoryPage } from './pages/HistoryPage';
import { ProfilePage } from './pages/ProfilePage';

export type AppScreen =
  | 'login'
  | 'register'
  | 'preferences'
  | 'home'
  | 'workout'
  | 'chat'
  | 'history'
  | 'profile';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile>(authService.getUser());
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('home');
  const [instructorModalOpen, setInstructorModalOpen] = useState(false);

  useEffect(() => {
    const unsub = authService.subscribe(() => {
      setCurrentUser(authService.getUser());
    });
    return () => unsub();
  }, []);

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
                authService.logout();
                setCurrentScreen('login');
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
