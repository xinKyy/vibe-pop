import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ContentCard from '../components/content/ContentCard';
import EditProfileModal from '../components/social/EditProfileModal';
import { useAuthStore } from '../stores/authStore';
import { useSocialStore } from '../stores/socialStore';
import { api } from '../api/client';
import type { Content, User } from '../types';
import { useTranslation, type TranslationKey } from '../i18n';

type TabKey = 'works' | 'likes' | 'favorites';
const tabs: { key: TabKey; labelKey: TranslationKey }[] = [
  { key: 'works', labelKey: 'profile.tabs.works' },
  { key: 'likes', labelKey: 'profile.tabs.likes' },
  { key: 'favorites', labelKey: 'profile.tabs.favorites' },
];

export default function ProfilePage() {
  const navigate = useNavigate();
  const { isLoggedIn, user, updateUser, logout } = useAuthStore();
  const resetSocial = useSocialStore((s) => s.reset);
  // 订阅 liked / favorited 集合，用户在任意页面点赞后回到这里能自动刷新列表
  const likedIds = useSocialStore((s) => s.likedContentIds);
  const favoritedIds = useSocialStore((s) => s.favoritedContentIds);
  const { t, language, setLanguage } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabKey>('works');
  const [myContents, setMyContents] = useState<Content[]>([]);
  const [likedContents, setLikedContents] = useState<Content[]>([]);
  const [favoriteContents, setFavoriteContents] = useState<Content[]>([]);
  const [loadingTab, setLoadingTab] = useState<Record<TabKey, boolean>>({
    works: false,
    likes: false,
    favorites: false,
  });
  const [loadedTab, setLoadedTab] = useState<Record<TabKey, boolean>>({
    works: false,
    likes: false,
    favorites: false,
  });
  const [showEdit, setShowEdit] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Content | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState('');

  const userId = user?.id;

  const fetchMyContents = useCallback(async () => {
    if (!userId) return;
    setLoadingTab((s) => ({ ...s, works: true }));
    try {
      const res = await api.users.contents(userId);
      setMyContents(res?.data?.items ?? []);
    } catch (e) {
      console.error('Failed to fetch my contents:', e);
    } finally {
      setLoadingTab((s) => ({ ...s, works: false }));
      setLoadedTab((s) => ({ ...s, works: true }));
    }
  }, [userId]);

  const fetchMyLikes = useCallback(async () => {
    setLoadingTab((s) => ({ ...s, likes: true }));
    try {
      const res = await api.users.myLikes();
      setLikedContents((res?.data?.items ?? []) as Content[]);
    } catch (e) {
      console.error('Failed to fetch my likes:', e);
    } finally {
      setLoadingTab((s) => ({ ...s, likes: false }));
      setLoadedTab((s) => ({ ...s, likes: true }));
    }
  }, []);

  const fetchMyFavorites = useCallback(async () => {
    setLoadingTab((s) => ({ ...s, favorites: true }));
    try {
      const res = await api.users.myFavorites();
      setFavoriteContents((res?.data?.items ?? []) as Content[]);
    } catch (e) {
      console.error('Failed to fetch my favorites:', e);
    } finally {
      setLoadingTab((s) => ({ ...s, favorites: false }));
      setLoadedTab((s) => ({ ...s, favorites: true }));
    }
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;
    if (activeTab === 'works' && !loadedTab.works) fetchMyContents();
    if (activeTab === 'likes' && !loadedTab.likes) fetchMyLikes();
    if (activeTab === 'favorites' && !loadedTab.favorites) fetchMyFavorites();
  }, [isLoggedIn, activeTab, loadedTab, fetchMyContents, fetchMyLikes, fetchMyFavorites]);

  // 当社交状态变化（用户在发现页 / 详情页点/取消 点赞、收藏）后，
  // 把对应 tab 的 loaded 标记重置，下一次 activeTab 命中时自动 refetch。
  useEffect(() => {
    setLoadedTab((s) => (s.likes ? { ...s, likes: false } : s));
  }, [likedIds]);

  useEffect(() => {
    setLoadedTab((s) => (s.favorites ? { ...s, favorites: false } : s));
  }, [favoritedIds]);

  // 登出后重置所有加载状态，避免再次登录时看到旧数据
  useEffect(() => {
    if (!isLoggedIn) {
      setMyContents([]);
      setLikedContents([]);
      setFavoriteContents([]);
      setLoadedTab({ works: false, likes: false, favorites: false });
    }
  }, [isLoggedIn]);

  // 同步后端迁移后的最新用户资料（老账号可能缺 displayName 等字段）。只跑一次，避免循环。
  const meRefreshedRef = useRef(false);
  useEffect(() => {
    if (!isLoggedIn || meRefreshedRef.current) return;
    meRefreshedRef.current = true;
    api.users
      .me()
      .then((res) => {
        if (res?.success && res.data) updateUser(res.data as Partial<User>);
      })
      .catch((e) => console.error('Failed to refresh me:', e));
  }, [isLoggedIn, updateUser]);

  const handleSaveProfile = useCallback(
    async (updates: { displayName: string; avatar: string; bio: string }) => {
      const res = await api.users.updateMe(updates);
      if (!res.success) throw new Error(res.error || 'Save failed');
      updateUser(res.data as Partial<User>);
      setToast(t('profile.toast.updated'));
      window.setTimeout(() => setToast(''), 1500);
    },
    [updateUser, t],
  );

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(''), 1500);
  };

  const handleConfirmLogout = () => {
    logout();
    resetSocial();
    meRefreshedRef.current = false;
    setShowLogoutConfirm(false);
    showToast(t('settings.logout.toast'));
  };

  const handleEditContent = useCallback(
    (content: Content) => {
      // 带着原作品进入创作页，发布时走 PUT 原地更新（参见 CreatePage editContent 分支）
      navigate('/create', { state: { edit: content } });
    },
    [navigate],
  );

  const handleConfirmDelete = async () => {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    try {
      const res = await api.contents.delete(deleteTarget.id);
      if (!res.success) throw new Error(res.error || 'Delete failed');
      setMyContents((list) => list.filter((c) => c.id !== deleteTarget.id));
      setDeleteTarget(null);
      showToast(t('profile.delete.toast'));
    } catch (e: any) {
      console.error('Delete content failed:', e);
      showToast(t('profile.delete.failed'));
    } finally {
      setDeleting(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="h-full flex flex-col bg-bg">
        {/* 未登录时也允许切换语言 */}
        <div className="flex justify-end" style={{ padding: '14px 20px 0' }}>
          <LanguageSwitch language={language} setLanguage={setLanguage} t={t} />
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-8">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center text-4xl mb-7">◎</div>
          <div className="text-lg font-semibold mb-3">{t('profile.notLoggedIn.title')}</div>
          <div className="text-[14px] text-dim text-center mb-10 max-w-[260px] leading-relaxed">
            {t('profile.notLoggedIn.subtitle')}
          </div>
          <button onClick={() => navigate('/login')}
            className="px-10 py-4 bg-accent text-accent-fg text-[15px] font-semibold rounded-[var(--radius-md)] active:scale-95 hover:brightness-110 transition-all duration-200">
            {t('profile.notLoggedIn.cta')}
          </button>
        </div>
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
            <div className="text-[22px] font-bold tracking-tight leading-none truncate" style={{ marginBottom: 6 }}>
              {user?.displayName || t('profile.defaultDisplayName')}
            </div>
            <div className="text-[14px] text-dim font-medium truncate">
              @{user?.username || 'user'}
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
            <div className="text-[12px] text-dim font-medium" style={{ marginTop: 4 }}>{t('profile.stats.following')}</div>
          </div>
          <div className="flex-1 bg-card rounded-[var(--radius-md)] text-center" style={{ padding: '12px 0' }}>
            <div className="text-[22px] font-bold tabular-nums leading-none">{user?.followersCount || 0}</div>
            <div className="text-[12px] text-dim font-medium" style={{ marginTop: 4 }}>{t('profile.stats.followers')}</div>
          </div>
          <div className="flex-1 bg-card rounded-[var(--radius-md)] text-center" style={{ padding: '12px 0' }}>
            <div className="text-[22px] font-bold tabular-nums leading-none">{myContents.length}</div>
            <div className="text-[12px] text-dim font-medium" style={{ marginTop: 4 }}>{t('profile.stats.works')}</div>
          </div>
        </div>

        {/* Edit profile */}
        <button
          type="button"
          onClick={(e) => {
            // 防御移动端 ghost click / 父容器 pointer handler 吞事件，并在本地静默失败时兜底
            e.preventDefault();
            e.stopPropagation();
            setShowEdit(true);
          }}
          disabled={!user}
          className="w-full rounded-[var(--radius-sm)] bg-muted text-[14px] font-semibold text-muted-fg hover:bg-border hover:text-fg active:scale-[0.99] transition-all duration-200 disabled:opacity-40"
          style={{ padding: '10px 0', touchAction: 'manipulation' }}
        >
          {t('profile.editProfile')}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border/50" style={{ gap: 8, padding: '2px 20px 10px' }}>
        {tabs.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex-1 text-center text-[14px] font-semibold rounded-[var(--radius-sm)] transition-all duration-200 ${
              activeTab === tab.key
                ? 'bg-fg text-bg'
                : 'text-dim hover:text-fg hover:bg-muted'
            }`}
            style={{ padding: '10px 0' }}>
            {t(tab.labelKey)}
          </button>
        ))}
      </div>

      {/* Content */}
      <div>
        {(() => {
          const currentList =
            activeTab === 'works' ? myContents : activeTab === 'likes' ? likedContents : favoriteContents;
          const isLoading = loadingTab[activeTab];

          if (isLoading) {
            return (
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
            );
          }

          if (currentList.length === 0) {
            if (activeTab === 'works') {
              return (
                <div className="text-center text-dim" style={{ padding: '40px 20px' }}>
                  <div className="text-5xl opacity-30" style={{ marginBottom: 10 }}>◇</div>
                  <div className="text-[15px] font-semibold" style={{ marginBottom: 6 }}>{t('profile.empty.title')}</div>
                  <div className="text-[13px] text-dim" style={{ marginBottom: 16 }}>{t('profile.empty.subtitle')}</div>
                  <button onClick={() => navigate('/create')}
                    className="bg-accent text-accent-fg text-[14px] font-semibold rounded-[var(--radius-md)] active:scale-95 hover:brightness-110 transition-all"
                    style={{ padding: '12px 24px' }}>
                    {t('profile.empty.cta')}
                  </button>
                </div>
              );
            }
            return (
              <div className="text-center text-dim" style={{ padding: '40px 20px' }}>
                <div className="text-5xl opacity-30" style={{ marginBottom: 10 }}>
                  {activeTab === 'likes' ? '♡' : '☆'}
                </div>
                <div className="text-[15px] font-semibold" style={{ marginBottom: 6 }}>
                  {t(activeTab === 'likes' ? 'profile.empty.likes' : 'profile.empty.favorites')}
                </div>
              </div>
            );
          }

          return (
            <div className="grid grid-cols-2" style={{ gap: 10, padding: '12px 20px' }}>
              {currentList.map((content) => (
                <ContentCard
                  key={content.id}
                  content={content}
                  showManage={activeTab === 'works'}
                  onEdit={activeTab === 'works' ? () => handleEditContent(content) : undefined}
                  onDelete={activeTab === 'works' ? () => setDeleteTarget(content) : undefined}
                />
              ))}
            </div>
          );
        })()}
      </div>

      {/* 设置区块：语言切换 + 退出登录 */}
      <div style={{ padding: '20px 20px 32px' }}>
        <div className="text-[12px] font-semibold text-dim uppercase tracking-wider" style={{ marginBottom: 10 }}>
          {t('settings.section')}
        </div>
        <div className="bg-card rounded-[var(--radius-md)] overflow-hidden">
          {/* 语言 */}
          <div
            className="flex items-center justify-between"
            style={{ padding: '14px 16px' }}
          >
            <div className="text-[14px] font-semibold">{t('settings.language')}</div>
            <LanguageSwitch language={language} setLanguage={setLanguage} t={t} />
          </div>
          <div className="border-t border-border/40" />
          {/* 退出登录 */}
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center justify-between text-left hover:bg-muted/50 active:bg-muted transition-colors"
            style={{ padding: '14px 16px' }}
          >
            <div className="text-[14px] font-semibold text-red-400">{t('settings.logout')}</div>
            <span className="text-dim text-[14px]">→</span>
          </button>
        </div>
      </div>

      {user && (
        <EditProfileModal
          user={user}
          isOpen={showEdit}
          onClose={() => setShowEdit(false)}
          onSave={handleSaveProfile}
        />
      )}

      {showLogoutConfirm && (
        <LogoutConfirmDialog
          t={t}
          onCancel={() => setShowLogoutConfirm(false)}
          onConfirm={handleConfirmLogout}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmDialog
          t={t}
          title={deleteTarget.title}
          loading={deleting}
          onCancel={() => !deleting && setDeleteTarget(null)}
          onConfirm={handleConfirmDelete}
        />
      )}

      {toast && (
        <div
          className="fixed left-1/2 -translate-x-1/2 z-[3000] bg-black/80 text-white text-[12px] rounded-[var(--radius-sm)]"
          style={{ bottom: 100, padding: '8px 14px' }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}

function LanguageSwitch({
  language,
  setLanguage,
  t,
}: {
  language: 'zh' | 'en';
  setLanguage: (lang: 'zh' | 'en') => void;
  t: (key: TranslationKey) => string;
}) {
  return (
    <div
      className="inline-flex items-center bg-muted rounded-[var(--radius-full)]"
      style={{ padding: 3 }}
      role="tablist"
      aria-label="Language switch"
    >
      {(['zh', 'en'] as const).map((lang) => {
        const active = language === lang;
        return (
          <button
            key={lang}
            role="tab"
            aria-selected={active}
            onClick={() => setLanguage(lang)}
            className={`text-[12px] font-semibold rounded-[var(--radius-full)] transition-all duration-200 ${
              active ? 'bg-fg text-bg' : 'text-dim hover:text-fg'
            }`}
            style={{ padding: '4px 12px' }}
          >
            {t(lang === 'zh' ? 'settings.language.zh' : 'settings.language.en')}
          </button>
        );
      })}
    </div>
  );
}

function DeleteConfirmDialog({
  t,
  title,
  loading,
  onCancel,
  onConfirm,
}: {
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
  title: string;
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[2500] flex items-center justify-center px-6" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-[320px] bg-bg border border-border/50 rounded-[var(--radius-lg)] animate-fade-in"
        onClick={(e) => e.stopPropagation()}
        style={{ padding: '20px' }}
      >
        <div className="text-[16px] font-semibold" style={{ marginBottom: 8 }}>
          {t('profile.delete.confirmTitle')}
        </div>
        <div className="text-[13px] text-dim leading-relaxed" style={{ marginBottom: 18 }}>
          {t('profile.delete.confirmDesc', { title })}
        </div>
        <div className="flex" style={{ gap: 10 }}>
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 bg-muted text-muted-fg text-[14px] font-semibold rounded-[var(--radius-sm)] hover:bg-border hover:text-fg transition-all disabled:opacity-40"
            style={{ padding: '10px 0' }}
          >
            {t('profile.delete.cancel')}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 bg-red-500 text-white text-[14px] font-semibold rounded-[var(--radius-sm)] active:scale-95 hover:brightness-110 transition-all disabled:opacity-60"
            style={{ padding: '10px 0' }}
          >
            {loading ? t('profile.delete.deleting') : t('profile.delete.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}

function LogoutConfirmDialog({
  t,
  onCancel,
  onConfirm,
}: {
  t: (key: TranslationKey) => string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[2500] flex items-center justify-center px-6" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-[320px] bg-bg border border-border/50 rounded-[var(--radius-lg)] animate-fade-in"
        onClick={(e) => e.stopPropagation()}
        style={{ padding: '20px' }}
      >
        <div className="text-[16px] font-semibold" style={{ marginBottom: 8 }}>
          {t('settings.logout.confirmTitle')}
        </div>
        <div className="text-[13px] text-dim leading-relaxed" style={{ marginBottom: 18 }}>
          {t('settings.logout.confirmDesc')}
        </div>
        <div className="flex" style={{ gap: 10 }}>
          <button
            onClick={onCancel}
            className="flex-1 bg-muted text-muted-fg text-[14px] font-semibold rounded-[var(--radius-sm)] hover:bg-border hover:text-fg transition-all"
            style={{ padding: '10px 0' }}
          >
            {t('settings.logout.cancel')}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-500 text-white text-[14px] font-semibold rounded-[var(--radius-sm)] active:scale-95 hover:brightness-110 transition-all"
            style={{ padding: '10px 0' }}
          >
            {t('settings.logout.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}
