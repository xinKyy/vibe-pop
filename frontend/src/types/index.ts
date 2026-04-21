export interface User {
  id: string;
  email: string;
  /** 唯一、不可修改的 @-handle */
  username: string;
  /** 可修改、允许重复的显示名 */
  displayName: string;
  avatar: string;
  bio: string;
  followingCount: number;
  followersCount: number;
  createdAt: string;
  /** 是否完成新用户引导。false 时前端应把用户路由到 /onboarding。 */
  onboarded?: boolean;
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
  displayName: string;
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
  /** 点击后填入输入框的提示词 */
  prompt: string;
  emoji: string;
  gradient: string;
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
