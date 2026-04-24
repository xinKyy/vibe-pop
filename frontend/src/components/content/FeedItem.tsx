import { useState, useCallback, useRef, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Content } from '../../types';
import { formatCount } from '../../utils/format';
import { useSocialStore } from '../../stores/socialStore';
import CommentSheet from '../social/CommentSheet';
import ShareSheet from '../social/ShareSheet';
import ConfirmDialog from '../ui/ConfirmDialog';
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
  const [showRemixConfirm, setShowRemixConfirm] = useState(false);
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
        className="h-full min-h-full relative overflow-hidden bg-bg"
        style={{ paddingBottom: bottomInset }}
      >
        {/* Content area (iframe / emoji) — 占满除底部手势区外的全部空间，
            信息/操作区以半透明遮罩的形式叠加在底部，最大化内容展示面积。*/}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{
            bottom: bottomInset,
            background: hasCode ? '#0A0A0C' : content.coverGradient,
          }}
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

        {/* Bottom info + actions —— 以渐变遮罩叠加在 iframe 之上，
            不再挤占内容区高度；iframe 可展示完整画面。 */}
        <div
          className="absolute left-0 right-0 z-10"
          style={{
            bottom: bottomInset,
            padding: '10px 14px 12px',
            background: 'linear-gradient(to bottom, rgba(10,10,12,0) 0%, rgba(10,10,12,0.65) 35%, rgba(10,10,12,0.92) 100%)',
            pointerEvents: 'auto',
          }}
        >
          {/* Author row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span
              className="cursor-pointer hover:text-accent transition-colors"
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: '#F5F5F7',
                letterSpacing: '-0.02em',
                textShadow: '0 1px 3px rgba(0,0,0,0.6)',
              }}
              onClick={() => navigate(`/user/${content.authorId}`)}
            >
              {content.author?.displayName || t('common.anonymous')}
              <span style={{ fontSize: 11, color: 'rgba(245,245,247,0.6)', fontWeight: 500, marginLeft: 5 }}>
                @{content.author?.username || 'anon'}
              </span>
            </span>
            <button
              onClick={() => toggleFollow(content.authorId)}
              style={{
                padding: '3px 10px',
                fontSize: 11,
                fontWeight: 600,
                borderRadius: 9999,
                background: following ? 'rgba(28,28,31,0.65)' : '#E8EA1A',
                color: following ? '#C0C0C8' : '#0A0A0C',
                border: 'none',
                cursor: 'pointer',
                backdropFilter: following ? 'blur(6px)' : 'none',
              }}
            >
              {following ? t('common.following') : t('common.follow')}
            </button>
          </div>

          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: '#F5F5F7',
              letterSpacing: '-0.02em',
              lineHeight: 1.25,
              marginBottom: 2,
              textShadow: '0 1px 3px rgba(0,0,0,0.6)',
            }}
          >
            {content.title}
          </div>
          {content.description && (
            <div
              style={{
                fontSize: 11.5,
                color: 'rgba(245,245,247,0.72)',
                lineHeight: 1.4,
                marginBottom: 6,
                display: '-webkit-box',
                WebkitLineClamp: 1,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textShadow: '0 1px 3px rgba(0,0,0,0.6)',
              }}
            >
              {content.description}
            </div>
          )}

          {/* Action row (horizontal, below content) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 6,
              marginTop: 4,
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
              label={<ChatBubbleIcon />}
              count={formatCount(commentCount)}
              onClick={() => setShowComments(true)}
            />
            <ActionButton
              label={<ShuffleIcon />}
              onClick={() => setShowRemixConfirm(true)}
            />
            <ActionButton
              label="↗"
              onClick={() => setShowShare(true)}
            />
            <div
              style={{
                marginLeft: 'auto',
                fontSize: 11,
                color: 'rgba(245,245,247,0.7)',
                fontWeight: 500,
                fontVariantNumeric: 'tabular-nums',
                textShadow: '0 1px 3px rgba(0,0,0,0.6)',
              }}
            >
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
      <ConfirmDialog
        isOpen={showRemixConfirm}
        title={t('feed.remix.confirmTitle')}
        body={t('feed.remix.confirmBody')}
        confirmLabel={t('feed.remix.confirmAction')}
        onCancel={() => setShowRemixConfirm(false)}
        onConfirm={() => {
          setShowRemixConfirm(false);
          onRemix?.(content);
        }}
      />
    </>
  );
}

function ActionButton({ label, count, active, onClick }: {
  /** 支持字符串 emoji 或 ReactNode（SVG 图标） */
  label: ReactNode;
  count?: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      // 阻断按下事件冒泡，避免触发沉浸页的 pointer 拖拽或其它祖先 handler；
      // 也顺带防止 dialog overlay 误吃本次点击（ghost click）。
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        height: 32,
        padding: count ? '0 10px' : '0 9px',
        borderRadius: 9999,
        fontSize: 14,
        fontWeight: 600,
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.18s',
        background: active ? '#E8EA1A' : 'rgba(20,20,24,0.55)',
        color: active ? '#0A0A0C' : 'rgba(255,255,255,0.92)',
        boxShadow: active ? '0 0 10px rgba(232,234,26,0.35)' : 'none',
        backdropFilter: active ? 'none' : 'blur(6px)',
      }}
    >
      <span style={{ fontSize: 15, lineHeight: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{label}</span>
      {count && (
        <span style={{ fontSize: 11, fontVariantNumeric: 'tabular-nums', opacity: active ? 0.8 : 0.8 }}>
          {count}
        </span>
      )}
    </button>
  );
}

/** 评论气泡图标（Feather message-circle 风格） */
function ChatBubbleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

/** Remix 交换图标（Feather shuffle 风格，贴合"混音/改编"语义） */
function ShuffleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="16 3 21 3 21 8" />
      <line x1="4" y1="20" x2="21" y2="3" />
      <polyline points="21 16 21 21 16 21" />
      <line x1="15" y1="15" x2="21" y2="21" />
      <line x1="4" y1="4" x2="9" y2="9" />
    </svg>
  );
}
