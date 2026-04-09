import { Hono } from 'hono';
import type { Env } from '../types';
import { authMiddleware } from '../middleware/auth';
import { generateContent } from '../services/ai';

const ai = new Hono<{ Bindings: Env }>();

ai.post('/generate', authMiddleware, async (c) => {
  const { prompt, existingCode } = await c.req.json<{
    prompt: string;
    existingCode?: string;
  }>();

  if (!prompt?.trim()) {
    return c.json({ success: false, error: 'Prompt required' }, 400);
  }

  const code = await generateContent(prompt, existingCode || null, c.env);

  return c.json({
    success: true,
    data: { code },
  });
});

ai.post('/remix', authMiddleware, async (c) => {
  const { contentId, prompt } = await c.req.json<{
    contentId: string;
    prompt: string;
  }>();

  if (!contentId || !prompt?.trim()) {
    return c.json({ success: false, error: 'Content ID and prompt required' }, 400);
  }

  const contentData = await c.env.KV.get(`contents:${contentId}`);
  if (!contentData) {
    return c.json({ success: false, error: 'Original content not found' }, 404);
  }

  const original = JSON.parse(contentData);
  const code = await generateContent(prompt, original.code, c.env);

  return c.json({
    success: true,
    data: {
      code,
      remixFromId: contentId,
      remixFromTitle: original.title,
      remixFromAuthor: original.authorId,
    },
  });
});

export default ai;
