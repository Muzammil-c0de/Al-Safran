import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import crypto from 'node:crypto';

const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_PUBLIC_URL } = process.env;

const placeholder = (v) => !v || /^your_/.test(v);

/** True once the account, bucket and API token are filled in (not the example values). */
export const r2Configured = ![R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET].some(placeholder);

// S3-compatible API endpoint: https://<account id>.r2.cloudflarestorage.com
const client = r2Configured
  ? new S3Client({
      region: 'auto',
      endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
    })
  : null;

/** Allowed uploads: mime type → file extension and kind. */
export const FILE_TYPES = {
  'image/jpeg': { ext: 'jpg', kind: 'image' },
  'image/png': { ext: 'png', kind: 'image' },
  'image/webp': { ext: 'webp', kind: 'image' },
  'image/avif': { ext: 'avif', kind: 'image' },
  'video/mp4': { ext: 'mp4', kind: 'video' },
  'video/webm': { ext: 'webm', kind: 'video' },
  'video/quicktime': { ext: 'mov', kind: 'video' },
};
export const ALLOWED_IMAGE_TYPES = Object.keys(FILE_TYPES).filter((t) => FILE_TYPES[t].kind === 'image');
export const ALLOWED_MEDIA_TYPES = Object.keys(FILE_TYPES);

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB
export const MAX_VIDEO_BYTES = 100 * 1024 * 1024; // 100 MB

/**
 * URL the website uses to show a stored file: the bucket's public URL if one is set,
 * otherwise this server's own /api/files route (which streams it from R2).
 */
export function publicUrl(key) {
  const base = (R2_PUBLIC_URL || '').trim().replace(/\/$/, '');
  return base ? `${base}/${key}` : `/api/files/${key}`;
}

/** Uploads an image or video buffer to R2 and returns its key and URL. */
export async function uploadFile(file, folder) {
  if (!client) throw Object.assign(new Error('Storage is not configured (R2 API token missing in server/.env).'), { status: 503 });
  const type = FILE_TYPES[file.mimetype];
  if (!type) throw Object.assign(new Error('This file type is not allowed.'), { status: 400 });
  const key = `${folder}/${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${type.ext}`;
  await client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      CacheControl: 'public, max-age=31536000, immutable',
    })
  );
  return { key, url: publicUrl(key), kind: type.kind };
}

/** Back-compat helper for project images. */
export const uploadImage = (file, folder = 'projects') => uploadFile(file, folder);

/** Reads a file from R2 (optionally a byte range, for video seeking). */
export async function getObject(key, range) {
  if (!client) throw Object.assign(new Error('Storage is not configured.'), { status: 503 });
  return client.send(new GetObjectCommand({ Bucket: R2_BUCKET, Key: key, Range: range }));
}

export async function deleteObject(key) {
  if (!client || !key) return;
  await client.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: key }));
}
