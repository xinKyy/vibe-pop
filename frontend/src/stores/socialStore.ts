import { create } from 'zustand';
import { api } from '../api/client';
import { useAuthStore } from './authStore';

interface SocialState {
  likedContentIds: Set<string>;
  favoritedContentIds: Set<string>;
  followingUserIds: Set<string>;
  initialized: boolean;

  init: () => Promise<void>;
  reset: () => void;
  toggleLike: (contentId: string) => boolean;
  toggleFavorite: (contentId: string) => boolean;
  toggleFollow: (userId: string) => boolean;
  isLiked: (contentId: string) => boolean;
  isFavorited: (contentId: string) => boolean;
  isFollowing: (userId: string) => boolean;
}

export const useSocialStore = create<SocialState>((set, get) => ({
  likedContentIds: new Set(),
  favoritedContentIds: new Set(),
  followingUserIds: new Set(),
  initialized: false,

  init: async () => {
    if (!useAuthStore.getState().isLoggedIn) return;
    try {
      const res = await api.social.getState();
      set({
        likedContentIds: new Set(res.data.likes),
        favoritedContentIds: new Set(res.data.favorites),
        followingUserIds: new Set(res.data.following),
        initialized: true,
      });
    } catch {
      // silently fail — user will see default (un-liked) states
    }
  },

  reset: () => set({
    likedContentIds: new Set(),
    favoritedContentIds: new Set(),
    followingUserIds: new Set(),
    initialized: false,
  }),

  toggleLike: (contentId) => {
    const current = get().likedContentIds;
    const next = new Set(current);
    const wasLiked = next.has(contentId);
    wasLiked ? next.delete(contentId) : next.add(contentId);
    set({ likedContentIds: next });

    if (useAuthStore.getState().isLoggedIn) {
      api.social.like(contentId).catch(() => {
        const revert = new Set(get().likedContentIds);
        wasLiked ? revert.add(contentId) : revert.delete(contentId);
        set({ likedContentIds: revert });
      });
    }

    return !wasLiked;
  },

  toggleFavorite: (contentId) => {
    const current = get().favoritedContentIds;
    const next = new Set(current);
    const wasFaved = next.has(contentId);
    wasFaved ? next.delete(contentId) : next.add(contentId);
    set({ favoritedContentIds: next });

    if (useAuthStore.getState().isLoggedIn) {
      api.social.favorite(contentId).catch(() => {
        const revert = new Set(get().favoritedContentIds);
        wasFaved ? revert.add(contentId) : revert.delete(contentId);
        set({ favoritedContentIds: revert });
      });
    }

    return !wasFaved;
  },

  toggleFollow: (userId) => {
    const current = get().followingUserIds;
    const next = new Set(current);
    const wasFollowing = next.has(userId);
    wasFollowing ? next.delete(userId) : next.add(userId);
    set({ followingUserIds: next });

    if (useAuthStore.getState().isLoggedIn) {
      api.social.follow(userId).catch(() => {
        const revert = new Set(get().followingUserIds);
        wasFollowing ? revert.add(userId) : revert.delete(userId);
        set({ followingUserIds: revert });
      });
    }

    return !wasFollowing;
  },

  isLiked: (contentId) => get().likedContentIds.has(contentId),
  isFavorited: (contentId) => get().favoritedContentIds.has(contentId),
  isFollowing: (userId) => get().followingUserIds.has(userId),
}));
