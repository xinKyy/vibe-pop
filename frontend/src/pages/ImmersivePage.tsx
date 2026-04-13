import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import FeedItem from '../components/content/FeedItem';
import { api } from '../api/client';
import type { Content } from '../types';

export default function ImmersivePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const targetContentId = (location.state as { contentId?: string })?.contentId;
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const feedRef = useRef<HTMLDivElement>(null);
  const scrolledRef = useRef(false);

  const fetchFeed = useCallback(async () => {
    try {
      const res = await api.contents.feed();
      setContents(res.data.items);
    } catch (e) {
      console.error('Failed to fetch feed:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  useEffect(() => {
    if (!targetContentId || contents.length === 0 || scrolledRef.current) return;
    scrolledRef.current = true;
    const index = contents.findIndex((c) => c.id === targetContentId);
    if (index <= 0) return;
    requestAnimationFrame(() => {
      const items = feedRef.current?.querySelectorAll('.snap-start');
      items?.[index]?.scrollIntoView({ behavior: 'instant' as ScrollBehavior });
    });
  }, [contents, targetContentId]);

  const handleRemix = useCallback((content: Content) => {
    navigate('/create', { state: { remix: content } });
  }, [navigate]);

  return (
    <div className="h-dvh w-full flex items-center justify-center bg-[#050507]">
      <div className="relative w-full max-w-[430px] h-full min-[431px]:h-[calc(100dvh-40px)] min-[431px]:max-h-[932px] bg-bg overflow-hidden min-[431px]:rounded-2xl min-[431px]:border min-[431px]:border-border/50">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-0 left-0 z-50 flex items-center gap-1 text-white/80 hover:text-white transition-colors"
          style={{
            padding: '14px 16px',
            fontSize: 14,
            fontWeight: 600,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            textShadow: '0 1px 4px rgba(0,0,0,0.5)',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          返回
        </button>

        {loading ? (
          <div className="h-full flex flex-col items-center justify-center text-dim">
            <div className="text-3xl mb-4 opacity-40">···</div>
            <div className="text-[15px] font-semibold">加载中</div>
          </div>
        ) : contents.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-dim">
            <div className="text-5xl mb-5 opacity-30">◇</div>
            <div className="text-[15px] font-semibold mb-2">暂无内容</div>
          </div>
        ) : (
          <div
            ref={feedRef}
            className="h-full overflow-y-scroll snap-y snap-mandatory scroll-smooth"
          >
            {contents.map((content) => (
              <FeedItem key={content.id} content={content} onRemix={handleRemix} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
