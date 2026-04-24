export interface Asset {
  id: string;
  name: string;
  size: number;
  mime: string;
  /**
   * 资源的可嵌入 URL，**必须是 data: 开头**。
   * 之所以不用 URL.createObjectURL 产生的 blob: URL：
   * - 预览用的 iframe 带 sandbox="allow-scripts"，是 opaque origin，
   *   Chromium 会把父页 origin 创建的 blob: URL 当成跨源资源拒绝加载，
   *   抛 "Not allowed to load local resource"。
   * - 发布后保存进数据库的内容里如果是 blob: URL，tab 关掉就失效。
   * data: URL 不受同源策略约束，也能原样持久化到 KV。
   * 字段名保留 blobUrl 是历史遗留，不影响语义。
   */
  blobUrl: string;
  kind: AssetKind;
}

export type AssetKind = 'image' | 'audio' | 'video' | 'other';

// 所有类型统一 1MB 上限：资源目前以 data: URL 内嵌进 HTML 并持久化到 KV，
// 一张图超过 1MB 就会让发布体积/渲染都变重；真要放大文件需要先接 R2/Images。
const ONE_MB = 1 * 1024 * 1024;
export const ASSET_LIMITS: Record<AssetKind, { max: number; accept: string[] }> = {
  image: { max: ONE_MB, accept: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'] },
  audio: { max: ONE_MB, accept: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3'] },
  video: { max: ONE_MB, accept: ['video/mp4', 'video/webm'] },
  other: { max: ONE_MB, accept: ['application/json', 'text/plain', 'text/csv'] },
};

export function detectKind(mime: string, name: string): AssetKind {
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('audio/')) return 'audio';
  if (mime.startsWith('video/')) return 'video';
  const ext = name.split('.').pop()?.toLowerCase();
  if (ext && ['json', 'txt', 'csv'].includes(ext)) return 'other';
  return 'other';
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

export function dedupeName(name: string, existing: string[]): string {
  if (!existing.includes(name)) return name;
  const dot = name.lastIndexOf('.');
  const base = dot >= 0 ? name.slice(0, dot) : name;
  const ext = dot >= 0 ? name.slice(dot) : '';
  let i = 1;
  while (existing.includes(`${base}_${i}${ext}`)) i++;
  return `${base}_${i}${ext}`;
}

export function assetPath(name: string): string {
  return `./assets/${name}`;
}

/**
 * 把 File/Blob 读成 data: URL。同步接口里 fire-and-forget 用不上，
 * 上传时 await 这个方法得到可嵌入的 URL。
 */
export function readAsDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error || new Error('read failed'));
    reader.readAsDataURL(file);
  });
}

/**
 * 将代码中对 ./assets/xxx 的引用替换为 data: URL，
 * 这样既能在 sandbox iframe 里加载，也能在持久化后被任意 viewer 复用。
 */
export function injectAssets(html: string, assets: Asset[]): string {
  if (!assets.length) return html;
  let out = html;
  for (const a of assets) {
    const p = assetPath(a.name);
    // 使用全局 split/join 避免正则特殊字符问题
    out = out.split(p).join(a.blobUrl);
  }
  return out;
}

/**
 * 反向修复：AI 有时会把某个 blob:.../<uuid> 直接硬编码进代码。
 * 这类 URL 在 sandbox iframe 里会被 Chromium 拒（Not allowed to load local resource），
 * 发布后更是立即失效。匹配到的通通还原成 ./assets/xxx，
 * 后续走 injectAssets 的正常通路（替换成 data: URL）。
 *
 * 注意：因为我们已经不再用 URL.createObjectURL，asset.blobUrl 现在其实是 data: URL，
 * 不会命中 AI 写的 blob: 字符串。所以这里额外按文件名做一次启发式匹配：
 * 如果 AI 写的是 blob:... 但位置恰好是 <img src="blob:..."> 类似的单次出现，
 * 我们无法知道它指向哪张图；保底只做"去掉"的话会更糟，所以只在 URL 完全匹配时做替换。
 */
export function remapBlobUrlsToAssetPaths(html: string, assets: Asset[]): string {
  if (!html || !assets.length) return html;
  let out = html;
  for (const a of assets) {
    if (!a.blobUrl) continue;
    if (!a.blobUrl.startsWith('blob:')) continue;
    out = out.split(a.blobUrl).join(assetPath(a.name));
  }
  return out;
}

/**
 * 检测代码里是否还残留 blob: URL（一定是 AI 自己编的或用户从开发者面板复制的，
 * 因为平台现在不再产出 blob: URL）。返回前 3 个样本用于日志/提示。
 */
export function findForeignBlobUrls(html: string, _assets: Asset[]): string[] {
  if (!html) return [];
  const matches = html.match(/blob:[^"'\s<>`)]+/gi) || [];
  const seen = new Set<string>();
  const result: string[] = [];
  for (const m of matches) {
    if (seen.has(m)) continue;
    seen.add(m);
    result.push(m);
    if (result.length >= 3) break;
  }
  return result;
}
