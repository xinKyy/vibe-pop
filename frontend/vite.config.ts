import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

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
你的回复必须仅包含可运行的 HTML 代码，以 <!DOCTYPE html> 开头。不要在代码块外添加任何解释文字。`

interface AiConfig {
  apiKey: string
  baseUrl: string
  model: string
}

function aiProxyPlugin(config: AiConfig): Plugin {
  const { apiKey, baseUrl, model } = config
  return {
    name: 'ai-proxy',
    configureServer(server) {
      if (!apiKey) {
        console.warn('[AI] AI_API_KEY 未配置，/api/ai/generate 将返回 500。请在 frontend/.env.local 中填写。')
      }
      server.middlewares.use('/api/ai/generate', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end(JSON.stringify({ success: false, error: 'Method not allowed' }))
          return
        }

        let body = ''
        for await (const chunk of req) body += chunk

        try {
          const { prompt, existingCode } = JSON.parse(body)
          if (!prompt?.trim()) {
            res.statusCode = 400
            res.end(JSON.stringify({ success: false, error: 'Prompt required' }))
            return
          }

          console.log(`[AI] Generating for: "${prompt.slice(0, 60)}..."`)

          const messages: { role: string; content: string }[] = [
            { role: 'system', content: SYSTEM_PROMPT },
          ]

          if (existingCode) {
            messages.push({
              role: 'user',
              content: `以下是现有代码:\n\`\`\`html\n${existingCode}\n\`\`\`\n\n请根据以下要求修改: ${prompt}`,
            })
          } else {
            messages.push({ role: 'user', content: prompt })
          }

          const apiRes = await fetch(`${baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model,
              messages,
              max_tokens: 8192,
              temperature: 0.7,
            }),
          })

          if (!apiRes.ok) {
            const errText = await apiRes.text().catch(() => 'unknown')
            console.error(`[AI] API error ${apiRes.status}:`, errText.slice(0, 300))
            res.statusCode = 502
            res.end(JSON.stringify({ success: false, error: `AI API error: ${apiRes.status}` }))
            return
          }

          const data = await apiRes.json() as { choices: { message: { content: string } }[] }
          let code = data.choices[0]?.message?.content || ''

          const htmlMatch = code.match(/```html\n?([\s\S]*?)```/)
          if (htmlMatch) code = htmlMatch[1]

          code = code.trim()
          console.log(`[AI] Done! ${code.length} chars generated`)

          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ success: true, data: { code } }))
        } catch (err: any) {
          console.error('[AI] Error:', err?.message || err)
          res.statusCode = 500
          res.end(JSON.stringify({ success: false, error: err?.message || 'Internal error' }))
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const aiConfig: AiConfig = {
    apiKey: env.AI_API_KEY ?? '',
    baseUrl: env.AI_BASE_URL || 'https://api.deepseek.com/v1',
    model: env.AI_MODEL || 'deepseek-chat',
  }

  return {
    plugins: [aiProxyPlugin(aiConfig), react(), tailwindcss()],
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:8787',
          changeOrigin: true,
        },
      },
    },
  }
})
