import { useNavigate } from 'react-router-dom';

interface FollowItem {
  id: string;
  username: string;
  handle: string;
  avatar: string;
}

interface FollowListModalProps {
  title: string;
  items: FollowItem[];
  isOpen: boolean;
  onClose: () => void;
}

export default function FollowListModal({ title, items, isOpen, onClose }: FollowListModalProps) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-[375px] max-h-[70vh] bg-[var(--color-bg-primary)] rounded-t-2xl flex flex-col animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
          <span className="text-sm font-semibold">{title}</span>
          <button onClick={onClose} className="text-[var(--color-text-dim)] text-lg">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="text-center py-12 text-[var(--color-text-dim)] text-sm">
              暂无数据
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--color-bg-card)] cursor-pointer transition-colors"
                onClick={() => { onClose(); navigate(`/user/${item.id}`); }}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink/30 to-pink-dark/30 flex items-center justify-center text-lg">
                  {item.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{item.username}</div>
                  <div className="text-xs text-[var(--color-text-muted)]">@{item.handle}</div>
                </div>
                <button className="px-3 py-1.5 bg-gradient-to-br from-pink to-pink-dark rounded-2xl text-white text-xs">
                  + 关注
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
