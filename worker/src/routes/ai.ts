import { Hono } from 'hono';
import type { Env } from '../types';
import { authMiddleware } from '../middleware/auth';
import { generateContent, generateContentStream } from '../services/ai';
import { matchTemplate, CONTENT_TEMPLATES } from '../services/templates';

const ai = new Hono<{ Bindings: Env }>();

ai.post('/generate', authMiddleware, async (c) => {
  const { prompt, existingCode } = await c.req.json<{
    prompt: string;
    existingCode?: string;
  }>();

  if (!prompt?.trim()) {
    return c.json({ success: false, error: 'Prompt required' }, 400);
  }

  const stream = generateContentStream(prompt, existingCode || null, c.env);

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

  const stream = generateContentStream(prompt, original.code, c.env);

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
