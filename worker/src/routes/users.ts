import { Hono } from 'hono';
import type { Env, User, Content } from '../types';
import { authMiddleware, optionalAuth } from '../middleware/auth';
import { getUserById, isValidUsername } from '../services/users';

const users = new Hono<{ Bindings: Env }>();

users.get('/me', authMiddleware, async (c) => {
  const userId = c.get('userId' as never) as string;
  const user = await getUserById(c.env.KV, userId);
  if (!user) return c.json({ success: false, error: 'User not found' }, 404);
  return c.json({ success: true, data: user });
});

users.put('/me', authMiddleware, async (c) => {
  const userId = c.get('userId' as never) as string;
  const user = await getUserById(c.env.KV, userId);
  if (!user) return c.json({ success: false, error: 'User not found' }, 404);

  const body = await c.req.json<Partial<Pick<User, 'displayName' | 'avatar' | 'bio'>> & { username?: string }>();

  // username 不可修改：若传入且与当前不同，拒绝。
  if (typeof body.username === 'string' && body.username !== user.username) {
    return c.json({ success: false, error: 'username 不可修改' }, 400);
  }

  const updates: Partial<User> = {};
  if (typeof body.displayName === 'string') {
    const name = body.displayName.trim();
    // 禁止把字面量 "undefined" / "null" 作为显示名保存，这是前端历史脏数据来源。
    if (name.length < 1 || name.length > 20 || name === 'undefined' || name === 'null') {
      return c.json({ success: false, error: '显示名长度需在 1~20 之间' }, 400);
    }
    updates.displayName = name;
  }
  if (typeof body.avatar === 'string') {
    const av = body.avatar.trim();
    if (av && av !== 'undefined' && av !== 'null') {
      updates.avatar = av.slice(0, 8);
    }
  }
  if (typeof body.bio === 'string') {
    const bioText = body.bio === 'undefined' || body.bio === 'null' ? '' : body.bio;
    updates.bio = bioText.slice(0, 140);
  }

  const updated: User = { ...user, ...updates };
  await c.env.KV.put(`users:${userId}`, JSON.stringify(updated));

  return c.json({ success: true, data: updated });
});

/**
 * 新用户引导：一次性设置最终 username + displayName（可选 avatar）。
 * 仅允许 onboarded === false 的用户调用，成功后会把旧 placeholder username 索引迁移到新 username。
 */
users.post('/me/onboarding', authMiddleware, async (c) => {
  const userId = c.get('userId' as never) as string;
  const user = await getUserById(c.env.KV, userId);
  if (!user) return c.json({ success: false, error: 'User not found' }, 404);

  if (user.onboarded) {
    return c.json({ success: false, error: 'ONBOARDING_ALREADY_DONE' }, 409);
  }

  const body = await c.req.json<{ username?: string; displayName?: string; avatar?: string }>();
  const username = (body.username || '').trim().toLowerCase();
  const displayName = (body.displayName || '').trim();

  if (!isValidUsername(username)) {
    return c.json({ success: false, error: 'INVALID_USERNAME' }, 400);
  }
  if (displayName.length < 1 || displayName.length > 20) {
    return c.json({ success: false, error: 'INVALID_DISPLAY_NAME' }, 400);
  }

  // 允许用户保留占位 username（它等于 userId），其它情况需要检查冲突。
  if (username !== user.username) {
    const taken = await c.env.KV.get(`users:username:${username}`);
    if (taken && taken !== userId) {
      return c.json({ success: false, error: 'USERNAME_TAKEN' }, 409);
    }
  }

  // 迁移 username 索引：删旧写新。
  if (username !== user.username) {
    await c.env.KV.delete(`users:username:${user.username}`);
    await c.env.KV.put(`users:username:${username}`, userId);
  }

  const updated: User = {
    ...user,
    username,
    displayName,
    avatar: typeof body.avatar === 'string' && body.avatar ? body.avatar.slice(0, 8) : user.avatar,
    onboarded: true,
  };
  await c.env.KV.put(`users:${userId}`, JSON.stringify(updated));

  return c.json({ success: true, data: updated });
});

users.get('/:id', optionalAuth(), async (c) => {
  const id = c.req.param('id')!;
  const user = await getUserById(c.env.KV, id);
  if (!user) return c.json({ success: false, error: 'User not found' }, 404);
  return c.json({ success: true, data: user });
});

users.get('/:id/contents', optionalAuth(), async (c) => {
  const id = c.req.param('id')!;
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '20');

  const listJson = await c.env.KV.get(`users:${id}:contents`);
  const allIds: string[] = listJson ? JSON.parse(listJson) : [];

  const start = (page - 1) * limit;
  const pageIds = allIds.slice(start, start + limit);

  const items: Content[] = [];
  for (const cid of pageIds) {
    const data = await c.env.KV.get(`contents:${cid}`);
    if (data) {
      const content: Content = JSON.parse(data);
      if (content.status === 'published') items.push(content);
    }
  }

  return c.json({
    success: true,
    data: { items, total: allIds.length, page, limit, hasMore: start + limit < allIds.length },
  });
});

export default users;
