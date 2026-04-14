export interface Env {
  KV: KVNamespace;
  R2?: R2Bucket;
  JWT_SECRET: string;
  AI_API_KEY?: string;
  AI_BASE_URL?: string;
}

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
