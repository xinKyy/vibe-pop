import { Hono } from 'hono';
import type { Env, User, Content } from '../types';
import { authMiddleware, optionalAuth } from '../middleware/auth';
import { getUserById } from '../services/users';

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
    if (name.length < 1 || name.length > 20) {
      return c.json({ success: false, error: '显示名长度需在 1~20 之间' }, 400);
    }
    updates.displayName = name;
  }
  if (typeof body.avatar === 'string') updates.avatar = body.avatar.slice(0, 8);
  if (typeof body.bio === 'string') updates.bio = body.bio.slice(0, 140);

  const updated: User = { ...user, ...updates };
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
