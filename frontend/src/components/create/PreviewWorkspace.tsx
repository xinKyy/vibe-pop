import { useEffect, useMemo, useState } from 'react';
import CodeEditor from './CodeEditor';
import AssetManager from './AssetManager';
import { injectAssets, type Asset } from '../../utils/assets';
import { validateHtml } from '../../utils/htmlValidate';
import { useTranslation } from '../../i18n';

type TabKey = 'preview' | 'code' | 'assets';

interface PreviewWorkspaceProps {
  /** AI 最初生成（或外部粘贴）的原始代码，用作「重置」参考 */
  aiCode: string;
  /** 当前用于预览的代码 */
  code: string;
  onCodeChange: (next: string) => void;
  assets: Asset[];
  onAssetsChange: (next: Asset[]) => void;
}

const CODE_SIZE_LIMIT = 50 * 1024;

export default function PreviewWorkspace({
  aiCode,
  code,
  onCodeChange,
  assets,
  onAssetsChange,
}: PreviewWorkspaceProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabKey>('preview');
  const [editorCode, setEditorCode] = useState(code);

  // 外部代码变化（例如 AI 再次生成）时同步到编辑器缓冲区
  useEffect(() => {
    setEditorCode(code);
  }, [code]);

  const dirty = editorCode !== code;
  const { errors } = useMemo(
    () => (activeTab === 'code' ? validateHtml(editorCode) : { errors: 0 }),
    [editorCode, activeTab],
  );
  const sizeBytes = useMemo(() => new Blob([editorCode]).size, [editorCode]);
  const oversize = sizeBytes > CODE_SIZE_LIMIT;

  const finalHtml = useMemo(() => injectAssets(code, assets), [code, assets]);

  const applyEdit = () => {
    if (oversize) return;
    onCodeChange(editorCode);
  };

  const resetEdit = () => {
    setEditorCode(aiCode);
    onCodeChange(aiCode);
  };

  const tabs: Array<{ key: TabKey; label: string; badge?: string }> = [
    { key: 'preview', label: t('workspace.tabs.preview') },
    { key: 'code', label: t('workspace.tabs.code'), badge: dirty ? '●' : undefined },
    { key: 'assets', label: `${t('workspace.tabs.assets')}${assets.length > 0 ? ` ${assets.length}` : ''}` },
  ];

  return (
    <div className="flex flex-col h-full min-h-0 bg-bg">
      {/* Tab 栏 */}
      <div className="flex border-b border-border/50 bg-bg" role="tablist">
        {tabs.map((t) => {
          const active = activeTab === t.key;
          return (
            <button
              key={t.key}
              role="tab"
              aria-selected={active}
              onClick={() => setActiveTab(t.key)}
              className={`relative flex-1 text-[13px] font-semibold transition-colors ${
                active ? 'text-fg' : 'text-muted-fg hover:text-fg'
              }`}
              style={{ padding: '12px 0' }}
            >
              <span className="inline-flex items-center justify-center gap-1.5">
                {t.label}
                {t.badge && <span className="text-red-400 text-[10px]">{t.badge}</span>}
              </span>
              {active && (
                <span
                  className="absolute left-0 right-0 bg-accent"
                  style={{ bottom: 0, height: 2 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* 内容区 */}
      <div className="flex-1 min-h-0 relative">
        {activeTab === 'preview' && (
          <iframe
            key={finalHtml.length + '-' + assets.length}
            srcDoc={finalHtml}
            sandbox="allow-scripts"
            className="w-full h-full border-0 bg-bg"
            title="preview"
          />
        )}

        {activeTab === 'code' && (
          <div className="absolute inset-0 flex flex-col">
            <div className="flex-1 min-h-0">
              <CodeEditor
                value={editorCode}
                onChange={setEditorCode}
                errors={errors}
                sizeLimit={CODE_SIZE_LIMIT}
              />
            </div>
            <div className="flex items-center gap-8 border-t border-border/40 bg-surface" style={{ padding: '10px 12px' }}>
              <button
                onClick={applyEdit}
                disabled={!dirty || oversize}
                className="bg-accent text-accent-fg text-[12px] font-semibold rounded-[var(--radius-sm)] disabled:opacity-30 active:scale-[0.98] hover:brightness-110 transition-all"
                style={{ padding: '7px 16px' }}
              >
                {t('workspace.apply')}
              </button>
              <button
                onClick={resetEdit}
                className="bg-muted text-muted-fg hover:bg-border hover:text-fg text-[12px] font-semibold rounded-[var(--radius-sm)] transition-all"
                style={{ padding: '7px 14px' }}
              >
                {t('workspace.reset')}
              </button>
              <div className="ml-auto text-[11px] text-dim">
                {oversize && <span className="text-red-400">{t('workspace.status.oversize')}</span>}
                {errors > 0 && <span className="text-red-400">{t('workspace.status.tagErrors', { count: errors })}</span>}
                {dirty ? t('workspace.status.dirty') : t('workspace.status.synced')}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'assets' && (
          <AssetManager assets={assets} onChange={onAssetsChange} />
        )}
      </div>
    </div>
  );
}
