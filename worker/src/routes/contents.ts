import { Hono } from 'hono';
import type { Env, Content } from '../types';
import { authMiddleware, optionalAuth } from '../middleware/auth';

const contents = new Hono<{ Bindings: Env }>();

function generateId(): string {
  return `cnt_${crypto.randomUUID().slice(0, 8)}`;
}

contents.get('/', optionalAuth(), async (c) => {
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '20');
  const type = c.req.query('type');

  const listJson = await c.env.KV.get('contents:list');
  const allIds: string[] = listJson ? JSON.parse(listJson) : [];

  let filteredIds = allIds;
  if (type) {
    const catJson = await c.env.KV.get(`contents:category:${type}`);
    filteredIds = catJson ? JSON.parse(catJson) : [];
  }

  const start = (page - 1) * limit;
  const pageIds = filteredIds.slice(start, start + limit);

  const items: Content[] = [];
  for (const id of pageIds) {
    const data = await c.env.KV.get(`contents:${id}`);
    if (data) items.push(JSON.parse(data));
  }

  return c.json({
    success: true,
    data: { items, total: filteredIds.length, page, limit, hasMore: start + limit < filteredIds.length },
  });
});

contents.get('/feed', optionalAuth(), async (c) => {
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '10');

  const listJson = await c.env.KV.get('contents:list');
  const allIds: string[] = listJson ? JSON.parse(listJson) : [];

  const start = (page - 1) * limit;
  const pageIds = allIds.slice(start, start + limit);

  const items: Content[] = [];
  for (const id of pageIds) {
    const data = await c.env.KV.get(`contents:${id}`);
    if (data) items.push(JSON.parse(data));
  }

  return c.json({
    success: true,
    data: { items, total: allIds.length, page, limit, hasMore: start + limit < allIds.length },
  });
});

contents.get('/:id', optionalAuth(), async (c) => {
  const id = c.req.param('id')!;
  const data = await c.env.KV.get(`contents:${id}`);
  if (!data) return c.json({ success: false, error: 'Not found' }, 404);

  const content: Content = JSON.parse(data);
  content.playCount++;
  await c.env.KV.put(`contents:${id}`, JSON.stringify(content));

  return c.json({ success: true, data: content });
});

contents.post('/', authMiddleware, async (c) => {
  const userId = c.get('userId' as never) as string;
  const body = await c.req.json<{
    title?: string;
    description?: string;
    type?: string;
    code?: string;
    prompt?: string;
    auto_publish?: boolean;
  }>();

  const id = generateId();
  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  ];
  const emojis = ['🎮', '📸', '🎨', '⏰', '🎯', '🎂'];

  const content: Content = {
    id,
    title: body.title || '未命名作品',
    description: body.description || '',
    type: (body.type as Content['type']) || 'other',
    code: body.code || `<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:72px">${emojis[Math.floor(Math.random() * emojis.length)]}</div>`,
    coverUrl: '',
    coverEmoji: emojis[Math.floor(Math.random() * emojis.length)],
    coverGradient: gradients[Math.floor(Math.random() * gradients.length)],
    tags: [],
    authorId: userId,
    status: body.auto_publish ? 'published' : 'draft',
    playCount: 0,
    likeCount: 0,
    favoriteCount: 0,
    commentCount: 0,
    remixCount: 0,
    createdAt: new Date().toISOString(),
    publishedAt: body.auto_publish ? new Date().toISOString() : undefined,
  };

  await c.env.KV.put(`contents:${id}`, JSON.stringify(content));

  // Add to user's content list
  const userContentsJson = await c.env.KV.get(`users:${userId}:contents`);
  const userContents: string[] = userContentsJson ? JSON.parse(userContentsJson) : [];
  userContents.unshift(id);
  await c.env.KV.put(`users:${userId}:contents`, JSON.stringify(userContents));

  if (content.status === 'published') {
    const listJson = await c.env.KV.get('contents:list');
    const list: string[] = listJson ? JSON.parse(listJson) : [];
    list.unshift(id);
    await c.env.KV.put('contents:list', JSON.stringify(list));

    if (content.type) {
      const catJson = await c.env.KV.get(`contents:category:${content.type}`);
      const catList: string[] = catJson ? JSON.parse(catJson) : [];
      catList.unshift(id);
      await c.env.KV.put(`contents:category:${content.type}`, JSON.stringify(catList));
    }
  }

  return c.json({
    success: true,
    data: {
      content_id: id,
      status: content.status,
      title: content.title,
      code: content.code,
      preview_url: `https://vibepop.app/preview/${id}`,
      publish_url: `https://vibepop.app/c/${id}`,
    },
  }, 201);
});

contents.put('/:id', authMiddleware, async (c) => {
  const userId = c.get('userId' as never) as string;
  const id = c.req.param('id')!;
  const data = await c.env.KV.get(`contents:${id}`);
  if (!data) return c.json({ success: false, error: 'Not found' }, 404);

  const content: Content = JSON.parse(data);
  if (content.authorId !== userId) {
    return c.json({ success: false, error: 'Forbidden' }, 403);
  }

  const updates = await c.req.json<Partial<Content>>();
  const updated = { ...content, ...updates, id, authorId: userId };
  await c.env.KV.put(`contents:${id}`, JSON.stringify(updated));

  return c.json({ success: true, data: updated });
});

contents.delete('/:id', authMiddleware, async (c) => {
  const userId = c.get('userId' as never) as string;
  const id = c.req.param('id')!;
  const data = await c.env.KV.get(`contents:${id}`);
  if (!data) return c.json({ success: false, error: 'Not found' }, 404);

  const content: Content = JSON.parse(data);
  if (content.authorId !== userId) {
    return c.json({ success: false, error: 'Forbidden' }, 403);
  }

  await c.env.KV.delete(`contents:${id}`);

  // Remove from lists
  const listJson = await c.env.KV.get('contents:list');
  if (listJson) {
    const list: string[] = JSON.parse(listJson);
    await c.env.KV.put('contents:list', JSON.stringify(list.filter((i) => i !== id)));
  }

  return c.json({ success: true });
});

contents.post('/:id/publish', authMiddleware, async (c) => {
  const userId = c.get('userId' as never) as string;
  const id = c.req.param('id')!;
  const data = await c.env.KV.get(`contents:${id}`);
  if (!data) return c.json({ success: false, error: 'Not found' }, 404);

  const content: Content = JSON.parse(data);
  if (content.authorId !== userId) {
    return c.json({ success: false, error: 'Forbidden' }, 403);
  }

  const body = await c.req.json<{ title?: string; description?: string; type?: string }>();
  content.status = 'published';
  content.publishedAt = new Date().toISOString();
  if (body.title) content.title = body.title;
  if (body.description) content.description = body.description;
  if (body.type) content.type = body.type as Content['type'];

  await c.env.KV.put(`contents:${id}`, JSON.stringify(content));

  const listJson = await c.env.KV.get('contents:list');
  const list: string[] = listJson ? JSON.parse(listJson) : [];
  if (!list.includes(id)) {
    list.unshift(id);
    await c.env.KV.put('contents:list', JSON.stringify(list));
  }

  return c.json({
    success: true,
    data: { content_id: id, status: 'published', publish_url: `https://vibepop.app/c/${id}` },
  });
});

export default contents;
