import type { Content } from '../../types';

interface ShareSheetProps {
  content: Content;
  isOpen: boolean;
  onClose: () => void;
}

export default function ShareSheet({ content, isOpen, onClose }: ShareSheetProps) {
  if (!isOpen) return null;

  const shareUrl = `${window.location.origin}/c/${content.id}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      onClose();
    } catch {
      // fallback
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
          text: `来 VibePop 看看「${content.title}」`,
          url: shareUrl,
        });
      } catch { /* user cancelled */ }
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-[375px] bg-[var(--color-bg-primary)] rounded-t-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 py-4 border-b border-[var(--color-border)]">
          <div className="text-sm font-semibold text-center">分享</div>
        </div>

        <div className="p-4">
          {/* Share card preview */}
          <div className="rounded-xl overflow-hidden mb-4">
            <div
              className="h-32 flex items-center justify-center text-5xl"
              style={{ background: content.coverGradient }}
            >
              {content.coverEmoji}
            </div>
            <div className="bg-[var(--color-bg-card)] p-3">
              <div className="text-sm font-medium">{content.title}</div>
              <div className="text-xs text-[var(--color-text-muted)] mt-1">
                @{content.author.username} · VibePop
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            {[
              { icon: '📋', label: '复制链接', action: handleCopyLink },
              { icon: '💬', label: '微信', action: handleCopyLink },
              { icon: '🐦', label: '微博', action: handleCopyLink },
              { icon: '📤', label: '更多', action: handleNativeShare },
            ].map((item) => (
              <button
                key={item.label}
                onClick={item.action}
                className="flex flex-col items-center gap-2 py-3"
              >
                <div className="w-12 h-12 rounded-full bg-[var(--color-bg-card)] flex items-center justify-center text-2xl">
                  {item.icon}
                </div>
                <span className="text-[11px] text-[var(--color-text-muted)]">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-4 border-t border-[var(--color-border)] text-sm text-[var(--color-text-muted)]"
        >
          取消
        </button>
      </div>
    </div>
  );
}
