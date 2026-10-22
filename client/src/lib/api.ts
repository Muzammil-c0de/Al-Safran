import type { AdminStats, ContactMessage, ContactPayload, MediaItem, Project } from '@/types';

const BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public fieldErrors?: Record<string, string>
  ) {
    super(message);
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  token?: string;
}

async function request<T>(path: string, { method = 'GET', body, token }: RequestOptions = {}): Promise<T> {
  const isForm = body instanceof FormData;
  const headers: Record<string, string> = {};
  if (body !== undefined && !isForm) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE}/api${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : isForm ? (body as FormData) : JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.error ?? `Request failed (${res.status})`, res.status, data.errors);
  return data as T;
}

/**
 * Upload with progress (fetch can't report upload progress, so this uses XHR).
 * Used for images/videos in the admin media library.
 */
function upload<T>(path: string, form: FormData, token: string, onProgress?: (pct: number) => void): Promise<T> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${BASE}/api${path}`);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      let data: { error?: string } = {};
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        /* non-JSON response */
      }
      if (xhr.status >= 200 && xhr.status < 300) resolve(data as T);
      else reject(new ApiError(data.error ?? `Upload failed (${xhr.status})`, xhr.status));
    };
    xhr.onerror = () => reject(new ApiError('Network error — check your connection and try again.', 0));
    xhr.send(form);
  });
}

export const api = {
  health: () => request<{ ok: boolean; database: boolean; storage: boolean }>('/health'),
  getProjects: () => request<Project[]>('/projects'),
  getMedia: () => request<MediaItem[]>('/media'),
  sendContact: (payload: ContactPayload) => request<{ ok: true }>('/contact', { method: 'POST', body: payload }),

  admin: {
    login: (username: string, password: string) =>
      request<{ token: string; username: string }>('/admin/login', { method: 'POST', body: { username, password } }),
    me: (token: string) => request<{ username: string; fixed: boolean }>('/admin/me', { token }),
    changePassword: (token: string, current: string, next: string) =>
      request<{ ok: true }>('/admin/password', { method: 'POST', body: { current, next }, token }),
    stats: (token: string) => request<AdminStats>('/admin/stats', { token }),

    messages: (token: string) => request<ContactMessage[]>('/admin/messages', { token }),
    markMessage: (token: string, id: number, isRead: boolean) =>
      request<{ ok: true }>(`/admin/messages/${id}`, { method: 'PATCH', body: { is_read: isRead }, token }),
    deleteMessage: (token: string, id: number) => request<{ ok: true }>(`/admin/messages/${id}`, { method: 'DELETE', token }),

    createProject: (token: string, form: FormData) => request<Project>('/admin/projects', { method: 'POST', body: form, token }),
    deleteProject: (token: string, id: Project['id']) =>
      request<{ ok: true }>(`/admin/projects/${id}`, { method: 'DELETE', token }),

    media: (token: string) => request<MediaItem[]>('/admin/media', { token }),
    uploadMedia: (token: string, form: FormData, onProgress?: (pct: number) => void) =>
      upload<MediaItem>('/admin/media', form, token, onProgress),
    renameMedia: (token: string, id: number, title: string) =>
      request<MediaItem>(`/admin/media/${id}`, { method: 'PATCH', body: { title }, token }),
    deleteMedia: (token: string, id: number) => request<{ ok: true }>(`/admin/media/${id}`, { method: 'DELETE', token }),
  },
};
