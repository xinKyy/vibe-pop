import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Content } from '../../types';
import { formatCount } from '../../api/mockData';
import { useSocialStore } from '../../stores/socialStore';
import CommentSheet from '../social/CommentSheet';
import ShareSheet from '../social/ShareSheet';

interface FeedItemProps {
  content: Content;
  onRemix?: (content: Content) => void;
}

export default function FeedItem({ content, onRemix }: FeedItemProps) {
  const navigate = useNavigate();
  const { isLiked, isFavorited, isFollowing, toggleLike, toggleFavorite, toggleFollow } = useSocialStore();

  const liked = isLiked(content.id);
  const favorited = isFavorited(content.id);
  const following = isFollowing(content.authorId);

  const [likeCount, setLikeCount] = useState(content.likeCount);
  const [favoriteCount, setFavoriteCount] = useState(content.favoriteCount);
  const [showHeart, setShowHeart] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [paused, setPaused] = useState(false);
  const lastTapRef = useRef(0);

  const handleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      if (!liked) {
        toggleLike(content.id);
        setLikeCount((c) => c + 1);
      }
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 800);
    } else {
      setTimeout(() => {
        if (Date.now() - lastTapRef.current >= 300) {
          setPaused((v) => !v);
        }
      }, 300);
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

  return (
    <>
      <div
        className="h-[calc(100dvh-60px)] min-h-[calc(100dvh-60px)] snap-start snap-always relative flex items-center justify-center overflow-hidden"
        style={{ background: content.coverGradient }}
        onClick={handleTap}
      >
        <div className="w-full h-full flex items-center justify-center text-7xl select-none">
          {content.coverEmoji}
        </div>

        {paused && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none z-20">
            <div className="w-16 h-16 rounded-full bg-black/40 backdrop-blur flex items-center justify-center">
              <span className="text-3xl ml-1">▶</span>
            </div>
          </div>
        )}

        {showHeart && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
            <span className="text-8xl animate-heart-burst">❤️</span>
          </div>
        )}

        {/* Side actions */}
        <div className="absolute right-4 bottom-52 flex flex-col gap-5 z-10" onClick={(e) => e.stopPropagation()}>
          <SideButton icon={liked ? '❤️' : '🤍'} count={formatCount(likeCount)} active={liked} onClick={handleToggleLike} />
          <SideButton icon={favorited ? '⭐' : '☆'} count={formatCount(favoriteCount)} active={favorited} onClick={handleToggleFavorite} />
          <SideButton icon="💬" count={formatCount(content.commentCount)} onClick={() => setShowComments(true)} />
          <SideButton icon="🔄" onClick={() => onRemix?.(content)} />
          <SideButton icon="↗️" onClick={() => setShowShare(true)} />
        </div>

        {/* Bottom info */}
        <div className="absolute bottom-20 left-0 right-14 px-5 pt-16 bg-gradient-to-t from-black/80 to-transparent z-10" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-2 mb-1 text-sm font-semibold">
            <span
              className="text-pink cursor-pointer hover:underline"
              onClick={() => navigate(`/user/${content.authorId}`)}
            >
              @{content.author.username}
            </span>
            <button
              onClick={() => toggleFollow(content.authorId)}
              className={`px-2 py-0.5 rounded-xl text-[11px] font-medium transition-all ${
                following
                  ? 'bg-white/10 text-[var(--color-text-muted)]'
                  : 'bg-gradient-to-br from-pink to-pink-dark text-white'
              }`}
            >
              {following ? '已关注' : '+ 关注'}
            </button>
          </div>
          <div className="text-base mb-1">
            {content.title}
            {content.description && <span className="text-white/70"> - {content.description}</span>}
          </div>
          {content.remixFromId && (
            <div className="text-xs text-white/50 mb-2">🔄 Remix from @{content.author.username}</div>
          )}
          <div className="flex gap-5 text-[13px] text-gray-300 pb-1">
            <span>▶ {formatCount(content.playCount)}</span>
            <span>❤ {formatCount(likeCount)}</span>
            <span>⭐ {formatCount(favoriteCount)}</span>
            <span>💬 {formatCount(content.commentCount)}</span>
          </div>
        </div>
      </div>

      <CommentSheet contentId={content.id} isOpen={showComments} onClose={() => setShowComments(false)} />
      <ShareSheet content={content} isOpen={showShare} onClose={() => setShowShare(false)} />
    </>
  );
}

function SideButton({ icon, count, active, onClick }: { icon: string; count?: string; active?: boolean; onClick: () => void }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={onClick}
        className={`w-12 h-12 rounded-full backdrop-blur-lg flex items-center justify-center text-2xl transition-all hover:scale-110 active:scale-95 ${
          active ? 'bg-pink/20' : 'bg-white/10 hover:bg-pink/30'
        }`}
      >
        {icon}
      </button>
      {count && <span className="text-[10px] text-white/70">{count}</span>}
    </div>
  );
}
