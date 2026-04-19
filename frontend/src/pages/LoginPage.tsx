import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { api } from '../api/client';
import Logo from '../components/ui/Logo';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
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
      setError(e.message || '发送失败');
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
      setError(e.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-bg">
      <div className="flex items-center px-5 py-3.5">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-[var(--radius-sm)] bg-muted flex items-center justify-center text-muted-fg hover:bg-border hover:text-fg transition-all duration-200"
        >
          ←
        </button>
      </div>

      <div className="flex-1 flex flex-col px-6 pt-5">
        <div className="mb-12">
          <Logo size={72} className="mb-5" />
          <div className="text-[clamp(2rem,10vw,3rem)] font-bold tracking-tight leading-tight mb-3">
            <span className="text-accent">登录</span> VibePop
          </div>
          <div className="text-muted-fg text-[14px] font-medium">VibeCoding for Fun</div>
        </div>

        {error && (
          <div className="mb-6 px-4 py-3.5 bg-red-500/10 rounded-[var(--radius-sm)] text-red-400 text-[13px] font-medium animate-fade-in">
            {error}
          </div>
        )}

        <div className="space-y-[18px]">
          <div>
            <label className="text-[13px] text-dim font-semibold mb-2.5 block">邮箱地址</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="hello@example.com"
              className="w-full bg-muted rounded-[var(--radius-sm)] px-4 py-4 text-base font-medium text-fg outline-none focus:ring-1 focus:ring-accent placeholder:text-dim transition-all"
            />
          </div>

          <div>
            <label className="text-[13px] text-dim font-semibold mb-2.5 block">验证码</label>
            <div className="flex gap-3">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                placeholder="000000"
                maxLength={6}
                className="flex-1 bg-muted rounded-[var(--radius-sm)] px-4 py-4 text-base font-medium tracking-[0.2em] text-fg outline-none focus:ring-1 focus:ring-accent placeholder:text-dim transition-all"
              />
              <button
                onClick={sendCode}
                disabled={countdown > 0 || !email.trim()}
                className="px-5 py-4 bg-surface rounded-[var(--radius-sm)] text-[13px] font-semibold text-muted-fg whitespace-nowrap disabled:opacity-30 hover:bg-border hover:text-fg transition-all duration-200"
              >
                {countdown > 0 ? `${countdown}s` : '发送验证码'}
              </button>
            </div>
            <div className="text-[12px] text-dim font-medium mt-3">
              开发模式：输入验证码 000000 即可登录
            </div>
          </div>
        </div>

        <button
          onClick={handleLogin}
          disabled={!email.trim() || !code.trim() || loading}
          className="mt-12 w-full py-4 bg-accent text-accent-fg text-[15px] font-semibold rounded-[var(--radius-md)] disabled:opacity-30 active:scale-[0.98] hover:brightness-110 transition-all duration-200"
        >
          {loading ? '登录中...' : '登录 / 注册'}
        </button>

        <div className="text-center text-[13px] text-dim font-medium mt-4">
          未注册的邮箱将自动创建账号
        </div>
      </div>
    </div>
  );
}
