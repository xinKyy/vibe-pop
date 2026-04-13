import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../../api/client';
import { useAuthStore } from '../../stores/authStore';
import type { Comment } from '../../types';

interface CommentSheetProps {
  contentId: string;
  isOpen: boolean;
  onClose: () => void;
  onCommentCountChange?: (delta: number) => void;
}

export default function CommentSheet({ contentId, isOpen, onClose, onCommentCountChange }: CommentSheetProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const composingRef = useRef(false);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const currentUser = useAuthStore((s) => s.user);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.social.comments(contentId);
      setComments(res.data.items);
    } catch {
      // keep existing comments on error
    } finally {
      setLoading(false);
    }
  }, [contentId]);

  useEffect(() => {
    if (isOpen) {
      fetchComments();
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, fetchComments]);

  const handleSubmit = async () => {
    const text = input.trim();
    if (!text || submitting) return;

    if (!isLoggedIn) {
      // Could navigate to login, for now just hint
      return;
    }

    const optimistic: Comment = {
      id: `temp_${Date.now()}`,
      contentId,
      userId: currentUser?.id || '',
      user: {
        id: currentUser?.id || '',
        username: currentUser?.username || '我',
        handle: currentUser?.handle || 'me',
        avatar: currentUser?.avatar || '👤',
      },
      text,
      createdAt: new Date().toISOString(),
    };

    setComments((prev) => [optimistic, ...prev]);
    setInput('');
    setSubmitting(true);

    try {
      const res = await api.social.comment(contentId, text);
      const serverComment: Comment = {
        id: res.data.id,
        contentId: res.data.contentId,
        userId: res.data.userId,
        user: res.data.user || optimistic.user,
        text: res.data.text,
        createdAt: res.data.createdAt,
      };
      setComments((prev) =>
        prev.map((c) => (c.id === optimistic.id ? serverComment : c))
      );
      onCommentCountChange?.(1);
    } catch {
      setComments((prev) => prev.filter((c) => c.id !== optimistic.id));
      setInput(text);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-[430px] max-h-[65vh] bg-bg flex flex-col animate-slide-up rounded-t-[var(--radius-xl)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center" style={{ padding: '14px 0' }}>
          <div className="w-9 h-1 bg-border/60 rounded-full" />
        </div>

        <div className="flex items-center justify-between" style={{ padding: '0 20px 14px' }}>
          <span className="text-[15px] font-semibold">评论 ({comments.length})</span>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-dim text-sm hover:bg-border hover:text-fg transition-all duration-200">
            ✕
          </button>
        </div>

        <div className="border-t border-border/30" />

        <div className="flex-1 overflow-y-auto" style={{ padding: '16px 20px' }}>
          {loading ? (
            <div className="text-center text-dim" style={{ padding: '48px 0' }}>
              <div className="text-3xl opacity-40" style={{ marginBottom: 16 }}>···</div>
              <div className="text-[14px] font-medium">加载中</div>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center text-dim" style={{ padding: '48px 0' }}>
              <div className="text-4xl opacity-30" style={{ marginBottom: 16 }}>◇</div>
              <div className="text-[14px] font-medium">还没有评论，来说点什么吧</div>
            </div>
          ) : (
            comments.map((comment, i) => (
              <div key={comment.id} className="flex animate-fade-in" style={{ gap: 14, marginBottom: i < comments.length - 1 ? 18 : 0, animationDelay: `${i * 0.04}s` }}>
                <div className="w-9 h-9 bg-muted rounded-full flex items-center justify-center text-sm flex-shrink-0">
                  {comment.user?.avatar || '👤'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] text-accent font-semibold">
                    @{comment.user?.username || '匿名'}
                  </div>
                  <div className="text-[14px] text-fg/80 break-words leading-relaxed" style={{ marginTop: 4 }}>
                    {comment.text}
                  </div>
                  <div className="text-[12px] text-dim font-medium" style={{ marginTop: 8 }}>
                    {new Date(comment.createdAt).toLocaleDateString('zh-CN')}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-border/30 flex items-center" style={{ padding: '14px 20px', gap: 12 }}>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onCompositionStart={() => { composingRef.current = true; }}
            onCompositionEnd={() => { composingRef.current = false; }}
            onKeyDown={(e) => { if (e.key === 'Enter' && !composingRef.current) handleSubmit(); }}
            placeholder={isLoggedIn ? '说点什么...' : '登录后即可评论'}
            disabled={!isLoggedIn}
            className="flex-1 bg-muted text-[14px] text-fg outline-none focus:ring-1 focus:ring-accent placeholder:text-dim transition-all disabled:opacity-50"
            style={{ padding: '10px 16px', borderRadius: 9999 }}
          />
          <button
            onClick={handleSubmit}
            disabled={!isLoggedIn || submitting || !input.trim()}
            className="bg-accent text-accent-fg text-[14px] font-semibold active:scale-95 transition-all disabled:opacity-40 flex-shrink-0"
            style={{ padding: '10px 20px', borderRadius: 9999 }}
          >
            {submitting ? '···' : '发送'}
          </button>
        </div>
      </div>
    </div>
  );
}
