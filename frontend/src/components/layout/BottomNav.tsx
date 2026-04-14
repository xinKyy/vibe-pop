import { useLocation, useNavigate } from 'react-router-dom';

const tabs = [
  { path: '/', label: '发现', icon: '◈' },
  { path: '/create', label: '创作', icon: '+', isCenter: true },
  { path: '/profile', label: '我的', icon: '◎' },
] as const;

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="absolute bottom-0 left-0 right-0 h-[60px] bg-bg/95 backdrop-blur-xl border-t border-border/50 flex items-center px-2 z-[1000]">
      {tabs.map((tab) => (
        <button
          key={tab.path}
          onClick={() => navigate(tab.path)}
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-1.5 transition-all duration-200 ${
            'isCenter' in tab
              ? ''
              : isActive(tab.path)
                ? 'text-accent'
                : 'text-dim hover:text-muted-fg'
          }`}
        >
          {'isCenter' in tab ? (
            <div className="w-10 h-10 rounded-[var(--radius-md)] bg-accent text-accent-fg flex items-center justify-center text-xl font-bold hover:brightness-110 active:scale-95 transition-all duration-200">
              {tab.icon}
            </div>
          ) : (
            <>
              <span className="text-base leading-none">{tab.icon}</span>
              <span className="text-[10px] font-semibold tracking-wide">{tab.label}</span>
            </>
          )}
        </button>
      ))}
    </nav>
  );
}
