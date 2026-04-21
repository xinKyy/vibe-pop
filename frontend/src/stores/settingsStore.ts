import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Language = 'zh' | 'en';

interface SettingsState {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
}

function detectDefaultLanguage(): Language {
  if (typeof navigator === 'undefined') return 'zh';
  const lang = (navigator.language || '').toLowerCase();
  return lang.startsWith('zh') ? 'zh' : 'en';
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      language: detectDefaultLanguage(),
      setLanguage: (language) => set({ language }),
      toggleLanguage: () => set({ language: get().language === 'zh' ? 'en' : 'zh' }),
    }),
    { name: 'vibepop-settings' },
  ),
);
