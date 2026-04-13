import type { Env } from '../types';

const SYSTEM_PROMPT = `你是一位为 VibePop 平台生成可视化内容的 AI 编辑器。用户会输入主题、文案或图片素材，你需要直接输出一个完整的、可运行的单一 HTML 文件（内联样式，无外部 CSS/JS 依赖）。

## 硬性技术约束

### 画布与视口
- 基准画布宽度：375px。
- 所有元素最大宽度不得超过 100vw，禁止出现水平滚动条。
- 内容高度不限，支持垂直滚动，但核心信息在 844px 高度（iPhone 14）内必须可见或具备明确的滚动暗示。

### 响应式规则（Mobile-First）
- 以移动端为默认样式，桌面端使用 @media (min-width: 768px) 做适度放大。
- 布局只用 Flexbox 或 CSS Grid，移动端禁止 float 和多列布局。
- 间距优先使用 rem 和 %，细线/边框可用 px，但容器间距禁用大段固定像素值。
- 任何可点击元素在 375px 下的最小触控区域不得低于 44×44px。

### 代码规范
- 输出必须是单一 HTML 文件，<style> 标签内联在 <head> 中。
- 图片必须自带 width: 100%; height: auto; display: block; object-fit: cover/contain。
- 禁止用绝对定位承载核心内容（装饰性元素除外）。
- 移动端字体不得小于 14px。
- 动画必须包裹在 @media (prefers-reduced-motion: no-preference) 内。

### 兼容性
- 只支持竖屏。如果检测到用户要求横屏内容，自动将其适配为竖屏布局并重排元素。
- 避免使用过于前卫的 CSS 属性（如 container-queries、@layer），优先使用广泛支持的语法。

## 输出格式
你的回复必须仅包含可运行的 HTML 代码，以 <!DOCTYPE html> 开头。不要在代码块外添加任何解释文字。`;

export async function generateContent(
  prompt: string,
  existingCode: string | null,
  env: Env
): Promise<string> {
  const apiKey = env.AI_API_KEY;
  const baseUrl = env.AI_BASE_URL || 'https://api.deepseek.com/v1';

  if (!apiKey) {
    return generateFallbackContent(prompt);
  }

  try {
    const messages: { role: string; content: string }[] = [
      { role: 'system', content: SYSTEM_PROMPT },
    ];

    if (existingCode) {
      messages.push({
        role: 'user',
        content: `Here is the existing code:\n\`\`\`html\n${existingCode}\n\`\`\`\n\nPlease modify it based on this request: ${prompt}`,
      });
    } else {
      messages.push({ role: 'user', content: prompt });
    }

    const url = `${baseUrl}/chat/completions`;
    console.log('[AI] Calling:', url, 'model: deepseek-chat');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages,
        max_tokens: 8192,
        temperature: 0.7,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'unknown');
      console.error('[AI] API error:', response.status, errorText);
      return generateFallbackContent(prompt);
    }

    const data = await response.json() as { choices: { message: { content: string } }[] };
    let code = data.choices[0]?.message?.content || '';

    const htmlMatch = code.match(/```html\n?([\s\S]*?)```/);
    if (htmlMatch) code = htmlMatch[1];

    return code.trim();
  } catch (error: any) {
    console.error('[AI] Generation error:', error?.message || error);
    return generateFallbackContent(prompt);
  }
}

function generateFallbackContent(prompt: string): string {
  const colors = ['#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a'];
  const color1 = colors[Math.floor(Math.random() * colors.length)];
  const color2 = colors[Math.floor(Math.random() * colors.length)];

  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:sans-serif;background:linear-gradient(135deg,${color1},${color2});color:#fff;height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;overflow:hidden;user-select:none}
h1{font-size:24px;margin-bottom:12px;text-align:center;padding:0 20px}
p{font-size:14px;opacity:.7;text-align:center;padding:0 20px}
.emoji{font-size:80px;margin-bottom:20px;animation:bounce 2s infinite}
.btn{margin-top:20px;padding:12px 24px;background:rgba(255,255,255,.2);border:2px solid rgba(255,255,255,.3);border-radius:25px;color:#fff;font-size:16px;cursor:pointer;backdrop-filter:blur(10px);transition:all .2s}
.btn:active{transform:scale(.95);background:rgba(255,255,255,.3)}
@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-20px)}}
.particles{position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;overflow:hidden}
.particle{position:absolute;width:6px;height:6px;background:rgba(255,255,255,.4);border-radius:50%;animation:float linear infinite}
@keyframes float{0%{transform:translateY(100vh) rotate(0deg);opacity:1}100%{transform:translateY(-10vh) rotate(720deg);opacity:0}}
</style>
</head>
<body>
<div class="particles" id="particles"></div>
<div class="emoji" id="emoji">✨</div>
<h1>${prompt.slice(0, 50)}</h1>
<p>由 VibePop AI 生成</p>
<button class="btn" onclick="interact()">点击互动 🎉</button>
<script>
const emojis=['🎮','🎨','🎯','🎪','🎭','🎲','🎵','🎹','🎸','🎺'];
let count=0;
function interact(){
  count++;
  const el=document.getElementById('emoji');
  el.textContent=emojis[count%emojis.length];
  el.style.animation='none';
  void el.offsetHeight;
  el.style.animation='bounce 2s infinite';
  createBurst();
}
function createBurst(){
  for(let i=0;i<10;i++){
    const p=document.createElement('div');
    p.className='particle';
    p.style.left=Math.random()*100+'%';
    p.style.animationDuration=(Math.random()*3+2)+'s';
    p.style.animationDelay=Math.random()+'s';
    document.getElementById('particles').appendChild(p);
    setTimeout(()=>p.remove(),5000);
  }
}
for(let i=0;i<20;i++){
  const p=document.createElement('div');
  p.className='particle';
  p.style.left=Math.random()*100+'%';
  p.style.animationDuration=(Math.random()*3+2)+'s';
  p.style.animationDelay=Math.random()*5+'s';
  document.getElementById('particles').appendChild(p);
}
</script>
</body>
</html>`;
}
