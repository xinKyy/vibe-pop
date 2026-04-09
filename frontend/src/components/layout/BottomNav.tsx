import { useLocation, useNavigate } from 'react-router-dom';

const tabs = [
  { path: '/', icon: '🏠', label: '浏览' },
  { path: '/create', icon: '➕', label: '创作', isCenter: true },
  { path: '/profile', icon: '👤', label: '我的' },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="absolute bottom-0 left-0 right-0 h-15 bg-[var(--color-bg-primary)]/95 backdrop-blur-xl border-t border-[var(--color-border)] flex justify-around items-center z-[1000]">
      {tabs.map((tab) =>
        tab.isCenter ? (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className="w-12 h-12 rounded-full bg-gradient-to-br from-pink to-pink-dark flex items-center justify-center text-white text-2xl -mt-5 shadow-[0_4px_20px_rgba(255,107,157,0.4)] active:scale-95 transition-transform"
          >
            {tab.icon}
          </button>
        ) : (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className={`flex flex-col items-center gap-1 text-[11px] px-5 py-2 transition-colors ${
              isActive(tab.path) ? 'text-pink' : 'text-[var(--color-text-dim)]'
            }`}
          >
            <span className="text-2xl">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        )
      )}
    </nav>
  );
}
