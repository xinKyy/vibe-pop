import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Marquee from '../components/ui/Marquee';
import ContentCard from '../components/content/ContentCard';
import { api } from '../api/client';
import type { Content } from '../types';

const categories = ['全部', '游戏', '回忆', '生成器', '其他'];
const categoryMap: Record<string, string | undefined> = {
  '全部': undefined,
  '游戏': 'game',
  '回忆': 'memory',
  '生成器': 'generator',
  '其他': 'other',
};

export default function BrowsePage() {
  const [category, setCategory] = useState('全部');
  const [listContents, setListContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchList = useCallback(async (cat: string) => {
    setLoading(true);
    try {
      const type = categoryMap[cat];
      const res = await api.contents.list({ type });
      setListContents(res.data.items);
    } catch (e) {
      console.error('Failed to fetch list:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchList(category);
  }, [fetchList, category]);

  const handleCategoryChange = (cat: string) => {
    setCategory(cat);
    fetchList(cat);
  };

  return (
    <div className="h-full flex flex-col bg-bg">
      <div className="shrink-0">
        {/* Title */}
        <div style={{ padding: '12px 20px 8px' }}>
          <h1 className="text-[clamp(1.75rem,8vw,2.5rem)] font-bold tracking-tight leading-none">
            Vibe<span className="text-accent">Pop</span>
          </h1>
          <p className="text-[13px] text-dim font-medium" style={{ marginTop: 4 }}>AI 驱动的互动内容社区</p>
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
            发现
          </button>
          <button
            onClick={() => navigate('/immersive')}
            className="flex-1 text-[13px] font-semibold rounded-[var(--radius-sm)] transition-all duration-200 text-dim hover:text-fg hover:bg-muted"
            style={{ padding: '7px 0' }}
          >
            沉浸
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Category filter */}
        <div className="flex overflow-x-auto" style={{ gap: 8, padding: '0 20px 12px' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`text-[13px] font-semibold whitespace-nowrap rounded-[var(--radius-full)] transition-all duration-200 ${
                category === cat
                  ? 'bg-accent text-accent-fg'
                  : 'bg-muted text-muted-fg hover:bg-border hover:text-fg'
              }`}
              style={{ padding: '6px 16px' }}
            >
              {cat}
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
            <div className="text-[15px] font-semibold mb-2">暂无内容</div>
            <div className="text-[13px] text-dim">去创作第一个作品吧</div>
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
