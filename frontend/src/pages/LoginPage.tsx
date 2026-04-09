import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { mockUser } from '../api/mockData';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);

  const sendCode = async () => {
    if (!email.trim() || countdown > 0) return;
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(timer); return 0; }
        return c - 1;
      });
    }, 1000);
  };

  const handleLogin = async () => {
    if (!email.trim() || !code.trim()) return;
    setLoading(true);

    // Simulate login
    await new Promise((r) => setTimeout(r, 800));
    login(
      { ...mockUser, email },
      'mock_jwt_token_' + Date.now()
    );
    setLoading(false);
    navigate('/profile');
  };

  return (
    <div className="max-w-[375px] mx-auto h-dvh bg-[var(--color-bg-primary)] flex flex-col border-x border-[var(--color-border)]">
      {/* Header */}
      <div className="flex items-center px-4 py-3">
        <button onClick={() => navigate(-1)} className="text-2xl text-white">←</button>
      </div>

      <div className="flex-1 flex flex-col px-8 pt-12">
        <div className="text-3xl font-bold mb-2">
          <span className="bg-gradient-to-r from-pink to-pink-dark bg-clip-text text-transparent">
            VibePop
          </span>
        </div>
        <div className="text-[var(--color-text-muted)] text-sm mb-10">VibeCoding for Fun</div>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-[var(--color-text-muted)] mb-1.5 block">邮箱</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="请输入邮箱地址"
              className="w-full bg-[var(--color-bg-input)] border border-[var(--color-border-input)] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-pink placeholder:text-[var(--color-text-dim)]"
            />
          </div>

          <div>
            <label className="text-xs text-[var(--color-text-muted)] mb-1.5 block">验证码</label>
            <div className="flex gap-3">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                placeholder="输入验证码"
                className="flex-1 bg-[var(--color-bg-input)] border border-[var(--color-border-input)] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-pink placeholder:text-[var(--color-text-dim)]"
              />
              <button
                onClick={sendCode}
                disabled={countdown > 0 || !email.trim()}
                className="px-4 py-3 bg-[var(--color-bg-card)] border border-[var(--color-border-input)] rounded-xl text-sm text-pink whitespace-nowrap disabled:opacity-40 disabled:text-[var(--color-text-dim)]"
              >
                {countdown > 0 ? `${countdown}s` : '发送验证码'}
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogin}
          disabled={!email.trim() || !code.trim() || loading}
          className="mt-8 w-full py-3.5 bg-gradient-to-br from-pink to-pink-dark rounded-3xl text-white text-sm font-semibold disabled:opacity-40 active:scale-[0.98] transition-transform"
        >
          {loading ? '登录中...' : '登录 / 注册'}
        </button>

        <div className="text-center text-xs text-[var(--color-text-dim)] mt-4">
          未注册的邮箱将自动创建账号
        </div>
      </div>
    </div>
  );
}
