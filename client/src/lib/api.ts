import type { AdminStats, Banner, ContactMessage, ContactPayload, MediaItem, Project } from '@/types';

const BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

/**
 * Files stored in R2 are served by the API at "/api/files/…". When the API runs on another domain
 * (VITE_API_URL), those paths need the API's address in front so the website can load them.
 */
export const fileUrl = (url: string | null) => (url && url.startsWith('/api/') ? `${BASE}${url}` : url);

const withFileUrls = <T extends { url?: string; image_url?: string | null }>(rows: T[]) =>
  rows.map((r) => ({
    ...r,
    ...(r.url !== undefined ? { url: fileUrl(r.url) as string } : {}),
    ...(r.image_url !== undefined ? { image_url: fileUrl(r.image_url) } : {}),
  }));

const bannerUrls = (b: Banner): Banner => ({ ...b, desktop_url: fileUrl(b.desktop_url) as string, mobile_url: fileUrl(b.mobile_url) });

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

/** PUTs a file straight into R2 using a signed link (XHR, because fetch can't report upload progress). */
function putToStorage(uploadUrl: string, file: File, onProgress: (loaded: number) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', uploadUrl);
    xhr.setRequestHeader('Content-Type', file.type);
    xhr.upload.onprogress = (e) => onProgress(e.loaded);
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new ApiError(`Upload to storage failed (${xhr.status}). Check the R2 CORS settings.`, xhr.status));
    xhr.onerror = () =>
      reject(new ApiError('Could not reach file storage — check your connection, or the R2 bucket CORS settings.', 0));
    xhr.send(file);
  });
}

/** Which form fields are files, the R2 folder they go in, and the name the API expects their key under. */
type FileFields = Record<string, { folder: string | ((f: File) => string); keyName: string }>;

/**
 * Sends an admin form: every file in it is uploaded straight to R2 first (with overall progress),
 * then the rest of the form + the new file keys are sent to the API as JSON.
 */
async function submitForm<T>(
  path: string,
  method: 'POST' | 'PATCH',
  form: FormData,
  token: string,
  fileFields: FileFields,
  onProgress?: (pct: number) => void
): Promise<T> {
  const body: Record<string, string> = {};
  const files: { field: string; file: File }[] = [];
  form.forEach((value, field) => {
    if (value instanceof File) {
      if (value.size > 0 && fileFields[field]) files.push({ field, file: value });
    } else body[field] = value;
  });

  const total = files.reduce((n, f) => n + f.file.size, 0) || 1;
  const loaded: Record<string, number> = {};
  const report = () => onProgress?.(Math.min(99, Math.round((Object.values(loaded).reduce((a, b) => a + b, 0) / total) * 100)));

  for (const { field, file } of files) {
    const spec = fileFields[field];
    const folder = typeof spec.folder === 'function' ? spec.folder(file) : spec.folder;
    const signed = await request<{ key: string; uploadUrl: string }>('/admin/uploads', {
      method: 'POST',
      body: { folder, contentType: file.type, size: file.size },
      token,
    });
    await putToStorage(signed.uploadUrl, file, (n) => {
      loaded[field] = n;
      report();
    });
    body[spec.keyName] = signed.key;
  }

  const result = await request<T>(path, { method, body, token });
  onProgress?.(100);
  return result;
}

const PROJECT_FILES: FileFields = { image: { folder: 'projects', keyName: 'image_key' } };
const MEDIA_FILES: FileFields = { file: { folder: (f) => (f.type.startsWith('video/') ? 'videos' : 'images'), keyName: 'file_key' } };
const BANNER_FILES: FileFields = {
  desktop: { folder: 'banners', keyName: 'desktop_key' },
  mobile: { folder: 'banners', keyName: 'mobile_key' },
};

export const api = {
  health: () => request<{ ok: boolean; database: boolean; storage: boolean }>('/health'),
  getProjects: () => request<Project[]>('/projects').then(withFileUrls),
  getMedia: () => request<MediaItem[]>('/media').then(withFileUrls),
  getBanners: () => request<Banner[]>('/banners').then((rows) => rows.map(bannerUrls)),
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

    createProject: (token: string, form: FormData) => submitForm<Project>('/admin/projects', 'POST', form, token, PROJECT_FILES),
    deleteProject: (token: string, id: Project['id']) =>
      request<{ ok: true }>(`/admin/projects/${id}`, { method: 'DELETE', token }),

    media: (token: string) => request<MediaItem[]>('/admin/media', { token }).then(withFileUrls),
    uploadMedia: (token: string, form: FormData, onProgress?: (pct: number) => void) =>
      submitForm<MediaItem>('/admin/media', 'POST', form, token, MEDIA_FILES, onProgress).then((m) => withFileUrls([m])[0]),
    renameMedia: (token: string, id: number, title: string) =>
      request<MediaItem>(`/admin/media/${id}`, { method: 'PATCH', body: { title }, token }).then((m) => withFileUrls([m])[0]),
    deleteMedia: (token: string, id: number) => request<{ ok: true }>(`/admin/media/${id}`, { method: 'DELETE', token }),

    banners: (token: string) => request<Banner[]>('/admin/banners', { token }).then((rows) => rows.map(bannerUrls)),
    createBanner: (token: string, form: FormData, onProgress?: (pct: number) => void) =>
      submitForm<Banner>('/admin/banners', 'POST', form, token, BANNER_FILES, onProgress).then(bannerUrls),
    updateBanner: (token: string, id: number, form: FormData, onProgress?: (pct: number) => void) =>
      submitForm<Banner>(`/admin/banners/${id}`, 'PATCH', form, token, BANNER_FILES, onProgress).then(bannerUrls),
    moveBanner: (token: string, id: number, direction: 'up' | 'down') =>
      request<Banner[]>(`/admin/banners/${id}/move`, { method: 'POST', body: { direction }, token }).then((rows) => rows.map(bannerUrls)),
    deleteBanner: (token: string, id: number) => request<{ ok: true }>(`/admin/banners/${id}`, { method: 'DELETE', token }),
  },
};
