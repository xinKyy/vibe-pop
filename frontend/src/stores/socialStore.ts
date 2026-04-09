import { create } from 'zustand';

interface SocialState {
  likedContentIds: Set<string>;
  favoritedContentIds: Set<string>;
  followingUserIds: Set<string>;
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

  toggleLike: (contentId) => {
    const current = get().likedContentIds;
    const next = new Set(current);
    const wasLiked = next.has(contentId);
    wasLiked ? next.delete(contentId) : next.add(contentId);
    set({ likedContentIds: next });
    return !wasLiked;
  },

  toggleFavorite: (contentId) => {
    const current = get().favoritedContentIds;
    const next = new Set(current);
    const wasFaved = next.has(contentId);
    wasFaved ? next.delete(contentId) : next.add(contentId);
    set({ favoritedContentIds: next });
    return !wasFaved;
  },

  toggleFollow: (userId) => {
    const current = get().followingUserIds;
    const next = new Set(current);
    const wasFollowing = next.has(userId);
    wasFollowing ? next.delete(userId) : next.add(userId);
    set({ followingUserIds: next });
    return !wasFollowing;
  },

  isLiked: (contentId) => get().likedContentIds.has(contentId),
  isFavorited: (contentId) => get().favoritedContentIds.has(contentId),
  isFollowing: (userId) => get().followingUserIds.has(userId),
}));
