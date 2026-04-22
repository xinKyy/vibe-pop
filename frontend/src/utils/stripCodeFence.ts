/**
 * 剥离 AI 输出里可能残留的 Markdown 代码围栏（code fence）。
 *
 * 情况：
 * 1. 成对：```html\n...\n``` → 取内部
 * 2. 只有起始没结束（流式未完成 / max_tokens 截断）：剥掉起始即可
 * 3. 只有结束没有起始：剥掉末尾
 * 4. 没有围栏：原样返回
 *
 * 说明：对流式过程中每一次累积文本都调用是安全的，因为在"只有开头还没发到结尾"的
 * 中间阶段也会把开头的 ```html 剥掉。
 */
export function stripCodeFence(raw: string): string {
  if (!raw) return '';
  let code = raw.trim();
  if (!code.startsWith('```') && !code.endsWith('```')) return code;

  const paired = code.match(/^```(?:[a-zA-Z0-9_-]+)?\s*\n([\s\S]*?)\n```\s*$/);
  if (paired) return paired[1].trim();

  code = code.replace(/^```(?:[a-zA-Z0-9_-]+)?[ \t]*\r?\n?/, '');
  code = code.replace(/\r?\n?```\s*$/, '');
  return code.trim();
}
