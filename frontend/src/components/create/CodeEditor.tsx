import { useMemo, useRef, useEffect } from 'react';
import { useTranslation } from '../../i18n';

interface CodeEditorProps {
  value: string;
  onChange: (v: string) => void;
  readOnly?: boolean;
  errors?: number;
  /** 字符数显示与校验上限（字节） */
  sizeLimit?: number;
}

/**
 * 轻量代码编辑器：textarea + 行号。
 * 不依赖 Monaco（约 1MB），保持首屏轻量；若后续需要高级特性可替换。
 */
export default function CodeEditor({ value, onChange, readOnly, errors = 0, sizeLimit = 50 * 1024 }: CodeEditorProps) {
  const { t } = useTranslation();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  const lineCount = useMemo(() => Math.max(1, value.split('\n').length), [value]);
  const sizeBytes = useMemo(() => new Blob([value]).size, [value]);
  const oversize = sizeBytes > sizeLimit;

  useEffect(() => {
    const ta = textareaRef.current;
    const gutter = gutterRef.current;
    if (!ta || !gutter) return;
    const sync = () => { gutter.scrollTop = ta.scrollTop; };
    ta.addEventListener('scroll', sync);
    return () => ta.removeEventListener('scroll', sync);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = e.currentTarget;
      const { selectionStart: s, selectionEnd: ed } = ta;
      const next = value.slice(0, s) + '  ' + value.slice(ed);
      onChange(next);
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = s + 2;
      });
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0d0d10]">
      <div className="flex flex-1 min-h-0 font-mono text-[12px] leading-[1.5]">
        <div
          ref={gutterRef}
          className="select-none overflow-hidden text-right text-dim bg-[#0a0a0c] border-r border-border/40"
          style={{ padding: '12px 8px 12px 12px', minWidth: 44 }}
        >
          {Array.from({ length: lineCount }).map((_, i) => (
            <div key={i} style={{ fontVariantNumeric: 'tabular-nums' }}>{i + 1}</div>
          ))}
        </div>
        <textarea
          ref={textareaRef}
          value={value}
          readOnly={readOnly}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
          className="flex-1 bg-transparent text-fg outline-none resize-none"
          style={{
            padding: 12,
            whiteSpace: 'pre',
            overflowWrap: 'normal',
            overflow: 'auto',
            caretColor: 'var(--color-accent)',
            lineHeight: 1.5,
          }}
        />
      </div>
      {/* 底部状态栏 */}
      <div
        className="flex items-center justify-between border-t border-border/40 text-[11px] text-muted-fg select-none"
        style={{ padding: '6px 12px', background: '#0a0a0c' }}
      >
        <span className="tabular-nums">{t('editor.lineChar', { lines: lineCount, chars: value.length })}</span>
        <span className={`tabular-nums ${oversize ? 'text-red-400' : ''}`}>
          {(sizeBytes / 1024).toFixed(1)} / {(sizeLimit / 1024).toFixed(0)} KB
          {oversize && t('editor.oversize')}
          {errors > 0 && t('editor.errors', { count: errors })}
        </span>
      </div>
    </div>
  );
}
