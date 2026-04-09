import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Env } from './types';
import authRoutes from './routes/auth';
import contentRoutes from './routes/contents';
import userRoutes from './routes/users';
import socialRoutes from './routes/social';
import aiRoutes from './routes/ai';

const app = new Hono<{ Bindings: Env }>();

app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

app.route('/api/auth', authRoutes);
app.route('/api/contents', contentRoutes);
app.route('/api/users', userRoutes);
app.route('/api', socialRoutes);
app.route('/api/ai', aiRoutes);

// Open API v1 (reuses content routes with API key auth)
app.route('/api/v1/contents', contentRoutes);

app.get('/api/health', (c) => c.json({ status: 'ok', version: '1.0.0' }));

app.notFound((c) => c.json({ success: false, error: 'Not found' }, 404));

app.onError((err, c) => {
  console.error('Server error:', err);
  return c.json({ success: false, error: 'Internal server error' }, 500);
});

export default app;
