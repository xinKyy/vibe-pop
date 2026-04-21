import { Hono } from 'hono';
import type { Env, Content, Comment, User } from '../types';
import { authMiddleware, optionalAuth } from '../middleware/auth';
import { getUserById, toUserSummary, fallbackSummary } from '../services/users';

const social = new Hono<{ Bindings: Env }>();

// --- Social state (for hydrating frontend) ---
social.get('/users/me/social-state', authMiddleware, async (c) => {
  const userId = c.get('userId' as never) as string;

  const [likesJson, favsJson, followingJson] = await Promise.all([
    c.env.KV.get(`users:${userId}:likes`),
    c.env.KV.get(`users:${userId}:favorites`),
    c.env.KV.get(`users:${userId}:following`),
  ]);

  return c.json({
    success: true,
    data: {
      likes: likesJson ? JSON.parse(likesJson) : [],
      favorites: favsJson ? JSON.parse(favsJson) : [],
      following: followingJson ? JSON.parse(followingJson) : [],
    },
  });
});

// --- Like ---
social.post('/contents/:id/like', authMiddleware, async (c) => {
  const userId = c.get('userId' as never) as string;
  const contentId = c.req.param('id')!;

  const likesJson = await c.env.KV.get(`users:${userId}:likes`);
  const likes: string[] = likesJson ? JSON.parse(likesJson) : [];

  const contentData = await c.env.KV.get(`contents:${contentId}`);
  if (!contentData) return c.json({ success: false, error: 'Content not found' }, 404);
  const content: Content = JSON.parse(contentData);

  const isLiked = likes.includes(contentId);
  if (isLiked) {
    const updated = likes.filter((id) => id !== contentId);
    await c.env.KV.put(`users:${userId}:likes`, JSON.stringify(updated));
    content.likeCount = Math.max(0, content.likeCount - 1);
  } else {
    likes.unshift(contentId);
    await c.env.KV.put(`users:${userId}:likes`, JSON.stringify(likes));
    content.likeCount++;
  }

  await c.env.KV.put(`contents:${contentId}`, JSON.stringify(content));

  return c.json({ success: true, data: { liked: !isLiked, likeCount: content.likeCount } });
});

// --- Favorite ---
social.post('/contents/:id/favorite', authMiddleware, async (c) => {
  const userId = c.get('userId' as never) as string;
  const contentId = c.req.param('id')!;

  const favsJson = await c.env.KV.get(`users:${userId}:favorites`);
  const favs: string[] = favsJson ? JSON.parse(favsJson) : [];

  const contentData = await c.env.KV.get(`contents:${contentId}`);
  if (!contentData) return c.json({ success: false, error: 'Content not found' }, 404);
  const content: Content = JSON.parse(contentData);

  const isFaved = favs.includes(contentId);
  if (isFaved) {
    const updated = favs.filter((id) => id !== contentId);
    await c.env.KV.put(`users:${userId}:favorites`, JSON.stringify(updated));
    content.favoriteCount = Math.max(0, content.favoriteCount - 1);
  } else {
    favs.unshift(contentId);
    await c.env.KV.put(`users:${userId}:favorites`, JSON.stringify(favs));
    content.favoriteCount++;
  }

  await c.env.KV.put(`contents:${contentId}`, JSON.stringify(content));

  return c.json({ success: true, data: { favorited: !isFaved, favoriteCount: content.favoriteCount } });
});

// --- Comments ---
social.get('/contents/:id/comments', optionalAuth(), async (c) => {
  const contentId = c.req.param('id')!;
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '20');

  const commentsJson = await c.env.KV.get(`contents:${contentId}:comments`);
  const allComments: Comment[] = commentsJson ? JSON.parse(commentsJson) : [];

  const start = (page - 1) * limit;
  const pageComments = allComments.slice(start, start + limit);

  // Enrich with user data
  const enriched = [];
  for (const comment of pageComments) {
    const user = await getUserById(c.env.KV, comment.userId);
    enriched.push({
      ...comment,
      user: user ? toUserSummary(user) : fallbackSummary(comment.userId),
    });
  }

  return c.json({
    success: true,
    data: { items: enriched, total: allComments.length, page, limit, hasMore: start + limit < allComments.length },
  });
});

