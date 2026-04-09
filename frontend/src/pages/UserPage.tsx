import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ContentCard from '../components/content/ContentCard';
import { mockContents } from '../api/mockData';

const tabs = ['作品', '点赞'] as const;

export default function UserPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<typeof tabs[number]>('作品');
  const [following, setFollowing] = useState(false);

  const userContents = mockContents.filter((c) => c.authorId === userId);
  const user = userContents[0]?.author ?? {
    id: userId ?? '',
    username: '创作者',
    handle: 'creator',
    avatar: '🎨',
  };

  const likedContents = [mockContents[3]];
  const contents = activeTab === '作品' ? userContents : likedContents;

  return (
    <div className="h-full overflow-y-auto">
      {/* Header with back button */}
      <div className="flex items-center px-4 py-3">
        <button onClick={() => navigate(-1)} className="text-2xl">←</button>
        <span className="flex-1 text-center text-sm font-medium">个人主页</span>
        <div className="w-6" />
      </div>

      {/* Profile header */}
      <div className="px-5 pb-5 text-center border-b border-[var(--color-border)]">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink to-pink-dark mx-auto mb-3 flex items-center justify-center text-4xl">
          {user.avatar}
        </div>
        <div className="text-lg font-semibold mb-1">{user.username}</div>
        <div className="text-[13px] text-[var(--color-text-muted)] mb-2">@{user.handle}</div>
        <div className="text-[13px] text-[var(--color-text-secondary)] mb-3">创造有趣的内容 ✨</div>

        <div className="flex justify-center gap-6 mb-4">
          <div className="cursor-pointer">
            <div className="text-base font-semibold">{Math.floor(Math.random() * 200)}</div>
            <div className="text-xs text-[var(--color-text-muted)]">关注</div>
          </div>
          <div className="cursor-pointer">
            <div className="text-base font-semibold">{Math.floor(Math.random() * 1000)}</div>
            <div className="text-xs text-[var(--color-text-muted)]">粉丝</div>
          </div>
        </div>

        <button
          onClick={() => setFollowing((v) => !v)}
          className={`px-6 py-2 rounded-2xl text-[13px] transition-all ${
            following
              ? 'bg-transparent border border-[var(--color-border-input)] text-[var(--color-text-muted)]'
              : 'bg-gradient-to-br from-pink to-pink-dark text-white border-none'
          }`}
        >
          {following ? '已关注' : '+ 关注'}
        </button>
      </div>

      {/* Tabs -- no "收藏" for other users */}
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

      {/* Content */}
      <div className="p-3">
        {contents.length === 0 ? (
          <div className="text-center py-16 text-[var(--color-text-dim)]">
            <div className="text-5xl mb-3">📭</div>
            <div className="text-sm">还没有内容</div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {contents.map((content) => (
              <ContentCard key={content.id} content={content} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
