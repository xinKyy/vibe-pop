import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Marquee from '../components/ui/Marquee';
import Logo from '../components/ui/Logo';
import PreviewWorkspace from '../components/create/PreviewWorkspace';
import ExternalAIPanel from '../components/create/ExternalAIPanel';
import { api } from '../api/client';
import { useAuthStore } from '../stores/authStore';
import {
  findForeignBlobUrls,
  injectAssets,
  remapBlobUrlsToAssetPaths,
  type Asset,
} from '../utils/assets';
import { stripCodeFence } from '../utils/stripCodeFence';
import type { Content, ContentType, PromptTemplateDTO } from '../types';
import { useTranslation, type TranslationKey } from '../i18n';
import type { Language } from '../stores/settingsStore';

type Stage = 'input' | 'generating' | 'preview' | 'publish';
type CreateMode = 'builtin' | 'external';

/** 根据当前语言挑选 i18n 文案；缺失时回退到中文，再到英文，最后给空串 */
function pickLocalized(
  value: { zh: string; en: string } | string | undefined | null,
  language: Language,
): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value[language] ?? value.zh ?? value.en ?? '';
}

export default function CreatePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuthStore();
  const { t, language } = useTranslation();
  const remixContent = (location.state as { remix?: Content })?.remix;
  const editContent = (location.state as { edit?: Content })?.edit;

  const [prompt, setPrompt] = useState(
    remixContent
      ? t('create.remix.descTemplate', {
          title: remixContent.title,
          username: remixContent.author?.username || '',
        }) + ' '
      : '',
  );
  // Remix / Edit 直接进入预览编辑器：把原作品代码作为"基线代码"填入
  const [stage, setStage] = useState<Stage>(remixContent || editContent ? 'preview' : 'input');
  const [createMode, setCreateMode] = useState<CreateMode>('builtin');
  /** 原始 AI（或外部粘贴 / Remix 源）代码，用于「重置」 */
  const [aiCode, setAiCode] = useState(remixContent?.code || editContent?.code || '');
  /** 当前用于预览的代码（可能已被手动编辑后应用） */
  const [generatedCode, setGeneratedCode] = useState(remixContent?.code || editContent?.code || '');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [generatedMeta] = useState<{ title?: string; description?: string; type?: string; coverEmoji?: string; coverGradient?: string }>({});
  const [chatInput, setChatInput] = useState('');
  const [chatPanelOpen, setChatPanelOpen] = useState(true);
  const [statusMsg, setStatusMsg] = useState('');
  const [warning, setWarning] = useState('');
  const [templates, setTemplates] = useState<PromptTemplateDTO[]>([]);

  const [publishTitle, setPublishTitle] = useState('');
  const [publishDesc, setPublishDesc] = useState('');
  const [publishType, setPublishType] = useState<ContentType>('game');

  useEffect(() => {
    api.getTemplates().then(setTemplates).catch(() => {});
  }, []);

  const generate = useCallback(async (userPrompt: string, existingCode?: string) => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    setStage('generating');
    setStatusMsg(t('create.status.generating'));
    setWarning('');
    setGeneratedCode('');
    const assetBriefs = assets.map((a) => ({ name: a.name, kind: a.kind, mime: a.mime }));
    try {
      const finalCode = await api.ai.generateStream(
        userPrompt,
        existingCode,
        (partialCode) => {
          const clean = stripCodeFence(partialCode);
          setGeneratedCode(clean);
          setStatusMsg(t('create.status.generatingWith', { count: clean.length }));
        },
        assetBriefs,
      );

      // 兜底 1：AI 若硬编码了当前会话的 blob URL，还原为 ./assets/xxx，
      //         这样代码持久化到数据库后下次打开依然能用。
      const code = remapBlobUrlsToAssetPaths(stripCodeFence(finalCode), assets);

      // 兜底 2：残留的 blob: URL（不在资源清单里、或已过期的）给用户明确提示，
      //         否则 sandbox iframe 里一定白屏。
      const foreign = findForeignBlobUrls(code, assets);
      if (foreign.length > 0) {
        setWarning(t('create.warning.hardcodedBlob'));
        console.warn('[Create] AI returned hardcoded blob URL(s):', foreign);
      }

      setAiCode(code);
      setGeneratedCode(code);
      setStage('preview');
    } catch (e: any) {
      console.error('Generate error:', e);
      setStatusMsg(t('create.status.generateFailed') + (e.message || t('create.unknownError')));
      setTimeout(() => setStage('input'), 2000);
    }
  }, [isLoggedIn, navigate, t, assets]);

  const handleSend = () => {
    if (!prompt.trim()) return;
    generate(prompt.trim());
  };

  const handleChatSend = () => {
    if (!chatInput.trim()) return;
    const input = chatInput;
    const currentCode = generatedCode;
    setChatInput('');
    generate(input.trim(), currentCode);
  };

  const handleTemplateClick = (tmpl: PromptTemplateDTO) => {
    setPrompt(pickLocalized(tmpl.prompt, language));
  };

  const handleExternalCode = (code: string) => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    setAiCode(code);
    setGeneratedCode(code);
    setStage('preview');
  };

  const goToPublish = () => {
    const defaultTitle = editContent
      ? editContent.title
      : remixContent
        ? `${remixContent.title} ${t('create.remix.titleSuffix')}`
        : generatedMeta.title || prompt.slice(0, 30) || t('create.defaultTitle');
    setPublishTitle(defaultTitle);
    setPublishDesc(
      editContent?.description ||
        generatedMeta.description ||
        (remixContent
          ? t('create.remix.descTemplate', {
              title: remixContent.title,
              username: remixContent.author?.username || '',
            })
          : ''),
    );
    setPublishType(
      (editContent?.type as ContentType) ||
        (generatedMeta.type as ContentType) ||
        (remixContent?.type as ContentType) ||
        'game',
    );
    setStage('publish');
  };

  const handlePublish = async () => {
    if (!publishTitle.trim()) return;
    setStage('generating');
    setStatusMsg(editContent ? t('create.publish.saving') : t('create.publish.publishing'));
    try {
      if (editContent) {
        const res = await api.contents.update(editContent.id, {
          title: publishTitle,
          description: publishDesc,
          type: publishType,
          code: injectAssets(generatedCode, assets),
        });
        if (!res.success) throw new Error(res.error || 'Update failed');
        setStatusMsg(t('create.publish.saved'));
      } else {
        await api.contents.create({
          title: publishTitle,
          description: publishDesc,
          type: publishType,
          code: injectAssets(generatedCode, assets),
          auto_publish: true,
        });
        setStatusMsg(t('create.publish.success'));
      }
      setTimeout(() => navigate('/profile'), 1000);
    } catch (e: any) {
      setStatusMsg(t('create.publish.failed') + (e.message || t('create.unknownError')));
      setTimeout(() => setStage('publish'), 2000);
    }
  };

  if (stage === 'generating') {
    return (
      <div className="h-full flex flex-col bg-bg">
        <div className="flex items-center justify-center border-b border-border/50" style={{ padding: '14px 20px', gap: 8 }}>
          <div className="w-5 h-5 rounded-full border-2 border-accent border-t-transparent animate-spin" />
          <span className="text-[13px] font-semibold text-dim">{statusMsg}</span>
        </div>
        <div className="flex-1 relative">
          {generatedCode ? (
            <iframe
              srcDoc={injectAssets(generatedCode, assets)}
              sandbox="allow-scripts"
              className="w-full h-full border-0"
              title="generating-preview"
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center" style={{ padding: '0 32px' }}>
              <Logo size={72} className="mb-8 animate-pulse" />
              <div className="text-[13px] text-dim font-medium">{t('create.status.waiting')}</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (stage === 'preview') {
    return (
      <div className="h-full flex flex-col bg-bg">
        <div className="flex items-center justify-between border-b border-border/50" style={{ padding: '12px 20px' }}>
          <button
            onClick={() => {
              // Remix / Edit 场景没有"input"可回退，直接退出到上一页
              if (remixContent || editContent) navigate(-1);
              else setStage('input');
            }}
            className="rounded-[var(--radius-sm)] bg-muted flex items-center justify-center text-muted-fg hover:bg-border hover:text-fg transition-all duration-200"
            style={{ width: 40, height: 40 }}
          >
            ←
          </button>
          <span className="text-[14px] font-semibold">
            {editContent
              ? t('create.workspace.editTitle')
              : remixContent
                ? t('create.workspace.remixTitle')
                : t('create.workspace.title')}
          </span>
          <button onClick={goToPublish} className="bg-accent text-accent-fg text-[13px] font-semibold rounded-[var(--radius-sm)] active:scale-95 transition-all" style={{ padding: '8px 20px' }}>
            {editContent ? t('create.workspace.save') : t('create.workspace.publish')}
          </button>
        </div>

        {remixContent && (
          <div
            className="flex items-center gap-2 border-b border-border/30"
            style={{ padding: '8px 16px', background: 'rgba(232,234,26,0.06)' }}
          >
            <span className="text-[11px] font-semibold text-accent">{t('create.remix.label')}</span>
            <span className="text-[12px] text-muted-fg truncate">
              {t('create.workspace.basedOn', {
                title: remixContent.title,
                username: remixContent.author?.username || 'anon',
              })}
            </span>
          </div>
        )}

        {warning && (
          <div
            className="flex items-start gap-2 border-b border-border/30"
            style={{ padding: '8px 16px', background: 'rgba(239,68,68,0.08)' }}
            role="alert"
          >
            <span className="text-[12px] font-semibold text-red-400 flex-shrink-0">!</span>
            <span className="text-[12px] text-red-400/90 leading-snug flex-1">{warning}</span>
            <button
              type="button"
              onClick={() => setWarning('')}
              aria-label="dismiss"
              className="text-[12px] text-red-400/70 hover:text-red-400 flex-shrink-0"
            >
              ×
            </button>
          </div>
        )}

        <div className="flex-1 min-h-0">
          <PreviewWorkspace
            aiCode={aiCode}
            code={generatedCode}
            onCodeChange={setGeneratedCode}
            assets={assets}
            onAssetsChange={setAssets}
          />
        </div>

        <div className="border-t border-border/50">
          <button
            type="button"
            onClick={() => setChatPanelOpen((v) => !v)}
            aria-expanded={chatPanelOpen}
            aria-label={chatPanelOpen ? t('create.chat.collapse') : t('create.chat.expand')}
            className="w-full flex items-center justify-center text-[12px] text-dim hover:text-fg transition-colors"
            style={{ padding: '8px 0', gap: 6 }}
          >
            <span className="text-[14px] leading-none">{chatPanelOpen ? '⌄' : '⌃'}</span>
            <span>{chatPanelOpen ? t('create.chat.collapse') : t('create.chat.expand')}</span>
          </button>
          {chatPanelOpen && (
            <div style={{ padding: '0 20px 16px' }}>
              <div className="bg-surface rounded-[var(--radius-sm)] text-[13px] text-muted-fg leading-relaxed" style={{ padding: 16, marginBottom: 12 }}>
                {remixContent ? t('create.hint.remix') : t('create.hint.normal')}
              </div>
              <div className="flex" style={{ gap: 12 }}>
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleChatSend()}
                  placeholder={t('create.chat.placeholder')}
                  className="flex-1 bg-muted rounded-[var(--radius-sm)] text-[14px] text-fg outline-none focus:ring-1 focus:ring-accent placeholder:text-dim transition-all"
                  style={{ padding: '12px 16px' }}
                />
                <button onClick={handleChatSend} className="bg-accent text-accent-fg rounded-[var(--radius-sm)] flex items-center justify-center font-semibold active:scale-90 transition-all flex-shrink-0" style={{ width: 48, height: 48 }}>
                  →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (stage === 'publish') {
    const publishCategories: { value: ContentType; labelKey: TranslationKey }[] = [
      { value: 'game', labelKey: 'browse.categories.game' },
      { value: 'album', labelKey: 'browse.categories.album' },
      { value: 'tool', labelKey: 'browse.categories.tool' },
      { value: 'art', labelKey: 'browse.categories.art' },
      { value: 'guide', labelKey: 'browse.categories.guide' },
      { value: 'other', labelKey: 'browse.categories.other' },
    ];
    return (
      <div className="h-full overflow-y-auto bg-bg">
        <div className="flex items-center border-b border-border/50" style={{ padding: '12px 20px' }}>
          <button onClick={() => setStage('preview')} className="rounded-[var(--radius-sm)] bg-muted flex items-center justify-center text-muted-fg hover:bg-border hover:text-fg transition-all duration-200" style={{ width: 40, height: 40 }}>
            ←
          </button>
          <span className="flex-1 text-center text-[14px] font-semibold">{editContent ? t('create.publish.headerEdit') : t('create.publish.header')}</span>
          <div style={{ width: 40 }} />
        </div>
        <div style={{ padding: 24 }}>
          <div className="aspect-video overflow-hidden relative rounded-[var(--radius-md)] bg-card" style={{ marginBottom: 24 }}>
            <iframe srcDoc={injectAssets(generatedCode, assets)} sandbox="allow-scripts" className="w-full h-full border-0 pointer-events-none" title="cover" />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label className="text-[13px] text-dim font-semibold block" style={{ marginBottom: 10 }}>{t('create.publish.title')}</label>
            <input value={publishTitle} onChange={(e) => setPublishTitle(e.target.value)} placeholder={t('create.publish.titlePlaceholder')}
              className="w-full bg-muted rounded-[var(--radius-sm)] text-base font-semibold text-fg outline-none focus:ring-1 focus:ring-accent placeholder:text-dim transition-all"
              style={{ padding: '14px 16px' }} />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label className="text-[13px] text-dim font-semibold block" style={{ marginBottom: 10 }}>{t('create.publish.desc')}</label>
            <textarea value={publishDesc} onChange={(e) => setPublishDesc(e.target.value)} placeholder={t('create.publish.descPlaceholder')} rows={2}
              className="w-full bg-muted rounded-[var(--radius-sm)] text-[14px] text-fg resize-none outline-none focus:ring-1 focus:ring-accent placeholder:text-dim leading-relaxed transition-all"
              style={{ padding: '14px 16px' }} />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label className="text-[13px] text-dim font-semibold block" style={{ marginBottom: 10 }}>{t('create.publish.category')}</label>
            <div className="flex" style={{ gap: 10 }}>
              {publishCategories.map((cat) => (
                <button key={cat.value} onClick={() => setPublishType(cat.value)}
                  className={`flex-1 text-[13px] font-semibold rounded-[var(--radius-sm)] transition-all duration-200 ${
                    publishType === cat.value
                      ? 'bg-accent text-accent-fg'
                      : 'bg-muted text-muted-fg hover:bg-border hover:text-fg'
                  }`}
                  style={{ padding: '12px 0' }}>
                  {t(cat.labelKey)}
                </button>
              ))}
            </div>
          </div>
          <button onClick={handlePublish} disabled={!publishTitle.trim()}
            className="w-full bg-accent text-accent-fg text-[15px] font-semibold rounded-[var(--radius-md)] disabled:opacity-30 active:scale-[0.98] hover:brightness-110 transition-all duration-200"
            style={{ padding: '14px 0' }}>
            {editContent ? t('create.publish.submitEdit') : t('create.publish.submit')}
          </button>
        </div>
      </div>
    );
  }

  // Input stage
  return (
    <div className="h-full flex flex-col bg-bg">
      {/* Header */}
      <div style={{ padding: '18px 20px 10px' }}>
        <h1 className="text-[clamp(1.75rem,8vw,2.5rem)] font-bold tracking-tight leading-none">
          {t('create.title.prefix')}<span className="text-accent">{t('create.title.suffix')}</span>
        </h1>
        <p className="text-[13px] text-dim font-medium" style={{ marginTop: 7 }}>{t('create.subtitle')}</p>
      </div>

      {/* 创作方式切换 */}
      <div style={{ padding: '0 20px 10px' }}>
        <div style={{ padding: '5px' }} className="grid grid-cols-2 bg-muted rounded-[var(--radius-sm)] p-1 gap-1">
          <ModeTab
            active={createMode === 'builtin'}
            onClick={() => setCreateMode('builtin')}
            title={t('create.mode.builtin.title')}
            subtitle={t('create.mode.builtin.subtitle')}
          />
          <ModeTab
            active={createMode === 'external'}
            onClick={() => setCreateMode('external')}
            title={t('create.mode.external.title')}
            subtitle={t('create.mode.external.subtitle')}
          />
        </div>
      </div>

      {createMode === 'builtin' ? (
        <>
          {/* 内置 AI 输入区 */}
          <div style={{ padding: '0 20px 14px' }}>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={t('create.inputPlaceholder')}
              rows={3}
              className="w-full bg-muted rounded-[var(--radius-md)] text-[14px] text-fg resize-none outline-none focus:ring-1 focus:ring-accent placeholder:text-dim leading-relaxed transition-all"
              style={{ minHeight: 120, padding: 16 }}
            />
            <button onClick={handleSend} disabled={!prompt.trim()}
              className="w-full bg-accent text-accent-fg text-[15px] font-semibold rounded-[var(--radius-md)] active:scale-[0.98] hover:brightness-110 transition-all duration-200 disabled:opacity-30 flex items-center justify-center gap-2"
              style={{ marginTop: 8, padding: '12px 0' }}>
              {t('create.send')}
            </button>
          </div>

          {/* Prompt templates */}
          <div className="flex-1 overflow-y-auto">
            {templates.length > 0 && (
              <div className="border-y border-border/30" style={{ padding: '6px 0', marginBottom: 14 }}>
                <Marquee speed={40}>
                  <span className="text-[12px] font-semibold text-dim mx-5">{t('create.templates.inspiration')}</span>
                  {templates.map((tmpl) => (
                    <span key={tmpl.id} className="text-[12px] font-semibold text-muted-fg mx-5">
                      {tmpl.emoji} {pickLocalized(tmpl.title, language)}
                    </span>
                  ))}
                </Marquee>
              </div>
            )}

            <div style={{ padding: '0 20px 16px' }}>
              <div className="flex items-baseline justify-between" style={{ marginBottom: 8 }}>
                <div className="text-[13px] text-dim font-semibold">{t('create.templates.inspiration')}</div>
                <div className="text-[11px] text-dim">{t('create.templates.hint')}</div>
              </div>
              <div className="grid grid-cols-2" style={{ gap: 10 }}>
                {templates.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => handleTemplateClick(tmpl)}
                    className="group text-left bg-card rounded-[var(--radius-md)] overflow-hidden cursor-pointer transition-all duration-300 hover:ring-1 hover:ring-accent/40 active:scale-[0.98]"
                  >
                    <div
                      className="flex items-center justify-center text-3xl relative"
                      style={{ background: tmpl.gradient, height: 72 }}
                    >
                      <span className="group-hover:scale-110 transition-transform duration-300">{tmpl.emoji}</span>
                    </div>
                    <div style={{ padding: 12 }}>
                      <div className="text-[13px] font-semibold group-hover:text-accent transition-colors" style={{ marginBottom: 4 }}>
                        {pickLocalized(tmpl.title, language)}
                      </div>
                      <div
                        className="text-[11px] text-dim font-medium leading-snug"
                        style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                      >
                        {pickLocalized(tmpl.description, language) || pickLocalized(tmpl.prompt, language)}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        /* 外部 AI 流程 */
        <div className="flex-1 overflow-y-auto" style={{ padding: '4px 20px 20px' }}>
          <ExternalAIPanel
            prompt={prompt}
            onPromptChange={setPrompt}
            onSubmitCode={handleExternalCode}
          />
        </div>
      )}
    </div>
  );
}

function ModeTab({
  active,
  onClick,
  title,
  subtitle,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  subtitle: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-[var(--radius-sm)] text-left transition-all ${
        active ? 'bg-bg text-fg shadow-sm' : 'text-muted-fg hover:text-fg'
      }`}
      style={{ padding: '8px 10px' }}
    >
      <div className="text-[13px] font-semibold">{title}</div>
      <div className="text-[11px] text-dim" style={{ marginTop: 2, lineHeight: 1.3 }}>{subtitle}</div>
    </button>
  );
}
