import type { Content } from '../../types';
import { formatCount } from '../../api/mockData';

interface ContentCardProps {
  content: Content;
  onClick?: () => void;
  showManage?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function ContentCard({ content, onClick, showManage, onEdit, onDelete }: ContentCardProps) {
  return (
    <div
      className="bg-[var(--color-bg-card)] rounded-xl overflow-hidden cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]"
      onClick={onClick}
    >
      <div
        className="aspect-[3/4] flex items-center justify-center text-5xl"
        style={{ background: content.coverGradient }}
      >
        {content.coverEmoji}
      </div>
      <div className="p-2.5">
        <div className="text-[13px] font-medium mb-1.5 truncate">{content.title}</div>
        <div className="flex gap-2.5 text-[11px] text-[var(--color-text-muted)]">
          <span className="flex items-center gap-1">▶ {formatCount(content.playCount)}</span>
          <span className="flex items-center gap-1">❤ {formatCount(content.likeCount)}</span>
        </div>
        {showManage && (
          <div className="flex gap-2 mt-2">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit?.(); }}
              className="flex-1 text-[11px] py-1 rounded-md bg-[var(--color-border-input)] text-[var(--color-text-muted)]"
            >
              编辑
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
              className="flex-1 text-[11px] py-1 rounded-md bg-[var(--color-border-input)] text-red-400"
            >
              删除
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
