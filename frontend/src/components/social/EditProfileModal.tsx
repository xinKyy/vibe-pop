import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { User } from '../../types';
import { useTranslation } from '../../i18n';

interface EditProfileModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: { displayName: string; avatar: string; bio: string }) => Promise<void>;
}

const AVATAR_PRESETS = ['😀', '😺', '🎨', '🎮', '🎯', '✈️', '🤖', '⏰', '🎂', '🌟', '🔥', '💎', '🚀', '🌈', '👻', '🦄'];

// 防御历史脏数据：某些老账户会把字段保存成字符串 "undefined" / "null"，
// 读取时需要当作空值，避免输入框里直接显示 "undefined"。
function sanitizeField(v: unknown): string {
  if (typeof v !== 'string') return '';
  const t = v.trim();
  if (!t || t === 'undefined' || t === 'null') return '';
  return v;
}

export default function EditProfileModal({ user, isOpen, onClose, onSave }: EditProfileModalProps) {
  const { t } = useTranslation();
  const initName = sanitizeField(user.displayName) || sanitizeField(user.username) || '';
  const initAvatar = sanitizeField(user.avatar) || '😀';
  const initBio = sanitizeField(user.bio);
  const [displayName, setDisplayName] = useState(initName);
  const [avatar, setAvatar] = useState(initAvatar);
  const [bio, setBio] = useState(initBio);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setDisplayName(sanitizeField(user.displayName) || sanitizeField(user.username) || '');
      setAvatar(sanitizeField(user.avatar) || '😀');
      setBio(sanitizeField(user.bio));
      setError('');
    }
  }, [isOpen, user]);

  // 打开时锁住 body 滚动 + 支持 ESC 关闭，避免移动端误触或输入时页面被意外滚动。
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSave = async () => {
    const name = (displayName ?? '').trim();
    const bioText = bio ?? '';
    if (name.length < 1 || name.length > 20) {
      setError(t('edit.error.nameLength'));
      return;
    }
    if (bioText.length > 140) {
      setError(t('edit.error.bioLength'));
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSave({ displayName: name, avatar: avatar ?? '😀', bio: bioText });
      onClose();
    } catch (e) {
      setError((e as Error).message || t('edit.error.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const modal = (
    <div
      className="fixed inset-0 z-[2000] flex items-end justify-center"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-[430px] bg-bg flex flex-col animate-slide-up rounded-t-[var(--radius-xl)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center" style={{ padding: '14px 0' }}>
          <div className="w-9 h-1 bg-border/60 rounded-full" />
        </div>

        <div className="flex items-center justify-between" style={{ padding: '0 20px 14px' }}>
          <span className="text-[15px] font-semibold">{t('edit.title')}</span>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-dim text-sm hover:bg-border hover:text-fg transition-all duration-200"
          >
            ✕
          </button>
        </div>

        <div className="border-t border-border/30" />

        <div className="overflow-y-auto" style={{ padding: '16px 20px', maxHeight: '60vh' }}>
          {/* 用户名（只读） */}
          <div style={{ marginBottom: 18 }}>
            <div className="text-[12px] font-semibold text-dim" style={{ marginBottom: 6 }}>
              {t('edit.username.label')}
            </div>
            <div
              className="bg-muted/50 rounded-[var(--radius-sm)] text-[14px] text-muted-fg font-mono"
              style={{ padding: '10px 12px' }}
            >
              @{user.username}
            </div>
          </div>

          {/* 头像 */}
          <div style={{ marginBottom: 18 }}>
            <div className="text-[12px] font-semibold text-dim" style={{ marginBottom: 8 }}>
              {t('edit.avatar.label')}
            </div>
            <div className="grid grid-cols-8" style={{ gap: 6 }}>
              {AVATAR_PRESETS.map((em) => (
                <button
                  key={em}
                  onClick={() => setAvatar(em)}
                  className={`aspect-square rounded-full flex items-center justify-center text-[18px] transition-all ${
                    avatar === em
                      ? 'bg-accent text-accent-fg ring-2 ring-accent'
                      : 'bg-muted hover:bg-border'
                  }`}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          {/* 显示名 */}
          <div style={{ marginBottom: 18 }}>
            <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
              <div className="text-[12px] font-semibold text-dim">{t('edit.displayName.label')}</div>
              <div className="text-[11px] text-dim tabular-nums">{(displayName ?? '').length}/20</div>
            </div>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value.slice(0, 20))}
              placeholder={t('edit.displayName.placeholder')}
              className="w-full bg-muted rounded-[var(--radius-sm)] text-[14px] text-fg outline-none focus:ring-1 focus:ring-accent placeholder:text-dim transition-all"
              style={{ padding: '10px 12px' }}
            />
          </div>

          {/* 简介 */}
          <div style={{ marginBottom: 18 }}>
            <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
              <div className="text-[12px] font-semibold text-dim">{t('edit.bio.label')}</div>
              <div className="text-[11px] text-dim tabular-nums">{(bio ?? '').length}/140</div>
            </div>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 140))}
              placeholder={t('edit.bio.placeholder')}
              rows={3}
              className="w-full bg-muted rounded-[var(--radius-sm)] text-[14px] text-fg resize-none outline-none focus:ring-1 focus:ring-accent placeholder:text-dim leading-relaxed transition-all"
              style={{ padding: '10px 12px' }}
            />
          </div>

          {error && (
            <div
              className="text-[12px] text-red-400 bg-red-500/10 rounded-[var(--radius-sm)]"
              style={{ padding: '8px 12px', marginBottom: 10 }}
            >
              {error}
            </div>
          )}
        </div>

        <div
          className="border-t border-border/30 flex items-center"
          style={{ padding: '12px 20px 18px', gap: 10 }}
        >
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 bg-muted text-muted-fg text-[14px] font-semibold rounded-[var(--radius-sm)] hover:bg-border hover:text-fg transition-all disabled:opacity-40"
            style={{ padding: '10px 0' }}
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !(displayName ?? '').trim()}
            className="flex-1 bg-accent text-accent-fg text-[14px] font-semibold rounded-[var(--radius-sm)] active:scale-95 hover:brightness-110 transition-all disabled:opacity-40"
            style={{ padding: '10px 0' }}
          >
            {saving ? t('common.saving') : t('common.save')}
          </button>
        </div>
      </div>
    </div>
  );

  // 通过 Portal 渲染到 body，规避 AppShell 的 overflow-hidden、overflow-y-auto 等
  // 祖先节点可能造成的定位/裁剪问题，同时与 CommentSheet/ShareSheet 行为保持一致。
  return createPortal(modal, document.body);
}
