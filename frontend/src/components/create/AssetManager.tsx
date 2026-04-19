import { useRef, useState } from 'react';
import {
  ASSET_LIMITS,
  assetPath,
  dedupeName,
  detectKind,
  formatBytes,
  type Asset,
} from '../../utils/assets';

interface AssetManagerProps {
  assets: Asset[];
  onChange: (next: Asset[]) => void;
}

const KIND_ICON: Record<Asset['kind'], string> = {
  image: '🖼',
  audio: '🎵',
  video: '🎬',
  other: '📄',
};

export default function AssetManager({ assets, onChange }: AssetManagerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [toast, setToast] = useState<string>('');
  const [copyId, setCopyId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(''), 2000);
  };

  const addFiles = async (files: FileList | File[]) => {
    const existing = assets.map((a) => a.name);
    const next: Asset[] = [...assets];
    for (const file of Array.from(files)) {
      const kind = detectKind(file.type, file.name);
      const limit = ASSET_LIMITS[kind];
      if (file.size > limit.max) {
        showToast(`「${file.name}」超过 ${formatBytes(limit.max)} 限制`);
        continue;
      }
      const name = dedupeName(file.name, existing);
      existing.push(name);
      const blobUrl = URL.createObjectURL(file);
      next.push({
        id: crypto.randomUUID(),
        name,
        size: file.size,
        mime: file.type || 'application/octet-stream',
        blobUrl,
        kind,
      });
    }
    onChange(next);
  };

  const handleRemove = (id: string) => {
    const target = assets.find((a) => a.id === id);
    if (!target) return;
    if (!window.confirm(`确认删除「${target.name}」？`)) return;
    try { URL.revokeObjectURL(target.blobUrl); } catch { /* noop */ }
    onChange(assets.filter((a) => a.id !== id));
  };

  const handleCopy = async (a: Asset) => {
    try {
      await navigator.clipboard.writeText(assetPath(a.name));
      setCopyId(a.id);
      window.setTimeout(() => setCopyId(null), 1200);
    } catch {
      showToast('复制失败');
    }
  };

  const totalSize = assets.reduce((s, a) => s + a.size, 0);

  return (
    <div className="h-full flex flex-col bg-bg overflow-hidden">
      {/* 上传区 */}
      <div style={{ padding: 16 }}>
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
          }}
          className={`rounded-[var(--radius-md)] border-2 border-dashed transition-colors cursor-pointer ${
            dragOver ? 'border-accent bg-accent/5' : 'border-border/60 bg-surface hover:border-accent/50'
          }`}
          style={{ padding: '24px 16px', textAlign: 'center' }}
        >
          <div className="text-2xl" style={{ marginBottom: 6 }}>⇪</div>
          <div className="text-[13px] font-semibold text-fg">拖拽文件到此处或点击上传</div>
          <div className="text-[11px] text-dim" style={{ marginTop: 4 }}>
            图片 ≤5MB · 音频 ≤10MB · 视频 ≤50MB · 其他 ≤1MB
          </div>
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          accept={[
            ...ASSET_LIMITS.image.accept,
            ...ASSET_LIMITS.audio.accept,
            ...ASSET_LIMITS.video.accept,
            ...ASSET_LIMITS.other.accept,
          ].join(',')}
          onChange={(e) => {
            if (e.target.files?.length) addFiles(e.target.files);
            e.target.value = '';
          }}
        />
      </div>

      {/* 资源列表 */}
      <div className="flex-1 overflow-y-auto" style={{ padding: '0 16px 16px' }}>
        {assets.length === 0 ? (
          <div className="text-center text-dim text-[13px]" style={{ padding: '24px 0' }}>
            暂无资源 · 上传后在代码中使用 <code className="text-muted-fg">./assets/文件名</code> 引用
          </div>
        ) : (
          <>
            <div className="text-[11px] text-dim" style={{ marginBottom: 10 }}>
              共 {assets.length} 项 · {formatBytes(totalSize)}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {assets.map((a) => (
                <div key={a.id} className="bg-card rounded-[var(--radius-sm)] overflow-hidden border border-border/40">
                  <div
                    className="aspect-video flex items-center justify-center bg-[#0a0a0c] relative"
                  >
                    {a.kind === 'image' ? (
                      <img src={a.blobUrl} alt={a.name} className="w-full h-full object-cover" />
                    ) : a.kind === 'video' ? (
                      <video src={a.blobUrl} className="w-full h-full object-cover" muted />
                    ) : (
                      <div className="text-3xl">{KIND_ICON[a.kind]}</div>
                    )}
                  </div>
                  <div style={{ padding: '8px 10px' }}>
                    <div className="text-[12px] font-semibold truncate text-fg">{a.name}</div>
                    <div className="text-[10px] text-dim tabular-nums">{formatBytes(a.size)}</div>
                    <div className="flex gap-1" style={{ marginTop: 8 }}>
                      <button
                        onClick={() => handleCopy(a)}
                        className="flex-1 bg-muted hover:bg-border text-muted-fg hover:text-fg text-[11px] font-semibold rounded transition-colors"
                        style={{ padding: '5px 0' }}
                      >
                        {copyId === a.id ? '已复制' : '复制路径'}
                      </button>
                      <button
                        onClick={() => handleRemove(a.id)}
                        className="bg-muted hover:bg-red-500/20 text-muted-fg hover:text-red-400 text-[11px] font-semibold rounded transition-colors"
                        style={{ padding: '5px 10px' }}
                      >
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {toast && (
        <div
          className="absolute left-1/2 -translate-x-1/2 z-50 bg-black/80 text-white text-[12px] rounded-[var(--radius-sm)]"
          style={{ bottom: 20, padding: '8px 14px' }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
