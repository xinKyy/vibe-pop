import { Hono } from 'hono';
import type { Env, Content, UserSummary } from '../types';
import { authMiddleware, optionalAuth } from '../middleware/auth';
import { getUserById, toUserSummary, fallbackSummary } from '../services/users';

const contents = new Hono<{ Bindings: Env }>();

function generateId(): string {
  return `cnt_${crypto.randomUUID().slice(0, 8)}`;
}

async function enrichContent(content: Content, kv: KVNamespace): Promise<Content & { author: UserSummary }> {
  const user = await getUserById(kv, content.authorId);
  return {
    ...content,
    author: user ? toUserSummary(user) : fallbackSummary(content.authorId),
  };
}

contents.get('/', optionalAuth(), async (c) => {
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '20');
  const type = c.req.query('type');
  const sort = c.req.query('sort'); // 'hot' | 'latest' | undefined（默认按 KV list 顺序，相当于最新）

  const listJson = await c.env.KV.get('contents:list');
  const allIds: string[] = listJson ? JSON.parse(listJson) : [];

  let filteredIds = allIds;
  if (type) {
    const catJson = await c.env.KV.get(`contents:category:${type}`);
    filteredIds = catJson ? JSON.parse(catJson) : [];
  }

  // 需要排序时先把候选集全部读出来（小数据量内存排序）
  if (sort === 'hot' || sort === 'latest') {
    const all: Content[] = [];
    for (const id of filteredIds) {
      const data = await c.env.KV.get(`contents:${id}`);
      if (data) all.push(JSON.parse(data));
    }

    if (sort === 'hot') {
      // 简单热度：点赞 + 收藏×2 + 播放×0.1 + 评论×1
      const score = (x: Content) =>
        (x.likeCount ?? 0) + (x.favoriteCount ?? 0) * 2 + (x.playCount ?? 0) * 0.1 + (x.commentCount ?? 0);
      all.sort((a, b) => score(b) - score(a));
    } else {
      // latest：publishedAt 优先，缺失回退 createdAt
      const ts = (x: Content) => new Date(x.publishedAt || x.createdAt || 0).getTime();
      all.sort((a, b) => ts(b) - ts(a));
    }

    const total = all.length;
    const start = (page - 1) * limit;
    const pageItems = all.slice(start, start + limit);
    const items = [];
    for (const content of pageItems) {
      items.push(await enrichContent(content, c.env.KV));
    }
    return c.json({
      success: true,
      data: { items, total, page, limit, hasMore: start + limit < total },
    });
  }

  const start = (page - 1) * limit;
  const pageIds = filteredIds.slice(start, start + limit);

  const items = [];
  for (const id of pageIds) {
    const data = await c.env.KV.get(`contents:${id}`);
    if (data) items.push(await enrichContent(JSON.parse(data), c.env.KV));
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

  const items = [];
  for (const id of pageIds) {
    const data = await c.env.KV.get(`contents:${id}`);
    if (data) items.push(await enrichContent(JSON.parse(data), c.env.KV));
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

  return c.json({ success: true, data: await enrichContent(content, c.env.KV) });
});

contents.post('/', authMiddleware, async (c) => {
  const userId = c.get('userId' as never) as string;
  const body = await c.req.json<{
    title?: string;
    description?: string;
    type?: string;
    code?: string;
    coverEmoji?: string;
    coverGradient?: string;
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
    code: body.code || '',
    coverUrl: '',
    coverEmoji: body.coverEmoji || emojis[Math.floor(Math.random() * emojis.length)],
    coverGradient: body.coverGradient || gradients[Math.floor(Math.random() * gradients.length)],
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

  const userContentsJson = await c.env.KV.get(`users:${userId}:contents`);
  const userContents: string[] = userContentsJson ? JSON.parse(userContentsJson) : [];
  userContents.unshift(id);
  await c.env.KV.put(`users:${userId}:contents`, JSON.stringify(userContents));

  if (content.status === 'published') {
    await addToList(c.env.KV, 'contents:list', id);
    if (content.type) {
      await addToList(c.env.KV, `contents:category:${content.type}`, id);
    }
  }

  return c.json({
    success: true,
    data: {
      content_id: id,
      status: content.status,
      title: content.title,
      code: content.code,
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
  await addToList(c.env.KV, 'contents:list', id);

  return c.json({
    success: true,
    data: { content_id: id, status: 'published' },
  });
});

async function addToList(kv: KVNamespace, key: string, id: string) {
  const json = await kv.get(key);
  const list: string[] = json ? JSON.parse(json) : [];
  if (!list.includes(id)) {
    list.unshift(id);
    await kv.put(key, JSON.stringify(list));
  }
}

export default contents;
