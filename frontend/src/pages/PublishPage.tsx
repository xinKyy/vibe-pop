import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ContentType } from '../types';

const categories: { value: ContentType; label: string }[] = [
  { value: 'game', label: '游戏' },
  { value: 'memory', label: '回忆' },
  { value: 'generator', label: '生成器' },
  { value: 'other', label: '其他' },
];

export default function PublishPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<ContentType>('game');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [publishing, setPublishing] = useState(false);

  const addTag = () => {
    const tag = tagInput.trim().replace(/^#/, '');
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
    }
    setTagInput('');
  };

  const handlePublish = async () => {
    if (!title.trim()) return;
    setPublishing(true);
    await new Promise((r) => setTimeout(r, 1000));
    setPublishing(false);
    navigate('/profile');
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="flex items-center px-4 py-3 border-b border-[var(--color-border)]">
        <button onClick={() => navigate(-1)} className="text-2xl">←</button>
        <span className="flex-1 text-center text-sm font-medium">发布你的作品</span>
        <div className="w-6" />
      </div>

      <div className="p-5 space-y-5">
        {/* Cover preview */}
        <div className="aspect-video rounded-xl bg-gradient-to-br from-pink/20 to-pink-dark/20 border border-dashed border-[var(--color-border-input)] flex items-center justify-center">
          <div className="text-center text-[var(--color-text-muted)]">
            <div className="text-3xl mb-2">📸</div>
            <div className="text-xs">自动生成封面 / 点击上传</div>
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="text-xs text-[var(--color-text-muted)] mb-1.5 block">标题 *</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="给作品起个名字"
            className="w-full bg-[var(--color-bg-input)] border border-[var(--color-border-input)] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-pink placeholder:text-[var(--color-text-dim)]"
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-xs text-[var(--color-text-muted)] mb-1.5 block">描述</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="介绍一下你的作品..."
            rows={3}
            className="w-full bg-[var(--color-bg-input)] border border-[var(--color-border-input)] rounded-xl px-4 py-3 text-white text-sm resize-none outline-none focus:border-pink placeholder:text-[var(--color-text-dim)]"
          />
        </div>

        {/* Category */}
        <div>
          <label className="text-xs text-[var(--color-text-muted)] mb-1.5 block">分类 *</label>
          <div className="flex gap-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setType(cat.value)}
                className={`px-3.5 py-2 rounded-xl text-xs transition-all ${
                  type === cat.value
                    ? 'bg-gradient-to-br from-pink to-pink-dark text-white'
                    : 'bg-[var(--color-bg-card)] text-[var(--color-text-muted)]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="text-xs text-[var(--color-text-muted)] mb-1.5 block">标签（可选）</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 bg-[var(--color-bg-card)] rounded-lg text-xs text-pink flex items-center gap-1"
              >
                #{tag}
                <button onClick={() => setTags(tags.filter((t) => t !== tag))} className="text-[var(--color-text-dim)]">×</button>
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

        {/* Publish button */}
        <button
          onClick={handlePublish}
          disabled={!title.trim() || publishing}
          className="w-full py-3.5 bg-gradient-to-br from-pink to-pink-dark rounded-3xl text-white text-sm font-semibold disabled:opacity-40 active:scale-[0.98] transition-transform"
        >
          {publishing ? '发布中...' : '发 布'}
        </button>
      </div>
    </div>
  );
}
