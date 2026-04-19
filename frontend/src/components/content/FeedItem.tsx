import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Content } from '../../types';
import { formatCount } from '../../utils/format';
import { useSocialStore } from '../../stores/socialStore';
import CommentSheet from '../social/CommentSheet';
import ShareSheet from '../social/ShareSheet';

interface FeedItemProps {
  content: Content;
  onRemix?: (content: Content) => void;
  /** 底部需要留出的空间，例如 Feed 底部手势切换区 */
  bottomInset?: number;
  /** 是否响应 iframe 内部交互（拖动切换时置为 false 以避免误触） */
  interactive?: boolean;
}

export default function FeedItem({ content, onRemix, bottomInset = 0, interactive = true }: FeedItemProps) {
  const navigate = useNavigate();
  const { isLiked, isFavorited, isFollowing, toggleLike, toggleFavorite, toggleFollow } = useSocialStore();

  const liked = isLiked(content.id);
  const favorited = isFavorited(content.id);
  const following = isFollowing(content.authorId);

  const [likeCount, setLikeCount] = useState(content.likeCount);
  const [favoriteCount, setFavoriteCount] = useState(content.favoriteCount);
  const [commentCount, setCommentCount] = useState(content.commentCount);
  const [showHeart, setShowHeart] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const lastTapRef = useRef(0);

  const handleTap = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('iframe')) return;
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      if (!liked) {
        toggleLike(content.id);
        setLikeCount((c) => c + 1);
      }
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 800);
    }
    lastTapRef.current = now;
  }, [liked, content.id, toggleLike]);

  const handleToggleLike = () => {
    const nowLiked = toggleLike(content.id);
    setLikeCount((c) => (nowLiked ? c + 1 : c - 1));
  };

  const handleToggleFavorite = () => {
    const nowFaved = toggleFavorite(content.id);
    setFavoriteCount((c) => (nowFaved ? c + 1 : c - 1));
  };

  const handleCommentCountChange = useCallback((delta: number) => {
    setCommentCount((c) => c + delta);
  }, []);

  const hasCode = content.code && content.code.length > 50;

  return (
    <>
      <div
        className="h-full min-h-full relative flex items-center justify-center overflow-hidden bg-bg"
        style={{ background: hasCode ? '#0A0A0C' : content.coverGradient }}
        onClick={handleTap}
      >
        {hasCode ? (
          <iframe
            srcDoc={content.code}
            sandbox="allow-scripts"
            className="w-full h-full border-0"
            title={content.title}
            style={{ pointerEvents: interactive ? 'auto' : 'none' }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-8xl select-none">
            {content.coverEmoji}
          </div>
        )}

        {showHeart && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
            <svg width="100" height="100" viewBox="0 0 24 24" className="animate-heart-burst drop-shadow-[0_0_30px_rgba(232,234,26,0.7)]">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#E8EA1A"/>
            </svg>
          </div>
        )}

        {/* Side actions */}
        <div className="absolute z-10 flex flex-col" style={{ right: 12, bottom: 100 + bottomInset, gap: 10 }}>
          <SideAction
            label="♥"
            count={formatCount(likeCount)}
            active={liked}
            onClick={handleToggleLike}
          />
          <SideAction
            label="★"
            count={formatCount(favoriteCount)}
            active={favorited}
            onClick={handleToggleFavorite}
          />
          <SideAction
            label="✦"
            count={formatCount(commentCount)}
            onClick={() => setShowComments(true)}
          />
          <SideAction
            label="↻"
            onClick={() => onRemix?.(content)}
          />
          <SideAction
            label="↗"
            onClick={() => setShowShare(true)}
          />
        </div>

        {/* Bottom info overlay */}
        <div
          className="absolute left-0 z-10 pointer-events-auto"
          style={{
            right: 0,
            bottom: bottomInset,
            padding: '20px 16px 14px',
            background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span
              className="cursor-pointer hover:text-accent transition-colors"
              style={{ fontSize: 15, fontWeight: 700, color: '#F5F5F7', letterSpacing: '-0.02em' }}
              onClick={() => navigate(`/user/${content.authorId}`)}
            >
              @{content.author?.username || '匿名'}
            </span>
            <button
              onClick={() => toggleFollow(content.authorId)}
              style={{
                padding: '4px 12px',
                fontSize: 12,
                fontWeight: 600,
                borderRadius: 9999,
                background: following ? 'rgba(28,28,31,0.5)' : '#E8EA1A',
                color: following ? '#5A5A62' : '#0A0A0C',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {following ? '已关注' : '+ 关注'}
            </button>
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#F5F5F7', letterSpacing: '-0.02em', lineHeight: 1.3, marginBottom: 4 }}>
            {content.title}
          </div>
          {content.description && (
            <div style={{ fontSize: 13, color: 'rgba(245,245,247,0.6)', lineHeight: 1.5, marginBottom: 8, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{content.description}</div>
          )}
          <div style={{ display: 'flex', gap: 14, fontSize: 12, color: 'rgba(245,245,247,0.35)', fontWeight: 500 }}>
            <span>▶ {formatCount(content.playCount)}</span>
            <span>♥ {formatCount(likeCount)}</span>
            <span>★ {formatCount(favoriteCount)}</span>
          </div>
        </div>
      </div>

      <CommentSheet
        contentId={content.id}
        isOpen={showComments}
        onClose={() => setShowComments(false)}
        onCommentCountChange={handleCommentCountChange}
      />
      <ShareSheet content={content} isOpen={showShare} onClose={() => setShowShare(false)} />
    </>
  );
}

function SideAction({ label, count, active, onClick }: {
  label: string;
  count?: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <button
        onClick={onClick}
        style={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 18,
          border: 'none',
          cursor: 'pointer',
          transition: 'all 0.2s',
          background: active ? '#E8EA1A' : 'rgba(0,0,0,0.4)',
          color: active ? '#0A0A0C' : 'rgba(255,255,255,0.9)',
          backdropFilter: active ? 'none' : 'blur(12px)',
          boxShadow: active ? '0 0 12px rgba(232,234,26,0.4)' : 'none',
        }}
      >
        {label}
      </button>
      {count && <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(245,245,247,0.5)', fontVariantNumeric: 'tabular-nums' }}>{count}</span>}
    </div>
  );
}
