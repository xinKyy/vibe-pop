import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { api } from '../api/client';
import Logo from '../components/ui/Logo';
import { useTranslation } from '../i18n';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const sendCode = async () => {
    if (!email.trim() || countdown > 0) return;
    setError('');
    try {
      await api.auth.sendCode(email);
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) { clearInterval(timer); return 0; }
          return c - 1;
        });
      }, 1000);
    } catch (e: any) {
      setError(e.message || t('login.errors.send'));
    }
  };

  const handleLogin = async () => {
    if (!email.trim() || !code.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.auth.login(email, code);
      login(res.data.user, res.data.token);
      navigate('/profile');
    } catch (e: any) {
      setError(e.message || t('login.errors.login'));
    } finally {
      setLoading(false);
    }
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label
              className="text-[13px] text-dim font-semibold block"
              style={{ marginBottom: 10 }}
            >
              {t('login.email')}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('login.emailPlaceholder')}
              className="w-full bg-muted rounded-[var(--radius-sm)] text-base font-medium text-fg outline-none focus:ring-1 focus:ring-accent placeholder:text-dim transition-all"
              style={{ padding: '14px 16px' }}
            />
          </div>

          <div>
            <label
              className="text-[13px] text-dim font-semibold block"
              style={{ marginBottom: 10 }}
            >
              {t('login.code')}
            </label>
            <div style={{ display: 'flex', gap: 12 }}>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                placeholder="000000"
                maxLength={6}
                className="flex-1 bg-muted rounded-[var(--radius-sm)] text-base font-medium tracking-[0.2em] text-fg outline-none focus:ring-1 focus:ring-accent placeholder:text-dim transition-all"
                style={{ padding: '14px 16px' }}
              />
              <button
                onClick={sendCode}
                disabled={countdown > 0 || !email.trim()}
                className="bg-surface rounded-[var(--radius-sm)] text-[13px] font-semibold text-muted-fg whitespace-nowrap disabled:opacity-30 hover:bg-border hover:text-fg transition-all duration-200"
                style={{ padding: '0 20px' }}
              >
                {countdown > 0 ? `${countdown}s` : t('login.sendCode')}
              </button>
            </div>
            <div
              className="text-[12px] text-dim font-medium"
              style={{ marginTop: 10 }}
            >
              {t('login.devHint')}
            </div>
          </div>
        </div>

        <button
          onClick={handleLogin}
          disabled={!email.trim() || !code.trim() || loading}
          className="w-full bg-accent text-accent-fg text-[15px] font-semibold rounded-[var(--radius-md)] disabled:opacity-30 active:scale-[0.98] hover:brightness-110 transition-all duration-200"
          style={{ marginTop: 40, padding: '14px 0' }}
        >
          {loading ? t('login.submitting') : t('login.submit')}
        </button>

        <div
          className="text-center text-[13px] text-dim font-medium"
          style={{ marginTop: 14 }}
        >
          {t('login.autoRegister')}
        </div>
      </div>
    </div>
  );
}
