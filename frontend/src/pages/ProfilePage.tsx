import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ContentCard from '../components/content/ContentCard';
import { useAuthStore } from '../stores/authStore';
import { api } from '../api/client';
import type { Content } from '../types';

const tabs = ['作品', '点赞', '收藏'] as const;

export default function ProfilePage() {
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<typeof tabs[number]>('作品');
  const [myContents, setMyContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMyContents = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await api.users.contents(user.id);
      setMyContents(res.data.items);
    } catch (e) {
      console.error('Failed to fetch my contents:', e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isLoggedIn) fetchMyContents();
  }, [isLoggedIn, fetchMyContents]);

  if (!isLoggedIn) {
    return (
      <div className="h-full flex flex-col items-center justify-center px-8 bg-bg">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center text-4xl mb-7">◎</div>
        <div className="text-lg font-semibold mb-3">还没有登录</div>
        <div className="text-[14px] text-dim text-center mb-10 max-w-[260px] leading-relaxed">
          登录后可以创作内容、管理作品、与创作者互动
        </div>
        <button onClick={() => navigate('/login')}
          className="px-10 py-4 bg-accent text-accent-fg text-[15px] font-semibold rounded-[var(--radius-md)] active:scale-95 hover:brightness-110 transition-all duration-200">
          去登录
        </button>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-bg">
      {/* Profile header */}
      <div style={{ padding: '18px 20px 16px' }}>
        {/* Avatar + name */}
        <div className="flex items-start" style={{ gap: 12, marginBottom: 14 }}>
          <div className="w-[72px] h-[72px] bg-muted rounded-full flex items-center justify-center text-[2rem] flex-shrink-0">
            {user?.avatar || '😀'}
          </div>
          <div className="flex-1 min-w-0" style={{ paddingTop: 6 }}>
            <div className="text-[22px] font-bold tracking-tight leading-none" style={{ marginBottom: 6 }}>
              {user?.username || '用户'}
            </div>
            <div className="text-[14px] text-dim font-medium">
              @{user?.handle || 'user'}
            </div>
            {user?.bio && (
              <div className="text-[14px] text-muted-fg leading-relaxed" style={{ marginTop: 6 }}>{user.bio}</div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex" style={{ gap: 8, marginBottom: 10 }}>
          <div className="flex-1 bg-card rounded-[var(--radius-md)] text-center" style={{ padding: '12px 0' }}>
            <div className="text-[22px] font-bold tabular-nums leading-none">{user?.followingCount || 0}</div>
            <div className="text-[12px] text-dim font-medium" style={{ marginTop: 4 }}>关注</div>
          </div>
          <div className="flex-1 bg-card rounded-[var(--radius-md)] text-center" style={{ padding: '12px 0' }}>
            <div className="text-[22px] font-bold tabular-nums leading-none">{user?.followersCount || 0}</div>
            <div className="text-[12px] text-dim font-medium" style={{ marginTop: 4 }}>粉丝</div>
          </div>
          <div className="flex-1 bg-card rounded-[var(--radius-md)] text-center" style={{ padding: '12px 0' }}>
            <div className="text-[22px] font-bold tabular-nums leading-none">{myContents.length}</div>
            <div className="text-[12px] text-dim font-medium" style={{ marginTop: 4 }}>作品</div>
          </div>
        </div>

        {/* Edit profile */}
        <button className="w-full rounded-[var(--radius-sm)] bg-muted text-[14px] font-semibold text-muted-fg hover:bg-border hover:text-fg transition-all duration-200" style={{ padding: '10px 0' }}>
          编辑资料
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border/50" style={{ gap: 8, padding: '2px 20px 10px' }}>
        {tabs.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex-1 text-center text-[14px] font-semibold rounded-[var(--radius-sm)] transition-all duration-200 ${
              activeTab === tab
                ? 'bg-fg text-bg'
                : 'text-dim hover:text-fg hover:bg-muted'
            }`}
            style={{ padding: '10px 0' }}>
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div>
        {loading ? (
          <div className="grid grid-cols-2" style={{ gap: 10, padding: '12px 20px' }}>
            {[...Array(2)].map((_, i) => (
              <div key={i} className="rounded-[var(--radius-md)] overflow-hidden bg-card">
                <div className="aspect-square loading-shimmer" />
                <div style={{ padding: 10 }}>
                  <div className="loading-shimmer w-3/4 rounded" style={{ height: 14, marginBottom: 6 }} />
                  <div className="loading-shimmer w-1/2 rounded" style={{ height: 12 }} />
                </div>
              </div>
            ))}
          </div>
        ) : activeTab === '作品' && myContents.length === 0 ? (
          <div className="text-center text-dim" style={{ padding: '40px 20px' }}>
            <div className="text-5xl opacity-30" style={{ marginBottom: 10 }}>◇</div>
            <div className="text-[15px] font-semibold" style={{ marginBottom: 6 }}>还没有作品</div>
            <div className="text-[13px] text-dim" style={{ marginBottom: 16 }}>用 AI 创作你的第一个互动内容</div>
            <button onClick={() => navigate('/create')}
              className="bg-accent text-accent-fg text-[14px] font-semibold rounded-[var(--radius-md)] active:scale-95 hover:brightness-110 transition-all"
              style={{ padding: '12px 24px' }}>
              开始创作
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2" style={{ gap: 10, padding: '12px 20px' }}>
            {(activeTab === '作品' ? myContents : []).map((content) => (
              <ContentCard key={content.id} content={content} showManage={activeTab === '作品'} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
