/**
 * 极简 HTML 标签闭合校验。仅用于编辑器保存前的基础提示，不替代严格解析器。
 */
const VOID_TAGS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr',
]);

export function validateHtml(html: string): { errors: number } {
  // 去除 script/style 内容避免误判
  const cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '');
  const tagRe = /<\/?([a-zA-Z][a-zA-Z0-9-]*)(\s[^>]*)?\s*(\/)?>/g;
  const stack: string[] = [];
  let errors = 0;
  let m: RegExpExecArray | null;
  while ((m = tagRe.exec(cleaned))) {
    const raw = m[0];
    const tag = m[1].toLowerCase();
    if (raw.startsWith('</')) {
      if (stack.pop() !== tag) errors++;
    } else if (!m[3] && !VOID_TAGS.has(tag)) {
      stack.push(tag);
    }
  }
  errors += stack.length;
  return { errors };
}
