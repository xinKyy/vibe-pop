import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ContentCard from '../components/content/ContentCard';
import { api } from '../api/client';
import type { Content } from '../types';

const tabs = ['作品', '点赞'] as const;

export default function UserPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<typeof tabs[number]>('作品');
  const [following, setFollowing] = useState(false);
  const [userContents, setUserContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);

  const user = userContents[0]?.author ?? {
    id: userId ?? '',
    username: '创作者',
    handle: 'creator',
    avatar: '🎨',
  };

  const fetchContents = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await api.users.contents(userId);
      setUserContents(res.data.items);
    } catch (e) {
      console.error('Failed to fetch user contents:', e);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchContents();
  }, [fetchContents]);

  const contents = activeTab === '作品' ? userContents : [];

  return (
    <div className="h-full overflow-y-auto bg-bg">
      {/* Header */}
      <div className="flex items-center px-5 py-4 border-b border-border/50">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-[var(--radius-sm)] bg-muted flex items-center justify-center text-muted-fg hover:bg-border hover:text-fg transition-all duration-200">
          ←
        </button>
        <span className="flex-1 text-center text-[14px] font-semibold">个人主页</span>
        <div className="w-10" />
      </div>

      {/* Profile */}
      <div className="px-5 pt-7 pb-7">
        {/* Avatar + name */}
        <div className="flex items-start gap-4 mb-7">
          <div className="w-[72px] h-[72px] bg-muted rounded-full flex items-center justify-center text-[2rem] flex-shrink-0">
            {user.avatar}
          </div>
          <div className="flex-1 min-w-0 pt-2">
            <div className="text-[22px] font-bold tracking-tight leading-none mb-2.5">
              {user.username}
            </div>
            <div className="text-[14px] text-dim font-medium mb-2">
              @{user.handle}
            </div>
            <div className="text-[14px] text-muted-fg">创造有趣的内容</div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-3.5 mb-5">
          <div className="flex-1 bg-card rounded-[var(--radius-md)] py-4.5 text-center">
            <div className="text-[22px] font-bold tabular-nums leading-none">{userContents.length}</div>
            <div className="text-[12px] text-dim font-medium mt-2">作品</div>
          </div>
          <div className="flex-1 bg-card rounded-[var(--radius-md)] py-4.5 text-center">
            <div className="text-[22px] font-bold tabular-nums leading-none">--</div>
            <div className="text-[12px] text-dim font-medium mt-2">粉丝</div>
          </div>
        </div>

        {/* Follow */}
        <button
          onClick={() => setFollowing((v) => !v)}
          className={`w-full py-3 text-[14px] font-semibold rounded-[var(--radius-sm)] transition-all duration-200 ${
            following
              ? 'bg-muted text-muted-fg hover:bg-border'
              : 'bg-accent text-accent-fg hover:brightness-110'
          }`}
        >
          {following ? '已关注' : '+ 关注'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2.5 px-5 pt-1 pb-5 border-b border-border/50">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 text-center py-3 text-[14px] font-semibold rounded-[var(--radius-sm)] transition-all duration-200 ${
              activeTab === tab
                ? 'bg-fg text-bg'
                : 'text-dim hover:text-fg hover:bg-muted'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div>
        {loading ? (
          <div className="grid grid-cols-2 gap-4 px-5 py-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="rounded-[var(--radius-md)] overflow-hidden bg-card">
                <div className="aspect-square loading-shimmer" />
                <div className="p-3.5 space-y-3">
                  <div className="h-3.5 loading-shimmer w-3/4 rounded" />
                  <div className="h-3 loading-shimmer w-1/2 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : contents.length === 0 ? (
          <div className="text-center py-20 text-dim">
            <div className="text-5xl mb-5 opacity-30">◇</div>
            <div className="text-[15px] font-semibold">还没有内容</div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 px-5 py-6">
            {contents.map((content) => (
              <ContentCard key={content.id} content={content} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
