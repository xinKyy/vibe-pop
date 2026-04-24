import { Hono } from 'hono';
import type { Env } from '../types';
import { authMiddleware } from '../middleware/auth';
import { generateContent, generateContentStream, type AssetBrief } from '../services/ai';
import { matchTemplate, CONTENT_TEMPLATES } from '../services/templates';

const ai = new Hono<{ Bindings: Env }>();

// 仅接受已知字段，过滤掉 blobUrl 之类的无关字段，最多 32 项避免滥用
function sanitizeAssets(raw: unknown): AssetBrief[] | null {
  if (!Array.isArray(raw)) return null;
  const out: AssetBrief[] = [];
  for (const item of raw.slice(0, 32)) {
    if (!item || typeof item !== 'object') continue;
    const name = typeof (item as any).name === 'string' ? (item as any).name.slice(0, 200) : '';
    const kindRaw = (item as any).kind;
    const kind = (['image', 'audio', 'video', 'other'] as const).includes(kindRaw) ? kindRaw : 'other';
    const mime = typeof (item as any).mime === 'string' ? (item as any).mime.slice(0, 100) : undefined;
    if (!name) continue;
    out.push({ name, kind, mime });
  }
  return out.length ? out : null;
}

ai.post('/generate', authMiddleware, async (c) => {
  const body = await c.req.json<{
    prompt: string;
    existingCode?: string;
    assets?: unknown;
  }>();
  const { prompt, existingCode } = body;

  if (!prompt?.trim()) {
    return c.json({ success: false, error: 'Prompt required' }, 400);
  }

  const assets = sanitizeAssets(body.assets);
  const stream = generateContentStream(prompt, existingCode || null, c.env, assets);

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
      'Access-Control-Allow-Origin': '*',
    },
  });
});

ai.post('/remix', authMiddleware, async (c) => {
  const body = await c.req.json<{
    contentId: string;
    prompt: string;
    assets?: unknown;
  }>();
  const { contentId, prompt } = body;

  if (!contentId || !prompt?.trim()) {
    return c.json({ success: false, error: 'Content ID and prompt required' }, 400);
  }

  const contentData = await c.env.KV.get(`contents:${contentId}`);
  if (!contentData) {
    return c.json({ success: false, error: 'Original content not found' }, 404);
  }

  const original = JSON.parse(contentData);
  const assets = sanitizeAssets(body.assets);

  const stream = generateContentStream(prompt, original.code, c.env, assets);

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
      'Access-Control-Allow-Origin': '*',
    },
  });
});

export default ai;