social.post('/contents/:id/comments', authMiddleware, async (c) => {
  const userId = c.get('userId' as never) as string;
  const contentId = c.req.param('id')!;
  const { text } = await c.req.json<{ text: string }>();

  if (!text?.trim()) return c.json({ success: false, error: 'Text required' }, 400);

  const comment: Comment = {
    id: `cmt_${crypto.randomUUID().slice(0, 8)}`,
    contentId,
    userId,
    text: text.trim(),
    createdAt: new Date().toISOString(),
  };

  const commentsJson = await c.env.KV.get(`contents:${contentId}:comments`);
  const comments: Comment[] = commentsJson ? JSON.parse(commentsJson) : [];
  comments.unshift(comment);
  await c.env.KV.put(`contents:${contentId}:comments`, JSON.stringify(comments));

  const contentData = await c.env.KV.get(`contents:${contentId}`);
  if (contentData) {
    const content: Content = JSON.parse(contentData);
    content.commentCount++;
    await c.env.KV.put(`contents:${contentId}`, JSON.stringify(content));
  }

  const user = await getUserById(c.env.KV, userId);

  return c.json({
    success: true,
    data: {
      ...comment,
      user: user ? toUserSummary(user) : fallbackSummary(userId),
    },
  }, 201);
});

// --- Follow ---
social.post('/users/:id/follow', authMiddleware, async (c) => {
  const userId = c.get('userId' as never) as string;
  const targetId = c.req.param('id')!;

  if (userId === targetId) return c.json({ success: false, error: 'Cannot follow yourself' }, 400);

  const followingJson = await c.env.KV.get(`users:${userId}:following`);
  const following: string[] = followingJson ? JSON.parse(followingJson) : [];

  const isFollowing = following.includes(targetId);
  if (isFollowing) {
    const updated = following.filter((id) => id !== targetId);
    await c.env.KV.put(`users:${userId}:following`, JSON.stringify(updated));

    const followersJson = await c.env.KV.get(`users:${targetId}:followers`);
    const followers: string[] = followersJson ? JSON.parse(followersJson) : [];
    await c.env.KV.put(`users:${targetId}:followers`, JSON.stringify(followers.filter((id) => id !== userId)));

    // Update counts
    const myData = await c.env.KV.get(`users:${userId}`);
    if (myData) { const u: User = JSON.parse(myData); u.followingCount = Math.max(0, u.followingCount - 1); await c.env.KV.put(`users:${userId}`, JSON.stringify(u)); }
    const targetData = await c.env.KV.get(`users:${targetId}`);
    if (targetData) { const u: User = JSON.parse(targetData); u.followersCount = Math.max(0, u.followersCount - 1); await c.env.KV.put(`users:${targetId}`, JSON.stringify(u)); }
  } else {
    following.unshift(targetId);
    await c.env.KV.put(`users:${userId}:following`, JSON.stringify(following));

    const followersJson = await c.env.KV.get(`users:${targetId}:followers`);
    const followers: string[] = followersJson ? JSON.parse(followersJson) : [];
    followers.unshift(userId);
    await c.env.KV.put(`users:${targetId}:followers`, JSON.stringify(followers));

    const myData = await c.env.KV.get(`users:${userId}`);
    if (myData) { const u: User = JSON.parse(myData); u.followingCount++; await c.env.KV.put(`users:${userId}`, JSON.stringify(u)); }
    const targetData = await c.env.KV.get(`users:${targetId}`);
    if (targetData) { const u: User = JSON.parse(targetData); u.followersCount++; await c.env.KV.put(`users:${targetId}`, JSON.stringify(u)); }
  }

  return c.json({ success: true, data: { following: !isFollowing } });
});

social.get('/users/:id/following', optionalAuth(), async (c) => {
  const id = c.req.param('id')!;
  const listJson = await c.env.KV.get(`users:${id}:following`);
  const ids: string[] = listJson ? JSON.parse(listJson) : [];

  const items = [];
  for (const uid of ids) {
    const u = await getUserById(c.env.KV, uid);
    if (u) items.push(toUserSummary(u));
  }

  return c.json({ success: true, data: { items } });
});

social.get('/users/:id/followers', optionalAuth(), async (c) => {
  const id = c.req.param('id')!;
  const listJson = await c.env.KV.get(`users:${id}:followers`);
  const ids: string[] = listJson ? JSON.parse(listJson) : [];

  const items = [];
  for (const uid of ids) {
    const u = await getUserById(c.env.KV, uid);
    if (u) items.push(toUserSummary(u));
  }

  return c.json({ success: true, data: { items } });
});

export default social;
