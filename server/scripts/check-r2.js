// Checks the Cloudflare R2 connection: lists the bucket, then uploads, reads back and deletes a tiny test file.
import 'dotenv/config';
import { S3Client, ListObjectsV2Command, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET } = process.env;
const client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
});

const step = async (label, fn) => {
  try {
    const out = await fn();
    console.log(`✔ ${label}${out ? ` — ${out}` : ''}`);
    return true;
  } catch (err) {
    console.log(`✘ ${label} — ${err.name}: ${err.message}`);
    return false;
  }
};

const key = `_connection-test/${Date.now()}.txt`;
await step(`List bucket "${R2_BUCKET}"`, async () => {
  const r = await client.send(new ListObjectsV2Command({ Bucket: R2_BUCKET, MaxKeys: 5 }));
  return `${r.KeyCount ?? 0} object(s) found`;
});
const wrote = await step('Upload test file', async () => {
  await client.send(new PutObjectCommand({ Bucket: R2_BUCKET, Key: key, Body: 'ok', ContentType: 'text/plain' }));
});
if (wrote) {
  await step('Read test file back', async () => {
    const r = await client.send(new GetObjectCommand({ Bucket: R2_BUCKET, Key: key }));
    return `"${await r.Body.transformToString()}"`;
  });
  await step('Delete test file', async () => {
    await client.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: key }));
  });
}
