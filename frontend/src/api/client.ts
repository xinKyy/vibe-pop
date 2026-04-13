import { useAuthStore } from '../stores/authStore';

const BASE_URL = '/api';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = useAuthStore.getState().token;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `Request failed: ${res.status}`);
  }

  return data;
}

export const api = {
  auth: {
    sendCode: (email: string) =>
      request<{ success: boolean; data: { message: string } }>('/auth/send-code', { method: 'POST', body: JSON.stringify({ email }) }),
    login: (email: string, code: string) =>
      request<{ success: boolean; data: { user: any; token: string } }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, code }) }),
  },

  contents: {
    list: (params?: { page?: number; limit?: number; type?: string }) => {
      const query = new URLSearchParams();
      if (params?.page) query.set('page', String(params.page));
      if (params?.limit) query.set('limit', String(params.limit));
      if (params?.type) query.set('type', params.type);
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
    contents: (id: string, page = 1) =>
      request<{ success: boolean; data: { items: any[]; hasMore: boolean } }>(`/users/${id}/contents?page=${page}`),
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
    generate: (prompt: string, existingCode?: string) =>
      request<{ success: boolean; data: { code: string; title?: string; description?: string; type?: string; coverEmoji?: string; coverGradient?: string } }>(
        '/ai/generate', { method: 'POST', body: JSON.stringify({ prompt, existingCode }) }
      ),
    remix: (contentId: string, prompt: string) =>
      request<{ success: boolean; data: { code: string; remixFromId: string } }>(
        '/ai/remix', { method: 'POST', body: JSON.stringify({ contentId, prompt }) }
      ),
  },

  getTemplates: async () => {
    const res = await request<{ success: boolean; data: any[] }>('/templates');
    return res.data;
  },
};
