import { useState, useEffect, useRef } from 'react';
import { mockComments } from '../../api/mockData';
import type { Comment } from '../../types';

interface CommentSheetProps {
  contentId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function CommentSheet({ contentId, isOpen, onClose }: CommentSheetProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setComments(mockComments.filter((c) => c.contentId === contentId));
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, contentId]);

  const handleSubmit = () => {
    if (!input.trim()) return;
    const newComment: Comment = {
      id: `cmt_${Date.now()}`,
      contentId,
      userId: 'u_001',
      user: { id: 'u_001', username: '猫主人', handle: 'catmaster', avatar: '😺' },
      text: input.trim(),
      createdAt: new Date().toISOString(),
    };
    setComments([newComment, ...comments]);
    setInput('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-[375px] max-h-[60vh] bg-[var(--color-bg-primary)] rounded-t-2xl flex flex-col animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
          <span className="text-sm font-semibold">评论 ({comments.length})</span>
          <button onClick={onClose} className="text-[var(--color-text-dim)] text-lg">✕</button>
        </div>

        {/* Comment list */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          {comments.length === 0 ? (
            <div className="text-center py-8 text-[var(--color-text-dim)] text-sm">
              还没有评论，来说点什么吧
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink/30 to-pink-dark/30 flex items-center justify-center text-sm flex-shrink-0">
                  {comment.user.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-pink font-medium mb-0.5">
                    @{comment.user.username}
                  </div>
                  <div className="text-sm text-[var(--color-text-secondary)] break-words">
                    {comment.text}
                  </div>
                  <div className="text-[10px] text-[var(--color-text-dim)] mt-1">
                    {new Date(comment.createdAt).toLocaleDateString('zh-CN')}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-[var(--color-border)] flex gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="说点什么..."
            className="flex-1 bg-[var(--color-bg-input)] border border-[var(--color-border-input)] rounded-3xl px-4 py-2.5 text-white text-sm outline-none focus:border-pink placeholder:text-[var(--color-text-dim)]"
          />
          <button
            onClick={handleSubmit}
            className="px-4 py-2.5 bg-gradient-to-br from-pink to-pink-dark rounded-3xl text-white text-sm font-medium"
          >
            发送
          </button>
        </div>
      </div>
    </div>
  );
}
