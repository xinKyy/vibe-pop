import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Marquee from '../components/ui/Marquee';
import Logo from '../components/ui/Logo';
import ContentCard from '../components/content/ContentCard';
import { api } from '../api/client';
import type { Content } from '../types';
import { useTranslation, type TranslationKey } from '../i18n';

/**
 * 发现页筛选 tab。同一横排里混合了「排序维度」和「分类维度」：
 * - all / hot / latest 不过滤 type，仅改变排序方式
 * - 其余 tab 按对应 ContentType 过滤，内部按最新排序
 */
type TabKey = 'all' | 'hot' | 'latest' | 'game' | 'album' | 'tool' | 'art' | 'guide' | 'other';

interface BrowseTab {
  key: TabKey;
  labelKey: TranslationKey;
  type?: string;
  sort?: 'hot' | 'latest';
}

const BROWSE_TABS: BrowseTab[] = [
  { key: 'all', labelKey: 'browse.categories.all' },
  { key: 'hot', labelKey: 'browse.sort.hot', sort: 'hot' },
  { key: 'latest', labelKey: 'browse.sort.latest', sort: 'latest' },
  { key: 'game', labelKey: 'browse.categories.game', type: 'game' },
  { key: 'album', labelKey: 'browse.categories.album', type: 'album' },
  { key: 'tool', labelKey: 'browse.categories.tool', type: 'tool' },
  { key: 'art', labelKey: 'browse.categories.art', type: 'art' },
  { key: 'guide', labelKey: 'browse.categories.guide', type: 'guide' },
  { key: 'other', labelKey: 'browse.categories.other', type: 'other' },
];

export default function BrowsePage() {
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [listContents, setListContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const fetchList = useCallback(async (key: TabKey) => {
    setLoading(true);
    try {
      const tab = BROWSE_TABS.find((c) => c.key === key);
      const res = await api.contents.list({ type: tab?.type, sort: tab?.sort });
      setListContents(res.data.items);
    } catch (e) {
      console.error('Failed to fetch list:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchList(activeTab);
  }, [fetchList, activeTab]);

  const handleTabChange = (key: TabKey) => {
    setActiveTab(key);
    fetchList(key);
  };

  return (
    <div className="h-full flex flex-col bg-bg">
      <div className="shrink-0">
        {/* Title */}
        <div className="flex items-center gap-3" style={{ padding: '12px 20px 8px' }}>
          <Logo size={40} />
          <div>
            <h1 className="text-[clamp(1.75rem,8vw,2.5rem)] font-bold tracking-tight leading-none">
              Vibe<span className="text-accent">Pop</span>
            </h1>
            <p className="text-[13px] text-dim font-medium" style={{ marginTop: 4 }}>{t('app.tagline')}</p>
          </div>
        </div>

        {/* Marquee */}
        <div className="bg-accent/10 border-y border-accent/20" style={{ padding: '5px 0' }}>
          <Marquee speed={50}>
            <span className="text-[11px] font-semibold text-accent/80 mx-5">★ 创造力无限</span>
            <span className="text-[11px] font-semibold text-accent/80 mx-5">◆ AI 驱动</span>
            <span className="text-[11px] font-semibold text-accent/80 mx-5">● 互动内容</span>
            <span className="text-[11px] font-semibold text-accent/80 mx-5">★ VIBE CODING</span>
            <span className="text-[11px] font-semibold text-accent/80 mx-5">◆ FOR FUN</span>
          </Marquee>
        </div>

        {/* Mode toggle */}
        <div className="flex gap-2" style={{ padding: '4px 20px 4px' }}>
          <button
            className="flex-1 text-[13px] font-semibold rounded-[var(--radius-sm)] transition-all duration-200 bg-fg text-bg"
            style={{ padding: '7px 0' }}
          >
            {t('browse.modeDiscover')}
          </button>
          <button
            onClick={() => navigate('/immersive')}
            className="flex-1 text-[13px] font-semibold rounded-[var(--radius-sm)] transition-all duration-200 text-dim hover:text-fg hover:bg-muted"
            style={{ padding: '7px 0' }}
          >
            {t('browse.modeImmersive')}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Category + sort tabs (all / hot / latest / specific categories) */}
        <div className="flex overflow-x-auto" style={{ gap: 8, padding: '0 20px 12px' }}>
          {BROWSE_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`text-[13px] font-semibold whitespace-nowrap rounded-[var(--radius-full)] transition-all duration-200 ${
                activeTab === tab.key
                  ? 'bg-accent text-accent-fg'
                  : 'bg-muted text-muted-fg hover:bg-border hover:text-fg'
              }`}
              style={{ padding: '6px 16px' }}
            >
              {t(tab.labelKey)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-4 px-5 pb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-[var(--radius-md)] overflow-hidden bg-card">
                <div className="aspect-square loading-shimmer" />
                <div className="p-3.5 space-y-3">
                  <div className="h-3.5 loading-shimmer w-3/4 rounded" />
                  <div className="h-3 loading-shimmer w-1/2 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : listContents.length === 0 ? (
          <div className="text-center py-24 text-dim">
            <div className="text-5xl mb-5 opacity-30">◇</div>
            <div className="text-[15px] font-semibold mb-2">{t('browse.empty.title')}</div>
            <div className="text-[13px] text-dim">{t('browse.empty.subtitle')}</div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 px-5 pb-6">
            {listContents.map((content, i) => (
              <div key={content.id} className="animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                <ContentCard
                  content={content}
                  onClick={() => navigate('/immersive', { state: { contentId: content.id } })}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
