export interface Asset {
  id: string;
  name: string;
  size: number;
  mime: string;
  blobUrl: string;
  kind: AssetKind;
}

export type AssetKind = 'image' | 'audio' | 'video' | 'other';

export const ASSET_LIMITS: Record<AssetKind, { max: number; accept: string[] }> = {
  image: { max: 5 * 1024 * 1024, accept: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'] },
  audio: { max: 10 * 1024 * 1024, accept: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3'] },
  video: { max: 50 * 1024 * 1024, accept: ['video/mp4', 'video/webm'] },
  other: { max: 1 * 1024 * 1024, accept: ['application/json', 'text/plain', 'text/csv'] },
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
 * 将代码中对 ./assets/xxx 的引用替换为运行时 Blob URL。
 * iframe sandbox 下 blob: 可供 <img>/<audio>/<video> 子资源加载。
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
 * 反向修复：AI 有时会把当前页面的 blob URL 直接硬编码进代码。
 * 这些 URL 在 sandbox=allow-scripts 的 iframe 里是跨 origin 不可访问的，
 * 且页面刷新后立即失效。把能匹配到当前 asset 的 blob URL 还原成 ./assets/xxx，
 * 后续走 injectAssets 正常通路。
 */
export function remapBlobUrlsToAssetPaths(html: string, assets: Asset[]): string {
  if (!html || !assets.length) return html;
  let out = html;
  for (const a of assets) {
    if (!a.blobUrl) continue;
    out = out.split(a.blobUrl).join(assetPath(a.name));
  }
  return out;
}

/**
 * 检测代码里是否还残留任何无法复用的 blob: URL（即不在当前 assets 里的）。
 * 返回前 3 个样本（截断显示用）。
 */
export function findForeignBlobUrls(html: string, assets: Asset[]): string[] {
  if (!html) return [];
  const known = new Set(assets.map((a) => a.blobUrl).filter(Boolean));
  const matches = html.match(/blob:[^"'\s<>`)]+/gi) || [];
  const seen = new Set<string>();
  const result: string[] = [];
  for (const m of matches) {
    if (known.has(m)) continue;
    if (seen.has(m)) continue;
    seen.add(m);
    result.push(m);
    if (result.length >= 3) break;
  }
  return result;
}
