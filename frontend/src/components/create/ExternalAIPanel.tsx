import { useMemo, useState } from 'react';
import { buildExternalPrompt } from '../../utils/prompts';
import { useTranslation } from '../../i18n';

interface ExternalAIPanelProps {
  /** 用户对想法的描述（与内置 AI 输入共用） */
  prompt: string;
  onPromptChange: (v: string) => void;
  /** 粘贴代码并进入预览阶段 */
  onSubmitCode: (code: string) => void;
}

const CODE_WARN_BYTES = 50 * 1024;

export default function ExternalAIPanel({ prompt, onPromptChange, onSubmitCode }: ExternalAIPanelProps) {
  const { t } = useTranslation();
  const [showPromptCard, setShowPromptCard] = useState(false);
  const [pastedCode, setPastedCode] = useState('');
  const [toast, setToast] = useState('');

  const promptData = useMemo(() => buildExternalPrompt(prompt), [prompt]);
  const pastedBytes = useMemo(() => new Blob([pastedCode]).size, [pastedCode]);
  const oversize = pastedBytes > CODE_WARN_BYTES;

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(''), 1500);
  };

  const generateAndCopy = async () => {
    if (!prompt.trim()) {
      showToast(t('external.toast.emptyPrompt'));
      return;
    }
    setShowPromptCard(true);
    try {
      await navigator.clipboard.writeText(promptData.full);
      showToast(t('external.toast.promptCopied'));
    } catch {
      showToast(t('external.toast.copyManually'));
    }
  };

  const copyFull = async () => {
    try {
      await navigator.clipboard.writeText(promptData.full);
      showToast(t('common.copied'));
    } catch {
      showToast(t('common.copyFailed'));
    }
  };

  const handleEnterPreview = () => {
    const code = extractHtml(pastedCode.trim());
    if (!code) {
      showToast(t('external.toast.emptyCode'));
      return;
    }
    onSubmitCode(code);
  };

  return (
    <div className="flex flex-col gap-4 relative">
      {/* Step1: 描述 + 生成提示词 */}
      <div className="bg-surface rounded-[var(--radius-md)] border border-border/40" style={{ padding: 14 }}>
        <div className="text-[12px] font-semibold text-dim" style={{ marginBottom: 8 }}>{t('external.step1.label')}</div>
        <textarea
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          placeholder={t('external.step1.placeholder')}
          rows={3}
          className="w-full bg-muted rounded-[var(--radius-sm)] text-[14px] text-fg resize-none outline-none focus:ring-1 focus:ring-accent placeholder:text-dim leading-relaxed transition-all"
          style={{ padding: 12 }}
        />
        <button
          onClick={generateAndCopy}
          className="w-full bg-accent text-accent-fg text-[13px] font-semibold rounded-[var(--radius-sm)] active:scale-[0.98] hover:brightness-110 transition-all disabled:opacity-30"
          style={{ marginTop: 8, padding: '10px 0' }}
          disabled={!prompt.trim()}
        >
          {t('external.step1.generate')}
        </button>
      </div>

      {/* Step2: 提示词卡片 */}
      {showPromptCard && (
        <div className="bg-surface rounded-[var(--radius-md)] border border-border/40 animate-fade-in" style={{ padding: 14 }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
            <span className="text-[12px] font-semibold text-dim">{t('external.step2.label')}</span>
            <button
              onClick={copyFull}
              className="bg-muted hover:bg-border text-muted-fg hover:text-fg text-[11px] font-semibold rounded transition-colors"
              style={{ padding: '4px 10px' }}
            >
              {t('external.step2.copy')}
            </button>
          </div>
          <div
            className="bg-[#0a0a0c] rounded-[var(--radius-sm)] text-[11px] leading-relaxed font-mono text-muted-fg border border-border/40 whitespace-pre-wrap overflow-auto"
            style={{ padding: 12, maxHeight: 220 }}
          >
            {promptData.full}
          </div>
          <div className="text-[11px] text-dim" style={{ marginTop: 8 }}>
            {t('external.step2.support')}
          </div>
        </div>
      )}

      {/* Step3: 粘贴代码 */}
      <div className="bg-surface rounded-[var(--radius-md)] border border-border/40" style={{ padding: 14 }}>
        <div className="text-[12px] font-semibold text-dim" style={{ marginBottom: 8 }}>{t('external.step3.label')}</div>
        <textarea
          value={pastedCode}
          onChange={(e) => setPastedCode(e.target.value)}
          placeholder={t('external.step3.placeholder')}
          rows={6}
          className="w-full bg-muted rounded-[var(--radius-sm)] text-[12px] text-fg font-mono resize-none outline-none focus:ring-1 focus:ring-accent placeholder:text-dim leading-relaxed transition-all"
          style={{ padding: 12 }}
        />
        <div className="flex items-center justify-between" style={{ marginTop: 8 }}>
          <span className={`text-[11px] tabular-nums ${oversize ? 'text-red-400' : 'text-dim'}`}>
            {(pastedBytes / 1024).toFixed(1)} KB
            {oversize && t('external.sizeWarn')}
          </span>
          <button
            onClick={handleEnterPreview}
            disabled={!pastedCode.trim()}
            className="bg-accent text-accent-fg text-[13px] font-semibold rounded-[var(--radius-sm)] active:scale-[0.98] hover:brightness-110 transition-all disabled:opacity-30"
            style={{ padding: '8px 18px' }}
          >
            {t('external.step3.preview')}
          </button>
        </div>
      </div>

      {toast && (
        <div
          className="fixed left-1/2 -translate-x-1/2 z-50 bg-black/80 text-white text-[12px] rounded-[var(--radius-sm)]"
          style={{ bottom: 100, padding: '8px 14px' }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}

/**
 * 尝试从用户粘贴的文本中提取 HTML。
 * - 若包含 ```html ``` 围栏，仅取代码块
 * - 若仅粘贴了 <body> 内片段，包一层 HTML 骨架
 */
function extractHtml(raw: string): string {
  if (!raw) return '';
  const fence = raw.match(/```(?:html)?\n?([\s\S]*?)```/i);
  let code = fence ? fence[1].trim() : raw.trim();
  if (/<!DOCTYPE\s+html/i.test(code) || /<html[\s>]/i.test(code)) return code;
  // 片段 - 包一层骨架
  return `<!DOCTYPE html>\n<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>\n${code}\n</body></html>`;
}
