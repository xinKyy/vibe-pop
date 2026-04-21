import { Hono } from 'hono';
import type { Env, User } from '../types';
import { signJWT } from '../middleware/auth';
import { getUserById } from '../services/users';

const auth = new Hono<{ Bindings: Env }>();

interface GoogleTokenInfo {
  iss: string;
  aud: string;
  azp?: string;
  sub: string;
  email?: string;
  email_verified?: string | boolean;
  name?: string;
  picture?: string;
  exp: string | number;
}

async function verifyGoogleIdToken(idToken: string, expectedClientId: string): Promise<GoogleTokenInfo | null> {
  try {
    const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
    if (!res.ok) {
      console.error('[Google] tokeninfo error', res.status);
      return null;
    }
    const info = (await res.json()) as GoogleTokenInfo;

    if (info.aud !== expectedClientId) {
      console.error('[Google] aud mismatch', info.aud, '!=', expectedClientId);
      return null;
    }

    const iss = info.iss;
    if (iss !== 'https://accounts.google.com' && iss !== 'accounts.google.com') {
      console.error('[Google] unexpected iss', iss);
      return null;
    }

    const exp = typeof info.exp === 'string' ? parseInt(info.exp, 10) : info.exp;
    if (!exp || exp < Math.floor(Date.now() / 1000)) {
      console.error('[Google] token expired');
      return null;
    }

    const emailVerified = info.email_verified === true || info.email_verified === 'true';
    if (!emailVerified) {
      console.error('[Google] email not verified');
      return null;
    }

    return info;
  } catch (err: any) {
    console.error('[Google] verify error', err?.message || err);
    return null;
  }
}

auth.post('/google', async (c) => {
  const clientId = c.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return c.json({ success: false, error: 'Google login not configured on server' }, 500);
  }

  const { idToken } = await c.req.json<{ idToken: string }>().catch(() => ({ idToken: '' }));
  if (!idToken) {
    return c.json({ success: false, error: 'idToken required' }, 400);
  }

  const info = await verifyGoogleIdToken(idToken, clientId);
  if (!info || !info.sub || !info.email) {
    return c.json({ success: false, error: 'Invalid Google token' }, 401);
  }

  const googleId = info.sub;
  const email = info.email;

  // 1) 已绑定过 googleId → 直接登录
  let userId = await c.env.KV.get(`users:google:${googleId}`);

  // 2) 首次 Google 登录：尝试按 email 合并到老账号
  if (!userId) {
    const byEmail = await c.env.KV.get(`users:email:${email}`);
    if (byEmail) {
      userId = byEmail;
      const existing = await getUserById(c.env.KV, userId);
      if (existing && !existing.googleId) {
        const merged: User = { ...existing, googleId };
        await c.env.KV.put(`users:${userId}`, JSON.stringify(merged));
      }
      await c.env.KV.put(`users:google:${googleId}`, userId);
    }
  }

  let user: User;
  let isNewUser = false;

  if (!userId) {
    // 3) 全新用户
    userId = `u_${crypto.randomUUID().slice(0, 8)}`;
    const placeholderUsername = userId;
    user = {
      id: userId,
      email,
      googleId,
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
    await c.env.KV.put(`users:google:${googleId}`, userId);
    isNewUser = true;
  } else {
    const loaded = await getUserById(c.env.KV, userId);
    if (!loaded) return c.json({ success: false, error: 'User not found' }, 500);
    user = loaded;

    // 自愈：早期"未完成引导"的占位账号被错标 onboarded=true 的情况
    if (user.onboarded && !user.displayName && user.username === user.id) {
      user = { ...user, onboarded: false };
      await c.env.KV.put(`users:${userId}`, JSON.stringify(user));
    }

    isNewUser = !user.onboarded;
  }

  const token = await signJWT({ sub: userId, email }, c.env.JWT_SECRET);

  return c.json({ success: true, data: { user, token, isNewUser } });
});

export default auth;
