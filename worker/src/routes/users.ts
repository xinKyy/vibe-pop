import { Hono } from 'hono';
import type { Env, User, Content } from '../types';
import { authMiddleware, optionalAuth } from '../middleware/auth';

const users = new Hono<{ Bindings: Env }>();

users.get('/me', authMiddleware, async (c) => {
  const userId = c.get('userId' as never) as string;
  const data = await c.env.KV.get(`users:${userId}`);
  if (!data) return c.json({ success: false, error: 'User not found' }, 404);

  return c.json({ success: true, data: JSON.parse(data) });
});

users.put('/me', authMiddleware, async (c) => {
  const userId = c.get('userId' as never) as string;
  const data = await c.env.KV.get(`users:${userId}`);
  if (!data) return c.json({ success: false, error: 'User not found' }, 404);

  const user: User = JSON.parse(data);
  const updates = await c.req.json<Partial<Pick<User, 'username' | 'handle' | 'avatar' | 'bio'>>>();

  const updated = { ...user, ...updates };
  await c.env.KV.put(`users:${userId}`, JSON.stringify(updated));

  return c.json({ success: true, data: updated });
});

users.get('/:id', optionalAuth(), async (c) => {
  const id = c.req.param('id')!;
  const data = await c.env.KV.get(`users:${id}`);
  if (!data) return c.json({ success: false, error: 'User not found' }, 404);

  return c.json({ success: true, data: JSON.parse(data) });
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
