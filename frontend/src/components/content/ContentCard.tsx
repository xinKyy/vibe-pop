import type { Content } from '../../types';
import { formatCount } from '../../utils/format';

interface ContentCardProps {
  content: Content;
  onClick?: () => void;
  showManage?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function ContentCard({ content, onClick, showManage, onEdit, onDelete }: ContentCardProps) {
  const hasCode = content.code && content.code.length > 50;

  return (
    <div
      className="group relative bg-card rounded-[var(--radius-md)] overflow-hidden cursor-pointer transition-all duration-300 hover:ring-1 hover:ring-accent/40 active:scale-[0.98]"
      onClick={onClick}
    >
      <div
        className="aspect-square flex items-center justify-center relative overflow-hidden"
        style={{ background: hasCode ? '#0A0A0C' : (content.coverGradient || '#1C1C1F') }}
      >
        {hasCode ? (
          <iframe
            srcDoc={content.code}
            sandbox="allow-scripts"
            className="w-full h-full border-0 pointer-events-none"
            title={content.title}
            loading="lazy"
          />
        ) : (
          <span className="text-5xl select-none group-hover:scale-110 transition-transform duration-300">{content.coverEmoji}</span>
        )}

        <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2.5 py-1 bg-black/60 backdrop-blur-sm rounded-[var(--radius-sm)] text-[11px] text-fg/80 font-semibold tabular-nums">
          {formatCount(content.playCount)}
        </div>
      </div>

      <div style={{ padding: '8px 10px' }}>
        <div className="text-[13px] font-semibold truncate text-fg group-hover:text-accent transition-colors duration-200" style={{ marginBottom: 4 }}>
          {content.title}
        </div>
        <div className="flex items-center text-[12px] text-dim font-medium" style={{ gap: 10 }}>
          <span className="flex items-center gap-1">
            ♥ {formatCount(content.likeCount)}
          </span>
          <span className="flex items-center gap-1">
            ✦ {formatCount(content.commentCount)}
          </span>
        </div>
        {showManage && (
          <div className="flex border-t border-border/50" style={{ gap: 6, marginTop: 8, paddingTop: 8 }}>
            <button
              onClick={(e) => { e.stopPropagation(); onEdit?.(); }}
              className="flex-1 text-[12px] font-medium rounded-[var(--radius-sm)] text-muted-fg hover:bg-muted hover:text-fg transition-colors"
              style={{ padding: '6px 0' }}
            >
              编辑
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
              className="flex-1 text-[12px] font-medium rounded-[var(--radius-sm)] text-red-400 hover:bg-red-500/10 transition-colors"
              style={{ padding: '6px 0' }}
            >
              删除
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
