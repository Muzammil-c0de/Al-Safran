import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import crypto from 'node:crypto';

const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_PUBLIC_URL } = process.env;

export const r2Configured = Boolean(R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY && R2_BUCKET);

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

export function publicUrl(key) {
  return `${(R2_PUBLIC_URL || '').replace(/\/$/, '')}/${key}`;
}

/** Uploads an image or video buffer to R2 and returns its key and public URL. */
export async function uploadFile(file, folder) {
  if (!client) throw Object.assign(new Error('Storage is not configured (R2 variables missing).'), { status: 503 });
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

export async function deleteObject(key) {
  if (!client || !key) return;
  await client.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: key }));
}
