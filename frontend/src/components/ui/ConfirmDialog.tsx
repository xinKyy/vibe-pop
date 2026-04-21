import { useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from '../../i18n';
import { useDismissOnOutside } from '../../hooks/useDismissOnOutside';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  /** 支持字符串或 ReactNode，便于插入图标、分段文案 */
  body?: ReactNode;
  /** 主按钮文案；默认取 common.confirm */
  confirmLabel?: string;
  cancelLabel?: string;
  /** 主按钮样式：默认亮色（accent），destructive 用于删除等危险操作 */
  variant?: 'primary' | 'destructive';
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * 通用居中确认弹窗。通过 Portal 挂到 body，配合 useDismissOnOutside
 * 处理 ghost click。
 */
export default function ConfirmDialog({
  isOpen,
  title,
  body,
  confirmLabel,
  cancelLabel,
  variant = 'primary',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { t } = useTranslation();
  const panelRef = useRef<HTMLDivElement>(null);

  useDismissOnOutside(isOpen, onCancel, panelRef);

  if (!isOpen) return null;

  const confirmBg =
    variant === 'destructive'
      ? 'bg-[#ef4444] text-white hover:bg-[#dc2626]'
      : 'bg-accent text-accent-fg hover:brightness-110';

  const dialog = (
    <div
      className="fixed inset-0 z-[2100] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      style={{ padding: '0 24px' }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" />
      <div
        ref={panelRef}
        className="relative w-full max-w-[360px] bg-bg border border-border/60 rounded-[var(--radius-xl)] shadow-2xl animate-slide-up"
      >
        {/*
          间距一律用 inline style 固化。
          原因：Portal 到 body 后部分环境下 Tailwind 的 padding / margin / gap 类表现不稳，
          为避免样式漂移统一走 style（与 ShareSheet 一致）。
        */}
        <div style={{ padding: '24px 24px 16px' }}>
          <div className="text-[17px] font-semibold text-fg" style={{ marginBottom: 8 }}>
            {title}
          </div>
          {body && (
            <div className="text-[13px] leading-[1.6] text-dim">{body}</div>
          )}
        </div>
        <div className="flex" style={{ gap: 8, padding: '0 16px 16px' }}>
          <button
            onClick={onCancel}
            className="flex-1 rounded-[var(--radius-full)] bg-muted text-muted-fg text-[14px] font-semibold hover:bg-border hover:text-fg transition-all duration-200"
            style={{ height: 40 }}
          >
            {cancelLabel ?? t('common.cancel')}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 rounded-[var(--radius-full)] text-[14px] font-semibold transition-all duration-200 ${confirmBg}`}
            style={{ height: 40 }}
          >
            {confirmLabel ?? t('common.confirm')}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(dialog, document.body);
}
