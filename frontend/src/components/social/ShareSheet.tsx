import { useRef } from 'react';
import { createPortal } from 'react-dom';
import type { Content } from '../../types';
import { useTranslation } from '../../i18n';
import { useDismissOnOutside } from '../../hooks/useDismissOnOutside';

interface ShareSheetProps {
  content: Content;
  isOpen: boolean;
  onClose: () => void;
}

export default function ShareSheet({ content, isOpen, onClose }: ShareSheetProps) {
  const { t } = useTranslation();
  const panelRef = useRef<HTMLDivElement>(null);
  useDismissOnOutside(isOpen, onClose, panelRef);

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

  const sheet = (
    <div className="fixed inset-0 z-[2000] flex items-end justify-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        ref={panelRef}
        className="relative w-full max-w-[430px] bg-bg animate-slide-up rounded-t-[var(--radius-xl)]"
      >
        {/*
          间距一律用 inline style 固化。
          原因：Portal 到 body 后部分环境下 Tailwind 的 padding / margin / gap 类（尤其 `py-4.5`
          这种非标准 spacing 刻度）表现不稳，为避免样式漂移统一走 style。
        */}
        <div className="flex justify-center" style={{ padding: '14px 0' }}>
          <div className="w-9 h-1 bg-border/60 rounded-full" />
        </div>

        <div style={{ padding: '0 20px 20px' }}>
          <div className="text-[15px] font-semibold text-center" style={{ marginBottom: 20 }}>
            {t('share.title')}
          </div>

          <div
            className="overflow-hidden rounded-[var(--radius-md)] bg-card"
            style={{ marginBottom: 20 }}
          >
            <div
              className="h-28 flex items-center justify-center text-4xl"
              style={{ background: content.coverGradient }}
            >
              {content.coverEmoji}
            </div>
            <div style={{ padding: 14 }}>
              <div className="text-[14px] font-semibold">{content.title}</div>
              <div className="text-[13px] text-dim font-medium" style={{ marginTop: 6 }}>
                {content.author.displayName} · @{content.author.username} · VibePop
              </div>
            </div>
          </div>

          <div
            className="grid grid-cols-4"
            style={{ gap: 12, marginBottom: 20 }}
          >
            {shareActions.map((item) => (
              <button
                key={item.label}
                onClick={item.action}
                className="flex flex-col items-center rounded-[var(--radius-md)] bg-card hover:bg-accent hover:text-accent-fg transition-all duration-200 group active:scale-95"
                style={{ padding: '14px 0', gap: 10 }}
              >
                <span className="text-xl group-hover:scale-110 transition-transform">{item.icon}</span>
                <span className="text-[12px] font-medium text-dim group-hover:text-accent-fg transition-colors">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full border-t border-border/30 text-[14px] font-medium text-dim hover:text-fg transition-all duration-200"
          style={{ padding: '18px 0' }}
        >
          {t('common.cancel')}
        </button>
      </div>
    </div>
  );

  return createPortal(sheet, document.body);
}
