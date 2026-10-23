import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
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

/** Folders the admin panel may upload into. */
export const UPLOAD_FOLDERS = ['images', 'videos', 'projects', 'banners'];

/**
 * Direct upload: gives the browser a short-lived link to PUT one file straight into R2
 * (so large videos never pass through the API — needed on Vercel, which caps request size).
 */
export async function createUploadUrl({ folder, contentType, size }) {
  if (!client) throw Object.assign(new Error('Storage is not configured (R2 API token missing).'), { status: 503 });
  const type = FILE_TYPES[contentType];
  if (!type) throw Object.assign(new Error('Allowed files: JPG, PNG, WEBP, AVIF images or MP4, WEBM, MOV videos.'), { status: 400 });
  if (!UPLOAD_FOLDERS.includes(folder)) throw Object.assign(new Error('Invalid upload folder.'), { status: 400 });
  const max = type.kind === 'video' ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
  if (!Number.isFinite(size) || size <= 0 || size > max) {
    throw Object.assign(new Error(type.kind === 'video' ? 'Videos must be under 100 MB.' : 'Images must be under 10 MB.'), { status: 400 });
  }
  const key = `${folder}/${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${type.ext}`;
  const uploadUrl = await getSignedUrl(client, new PutObjectCommand({ Bucket: R2_BUCKET, Key: key, ContentType: contentType }), {
    expiresIn: 15 * 60,
  });
  return { key, uploadUrl, url: publicUrl(key), kind: type.kind };
}

/**
 * Confirms a directly-uploaded file really exists in R2 (in an allowed folder) and returns its details.
 * `folders` limits which folders are accepted for this record.
 */
export async function verifyUpload(key, folders) {
  if (!client) throw Object.assign(new Error('Storage is not configured.'), { status: 503 });
  const ok = typeof key === 'string' && /^[a-z]+\/[\w.-]+$/.test(key) && folders.includes(key.split('/')[0]);
  if (!ok) throw Object.assign(new Error('Invalid file reference.'), { status: 400 });
  try {
    const head = await client.send(new HeadObjectCommand({ Bucket: R2_BUCKET, Key: key }));
    const type = FILE_TYPES[head.ContentType];
    if (!type) throw Object.assign(new Error('Uploaded file type is not allowed.'), { status: 400 });
    return { key, url: publicUrl(key), mime: head.ContentType, size: Number(head.ContentLength || 0), kind: type.kind };
  } catch (err) {
    if (err.status) throw err;
    throw Object.assign(new Error('The uploaded file was not found — please upload it again.'), { status: 400 });
  }
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
