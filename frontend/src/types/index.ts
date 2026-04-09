export interface User {
  id: string;
  email: string;
  username: string;
  handle: string;
  avatar: string;
  bio: string;
  followingCount: number;
  followersCount: number;
  createdAt: string;
}

export type ContentType = 'game' | 'memory' | 'generator' | 'other';

export interface Content {
  id: string;
  title: string;
  description: string;
  type: ContentType;
  code: string;
  coverUrl: string;
  coverEmoji: string;
  coverGradient: string;
  tags: string[];
  authorId: string;
  author: UserSummary;
  status: 'draft' | 'published';
  playCount: number;
  likeCount: number;
  favoriteCount: number;
  commentCount: number;
  remixCount: number;
  remixFromId?: string;
  remixFrom?: ContentSummary;
  createdAt: string;
  publishedAt?: string;
}

export interface ContentSummary {
  id: string;
  title: string;
  coverEmoji: string;
  coverGradient: string;
  authorId: string;
  authorName: string;
}

export interface UserSummary {
  id: string;
  username: string;
  handle: string;
  avatar: string;
}

export interface Comment {
  id: string;
  contentId: string;
  userId: string;
  user: UserSummary;
  text: string;
  createdAt: string;
}

export interface FeaturedTemplate {
  id: string;
  title: string;
  cover: string;
  coverEmoji: string;
  coverGradient: string;
  sortOrder: number;
  isActive: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
