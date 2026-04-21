import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import FeedItem from '../components/content/FeedItem';
import { api } from '../api/client';
import type { Content } from '../types';
import { useTranslation } from '../i18n';

const SWITCH_AREA_HEIGHT = 80;
const SWITCH_DISTANCE_RATIO = 0.18;
const SWITCH_VELOCITY_THRESHOLD = 0.5;

export default function ImmersivePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const targetContentId = (location.state as { contentId?: string })?.contentId;
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [containerHeight, setContainerHeight] = useState(() =>
    typeof window !== 'undefined' ? window.innerHeight : 800,
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef(0);
  const startTimeRef = useRef(0);
  const draggingRef = useRef(false);
  const pointerIdRef = useRef<number | null>(null);
  const initialIndexSetRef = useRef(false);

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
    if (initialIndexSetRef.current || !targetContentId || contents.length === 0) return;
    const index = contents.findIndex((c) => c.id === targetContentId);
    if (index > 0) setCurrentIndex(index);
    initialIndexSetRef.current = true;
  }, [contents, targetContentId]);

  const handleRemix = useCallback((content: Content) => {
    navigate('/create', { state: { remix: content } });
  }, [navigate]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setContainerHeight(el.clientHeight);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    if (contents.length === 0) return;
    pointerIdRef.current = e.pointerId;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    draggingRef.current = true;
    startYRef.current = e.clientY;
    startTimeRef.current = Date.now();
    setIsDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!draggingRef.current || pointerIdRef.current !== e.pointerId) return;
    let dy = e.clientY - startYRef.current;
    // 边界阻尼：第一个向下拖 / 最后一个向上拖 时阻尼为 0.3
    if ((currentIndex === 0 && dy > 0) || (currentIndex === contents.length - 1 && dy < 0)) {
      dy = dy * 0.3;
    }
    setDragY(dy);
  };

  const finishDrag = useCallback(() => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    const h = containerHeight;
    const dt = Math.max(Date.now() - startTimeRef.current, 1);
    const velocity = dragY / dt; // px/ms, 负值向上
    let next = currentIndex;
    if (dragY < -h * SWITCH_DISTANCE_RATIO || velocity < -SWITCH_VELOCITY_THRESHOLD) {
      next = Math.min(currentIndex + 1, contents.length - 1);
    } else if (dragY > h * SWITCH_DISTANCE_RATIO || velocity > SWITCH_VELOCITY_THRESHOLD) {
      next = Math.max(currentIndex - 1, 0);
    }
    setCurrentIndex(next);
    setDragY(0);
    setIsDragging(false);
    pointerIdRef.current = null;
  }, [dragY, currentIndex, contents.length, containerHeight]);

  const onPointerUp = (e: React.PointerEvent) => {
    if (pointerIdRef.current === e.pointerId) {
      try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch { /* noop */ }
      finishDrag();
    }
  };

  const translateY = -currentIndex * containerHeight + dragY;

  return (
    <div className="h-dvh w-full flex items-center justify-center bg-[#050507]">
      <div
        ref={containerRef}
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
          <>
            {/* 垂直滑动容器：transform 驱动 */}
            <div
              className="absolute inset-0"
              style={{
                transform: `translate3d(0, ${translateY}px, 0)`,
                transition: isDragging ? 'none' : 'transform 300ms cubic-bezier(0.22, 1, 0.36, 1)',
                willChange: 'transform',
              }}
            >
              {contents.map((content, idx) => (
                <div
                  key={content.id}
                  className="absolute left-0 right-0"
                  style={{
                    top: idx * containerHeight,
                    height: containerHeight,
                  }}
                >
                  <FeedItem
                    content={content}
                    onRemix={handleRemix}
                    bottomInset={SWITCH_AREA_HEIGHT}
                    interactive={!isDragging}
                  />
                </div>
              ))}
            </div>

            {/* 底部切换手势区 - 半透明遮罩 + 文字提示 */}
            <div
              className="absolute left-0 right-0 bottom-0 z-30 select-none"
              style={{
                height: SWITCH_AREA_HEIGHT,
                background: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(6px)',
                touchAction: 'none',
                cursor: isDragging ? 'grabbing' : 'grab',
              }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
            >
              <div className="flex items-center justify-center h-full gap-2 pointer-events-none">
                <span className="text-white/80 text-[14px] font-semibold tracking-wide">{t('immersive.swipeHint')}</span>
                <span className="text-white/40 text-[12px] font-medium tabular-nums">
                  {currentIndex + 1} / {contents.length}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
