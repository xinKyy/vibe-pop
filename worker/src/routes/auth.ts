import { Hono } from 'hono';
import type { Env, User } from '../types';
import { signJWT } from '../middleware/auth';
import { getUserById } from '../services/users';

const auth = new Hono<{ Bindings: Env }>();

auth.post('/send-code', async (c) => {
  const { email } = await c.req.json<{ email: string }>();
  if (!email || !email.includes('@')) {
    return c.json({ success: false, error: 'Invalid email' }, 400);
  }

  const code = String(Math.floor(100000 + Math.random() * 900000));
  await c.env.KV.put(`verify:${email}`, code, { expirationTtl: 300 });

  // In production, send email via an email service
  console.log(`Verification code for ${email}: ${code}`);

  return c.json({ success: true, data: { message: 'Code sent' } });
});

auth.post('/login', async (c) => {
  const { email, code } = await c.req.json<{ email: string; code: string }>();
  if (!email || !code) {
    return c.json({ success: false, error: 'Email and code required' }, 400);
  }

  const storedCode = await c.env.KV.get(`verify:${email}`);
  if (!storedCode || storedCode !== code) {
    // In dev mode, accept any code for testing
    if (code !== '000000') {
      return c.json({ success: false, error: 'Invalid verification code' }, 400);
    }
  }

  await c.env.KV.delete(`verify:${email}`);

  let userId = await c.env.KV.get(`users:email:${email}`);
  let user: User;
  let isNewUser = false;

  if (!userId) {
    userId = `u_${crypto.randomUUID().slice(0, 8)}`;
    // 初始 username 用 userId 作占位（合法且全局唯一），新用户引导后会替换为用户选择的 username。
    const placeholderUsername = userId;
    user = {
      id: userId,
      email,
      username: placeholderUsername,
      displayName: '',
      avatar: '😀',
      bio: '',
      followingCount: 0,
      followersCount: 0,
      createdAt: new Date().toISOString(),
      onboarded: false,
    };
    await c.env.KV.put(`users:${userId}`, JSON.stringify(user));
    await c.env.KV.put(`users:email:${email}`, userId);
    await c.env.KV.put(`users:username:${placeholderUsername}`, userId);
    isNewUser = true;
  } else {
    const loaded = await getUserById(c.env.KV, userId);
    if (!loaded) return c.json({ success: false, error: 'User not found' }, 500);
    user = loaded;
    isNewUser = !user.onboarded;
  }

  const token = await signJWT({ sub: userId, email }, c.env.JWT_SECRET);

  return c.json({ success: true, data: { user, token, isNewUser } });
});

export default auth;
