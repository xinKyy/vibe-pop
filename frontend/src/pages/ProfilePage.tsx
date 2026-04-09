import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ContentCard from '../components/content/ContentCard';
import FollowListModal from '../components/social/FollowListModal';
import { useAuthStore } from '../stores/authStore';
import { mockUser, mockMyContents, mockContents } from '../api/mockData';

const tabs = ['作品', '点赞', '收藏'] as const;

const mockFollowing = [
  { id: 'u_002', username: '小明的创意工坊', handle: 'xiaoming', avatar: '🎨' },
  { id: 'u_003', username: '旅行日记', handle: 'travel', avatar: '✈️' },
  { id: 'u_004', username: '毒舌AI', handle: 'dushe', avatar: '🤖' },
];

const mockFollowers = [
  { id: 'u_005', username: '时光机', handle: 'timemachine', avatar: '⏰' },
  { id: 'u_006', username: '贺卡工厂', handle: 'cardmaker', avatar: '🎂' },
];

export default function ProfilePage() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuthStore();
  const [activeTab, setActiveTab] = useState<typeof tabs[number]>('作品');
  const [followListType, setFollowListType] = useState<'following' | 'followers' | null>(null);

  const user = mockUser;
  const likedContents = [mockContents[1]];
  const favoritedContents = [mockContents[4]];

  const getTabContent = () => {
    switch (activeTab) {
      case '作品': return mockMyContents;
      case '点赞': return likedContents;
      case '收藏': return favoritedContents;
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="h-full flex flex-col items-center justify-center px-8">
        <div className="text-6xl mb-4">👤</div>
        <div className="text-lg font-semibold mb-2">还没有登录</div>
        <div className="text-sm text-[var(--color-text-muted)] mb-6 text-center">
          登录后可以创作内容、管理作品
        </div>
        <button
          onClick={() => navigate('/login')}
          className="px-8 py-3 bg-gradient-to-br from-pink to-pink-dark rounded-3xl text-white text-sm font-semibold active:scale-95 transition-transform"
        >
          去登录
        </button>
      </div>
    );
  }

  const contents = getTabContent();

  return (
    <>
      <div className="h-full overflow-y-auto">
        <div className="px-5 pt-6 pb-5 text-center border-b border-[var(--color-border)]">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink to-pink-dark mx-auto mb-3 flex items-center justify-center text-4xl">
            {user.avatar}
          </div>
          <div className="text-lg font-semibold mb-1">{user.username}</div>
          <div className="text-[13px] text-[var(--color-text-muted)] mb-2">@{user.handle}</div>
          <div className="text-[13px] text-[var(--color-text-secondary)] mb-3">{user.bio}</div>

          <div className="flex justify-center gap-6 mb-4">
            <button className="text-center" onClick={() => setFollowListType('following')}>
              <div className="text-base font-semibold">{user.followingCount}</div>
              <div className="text-xs text-[var(--color-text-muted)]">关注</div>
            </button>
            <button className="text-center" onClick={() => setFollowListType('followers')}>
              <div className="text-base font-semibold">{user.followersCount}</div>
              <div className="text-xs text-[var(--color-text-muted)]">粉丝</div>
            </button>
          </div>

          <button className="px-6 py-2 bg-transparent border border-[var(--color-border-input)] rounded-2xl text-white text-[13px] active:scale-95 transition-transform">
            编辑资料
          </button>
        </div>

        <div className="flex border-b border-[var(--color-border)]">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 text-center py-3.5 text-sm relative transition-colors ${
                activeTab === tab ? 'text-white font-semibold' : 'text-[var(--color-text-muted)]'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-[30%] right-[30%] h-0.5 bg-pink" />
              )}
            </button>
          ))}
        </div>

        <div className="p-3">
          {contents.length === 0 ? (
            <div className="text-center py-16 text-[var(--color-text-dim)]">
              <div className="text-5xl mb-3">📭</div>
              <div className="text-sm">还没有内容</div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {contents.map((content) => (
                <ContentCard
                  key={content.id}
                  content={content}
                  showManage={activeTab === '作品'}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <FollowListModal
        title={followListType === 'following' ? '关注' : '粉丝'}
        items={followListType === 'following' ? mockFollowing : mockFollowers}
        isOpen={followListType !== null}
        onClose={() => setFollowListType(null)}
      />
    </>
  );
}
