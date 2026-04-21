import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';
import './index.css';

// Google OAuth Web Client ID.
// Client ID 不是敏感信息（Google 设计上就会暴露在前端 JS），
// 所以这里硬编码一个默认值，支持通过 VITE_GOOGLE_CLIENT_ID 覆盖。
const GOOGLE_CLIENT_ID =
  (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined) ||
  '294530883238-ebgtp2t51j6h8rjl12roiuk5foujlfhf.apps.googleusercontent.com';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>
);
