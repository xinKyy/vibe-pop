import type { User, UserSummary } from '../types';

/** 保留字 username，禁止被用户占用 */
const RESERVED_USERNAMES = new Set([
  'admin', 'root', 'support', 'help', 'vibepop', 'official',
  'anon', 'anonymous', 'me', 'you', 'system', 'staff', 'null', 'undefined',
]);

/** username 合法字符：小写字母、数字、下划线，3~20 位 */
const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

export function isValidUsername(name: string): boolean {
  return USERNAME_RE.test(name) && !RESERVED_USERNAMES.has(name);
}

/** 从 email 生成一个可用的 username 基底 */
function baseUsernameFromEmail(email: string): string {
  const local = (email.split('@')[0] || '').toLowerCase();
  const cleaned = local.replace(/[^a-z0-9_]/g, '').slice(0, 16);
  if (cleaned.length >= 3) return cleaned;
  // 太短，补随机字符
  return (cleaned + 'user' + Math.random().toString(36).slice(2, 6)).slice(0, 16);
}

/**
 * 为一个 email 生成唯一且合法的 username。冲突时追加数字后缀。
 * 不会写入索引；由调用方统一处理。
 */
export async function generateUniqueUsername(kv: KVNamespace, email: string): Promise<string> {
  let base = baseUsernameFromEmail(email);
  if (RESERVED_USERNAMES.has(base)) base = base + '1';

  let candidate = base;
  let i = 1;
  while (await kv.get(`users:username:${candidate}`)) {
    i += 1;
    candidate = `${base}${i}`.slice(0, 20);
    if (i > 9999) {
      candidate = `${base.slice(0, 10)}${crypto.randomUUID().slice(0, 6)}`;
      break;
    }
  }
  return candidate;
}

/**
 * 读取用户，并在需要时自动把旧结构迁移到新结构。
 * 旧结构：{ username: 显示名, handle: 英文@句柄 }
 * 新结构：{ username: 英文@句柄, displayName: 显示名 }
 */
export async function getUserById(kv: KVNamespace, userId: string): Promise<User | null> {
  const raw = await kv.get(`users:${userId}`);
  if (!raw) return null;
  const parsed = JSON.parse(raw) as Partial<User> & { handle?: string };

  // 旧结构的唯一标志：带 `handle` 字段。没有 handle 就当作新结构。
  // 注意：新注册用户在未完成 onboarding 时 displayName 可能为 ''，不能用 displayName 真假来判定结构。
  if (!('handle' in parsed) && typeof parsed.username === 'string' && parsed.username) {
    // 已是新结构；兼容没有 onboarded 字段的老数据（迁移前留下的），默认视为已完成引导。
    if (typeof parsed.onboarded !== 'boolean') {
      const patched: User = {
        id: parsed.id!,
        email: parsed.email!,
        username: parsed.username,
        displayName: parsed.displayName ?? '',
        avatar: parsed.avatar || '😀',
        bio: parsed.bio || '',
        followingCount: parsed.followingCount || 0,
        followersCount: parsed.followersCount || 0,
        createdAt: parsed.createdAt || new Date().toISOString(),
        onboarded: true,
      };
      await kv.put(`users:${userId}`, JSON.stringify(patched));
      return patched;
    }
    return parsed as User;
  }

  // 迁移旧结构：把旧 handle 作为新 username；旧 username 作为 displayName。
  const oldHandle = (parsed as { handle?: string }).handle;
  const oldUsername = parsed.username;
  const migrated: User = {
    id: parsed.id!,
    email: parsed.email!,
    username: (oldHandle && isValidUsername(oldHandle) ? oldHandle : await generateUniqueUsername(kv, parsed.email || '')),
    displayName: oldUsername || oldHandle || '用户',
    avatar: parsed.avatar || '😀',
    bio: parsed.bio || '',
    followingCount: parsed.followingCount || 0,
    followersCount: parsed.followersCount || 0,
    createdAt: parsed.createdAt || new Date().toISOString(),
    onboarded: true,
  };

  await kv.put(`users:${userId}`, JSON.stringify(migrated));
  await kv.put(`users:username:${migrated.username}`, userId);
  return migrated;
}

export function toUserSummary(user: User): UserSummary {
  return { id: user.id, username: user.username, displayName: user.displayName, avatar: user.avatar };
}

export function fallbackSummary(userId: string): UserSummary {
  return { id: userId, username: 'anon', displayName: '匿名', avatar: '👤' };
}
