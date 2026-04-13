import { CONTENT_TEMPLATES, getTemplateKeys } from './services/templates';
import type { Content, User } from './types';

const seedUsers: User[] = [
  { id: 'u_seed01', email: 'xiaoming@vibepop.app', username: '小明的创意工坊', handle: 'xiaoming', avatar: '🎨', bio: '游戏开发爱好者', followingCount: 12, followersCount: 234, createdAt: '2026-03-01T00:00:00Z' },
  { id: 'u_seed02', email: 'travel@vibepop.app', username: '旅行日记', handle: 'travel', avatar: '✈️', bio: '用脚步丈量世界', followingCount: 89, followersCount: 567, createdAt: '2026-03-05T00:00:00Z' },
  { id: 'u_seed03', email: 'dushe@vibepop.app', username: '毒舌AI', handle: 'dushe', avatar: '🤖', bio: '专业吐槽30年', followingCount: 5, followersCount: 1200, createdAt: '2026-03-10T00:00:00Z' },
  { id: 'u_seed04', email: 'time@vibepop.app', username: '时光机', handle: 'timemachine', avatar: '⏰', bio: '记录每一个瞬间', followingCount: 45, followersCount: 178, createdAt: '2026-03-15T00:00:00Z' },
  { id: 'u_seed05', email: 'card@vibepop.app', username: '贺卡工厂', handle: 'cardmaker', avatar: '🎂', bio: '为每个特别的日子', followingCount: 23, followersCount: 345, createdAt: '2026-03-20T00:00:00Z' },
];

const templateToUser: Record<string, string> = {
  bouncing_ball: 'u_seed01',
  photo_album: 'u_seed02',
  roast_generator: 'u_seed03',
  time_capsule: 'u_seed04',
  dodge_game: 'u_seed01',
  birthday_card: 'u_seed05',
};

const playCounts: Record<string, number> = {
  bouncing_ball: 12500,
  photo_album: 8900,
  roast_generator: 25600,
  time_capsule: 432,
  dodge_game: 3400,
  birthday_card: 1800,
};

export async function seedDatabase(kv: KVNamespace) {
  const existingList = await kv.get('contents:list');
  if (existingList) {
    const ids: string[] = JSON.parse(existingList);
    if (ids.length > 0) return;
  }

  for (const user of seedUsers) {
    await kv.put(`users:${user.id}`, JSON.stringify(user));
    await kv.put(`users:email:${user.email}`, user.id);
  }

  const contentIds: string[] = [];
  const categoryMap: Record<string, string[]> = {};
  const userContents: Record<string, string[]> = {};

  for (const key of getTemplateKeys()) {
    const tmpl = CONTENT_TEMPLATES[key];
    const authorId = templateToUser[key] || 'u_seed01';
    const contentId = `cnt_${key}`;

    const content: Content = {
      id: contentId,
      title: tmpl.title,
      description: tmpl.description,
      type: tmpl.type as Content['type'],
      code: tmpl.code,
      coverUrl: '',
      coverEmoji: tmpl.emoji,
      coverGradient: tmpl.gradient,
      tags: [],
      authorId,
      status: 'published',
      playCount: playCounts[key] || 1000,
      likeCount: Math.floor((playCounts[key] || 1000) * 0.1),
      favoriteCount: Math.floor((playCounts[key] || 1000) * 0.03),
      commentCount: Math.floor(Math.random() * 100),
      remixCount: Math.floor(Math.random() * 30),
      createdAt: new Date(Date.now() - Math.random() * 7 * 86400000).toISOString(),
      publishedAt: new Date(Date.now() - Math.random() * 7 * 86400000).toISOString(),
    };

    await kv.put(`contents:${contentId}`, JSON.stringify(content));
    contentIds.push(contentId);

    if (!categoryMap[tmpl.type]) categoryMap[tmpl.type] = [];
    categoryMap[tmpl.type].push(contentId);

    if (!userContents[authorId]) userContents[authorId] = [];
    userContents[authorId].push(contentId);
  }

  await kv.put('contents:list', JSON.stringify(contentIds));

  for (const [cat, ids] of Object.entries(categoryMap)) {
    await kv.put(`contents:category:${cat}`, JSON.stringify(ids));
  }

  for (const [uid, ids] of Object.entries(userContents)) {
    await kv.put(`users:${uid}:contents`, JSON.stringify(ids));
  }

  await kv.put('templates:featured', JSON.stringify(
    getTemplateKeys().map((key, i) => ({
      id: key,
      contentId: `cnt_${key}`,
      title: CONTENT_TEMPLATES[key].title,
      coverEmoji: CONTENT_TEMPLATES[key].emoji,
      coverGradient: CONTENT_TEMPLATES[key].gradient,
      sortOrder: i,
      isActive: true,
    }))
  ));

  console.log(`Seeded ${contentIds.length} contents, ${seedUsers.length} users`);
}
