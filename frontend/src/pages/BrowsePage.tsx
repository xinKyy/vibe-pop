import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ContentCard from '../components/content/ContentCard';
import FeedItem from '../components/content/FeedItem';
import { mockContents } from '../api/mockData';

const categories = ['全部', '游戏', '回忆', '生成器', '其他'];
const categoryMap: Record<string, string | undefined> = {
  '全部': undefined,
  '游戏': 'game',
  '回忆': 'memory',
  '生成器': 'generator',
  '其他': 'other',
};

export default function BrowsePage() {
  const [mode, setMode] = useState<'list' | 'feed'>('list');
  const [category, setCategory] = useState('全部');
  const feedRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const filteredContents = categoryMap[category]
    ? mockContents.filter((c) => c.type === categoryMap[category])
    : mockContents;

  const openFeedFromList = useCallback((index: number) => {
    setMode('feed');
    setTimeout(() => {
      const items = feedRef.current?.querySelectorAll('.snap-start');
      items?.[index]?.scrollIntoView({ behavior: 'instant' as ScrollBehavior });
    }, 50);
  }, []);

  const handleRemix = useCallback((content: typeof mockContents[0]) => {
    navigate('/create', { state: { remix: content } });
  }, [navigate]);

  return (
    <div className="h-full flex flex-col">
      {/* Top tab bar */}
      <div className="flex px-5 pt-3 pb-0 bg-gradient-to-b from-[var(--color-bg-primary)]/95 to-transparent sticky top-0 z-[100]">
        {(['list', 'feed'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 text-center py-2 text-sm cursor-pointer relative transition-colors ${
              mode === m ? 'text-pink font-semibold' : 'text-[var(--color-text-dim)]'
            }`}
          >
            {m === 'list' ? 'List' : 'Feed'}
            {mode === m && (
              <span className="absolute bottom-0 left-[30%] right-[30%] h-0.5 bg-gradient-to-r from-pink to-pink-dark rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* List mode */}
      {mode === 'list' && (
        <div className="flex-1 overflow-y-auto">
          {/* Category filter */}
          <div className="flex gap-2 px-4 py-2 overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3.5 py-1.5 rounded-2xl text-xs whitespace-nowrap transition-all ${
                  category === cat
                    ? 'bg-gradient-to-br from-pink to-pink-dark text-white border border-transparent'
                    : 'bg-transparent border border-[var(--color-border-input)] text-[var(--color-text-muted)]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Content grid */}
          <div className="grid grid-cols-2 gap-3 p-3">
            {filteredContents.map((content, i) => (
              <ContentCard
                key={content.id}
                content={content}
                onClick={() => openFeedFromList(i)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Feed mode */}
      {mode === 'feed' && (
        <div
          ref={feedRef}
          className="flex-1 overflow-y-scroll snap-y snap-mandatory scroll-smooth"
        >
          {mockContents.map((content) => (
            <FeedItem key={content.id} content={content} onRemix={handleRemix} />
          ))}
        </div>
      )}
    </div>
  );
}
