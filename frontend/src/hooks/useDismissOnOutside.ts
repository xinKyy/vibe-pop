import { useEffect, useState, type RefObject } from 'react';

interface Options {
  /**
   * 打开到可被外部点击关闭之间的延迟（ms）。用来躲开 mobile 上
   * touchend 合成的一组 mousedown+mouseup+click 打到新挂载的 overlay
   * 导致"弹窗闪一下就关"的 ghost click。
   */
  armDelayMs?: number;
  /** 是否同时响应 Esc 关闭，默认开启 */
  closeOnEscape?: boolean;
}

/**
 * 统一处理 modal / sheet / dialog 的"点外部关闭 + Esc 关闭"。
 *
 * - 用 document 级 `pointerdown`（capture 阶段）监听，避开 React 合成事件
 *   的 stopPropagation 影响，对不同浏览器 / 触屏设备行为一致。
 * - 挂载后有一个短暂的 armed 窗口，期间忽略外部点击（见 {@link Options.armDelayMs}）。
 */
export function useDismissOnOutside(
  isOpen: boolean,
  onClose: () => void,
  panelRef: RefObject<HTMLElement | null>,
  { armDelayMs = 200, closeOnEscape = true }: Options = {},
) {
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setArmed(false);
      return;
    }
    const timer = window.setTimeout(() => setArmed(true), armDelayMs);
    return () => window.clearTimeout(timer);
  }, [isOpen, armDelayMs]);

  useEffect(() => {
    if (!isOpen || !armed) return;

    const handlePointerDown = (e: PointerEvent) => {
      const panel = panelRef.current;
      if (!panel) return;
      if (e.target instanceof Node && panel.contains(e.target)) return;
      onClose();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (closeOnEscape && e.key === 'Escape') onClose();
    };

    document.addEventListener('pointerdown', handlePointerDown, true);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, armed, onClose, panelRef, closeOnEscape]);
}
