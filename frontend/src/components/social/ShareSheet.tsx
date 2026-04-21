import type { Content } from '../../types';
import { useTranslation } from '../../i18n';

interface ShareSheetProps {
  content: Content;
  isOpen: boolean;
  onClose: () => void;
}

export default function ShareSheet({ content, isOpen, onClose }: ShareSheetProps) {
  const { t } = useTranslation();
  if (!isOpen) return null;

  const shareUrl = `${window.location.origin}/c/${content.id}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      onClose();
    } catch {
      const input = document.createElement('input');
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      onClose();
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: content.title,
          text: t('share.nativeText', { title: content.title }),
          url: shareUrl,
        });
      } catch { /* user cancelled */ }
    }
    onClose();
  };

  const shareActions = [
    { label: t('share.action.copyLink'), action: handleCopyLink, icon: '⊡' },
    { label: t('share.action.wechat'), action: handleCopyLink, icon: '◈' },
    { label: t('share.action.weibo'), action: handleCopyLink, icon: '◉' },
    { label: t('share.action.more'), action: handleNativeShare, icon: '···' },
  ];

  return (
    <div className="fixed inset-0 z-[2000] flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-[430px] bg-bg animate-slide-up rounded-t-[var(--radius-xl)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center py-3.5">
          <div className="w-9 h-1 bg-border/60 rounded-full" />
        </div>

        <div className="px-5 pb-5">
          <div className="text-[15px] font-semibold text-center mb-5">{t('share.title')}</div>

          <div className="overflow-hidden mb-5 rounded-[var(--radius-md)] bg-card">
            <div
              className="h-28 flex items-center justify-center text-4xl"
              style={{ background: content.coverGradient }}
            >
              {content.coverEmoji}
            </div>
            <div className="p-3.5">
              <div className="text-[14px] font-semibold">{content.title}</div>
              <div className="text-[13px] text-dim font-medium mt-1.5">
                {content.author.displayName} · @{content.author.username} · VibePop
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3 mb-5">
            {shareActions.map((item) => (
              <button
                key={item.label}
                onClick={item.action}
                className="flex flex-col items-center gap-2.5 py-3.5 rounded-[var(--radius-md)] bg-card hover:bg-accent hover:text-accent-fg transition-all duration-200 group active:scale-95"
              >
                <span className="text-xl group-hover:scale-110 transition-transform">{item.icon}</span>
                <span className="text-[12px] font-medium text-dim group-hover:text-accent-fg transition-colors">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-4.5 border-t border-border/30 text-[14px] font-medium text-dim hover:text-fg transition-all duration-200"
        >
          {t('common.cancel')}
        </button>
      </div>
    </div>
  );
}
