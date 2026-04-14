import type { Env } from '../types';

const SYSTEM_PROMPT = `你是VibePop平台的AI内容生成器。根据用户输入直接输出一个完整可运行的单HTML文件（内联CSS/JS，无外部依赖）。

要求：
- 移动端优先，基准宽度375px，max-width:100vw，禁止水平滚动
- 用Flexbox/Grid布局，间距用rem/%
- 字体>=14px，触控区>=44px
- 动画简洁流畅，视觉精美
- 只输出HTML代码，以<!DOCTYPE html>开头，不要任何解释文字`;

function buildMessages(prompt: string, existingCode: string | null) {
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
  return messages;
}

export function generateContentStream(
  prompt: string,
  existingCode: string | null,
  env: Env
): ReadableStream {
  const apiKey = env.AI_API_KEY;
  const baseUrl = env.AI_BASE_URL || 'https://api.deepseek.com/v1';

  if (!apiKey) {
    const fallback = generateFallbackContent(prompt);
    return new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: fallback })}\n\n`));
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      },
    });
  }

  const messages = buildMessages(prompt, existingCode);
  const url = `${baseUrl}/chat/completions`;
  console.log('[AI Stream] Calling:', url, 'model: deepseek-chat');

  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();

  (async () => {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages,
          max_tokens: 4096,
          temperature: 0.7,
          stream: true,
        }),
      });

      if (!response.ok || !response.body) {
        const errorText = await response.text().catch(() => 'unknown');
        console.error('[AI Stream] API error:', response.status, errorText);
        const fallback = generateFallbackContent(prompt);
        await writer.write(encoder.encode(`data: ${JSON.stringify({ content: fallback })}\n\n`));
        await writer.write(encoder.encode('data: [DONE]\n\n'));
        await writer.close();
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;
          const payload = trimmed.slice(6);

          if (payload === '[DONE]') {
            await writer.write(encoder.encode('data: [DONE]\n\n'));
            continue;
          }

          try {
            const parsed = JSON.parse(payload);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              await writer.write(encoder.encode(`data: ${JSON.stringify({ content: delta })}\n\n`));
            }
          } catch {
            // skip malformed chunks
          }
        }
      }

      if (!buffer.includes('[DONE]')) {
        await writer.write(encoder.encode('data: [DONE]\n\n'));
      }
      await writer.close();
    } catch (error: any) {
      console.error('[AI Stream] Error:', error?.message || error);
      try {
        const fallback = generateFallbackContent(prompt);
        await writer.write(encoder.encode(`data: ${JSON.stringify({ content: fallback })}\n\n`));
        await writer.write(encoder.encode('data: [DONE]\n\n'));
        await writer.close();
      } catch {
        await writer.abort();
      }
    }
  })();

  return readable;
}

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
    const messages = buildMessages(prompt, existingCode);
    const url = `${baseUrl}/chat/completions`;
    console.log('[AI] Calling:', url, 'model: deepseek-chat');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages,
        max_tokens: 4096,
        temperature: 0.7,
      }),
    });

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
