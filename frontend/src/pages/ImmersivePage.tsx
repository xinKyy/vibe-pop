import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPortal } from 'react-dom';
import FeedItem from '../components/content/FeedItem';
import { api } from '../api/client';
import type { Content } from '../types';
import { useTranslation } from '../i18n';

export default function ImmersivePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const targetContentId = (location.state as { contentId?: string })?.contentId;
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fullscreenContent, setFullscreenContent] = useState<Content | null>(null);

  const scrollerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const initialScrollDoneRef = useRef(false);

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

  // 首次进入时，如带 contentId 则滚动到目标卡片
  useEffect(() => {
    if (initialScrollDoneRef.current || !targetContentId || contents.length === 0) return;
    const index = contents.findIndex((c) => c.id === targetContentId);
    if (index > 0) {
      setCurrentIndex(index);
      // 等 DOM 布局完成再瞬时滚动到目标位置（不要用 smooth，避免抢占 scroll-snap）
      requestAnimationFrame(() => {
        const el = itemRefs.current[index];
        el?.scrollIntoView({ block: 'start' });
      });
    }
    initialScrollDoneRef.current = true;
  }, [contents, targetContentId]);

  const handleRemix = useCallback((content: Content) => {
    navigate('/create', { state: { remix: content } });
  }, [navigate]);

  const handleFullscreen = useCallback((content: Content) => {
    setFullscreenContent(content);
  }, []);

  const handleExitFullscreen = useCallback(() => {
    setFullscreenContent(null);
  }, []);

  // 监听滚动，更新当前索引（用于可能的分页/页码展示）
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const h = el.clientHeight;
        if (h <= 0) return;
        const idx = Math.round(el.scrollTop / h);
        setCurrentIndex((prev) => (prev === idx ? prev : idx));
      });
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [contents.length]);

  // 全屏模式：ESC 退出 + 锁定外层滚动
  useEffect(() => {
    if (!fullscreenContent) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFullscreenContent(null);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [fullscreenContent]);

  return (
    <div className="h-dvh w-full flex items-center justify-center bg-[#050507]">
      <div
        className="relative w-full max-w-[430px] h-full min-[431px]:h-[calc(100dvh-40px)] min-[431px]:max-h-[932px] bg-bg overflow-hidden min-[431px]:rounded-2xl min-[431px]:border min-[431px]:border-border/50"
      >
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
          {t('common.back')}
        </button>

        {/* 页码指示（右上角） */}
        {!loading && contents.length > 0 && (
          <div
            className="absolute top-0 right-0 z-50 select-none pointer-events-none"
            style={{
              padding: '14px 16px',
              fontSize: 12,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.7)',
              fontVariantNumeric: 'tabular-nums',
              textShadow: '0 1px 4px rgba(0,0,0,0.5)',
            }}
          >
            {currentIndex + 1} / {contents.length}
          </div>
        )}

        {loading ? (
          <div className="h-full flex flex-col items-center justify-center text-dim">
            <div className="text-3xl mb-4 opacity-40">···</div>
            <div className="text-[15px] font-semibold">{t('common.loading')}</div>
          </div>
        ) : contents.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-dim">
            <div className="text-5xl mb-5 opacity-30">◇</div>
            <div className="text-[15px] font-semibold mb-2">{t('immersive.empty.title')}</div>
          </div>
        ) : (
          <div
            ref={scrollerRef}
            className="h-full w-full overflow-y-auto overscroll-contain"
            style={{
              scrollSnapType: 'y mandatory',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {contents.map((content, idx) => (
              <div
                key={content.id}
                ref={(el) => { itemRefs.current[idx] = el; }}
                className="h-full w-full"
                style={{ scrollSnapAlign: 'start', scrollSnapStop: 'always' }}
              >
                <FeedItem
                  content={content}
                  onRemix={handleRemix}
                  onFullscreen={handleFullscreen}
                  interactive={false}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {fullscreenContent && createPortal(
        <FullscreenView
          content={fullscreenContent}
          onExit={handleExitFullscreen}
          exitLabel={t('immersive.exitFullscreen')}
        />,
        document.body,
      )}
    </div>
  );
}

function FullscreenView({
  content,
  onExit,
  exitLabel,
}: {
  content: Content;
  onExit: () => void;
  exitLabel: string;
}) {
  return (
    <div
      className="fixed inset-0 z-[9999] bg-black animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <iframe
        srcDoc={content.code}
        sandbox="allow-scripts"
        className="w-full h-full border-0"
        title={content.title}
      />
      <button
        onClick={onExit}
        aria-label={exitLabel}
        style={{
          position: 'fixed',
          top: 'max(16px, env(safe-area-inset-top))',
          right: 'max(16px, env(safe-area-inset-right))',
          zIndex: 10000,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '10px 14px',
          fontSize: 13,
          fontWeight: 600,
          color: '#fff',
          background: 'rgba(20,20,24,0.65)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 9999,
          cursor: 'pointer',
          boxShadow: '0 6px 20px rgba(0,0,0,0.45)',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <polyline points="4 14 10 14 10 20" />
          <polyline points="20 10 14 10 14 4" />
          <line x1="14" y1="10" x2="21" y2="3" />
          <line x1="3" y1="21" x2="10" y2="14" />
        </svg>
        {exitLabel}
      </button>
    </div>
  );
}
