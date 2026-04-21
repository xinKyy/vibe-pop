import { PROMPT_TEMPLATES } from './services/templates';
import type { Content } from './types';

/** ContentType schema version；每次调整分类映射都要升；启动时会执行对应迁移 */
const SCHEMA_VERSION = '2';

/** 老分类 → 新分类 映射。修改 ContentType 时在这里登记映射规则。 */
const CATEGORY_MIGRATIONS: Record<string, string> = {
  memory: 'album',
  generator: 'tool',
};

/** 把存量内容按 {@link CATEGORY_MIGRATIONS} 迁移 type，并重建 `contents:category:*` 索引。 */
async function migrateContentCategories(kv: KVNamespace) {
  const listJson = await kv.get('contents:list');
  if (!listJson) return;

  const ids: string[] = JSON.parse(listJson);
  const newCategoryMap: Record<string, string[]> = {};
  const oldCategories = new Set<string>();

  for (const id of ids) {
    const raw = await kv.get(`contents:${id}`);
    if (!raw) continue;
    const content: Content = JSON.parse(raw);
    const oldType = content.type as unknown as string;
    const mapped = CATEGORY_MIGRATIONS[oldType];
    if (mapped) {
      oldCategories.add(oldType);
      content.type = mapped as Content['type'];
      await kv.put(`contents:${id}`, JSON.stringify(content));
    }
    const finalType = content.type as unknown as string;
    (newCategoryMap[finalType] ??= []).push(id);
  }

  for (const oldType of oldCategories) {
    await kv.delete(`contents:category:${oldType}`);
  }
  for (const [cat, catIds] of Object.entries(newCategoryMap)) {
    await kv.put(`contents:category:${cat}`, JSON.stringify(catIds));
  }
}

/**
 * 启动时的必要初始化：只同步 prompt 模板和执行 schema 迁移，不再插入示例用户 / 示例内容。
 */
export async function seedDatabase(kv: KVNamespace) {
  await kv.put('templates:featured', JSON.stringify(PROMPT_TEMPLATES));

  const currentVer = await kv.get('schema:version');
  if (currentVer !== SCHEMA_VERSION) {
    await migrateContentCategories(kv);
    await kv.put('schema:version', SCHEMA_VERSION);
  }
}
