export interface Env {
  KV: KVNamespace;
  R2?: R2Bucket;
  JWT_SECRET: string;
  AI_API_KEY?: string;
  AI_BASE_URL?: string;
  AI_MODEL?: string;
}

export interface User {
  id: string;
  email: string;
  /** 唯一、不可修改的 @-handle，用于 @ 引用与 URL 定位 */
  username: string;
  /** 可修改、允许重复的显示名 */
  displayName: string;
  avatar: string;
  bio: string;
  followingCount: number;
  followersCount: number;
  createdAt: string;
  /** 是否完成新用户引导（设置 username / displayName）。老用户默认 true。 */
  onboarded: boolean;
}

export interface UserSummary {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
}

export type ContentType = 'game' | 'album' | 'tool' | 'art' | 'guide' | 'other';

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
  status: 'draft' | 'published';
  playCount: number;
  likeCount: number;
  favoriteCount: number;
  commentCount: number;
  remixCount: number;
  remixFromId?: string;
  createdAt: string;
  publishedAt?: string;
}

export interface Comment {
  id: string;
  contentId: string;
  userId: string;
  text: string;
  createdAt: string;
}

export interface JWTPayload {
  sub: string;
  email: string;
  iat: number;
  exp: number;
}
