import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import BrowsePage from './pages/BrowsePage';
import CreatePage from './pages/CreatePage';
import ProfilePage from './pages/ProfilePage';
import UserPage from './pages/UserPage';
import LoginPage from './pages/LoginPage';
import OnboardingPage from './pages/OnboardingPage';
import ImmersivePage from './pages/ImmersivePage';
import ContentDetailPage from './pages/ContentDetailPage';
import { useAuthStore } from './stores/authStore';
import { useSocialStore } from './stores/socialStore';

function NoiseTexture() {
  return (
    <svg className="noise-overlay" aria-hidden="true">
      <title>texture</title>
      <filter id="noise">
        <feTurbulence baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
      </filter>
      <rect width="100%" height="100%" filter="url(#noise)" />
    </svg>
  );
}

export default function App() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const initSocial = useSocialStore((s) => s.init);
  const resetSocial = useSocialStore((s) => s.reset);

  useEffect(() => {
    if (isLoggedIn) {
      initSocial();
    } else {
      resetSocial();
    }
  }, [isLoggedIn, initSocial, resetSocial]);

  return (
    <BrowserRouter>
      <NoiseTexture />
      <Routes>
        <Route
          element={
            <OnboardingGuard>
              <AppShell />
            </OnboardingGuard>
          }
        >
          <Route path="/" element={<BrowsePage />} />
          <Route path="/create" element={<CreatePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/user/:userId" element={<UserPage />} />
        </Route>
        <Route
          path="/immersive"
          element={
            <OnboardingGuard>
              <ImmersivePage />
            </OnboardingGuard>
          }
        />
        <Route
          path="/c/:contentId"
          element={
            <OnboardingGuard>
              <ContentDetailPage />
            </OnboardingGuard>
          }
        />
        <Route path="/login" element={<LoginPageWrapper />} />
        <Route path="/onboarding" element={<OnboardingPageWrapper />} />
      </Routes>
    </BrowserRouter>
  );
}

/**
 * 已登录但尚未完成新用户引导时，把用户强制送到 /onboarding。
 * 未登录用户不受影响（各页面自行处理匿名态）。
 */
function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  if (isLoggedIn && user && user.onboarded === false) {
    return <Navigate to="/onboarding" replace state={{ from: location.pathname }} />;
  }
  return <>{children}</>;
}

function CenteredPhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-dvh w-full flex items-center justify-center bg-[#050507]">
      <div className="relative w-full max-w-[430px] h-full min-[431px]:h-[calc(100dvh-40px)] min-[431px]:max-h-[932px] bg-bg overflow-hidden min-[431px]:rounded-2xl min-[431px]:border min-[431px]:border-border/50">
        {children}
      </div>
    </div>
  );
}

function LoginPageWrapper() {
  return (
    <CenteredPhoneFrame>
      <LoginPage />
    </CenteredPhoneFrame>
  );
}

function OnboardingPageWrapper() {
  return (
    <CenteredPhoneFrame>
      <OnboardingPage />
    </CenteredPhoneFrame>
  );
}
