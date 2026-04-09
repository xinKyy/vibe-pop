import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import BrowsePage from './pages/BrowsePage';
import CreatePage from './pages/CreatePage';
import ProfilePage from './pages/ProfilePage';
import UserPage from './pages/UserPage';
import LoginPage from './pages/LoginPage';
import PublishPage from './pages/PublishPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<BrowsePage />} />
          <Route path="/create" element={<CreatePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/user/:userId" element={<UserPage />} />
          <Route path="/publish/:contentId" element={<PublishPage />} />
        </Route>
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}
