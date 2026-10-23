// Allows the website (and local dev) to upload files straight to the R2 bucket from the browser.
// Usage: node scripts/set-r2-cors.js
import 'dotenv/config';
import { S3Client, PutBucketCorsCommand, GetBucketCorsCommand } from '@aws-sdk/client-s3';

const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET } = process.env;
const client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
});

export const CORS_RULES = [
  {
    AllowedOrigins: [
      'https://alsafran.tech',
      'https://www.alsafran.tech',
      'https://al-safran.vercel.app',
      'http://localhost:5173',
    ],
    AllowedMethods: ['PUT', 'GET', 'HEAD'],
    AllowedHeaders: ['content-type'],
    ExposeHeaders: ['ETag'],
    MaxAgeSeconds: 3600,
  },
];

try {
  await client.send(new PutBucketCorsCommand({ Bucket: R2_BUCKET, CORSConfiguration: { CORSRules: CORS_RULES } }));
  const now = await client.send(new GetBucketCorsCommand({ Bucket: R2_BUCKET }));
  console.log('✔ CORS set on bucket', R2_BUCKET, JSON.stringify(now.CORSRules?.[0]?.AllowedOrigins));
} catch (err) {
  console.log(`✘ Could not set CORS (${err.name}: ${err.message})`);
  console.log('  Set it in Cloudflare: R2 → alsafran → Settings → CORS Policy, with this JSON:');
  console.log(
    JSON.stringify(
      CORS_RULES.map((r) => ({ AllowedOrigins: r.AllowedOrigins, AllowedMethods: r.AllowedMethods, AllowedHeaders: r.AllowedHeaders, ExposeHeaders: r.ExposeHeaders, MaxAgeSeconds: r.MaxAgeSeconds })),
      null,
      2
    )
  );
}
