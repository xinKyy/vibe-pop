import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../i18n';

interface FollowItem {
  id: string;
  username: string;
  displayName: string;
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
  const { t } = useTranslation();

  if (!isOpen) return null;

  const modal = (
    <div
      className="fixed inset-0 z-[2000] flex items-end justify-center"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-[430px] max-h-[70vh] bg-bg flex flex-col animate-slide-up rounded-t-[var(--radius-xl)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center py-3.5">
          <div className="w-9 h-1 bg-border/60 rounded-full" />
        </div>

        <div className="flex items-center justify-between px-5 pb-3.5">
          <span className="text-[15px] font-semibold">{title}</span>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-dim text-sm hover:bg-border hover:text-fg transition-all duration-200">
            ✕
          </button>
        </div>

        <div className="border-t border-border/30" />

        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="text-center py-16 text-dim">
              <div className="text-4xl mb-4 opacity-30">◇</div>
              <div className="text-[14px] font-medium">{t('followList.empty')}</div>
            </div>
          ) : (
            items.map((item, i) => (
              <div
                key={item.id}
                className="flex items-center gap-3.5 px-5 py-[14px] hover:bg-muted/50 cursor-pointer transition-colors animate-fade-in"
                style={{ animationDelay: `${i * 0.03}s` }}
                onClick={() => { onClose(); navigate(`/user/${item.id}`); }}
              >
                <div className="w-11 h-11 bg-muted rounded-full flex items-center justify-center text-lg">
                  {item.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-semibold truncate">{item.displayName}</div>
                  <div className="text-[13px] text-dim font-medium mt-0.5">@{item.username}</div>
                </div>
                <button className="px-4.5 py-2.5 bg-accent text-accent-fg text-[13px] font-semibold rounded-[var(--radius-full)] active:scale-95 transition-all">
                  {t('followList.follow')}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
