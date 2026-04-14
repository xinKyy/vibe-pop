import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Marquee from '../components/ui/Marquee';
import { api } from '../api/client';
import { useAuthStore } from '../stores/authStore';
import type { Content, ContentType } from '../types';

type Stage = 'input' | 'generating' | 'preview' | 'publish';

interface Template {
  id: string;
  contentId: string;
  title: string;
  coverEmoji: string;
  coverGradient: string;
}

export default function CreatePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuthStore();
  const remixContent = (location.state as { remix?: Content })?.remix;

  const [prompt, setPrompt] = useState(remixContent ? `基于【${remixContent.title}】进行改编，` : '');
  const [stage, setStage] = useState<Stage>('input');
  const [generatedCode, setGeneratedCode] = useState('');
  const [generatedMeta] = useState<{ title?: string; description?: string; type?: string; coverEmoji?: string; coverGradient?: string }>({});
  const [chatInput, setChatInput] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [templates, setTemplates] = useState<Template[]>([]);

  const [publishTitle, setPublishTitle] = useState('');
  const [publishDesc, setPublishDesc] = useState('');
  const [publishType, setPublishType] = useState<ContentType>('game');

  useEffect(() => {
    api.getTemplates().then(setTemplates).catch(() => {});
  }, []);

  const generate = useCallback(async (userPrompt: string, existingCode?: string) => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    setStage('generating');
    setStatusMsg('AI 正在创造...');
    setGeneratedCode('');
    try {
      const finalCode = await api.ai.generateStream(
        userPrompt,
        existingCode,
        (partialCode) => {
          setGeneratedCode(partialCode);
          setStatusMsg(`AI 正在生成... (${partialCode.length} 字符)`);
        },
      );

      let code = finalCode.trim();
      const htmlMatch = code.match(/```html\n?([\s\S]*?)```/);
      if (htmlMatch) code = htmlMatch[1].trim();

      setGeneratedCode(code);
      setStage('preview');
    } catch (e: any) {
      console.error('Generate error:', e);
      setStatusMsg('生成失败: ' + (e.message || '未知错误'));
      setTimeout(() => setStage('input'), 2000);
    }
  }, [isLoggedIn, navigate]);

  const handleSend = () => {
    if (!prompt.trim()) return;
    generate(prompt.trim());
  };

  const handleChatSend = () => {
    if (!chatInput.trim()) return;
    const input = chatInput;
    const currentCode = generatedCode;
    setChatInput('');
    generate(input.trim(), currentCode);
  };

  const handleTemplateClick = (tmpl: Template) => {
    setPrompt(`基于【${tmpl.title}】模板进行创作`);
    generate(`基于【${tmpl.title}】模板进行创作`);
  };

  const goToPublish = () => {
    setPublishTitle(generatedMeta.title || prompt.slice(0, 30) || '我的作品');
    setPublishDesc(generatedMeta.description || '');
    setPublishType((generatedMeta.type as ContentType) || 'game');
    setStage('publish');
  };

  const handlePublish = async () => {
    if (!publishTitle.trim()) return;
    setStage('generating');
    setStatusMsg('正在发布...');
    try {
      await api.contents.create({
        title: publishTitle,
        description: publishDesc,
        type: publishType,
        code: generatedCode,
        auto_publish: true,
      });
      setStatusMsg('发布成功！');
      setTimeout(() => navigate('/profile'), 1000);
    } catch (e: any) {
      setStatusMsg('发布失败: ' + (e.message || '未知错误'));
      setTimeout(() => setStage('publish'), 2000);
    }
  };

  if (stage === 'generating') {
    return (
      <div className="h-full flex flex-col bg-bg">
        <div className="flex items-center justify-center border-b border-border/50" style={{ padding: '14px 20px', gap: 8 }}>
          <div className="w-5 h-5 rounded-full border-2 border-accent border-t-transparent animate-spin" />
          <span className="text-[13px] font-semibold text-dim">{statusMsg}</span>
        </div>
        <div className="flex-1 relative">
          {generatedCode ? (
            <iframe
              srcDoc={generatedCode}
              sandbox="allow-scripts"
              className="w-full h-full border-0"
              title="generating-preview"
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center" style={{ padding: '0 32px' }}>
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center text-3xl" style={{ marginBottom: 32 }}>⚡</div>
              <div className="text-[13px] text-dim font-medium">等待 AI 响应...</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (stage === 'preview') {
    return (
      <div className="h-full flex flex-col bg-bg">
        <div className="flex items-center justify-between border-b border-border/50" style={{ padding: '12px 20px' }}>
          <button onClick={() => setStage('input')} className="rounded-[var(--radius-sm)] bg-muted flex items-center justify-center text-muted-fg hover:bg-border hover:text-fg transition-all duration-200" style={{ width: 40, height: 40 }}>
            ←
          </button>
          <span className="text-[14px] font-semibold">预览</span>
          <button onClick={goToPublish} className="bg-accent text-accent-fg text-[13px] font-semibold rounded-[var(--radius-sm)] active:scale-95 transition-all" style={{ padding: '8px 20px' }}>
            发布 →
          </button>
        </div>

        <div className="flex-1 relative bg-bg">
          <iframe
            srcDoc={generatedCode}
            sandbox="allow-scripts"
            className="w-full h-full border-0"
            title="preview"
          />
        </div>

        <div className="border-t border-border/50" style={{ padding: '16px 20px' }}>
          <div className="bg-surface rounded-[var(--radius-sm)] text-[13px] text-muted-fg leading-relaxed" style={{ padding: 16, marginBottom: 12 }}>
            ✦ 内容已生成！还想调整什么？可以说"改颜色"、"加音效"、"调难度"...
          </div>
          <div className="flex" style={{ gap: 12 }}>
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleChatSend()}
              placeholder="告诉 AI 你想怎么改..."
              className="flex-1 bg-muted rounded-[var(--radius-sm)] text-[14px] text-fg outline-none focus:ring-1 focus:ring-accent placeholder:text-dim transition-all"
              style={{ padding: '12px 16px' }}
            />
            <button onClick={handleChatSend} className="bg-accent text-accent-fg rounded-[var(--radius-sm)] flex items-center justify-center font-semibold active:scale-90 transition-all flex-shrink-0" style={{ width: 48, height: 48 }}>
              →
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'publish') {
    const categories: { value: ContentType; label: string }[] = [
      { value: 'game', label: '游戏' },
      { value: 'memory', label: '回忆' },
      { value: 'generator', label: '生成器' },
      { value: 'other', label: '其他' },
    ];
    return (
      <div className="h-full overflow-y-auto bg-bg">
        <div className="flex items-center border-b border-border/50" style={{ padding: '12px 20px' }}>
          <button onClick={() => setStage('preview')} className="rounded-[var(--radius-sm)] bg-muted flex items-center justify-center text-muted-fg hover:bg-border hover:text-fg transition-all duration-200" style={{ width: 40, height: 40 }}>
            ←
          </button>
          <span className="flex-1 text-center text-[14px] font-semibold">发布作品</span>
          <div style={{ width: 40 }} />
        </div>
        <div style={{ padding: 24 }}>
          <div className="aspect-video overflow-hidden relative rounded-[var(--radius-md)] bg-card" style={{ marginBottom: 24 }}>
            <iframe srcDoc={generatedCode} sandbox="allow-scripts" className="w-full h-full border-0 pointer-events-none" title="cover" />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label className="text-[13px] text-dim font-semibold block" style={{ marginBottom: 10 }}>标题 *</label>
            <input value={publishTitle} onChange={(e) => setPublishTitle(e.target.value)} placeholder="给作品起个名字"
              className="w-full bg-muted rounded-[var(--radius-sm)] text-base font-semibold text-fg outline-none focus:ring-1 focus:ring-accent placeholder:text-dim transition-all"
              style={{ padding: '14px 16px' }} />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label className="text-[13px] text-dim font-semibold block" style={{ marginBottom: 10 }}>描述</label>
            <textarea value={publishDesc} onChange={(e) => setPublishDesc(e.target.value)} placeholder="介绍一下你的作品..." rows={2}
              className="w-full bg-muted rounded-[var(--radius-sm)] text-[14px] text-fg resize-none outline-none focus:ring-1 focus:ring-accent placeholder:text-dim leading-relaxed transition-all"
              style={{ padding: '14px 16px' }} />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label className="text-[13px] text-dim font-semibold block" style={{ marginBottom: 10 }}>分类 *</label>
            <div className="flex" style={{ gap: 10 }}>
              {categories.map((cat) => (
                <button key={cat.value} onClick={() => setPublishType(cat.value)}
                  className={`flex-1 text-[13px] font-semibold rounded-[var(--radius-sm)] transition-all duration-200 ${
                    publishType === cat.value
                      ? 'bg-accent text-accent-fg'
                      : 'bg-muted text-muted-fg hover:bg-border hover:text-fg'
                  }`}
                  style={{ padding: '12px 0' }}>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
          <button onClick={handlePublish} disabled={!publishTitle.trim()}
            className="w-full bg-accent text-accent-fg text-[15px] font-semibold rounded-[var(--radius-md)] disabled:opacity-30 active:scale-[0.98] hover:brightness-110 transition-all duration-200"
            style={{ padding: '14px 0' }}>
            发布
          </button>
        </div>
      </div>
    );
  }

  // Input stage
  return (
    <div className="h-full flex flex-col bg-bg">
      {/* Header */}
      <div style={{ padding: '18px 20px 14px' }}>
        <h1 className="text-[clamp(1.75rem,8vw,2.5rem)] font-bold tracking-tight leading-none">
          创<span className="text-accent">作</span>
        </h1>
        <p className="text-[13px] text-dim font-medium" style={{ marginTop: 7 }}>描述你的想法，AI 帮你实现</p>
      </div>

      {/* Input area */}
      <div style={{ padding: '0 20px 14px' }}>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={'描述你想创造什么...\n例如：做一个弹球游戏\n例如：做一个毒舌点评生成器\n例如：做一个生日贺卡'}
          rows={3}
          className="w-full bg-muted rounded-[var(--radius-md)] text-[14px] text-fg resize-none outline-none focus:ring-1 focus:ring-accent placeholder:text-dim leading-relaxed transition-all"
          style={{ minHeight: 120, padding: 16 }}
        />
        <button onClick={handleSend} disabled={!prompt.trim()}
          className="w-full bg-accent text-accent-fg text-[15px] font-semibold rounded-[var(--radius-md)] active:scale-[0.98] hover:brightness-110 transition-all duration-200 disabled:opacity-30 flex items-center justify-center gap-2"
          style={{ marginTop: 8, padding: '12px 0' }}>
          ⚡ 发送给 AI
        </button>
      </div>

      {/* Templates */}
      <div className="flex-1 overflow-y-auto">
        {templates.length > 0 && (
          <div className="border-y border-border/30" style={{ padding: '6px 0', marginBottom: 14 }}>
            <Marquee speed={40}>
              <span className="text-[12px] font-semibold text-dim mx-5">★ 热门模板</span>
              {templates.map((tmpl) => (
                <span key={tmpl.id} className="text-[12px] font-semibold text-muted-fg mx-5">
                  {tmpl.coverEmoji} {tmpl.title}
                </span>
              ))}
            </Marquee>
          </div>
        )}

        <div style={{ padding: '0 20px 16px' }}>
          <div className="text-[13px] text-dim font-semibold" style={{ marginBottom: 8 }}>
            ★ 热门模板
          </div>
          <div className="grid grid-cols-2" style={{ gap: 10 }}>
            {templates.map((tmpl) => (
              <div key={tmpl.id} onClick={() => handleTemplateClick(tmpl)}
                className="group bg-card rounded-[var(--radius-md)] overflow-hidden cursor-pointer transition-all duration-300 hover:ring-1 hover:ring-accent/40 active:scale-[0.98]">
                <div className="aspect-square flex items-center justify-center text-4xl relative" style={{ background: tmpl.coverGradient }}>
                  <span className="group-hover:scale-110 transition-transform duration-300">{tmpl.coverEmoji}</span>
                </div>
                <div className="text-center" style={{ padding: 14 }}>
                  <div className="text-[13px] font-semibold group-hover:text-accent transition-colors" style={{ marginBottom: 4 }}>{tmpl.title}</div>
                  <div className="text-[12px] text-dim font-medium group-hover:text-accent/60 transition-colors">
                    ↻ Remix
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
