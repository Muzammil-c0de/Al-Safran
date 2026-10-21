import type { ContactMessage, ContactPayload, Project } from '@/types';

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
  method?: 'GET' | 'POST' | 'DELETE';
  body?: unknown;
  token?: string;
}

async function request<T>(path: string, { method = 'GET', body, token }: RequestOptions = {}): Promise<T> {
  const isForm = body instanceof FormData;
  const headers: Record<string, string> = {};
  if (body !== undefined && !isForm) headers['Content-Type'] = 'application/json';
  if (token) headers['x-admin-token'] = token;

  const res = await fetch(`${BASE}/api${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : isForm ? (body as FormData) : JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.error ?? `Request failed (${res.status})`, res.status, data.errors);
  return data as T;
}

export const api = {
  getProjects: () => request<Project[]>('/projects'),
  sendContact: (payload: ContactPayload) => request<{ ok: true }>('/contact', { method: 'POST', body: payload }),

  admin: {
    verify: (token: string) => request<{ ok: true }>('/admin/verify', { token }),
    messages: (token: string) => request<ContactMessage[]>('/admin/messages', { token }),
    deleteMessage: (token: string, id: number) =>
      request<{ ok: true }>(`/admin/messages/${id}`, { method: 'DELETE', token }),
    createProject: (token: string, form: FormData) =>
      request<Project>('/admin/projects', { method: 'POST', body: form, token }),
    deleteProject: (token: string, id: Project['id']) =>
      request<{ ok: true }>(`/admin/projects/${id}`, { method: 'DELETE', token }),
  },
};
