import { create } from 'zustand';
import type { Content } from '../types';

interface ContentState {
  feedContents: Content[];
  listContents: Content[];
  currentCategory: string;
  setFeedContents: (contents: Content[]) => void;
  setListContents: (contents: Content[]) => void;
  setCurrentCategory: (category: string) => void;
  toggleLike: (contentId: string) => void;
  toggleFavorite: (contentId: string) => void;
}

export const useContentStore = create<ContentState>((set) => ({
  feedContents: [],
  listContents: [],
  currentCategory: '全部',
  setFeedContents: (contents) => set({ feedContents: contents }),
  setListContents: (contents) => set({ listContents: contents }),
  setCurrentCategory: (category) => set({ currentCategory: category }),
  toggleLike: (contentId) =>
    set((state) => ({
      feedContents: state.feedContents.map((c) =>
        c.id === contentId
          ? { ...c, likeCount: c.likeCount + (c.likeCount > 0 ? -1 : 1) }
          : c
      ),
      listContents: state.listContents.map((c) =>
        c.id === contentId
          ? { ...c, likeCount: c.likeCount + (c.likeCount > 0 ? -1 : 1) }
          : c
      ),
    })),
  toggleFavorite: (contentId) =>
    set((state) => ({
      feedContents: state.feedContents.map((c) =>
        c.id === contentId
          ? {
              ...c,
              favoriteCount: c.favoriteCount + (c.favoriteCount > 0 ? -1 : 1),
            }
          : c
      ),
    })),
}));
