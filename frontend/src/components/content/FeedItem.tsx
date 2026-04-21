import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Content } from '../../types';
import { formatCount } from '../../utils/format';
import { useSocialStore } from '../../stores/socialStore';
import CommentSheet from '../social/CommentSheet';
import ShareSheet from '../social/ShareSheet';
import { useTranslation } from '../../i18n';

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
  const { t } = useTranslation();
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
        className="h-full min-h-full relative flex flex-col overflow-hidden bg-bg"
        style={{ paddingBottom: bottomInset }}
      >
        {/* Content area (iframe / emoji) */}
        <div
          className="relative flex-1 flex items-center justify-center overflow-hidden"
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
        </div>

        {/* Bottom info + actions (outside iframe to avoid interaction conflicts) */}
        <div
          className="relative z-10 flex-shrink-0"
          style={{
            padding: '12px 16px 14px',
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.45), #0A0A0C 40%)',
            borderTop: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          {/* Author row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span
              className="cursor-pointer hover:text-accent transition-colors"
              style={{ fontSize: 15, fontWeight: 700, color: '#F5F5F7', letterSpacing: '-0.02em' }}
              onClick={() => navigate(`/user/${content.authorId}`)}
            >
              {content.author?.displayName || t('common.anonymous')}
              <span style={{ fontSize: 12, color: 'rgba(245,245,247,0.45)', fontWeight: 500, marginLeft: 6 }}>
                @{content.author?.username || 'anon'}
              </span>
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
              {following ? t('common.following') : t('common.follow')}
            </button>
          </div>

          <div style={{ fontSize: 15, fontWeight: 700, color: '#F5F5F7', letterSpacing: '-0.02em', lineHeight: 1.3, marginBottom: 2 }}>
            {content.title}
          </div>
          {content.description && (
            <div style={{ fontSize: 12, color: 'rgba(245,245,247,0.55)', lineHeight: 1.45, marginBottom: 8, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {content.description}
            </div>
          )}

          {/* Action row (horizontal, below content) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
              marginTop: 6,
            }}
          >
            <ActionButton
              label="♥"
              count={formatCount(likeCount)}
              active={liked}
              onClick={handleToggleLike}
            />
            <ActionButton
              label="★"
              count={formatCount(favoriteCount)}
              active={favorited}
              onClick={handleToggleFavorite}
            />
            <ActionButton
              label="✦"
              count={formatCount(commentCount)}
              onClick={() => setShowComments(true)}
            />
            <ActionButton
              label="↻"
              onClick={() => onRemix?.(content)}
            />
            <ActionButton
              label="↗"
              onClick={() => setShowShare(true)}
            />
            <div style={{ marginLeft: 'auto', fontSize: 11, color: 'rgba(245,245,247,0.35)', fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>
              ▶ {formatCount(content.playCount)}
            </div>
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

function ActionButton({ label, count, active, onClick }: {
  label: string;
  count?: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        height: 36,
        padding: count ? '0 12px' : '0 10px',
        borderRadius: 9999,
        fontSize: 15,
        fontWeight: 600,
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.18s',
        background: active ? '#E8EA1A' : 'rgba(255,255,255,0.08)',
        color: active ? '#0A0A0C' : 'rgba(255,255,255,0.92)',
        boxShadow: active ? '0 0 10px rgba(232,234,26,0.35)' : 'none',
      }}
    >
      <span style={{ fontSize: 16, lineHeight: 1 }}>{label}</span>
      {count && (
        <span style={{ fontSize: 12, fontVariantNumeric: 'tabular-nums', opacity: active ? 0.8 : 0.7 }}>
          {count}
        </span>
      )}
    </button>
  );
}
