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

const EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/avif': 'avif' };
export const ALLOWED_IMAGE_TYPES = Object.keys(EXT);

export function publicUrl(key) {
  return `${(R2_PUBLIC_URL || '').replace(/\/$/, '')}/${key}`;
}

export async function uploadImage(file, folder = 'projects') {
  if (!client) throw Object.assign(new Error('Storage is not configured (R2 variables missing).'), { status: 503 });
  const key = `${folder}/${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${EXT[file.mimetype]}`;
  await client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      CacheControl: 'public, max-age=31536000, immutable',
    })
  );
  return { key, url: publicUrl(key) };
}

export async function deleteObject(key) {
  if (!client || !key) return;
  await client.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: key }));
}
