import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { api } from '../api/client';
import type { User } from '../types';
import Logo from '../components/ui/Logo';
import { useTranslation } from '../i18n';

const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { user, isLoggedIn, updateUser } = useAuthStore();
  const { t } = useTranslation();

  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const syncedRef = useRef(false);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login', { replace: true });
      return;
    }
    if (user?.onboarded) {
      navigate('/profile', { replace: true });
      return;
    }
    // 进入页面时跟服务端同步一次真实状态，防止本地缓存过期（例如之前已完成但 localStorage 没更新）。
    if (syncedRef.current) return;
    syncedRef.current = true;
    api.users
      .me()
      .then((res) => {
        if (!res?.success || !res.data) return;
        const fresh = res.data as Partial<User>;
        updateUser(fresh);
        if (fresh.onboarded) navigate('/profile', { replace: true });
      })
      .catch(() => {
        // 忽略：网络失败不影响用户继续填表
      });
  }, [isLoggedIn, user?.onboarded, navigate, updateUser]);

  const usernameError = useMemo(() => {
    if (!username) return '';
    return USERNAME_RE.test(username) ? '' : t('onboarding.error.usernameInvalid');
  }, [username, t]);

  const displayNameError = useMemo(() => {
    if (!displayName) return '';
    return displayName.trim().length >= 1 && displayName.trim().length <= 20
      ? ''
      : t('onboarding.error.displayNameLength');
  }, [displayName, t]);

  const canSubmit =
    username.length >= 3 &&
    !usernameError &&
    displayName.trim().length >= 1 &&
    !displayNameError &&
    !submitting;

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;
    setError('');
    setSubmitting(true);
    try {
      const res = await api.users.completeOnboarding({
        username: username.trim().toLowerCase(),
        displayName: displayName.trim(),
      });
      if (!res.success || !res.data) {
        throw new Error(res.error || t('onboarding.error.unknown'));
      }
      updateUser(res.data as Partial<User>);
      setToast(t('onboarding.toast.success'));
      window.setTimeout(() => navigate('/profile', { replace: true }), 600);
    } catch (e: any) {
      const code = typeof e?.message === 'string' ? e.message : '';
      // 服务端已经完成过引导：本地状态过期，拉一次 me() 再跳到个人页，不给用户显示技术错误码。
      if (code === 'ONBOARDING_ALREADY_DONE') {
        try {
          const me = await api.users.me();
          if (me?.success && me.data) updateUser(me.data as Partial<User>);
        } catch {
          // 忽略
        }
        navigate('/profile', { replace: true });
        return;
      }
      if (code === 'USERNAME_TAKEN') setError(t('onboarding.error.usernameTaken'));
      else if (code === 'INVALID_USERNAME') setError(t('onboarding.error.usernameInvalid'));
      else if (code === 'INVALID_DISPLAY_NAME') setError(t('onboarding.error.displayNameLength'));
      else setError(code || t('onboarding.error.unknown'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="h-full flex flex-col bg-bg overflow-y-auto"
      style={{ padding: '24px 28px 40px' }}
    >
      <div style={{ marginBottom: 32 }}>
        <div style={{ marginBottom: 20 }}>
          <Logo size={56} />
        </div>
        <div
          className="text-[28px] font-bold tracking-tight leading-tight"
          style={{ marginBottom: 10 }}
        >
          {t('onboarding.header')}
        </div>
        <div className="text-muted-fg text-[14px] font-medium leading-relaxed">
          {t('onboarding.subtitle')}
        </div>
      </div>

      {error && (
        <div
          className="bg-red-500/10 rounded-[var(--radius-sm)] text-red-400 text-[13px] font-medium animate-fade-in"
          style={{ padding: '14px 16px', marginBottom: 20 }}
        >
          {error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
        <div>
          <label
            className="text-[13px] text-dim font-semibold block"
            style={{ marginBottom: 8 }}
          >
            {t('onboarding.username.label')}
          </label>
          <div
            className="flex items-center bg-muted rounded-[var(--radius-sm)] focus-within:ring-1 focus-within:ring-accent transition-all"
            style={{ padding: '0 16px' }}
          >
            <span className="text-dim text-base font-medium select-none" style={{ marginRight: 2 }}>@</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              placeholder={t('onboarding.username.placeholder')}
              maxLength={20}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              className="flex-1 bg-transparent text-base font-medium text-fg outline-none placeholder:text-dim"
              style={{ padding: '14px 0' }}
            />
          </div>
          <div
            className="text-[12px] font-medium"
            style={{ marginTop: 8, color: usernameError ? '#f87171' : undefined }}
          >
            {usernameError || t('onboarding.username.hint')}
          </div>
        </div>

        <div>
          <label
            className="text-[13px] text-dim font-semibold block"
            style={{ marginBottom: 8 }}
          >
            {t('onboarding.displayName.label')}
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder={t('onboarding.displayName.placeholder')}
            maxLength={20}
            className="w-full bg-muted rounded-[var(--radius-sm)] text-base font-medium text-fg outline-none focus:ring-1 focus:ring-accent placeholder:text-dim transition-all"
            style={{ padding: '14px 16px' }}
          />
          <div
            className="text-[12px] font-medium"
            style={{ marginTop: 8, color: displayNameError ? '#f87171' : undefined }}
          >
            {displayNameError || t('onboarding.displayName.hint')}
          </div>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="w-full bg-accent text-accent-fg text-[15px] font-semibold rounded-[var(--radius-md)] disabled:opacity-30 active:scale-[0.98] hover:brightness-110 transition-all duration-200"
        style={{ marginTop: 36, padding: '14px 0' }}
      >
        {submitting ? t('onboarding.submitting') : t('onboarding.submit')}
      </button>

      {toast && (
        <div
          className="fixed left-1/2 -translate-x-1/2 z-[3000] bg-black/80 text-white text-[12px] rounded-[var(--radius-sm)]"
          style={{ bottom: 100, padding: '8px 14px' }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
