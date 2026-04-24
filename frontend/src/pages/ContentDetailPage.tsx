import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import FeedItem from '../components/content/FeedItem';
import Logo from '../components/ui/Logo';
import { api } from '../api/client';
import type { Content } from '../types';
import { useTranslation } from '../i18n';

/**
 * 单帖详情页（分享链接落地页）：/c/:contentId
 *
 * - 复用沉浸页 FeedItem 的单屏样式，但只展示一条内容。
 * - 未登录用户也能访问（内容接口是 optionalAuth）。
 * - 顶部左侧「返回」按钮走浏览历史，顶部右侧 Logo 永远把人带回首页发现流，
 *   方便从外部打开的访客顺着链接去探索更多。
 */
export default function ContentDetailPage() {
  const { contentId } = useParams<{ contentId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [content, setContent] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!contentId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    api.contents
      .get(contentId)
      .then((res) => {
        if (cancelled) return;
        setContent(res.data as Content);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('Failed to fetch content:', err);
        setError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [contentId]);

  const handleRemix = useCallback((c: Content) => {
    navigate('/create', { state: { remix: c } });
  }, [navigate]);

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/');
  };

  return (
    <div className="h-dvh w-full flex items-center justify-center bg-[#050507]">
      <div className="relative w-full max-w-[430px] h-full min-[431px]:h-[calc(100dvh-40px)] min-[431px]:max-h-[932px] bg-bg overflow-hidden min-[431px]:rounded-2xl min-[431px]:border min-[431px]:border-border/50">
        {/* Back button */}
        <button
          onClick={handleBack}
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

        {/* Home / logo: 让外部打开的访客可以一键进入 App */}
        <button
          onClick={() => navigate('/')}
          className="absolute top-0 right-0 z-50 flex items-center gap-2 text-white/90 hover:text-white transition-colors"
          style={{
            padding: '10px 14px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            textShadow: '0 1px 4px rgba(0,0,0,0.5)',
          }}
          aria-label="VibePop"
        >
          <Logo size={24} />
          <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em' }}>
            Vibe<span style={{ color: '#E8EA1A' }}>Pop</span>
          </span>
        </button>

        {loading ? (
          <div className="h-full flex flex-col items-center justify-center text-dim">
            <div className="text-3xl mb-4 opacity-40">···</div>
            <div className="text-[15px] font-semibold">{t('common.loading')}</div>
          </div>
        ) : error || !content ? (
          <div className="h-full flex flex-col items-center justify-center text-dim" style={{ padding: 24 }}>
            <div className="text-5xl mb-5 opacity-30">◇</div>
            <div className="text-[15px] font-semibold mb-2">{t('detail.notFound.title')}</div>
            <div className="text-[13px] text-dim mb-6 text-center" style={{ maxWidth: 280 }}>
              {t('detail.notFound.subtitle')}
            </div>
            <button
              onClick={() => navigate('/')}
              style={{
                padding: '10px 20px',
                borderRadius: 9999,
                background: '#E8EA1A',
                color: '#0A0A0C',
                border: 'none',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {t('detail.notFound.cta')}
            </button>
          </div>
        ) : (
          <FeedItem content={content} onRemix={handleRemix} bottomInset={0} interactive />
        )}
      </div>
    </div>
  );
}
