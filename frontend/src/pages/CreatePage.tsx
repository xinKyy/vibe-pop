import { useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { mockTemplates } from '../api/mockData';
import type { Content, ContentType } from '../types';

type CreateStage = 'input' | 'generating' | 'preview' | 'publish';

interface GenerationStep {
  label: string;
  done: boolean;
}

const FALLBACK_CODE = (prompt: string) => {
  const colors = ['#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a'];
  const c1 = colors[Math.floor(Math.random() * colors.length)];
  const c2 = colors[Math.floor(Math.random() * colors.length)];
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:sans-serif;background:linear-gradient(135deg,${c1},${c2});color:#fff;height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;overflow:hidden;user-select:none}h2{font-size:22px;margin-bottom:8px;text-align:center;padding:0 20px}.emoji{font-size:72px;margin-bottom:16px;animation:bounce 2s infinite}p{font-size:13px;opacity:.7}@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-20px)}}.btn{margin-top:24px;padding:12px 28px;background:rgba(255,255,255,.2);border:2px solid rgba(255,255,255,.3);border-radius:25px;color:#fff;font-size:15px;cursor:pointer;backdrop-filter:blur(10px)}.btn:active{transform:scale(.95);background:rgba(255,255,255,.3)}</style></head><body><div class="emoji">✨</div><h2>${prompt.slice(0, 30)}</h2><p>由 VibePop AI 生成</p><button class="btn" onclick="this.textContent=['🎮','🎨','🎯','🎪','🎭','🎲'][Math.floor(Math.random()*6)]+' 再来一次！'">点击互动 🎉</button></body></html>`;
};

export default function CreatePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const remixContent = (location.state as { remix?: Content })?.remix;

  const [prompt, setPrompt] = useState(
    remixContent ? `基于【${remixContent.title}】进行改编，` : ''
  );
  const [stage, setStage] = useState<CreateStage>('input');
  const [generatedCode, setGeneratedCode] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [steps, setSteps] = useState<GenerationStep[]>([]);
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);

  // Publish state
  const [publishTitle, setPublishTitle] = useState('');
  const [publishDesc, setPublishDesc] = useState('');
  const [publishType, setPublishType] = useState<ContentType>('game');
  const [publishTags, setPublishTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const simulateGeneration = useCallback(async (userPrompt: string, isIteration = false) => {
    setStage('generating');

    const genSteps = isIteration
      ? [
          { label: `正在处理: ${userPrompt.slice(0, 25)}...`, done: false },
          { label: '更新预览...', done: false },
        ]
      : [
          { label: '生成游戏逻辑...', done: false },
          { label: '设计视觉效果...', done: false },
          { label: '添加交互反馈...', done: false },
        ];

    setSteps(genSteps);

    for (let i = 0; i < genSteps.length; i++) {
      await new Promise((r) => setTimeout(r, 600 + Math.random() * 400));
      setSteps((prev) => prev.map((s, j) => (j <= i ? { ...s, done: true } : s)));
    }

    await new Promise((r) => setTimeout(r, 300));
    setGeneratedCode(FALLBACK_CODE(userPrompt));
    setStage('preview');

    if (!isIteration) {
      setChatHistory([
        { role: 'user', text: userPrompt },
        { role: 'ai', text: '内容已生成！还需要调整什么吗？可以告诉我改颜色、加音效、调难度...' },
      ]);
    } else {
      setChatHistory((prev) => [
        ...prev,
        { role: 'user', text: userPrompt },
        { role: 'ai', text: '已更新！还要继续调整吗？' },
      ]);
    }
  }, []);

  const handleSend = () => {
    if (!prompt.trim()) return;
    simulateGeneration(prompt.trim());
  };

  const handleChatSend = () => {
    if (!chatInput.trim()) return;
    const input = chatInput;
    setChatInput('');
    simulateGeneration(input.trim(), true);
  };

  const handleTemplateClick = (title: string) => {
    const p = `基于【${title}】模板进行创作`;
    setPrompt(p);
    simulateGeneration(p);
  };

  const goToPublish = () => {
    setPublishTitle(prompt.slice(0, 30));
    setStage('publish');
  };

  const handlePublish = async () => {
    if (!publishTitle.trim()) return;
    setStage('generating');
    setSteps([{ label: '正在发布...', done: false }]);
    await new Promise((r) => setTimeout(r, 1000));
    setSteps([{ label: '发布成功！', done: true }]);
    await new Promise((r) => setTimeout(r, 500));
    navigate('/profile');
  };

  const addTag = () => {
    const tag = tagInput.trim().replace(/^#/, '');
    if (tag && !publishTags.includes(tag)) setPublishTags([...publishTags, tag]);
    setTagInput('');
  };

  // --- Generating stage ---
  if (stage === 'generating') {
    return (
      <div className="h-full flex flex-col items-center justify-center px-8">
        <div className="text-4xl mb-6 animate-bounce">🤖</div>
        <div className="text-lg font-semibold mb-6">AI 正在创造...</div>
        <div className="w-full space-y-3">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-3 text-sm">
              <span className={step.done ? 'text-green-400' : 'text-[var(--color-text-dim)] animate-pulse'}>
                {step.done ? '✓' : '~'}
              </span>
              <span className={step.done ? 'text-[var(--color-text-secondary)]' : 'text-[var(--color-text-dim)]'}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- Preview stage ---
  if (stage === 'preview') {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
          <button onClick={() => setStage('input')} className="text-2xl">←</button>
          <span className="text-sm font-medium">预览</span>
          <button
            onClick={goToPublish}
            className="px-3 py-1.5 bg-gradient-to-br from-pink to-pink-dark rounded-2xl text-white text-xs font-medium"
          >
            发布 →
          </button>
        </div>

        <div className="flex-1 relative bg-black">
          <iframe
            srcDoc={generatedCode}
            sandbox="allow-scripts"
            className="w-full h-full border-0"
            title="preview"
          />
        </div>

        <div className="px-4 py-3 border-t border-[var(--color-border)] max-h-[200px] overflow-y-auto">
          {/* Chat history */}
          <div className="space-y-2 mb-3">
            {chatHistory.slice(-4).map((msg, i) => (
              <div key={i} className={`text-xs ${msg.role === 'ai' ? 'text-[var(--color-text-muted)]' : 'text-pink'}`}>
                <span className="font-medium">{msg.role === 'ai' ? '🤖' : '你'}: </span>
                {msg.text}
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleChatSend()}
              placeholder="告诉AI你想怎么改..."
              className="flex-1 bg-[var(--color-bg-input)] border border-[var(--color-border-input)] rounded-3xl px-4 py-2.5 text-white text-sm outline-none focus:border-pink placeholder:text-[var(--color-text-dim)]"
            />
            <button
              onClick={handleChatSend}
              className="w-10 h-10 bg-gradient-to-br from-pink to-pink-dark rounded-full text-white text-lg flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform"
            >
              ➤
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Publish stage ---
  if (stage === 'publish') {
    const categories: { value: ContentType; label: string }[] = [
      { value: 'game', label: '游戏' },
      { value: 'memory', label: '回忆' },
      { value: 'generator', label: '生成器' },
      { value: 'other', label: '其他' },
    ];

    return (
      <div className="h-full overflow-y-auto">
        <div className="flex items-center px-4 py-3 border-b border-[var(--color-border)]">
          <button onClick={() => setStage('preview')} className="text-2xl">←</button>
          <span className="flex-1 text-center text-sm font-medium">发布你的作品</span>
          <div className="w-6" />
        </div>

        <div className="p-5 space-y-5">
          <div className="aspect-video rounded-xl overflow-hidden relative">
            <iframe
              srcDoc={generatedCode}
              sandbox="allow-scripts"
              className="w-full h-full border-0 pointer-events-none"
              title="cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          </div>

          <div>
            <label className="text-xs text-[var(--color-text-muted)] mb-1.5 block">标题 *</label>
            <input
              value={publishTitle}
              onChange={(e) => setPublishTitle(e.target.value)}
              placeholder="给作品起个名字"
              className="w-full bg-[var(--color-bg-input)] border border-[var(--color-border-input)] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-pink placeholder:text-[var(--color-text-dim)]"
            />
          </div>

          <div>
            <label className="text-xs text-[var(--color-text-muted)] mb-1.5 block">描述</label>
            <textarea
              value={publishDesc}
              onChange={(e) => setPublishDesc(e.target.value)}
              placeholder="介绍一下你的作品..."
              rows={3}
              className="w-full bg-[var(--color-bg-input)] border border-[var(--color-border-input)] rounded-xl px-4 py-3 text-white text-sm resize-none outline-none focus:border-pink placeholder:text-[var(--color-text-dim)]"
            />
          </div>

          <div>
            <label className="text-xs text-[var(--color-text-muted)] mb-1.5 block">分类 *</label>
            <div className="flex gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setPublishType(cat.value)}
                  className={`px-3.5 py-2 rounded-xl text-xs transition-all ${
                    publishType === cat.value
                      ? 'bg-gradient-to-br from-pink to-pink-dark text-white'
                      : 'bg-[var(--color-bg-card)] text-[var(--color-text-muted)]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-[var(--color-text-muted)] mb-1.5 block">标签（可选）</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {publishTags.map((tag) => (
                <span key={tag} className="px-2.5 py-1 bg-[var(--color-bg-card)] rounded-lg text-xs text-pink flex items-center gap-1">
                  #{tag}
                  <button onClick={() => setPublishTags(publishTags.filter((t) => t !== tag))} className="text-[var(--color-text-dim)]">×</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTag()}
                placeholder="#添加标签"
                className="flex-1 bg-[var(--color-bg-input)] border border-[var(--color-border-input)] rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-pink placeholder:text-[var(--color-text-dim)]"
              />
              <button onClick={addTag} className="px-3 py-2.5 bg-[var(--color-bg-card)] rounded-xl text-sm text-pink">
                + 添加
              </button>
            </div>
          </div>

          <button
            onClick={handlePublish}
            disabled={!publishTitle.trim()}
            className="w-full py-3.5 bg-gradient-to-br from-pink to-pink-dark rounded-3xl text-white text-sm font-semibold disabled:opacity-40 active:scale-[0.98] transition-transform"
          >
            发 布
          </button>
        </div>
      </div>
    );
  }

  // --- Input stage ---
  return (
    <div className="h-full flex flex-col">
      <div className="p-5 border-b border-[var(--color-border)]">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={'描述你想创造什么...\n例如：做一个弹球游戏，球用我的脸'}
          rows={3}
          className="w-full min-h-[80px] bg-[var(--color-bg-input)] border border-[var(--color-border-input)] rounded-xl p-3 text-white text-sm resize-none outline-none focus:border-pink placeholder:text-[var(--color-text-dim)]"
        />
        <button
          onClick={handleSend}
          disabled={!prompt.trim()}
          className="mt-3 w-full py-3 bg-gradient-to-br from-pink to-pink-dark rounded-3xl text-white text-sm font-semibold active:scale-[0.98] transition-transform disabled:opacity-40"
        >
          发送给 AI ➤
        </button>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        <div className="flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] mb-3">
          📋 推荐模板（一键 Remix）
        </div>

        <div className="grid grid-cols-2 gap-3">
          {mockTemplates.map((tmpl) => (
            <div
              key={tmpl.id}
              onClick={() => handleTemplateClick(tmpl.title)}
              className="bg-[var(--color-bg-card)] rounded-xl overflow-hidden cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <div
                className="aspect-square flex items-center justify-center text-4xl"
                style={{ background: tmpl.coverGradient }}
              >
                {tmpl.coverEmoji}
              </div>
              <div className="p-2.5 text-center">
                <div className="text-[13px] font-medium mb-1.5">{tmpl.title}</div>
                <div className="text-[11px] text-pink flex items-center justify-center gap-1">
                  🔄 一键 Remix
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center py-4 text-[var(--color-text-muted)] text-[13px] cursor-pointer hover:text-pink transition-colors">
          查看更多模板 →
        </div>
      </div>
    </div>
  );
}
