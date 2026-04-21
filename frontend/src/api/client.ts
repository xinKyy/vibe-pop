import { useAuthStore } from '../stores/authStore';
import type { PromptTemplateDTO } from '../types';

const BASE_URL = import.meta.env.PROD
  ? 'https://vibepop-api.zyhh1611054604.workers.dev/api'
  : '/api';

async function request<T>(path: string, options: RequestInit & { timeout?: number } = {}): Promise<T> {
  const token = useAuthStore.getState().token;
  const { timeout, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((fetchOptions.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let signal = fetchOptions.signal;
  let controller: AbortController | undefined;
  if (timeout && !signal) {
    controller = new AbortController();
    signal = controller.signal;
    setTimeout(() => controller!.abort(), timeout);
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...fetchOptions, headers, signal });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `Request failed: ${res.status}`);
  }

  return data;
}

async function streamRequest(
  path: string,
  body: Record<string, unknown>,
  onChunk: (text: string) => void,
): Promise<string> {
  const token = useAuthStore.getState().token;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error((data as any).error || `Request failed: ${res.status}`);
  }

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let accumulated = '';
  let buf = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buf += decoder.decode(value, { stream: true });
    const lines = buf.split('\n');
    buf = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith('data: ')) continue;
      const payload = trimmed.slice(6);
      if (payload === '[DONE]') continue;
      try {
        const parsed = JSON.parse(payload);
        if (parsed.content) {
          accumulated += parsed.content;
          onChunk(accumulated);
        }
      } catch {
        // skip
      }
    }
  }

  return accumulated;
}

export const api = {
  auth: {
    sendCode: (email: string) =>
      request<{ success: boolean; data: { message: string } }>('/auth/send-code', { method: 'POST', body: JSON.stringify({ email }) }),
    login: (email: string, code: string) =>
      request<{ success: boolean; data: { user: any; token: string; isNewUser: boolean } }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, code }) }),
  },

  contents: {
    list: (params?: { page?: number; limit?: number; type?: string; sort?: 'hot' | 'latest' }) => {
      const query = new URLSearchParams();
      if (params?.page) query.set('page', String(params.page));
      if (params?.limit) query.set('limit', String(params.limit));
      if (params?.type) query.set('type', params.type);
      if (params?.sort) query.set('sort', params.sort);
      return request<{ success: boolean; data: { items: any[]; total: number; hasMore: boolean } }>(`/contents?${query}`);
    },
    feed: (page = 1) =>
      request<{ success: boolean; data: { items: any[]; hasMore: boolean } }>(`/contents/feed?page=${page}`),
    get: (id: string) =>
      request<{ success: boolean; data: any }>(`/contents/${id}`),
    create: (body: { title?: string; description?: string; type?: string; code?: string; auto_publish?: boolean }) =>
      request<{ success: boolean; data: any }>('/contents', { method: 'POST', body: JSON.stringify(body) }),
    publish: (id: string, body: { title?: string; description?: string; type?: string }) =>
      request<{ success: boolean; data: any }>(`/contents/${id}/publish`, { method: 'POST', body: JSON.stringify(body) }),
    delete: (id: string) =>
      request<{ success: boolean }>(`/contents/${id}`, { method: 'DELETE' }),
  },

  users: {
    me: () => request<{ success: boolean; data: any }>('/users/me'),
    get: (id: string) => request<{ success: boolean; data: any }>(`/users/${id}`),
    updateMe: (body: { displayName?: string; avatar?: string; bio?: string }) =>
      request<{ success: boolean; data: any; error?: string }>('/users/me', { method: 'PUT', body: JSON.stringify(body) }),
    completeOnboarding: (body: { username: string; displayName: string; avatar?: string }) =>
      request<{ success: boolean; data: any; error?: string }>('/users/me/onboarding', { method: 'POST', body: JSON.stringify(body) }),
    contents: (id: string, page = 1) =>
      request<{ success: boolean; data: { items: any[]; hasMore: boolean } }>(`/users/${id}/contents?page=${page}`),
    myLikes: (page = 1) =>
      request<{ success: boolean; data: { items: any[]; hasMore: boolean } }>(`/users/me/likes?page=${page}`),
    myFavorites: (page = 1) =>
      request<{ success: boolean; data: { items: any[]; hasMore: boolean } }>(`/users/me/favorites?page=${page}`),
  },

  social: {
    getState: () =>
      request<{ success: boolean; data: { likes: string[]; favorites: string[]; following: string[] } }>('/users/me/social-state'),
    like: (contentId: string) =>
      request<{ success: boolean; data: { liked: boolean; likeCount: number } }>(`/contents/${contentId}/like`, { method: 'POST' }),
    favorite: (contentId: string) =>
      request<{ success: boolean; data: { favorited: boolean; favoriteCount: number } }>(`/contents/${contentId}/favorite`, { method: 'POST' }),
    comments: (contentId: string, page = 1) =>
      request<{ success: boolean; data: { items: any[]; hasMore: boolean } }>(`/contents/${contentId}/comments?page=${page}`),
    comment: (contentId: string, text: string) =>
      request<{ success: boolean; data: any }>(`/contents/${contentId}/comments`, { method: 'POST', body: JSON.stringify({ text }) }),
    follow: (userId: string) =>
      request<{ success: boolean; data: { following: boolean } }>(`/users/${userId}/follow`, { method: 'POST' }),
    followers: (userId: string) =>
      request<{ success: boolean; data: { items: any[] } }>(`/users/${userId}/followers`),
    following: (userId: string) =>
      request<{ success: boolean; data: { items: any[] } }>(`/users/${userId}/following`),
  },

  ai: {
    generateStream: (
      prompt: string,
      existingCode: string | undefined,
      onChunk: (text: string) => void,
    ): Promise<string> => {
      return streamRequest('/ai/generate', { prompt, existingCode }, onChunk);
    },
    remixStream: (
      contentId: string,
      prompt: string,
      onChunk: (text: string) => void,
    ): Promise<string> => {
      return streamRequest('/ai/remix', { contentId, prompt }, onChunk);
    },
    generate: (prompt: string, existingCode?: string) =>
      request<{ success: boolean; data: { code: string; title?: string; description?: string; type?: string; coverEmoji?: string; coverGradient?: string } }>(
        '/ai/generate', { method: 'POST', body: JSON.stringify({ prompt, existingCode }), timeout: 90000 }
      ),
    remix: (contentId: string, prompt: string) =>
      request<{ success: boolean; data: { code: string; remixFromId: string } }>(
        '/ai/remix', { method: 'POST', body: JSON.stringify({ contentId, prompt }), timeout: 90000 }
      ),
  },

  getTemplates: async () => {
    const res = await request<{ success: boolean; data: PromptTemplateDTO[] }>('/templates');
    return res.data;
  },
};
