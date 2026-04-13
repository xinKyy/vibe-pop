import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import BrowsePage from './pages/BrowsePage';
import CreatePage from './pages/CreatePage';
import ProfilePage from './pages/ProfilePage';
import UserPage from './pages/UserPage';
import LoginPage from './pages/LoginPage';
import ImmersivePage from './pages/ImmersivePage';
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
        <Route element={<AppShell />}>
          <Route path="/" element={<BrowsePage />} />
          <Route path="/create" element={<CreatePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/user/:userId" element={<UserPage />} />
        </Route>
        <Route path="/immersive" element={<ImmersivePage />} />
        <Route path="/login" element={<LoginPageWrapper />} />
      </Routes>
    </BrowserRouter>
  );
}

function LoginPageWrapper() {
  return (
    <div className="h-dvh w-full flex items-center justify-center bg-[#050507]">
      <div className="relative w-full max-w-[430px] h-full min-[431px]:h-[calc(100dvh-40px)] min-[431px]:max-h-[932px] bg-bg overflow-hidden min-[431px]:rounded-2xl min-[431px]:border min-[431px]:border-border/50">
        <LoginPage />
      </div>
    </div>
  );
}
