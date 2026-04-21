import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { useAuthStore } from '../stores/authStore';
import { api } from '../api/client';
import Logo from '../components/ui/Logo';
import { useTranslation } from '../i18n';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    const idToken = credentialResponse.credential;
    if (!idToken) {
      setError(t('login.errors.google'));
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.auth.google(idToken);
      login(res.data.user, res.data.token);
      const needsOnboarding = res.data.isNewUser || !res.data.user?.onboarded;
      navigate(needsOnboarding ? '/onboarding' : '/profile', { replace: true });
    } catch (e: any) {
      setError(e.message || t('login.errors.login'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError(t('login.errors.google'));
  };

  return (
    <div
      className="h-full flex flex-col bg-bg overflow-y-auto"
      style={{ padding: '16px 28px 40px' }}
    >
      <div className="flex items-center" style={{ marginBottom: 20 }}>
        <button
          onClick={() => navigate(-1)}
          className="rounded-[var(--radius-sm)] bg-muted flex items-center justify-center text-muted-fg hover:bg-border hover:text-fg transition-all duration-200"
          style={{ width: 40, height: 40 }}
        >
          ←
        </button>
      </div>

      <div className="flex-1 flex flex-col" style={{ paddingTop: 8 }}>
        <div style={{ marginBottom: 40 }}>
          <div style={{ marginBottom: 20 }}>
            <Logo size={72} />
          </div>
          <div
            className="text-[clamp(2rem,10vw,3rem)] font-bold tracking-tight leading-tight"
            style={{ marginBottom: 10 }}
          >
            <span className="text-accent">{t('login.title')}</span> VibePop
          </div>
          <div className="text-muted-fg text-[14px] font-medium">{t('login.subtitle')}</div>
        </div>

        {error && (
          <div
            className="bg-red-500/10 rounded-[var(--radius-sm)] text-red-400 text-[13px] font-medium animate-fade-in"
            style={{ padding: '14px 16px', marginBottom: 20 }}
          >
            {error}
          </div>
        )}

        <div
          className="flex flex-col items-center"
          style={{ gap: 14, marginTop: 12 }}
        >
          <div
            className="flex justify-center w-full"
            style={{ minHeight: 44, opacity: loading ? 0.4 : 1, pointerEvents: loading ? 'none' : 'auto' }}
          >
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              size="large"
              theme="filled_black"
              shape="pill"
              text="continue_with"
              useOneTap={false}
            />
          </div>

          {loading && (
            <div className="text-muted-fg text-[13px] font-medium">
              {t('login.submitting')}
            </div>
          )}
        </div>

        <div
          className="text-center text-[13px] text-dim font-medium"
          style={{ marginTop: 'auto', paddingTop: 32 }}
        >
          {t('login.autoRegister')}
        </div>
      </div>
    </div>
  );
}
