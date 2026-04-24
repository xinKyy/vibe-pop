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

/**
 * 把 pinned 的内容上浮到列表最前。多个置顶按 pinnedAt 倒序（新的置顶更靠前）。
 * 非置顶项保持入参原有顺序。
 */
function hoistPinned<T extends { pinned?: boolean; pinnedAt?: string }>(items: T[]): T[] {
  const pinned = items
    .filter((x) => x.pinned)
    .sort((a, b) => new Date(b.pinnedAt || 0).getTime() - new Date(a.pinnedAt || 0).getTime());
  const rest = items.filter((x) => !x.pinned);
  return [...pinned, ...rest];
}

/** 读取一组 id 的 Content 条目（并发，略过缺失项） */
async function loadContents(kv: KVNamespace, ids: string[]): Promise<Content[]> {
  const results = await Promise.all(
    ids.map(async (id) => {
      const data = await kv.get(`contents:${id}`);
      return data ? (JSON.parse(data) as Content) : null;
    }),
  );
  return results.filter((x): x is Content => x !== null);
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

  // 全量读取内容（小数据量），便于排序 + 置顶上浮
  const all = await loadContents(c.env.KV, filteredIds);

  if (sort === 'hot') {
    // 简单热度：点赞 + 收藏×2 + 播放×0.1 + 评论×1
    const score = (x: Content) =>
      (x.likeCount ?? 0) + (x.favoriteCount ?? 0) * 2 + (x.playCount ?? 0) * 0.1 + (x.commentCount ?? 0);
    all.sort((a, b) => score(b) - score(a));
  } else if (sort === 'latest') {
    // publishedAt 优先，缺失回退 createdAt
    const ts = (x: Content) => new Date(x.publishedAt || x.createdAt || 0).getTime();
    all.sort((a, b) => ts(b) - ts(a));
  }
  // 未指定 sort：保持 filteredIds（= KV list）既有顺序

  const hoisted = hoistPinned(all);

  const total = hoisted.length;
  const start = (page - 1) * limit;
  const pageItems = hoisted.slice(start, start + limit);
  const items = await Promise.all(pageItems.map((x) => enrichContent(x, c.env.KV)));

  return c.json({
    success: true,
    data: { items, total, page, limit, hasMore: start + limit < total },
  });
});

contents.get('/feed', optionalAuth(), async (c) => {
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '10');

  const listJson = await c.env.KV.get('contents:list');
  const allIds: string[] = listJson ? JSON.parse(listJson) : [];

  const all = await loadContents(c.env.KV, allIds);
  const hoisted = hoistPinned(all);

  const total = hoisted.length;
  const start = (page - 1) * limit;
  const pageItems = hoisted.slice(start, start + limit);
  const items = await Promise.all(pageItems.map((x) => enrichContent(x, c.env.KV)));

  return c.json({
    success: true,
    data: { items, total, page, limit, hasMore: start + limit < total },
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
