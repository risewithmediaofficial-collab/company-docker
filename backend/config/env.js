import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverRoot = path.resolve(__dirname, '..');
const workspaceRoot = path.resolve(serverRoot, '..');

const loadLocalGoogleClientSecretJson = () => {
  for (const dir of [serverRoot, workspaceRoot]) {
    try {
      const files = fs.readdirSync(dir);
      const match = files.find((f) => /^client_secret_.*\.json$/i.test(f));
      if (!match) continue;
      const parsed = JSON.parse(fs.readFileSync(path.join(dir, match), 'utf8'));
      const web = parsed?.web || parsed?.installed || parsed;
      if (web?.client_id && web?.client_secret) {
        return {
          clientId: String(web.client_id).trim(),
          clientSecret: String(web.client_secret).trim(),
        };
      }
    } catch (_) {
      // Ignore missing or unreadable local OAuth credential file
    }
  }
  return null;
};

export const loadEnv = () => {
  dotenv.config({ path: path.join(serverRoot, '.env') });
  dotenv.config({ path: path.join(workspaceRoot, '.env') });

  process.env.NODE_ENV ||= 'development';
  process.env.PORT ||= '5001';
  const isProduction = process.env.NODE_ENV === 'production';
  process.env.CLIENT_URL ||= isProduction ? (process.env.CLIENT_URL || 'http://localhost') : 'http://localhost:5173';

  if (isProduction) {
    process.env.MONGO_URI ||= process.env.MONGODB_URI;
    if (!process.env.MONGO_URI && process.env.SKIP_DB_CONNECT !== 'true') {
      throw new Error('[FATAL CONFIG] Production startup aborted: MONGO_URI environment variable is required.');
    }
  } else {
    process.env.MONGO_URI ||= process.env.MONGODB_URI || 'mongodb://localhost:27017/company_crm';
  }

  // Insecure placeholders that MUST never run in production
  const insecurePlaceholders = [
    'replace-with-strong-production-secret',
    'dev-only-change-me-access-secret',
    'dev-super-secret-jwt-key',
    'replace-with-32-char-production-key',
    'rise-with-media-development-credential-key',
    'changeme_strong_jwt_secret_32chars',
    'changeme_strong_refresh_secret',
    'changeme_32byte_encryption_key!!',
    'YourVeryLongAndRandomJwtSecretKey1234567890',
    'AnotherVeryLongAndRandomRefreshSecretKey',
    'YourExact32ByteEncryptionKeyHere',
  ];

  if (isProduction) {
    if (!process.env.JWT_SECRET || insecurePlaceholders.includes(process.env.JWT_SECRET)) {
      throw new Error('[FATAL SECURITY] Production startup aborted: insecure placeholder or missing JWT_SECRET.');
    }
    if (!process.env.JWT_REFRESH_SECRET || insecurePlaceholders.includes(process.env.JWT_REFRESH_SECRET)) {
      throw new Error('[FATAL SECURITY] Production startup aborted: insecure placeholder or missing JWT_REFRESH_SECRET.');
    }
    if (!process.env.ENCRYPTION_KEY || insecurePlaceholders.includes(process.env.ENCRYPTION_KEY)) {
      throw new Error('[FATAL SECURITY] Production startup aborted: insecure placeholder or missing ENCRYPTION_KEY.');
    }
  }

  process.env.JWT_SECRET ||= 'dev-only-change-me-access-secret';
  process.env.JWT_REFRESH_SECRET ||= process.env.JWT_SECRET;
  process.env.JWT_EXPIRE ||= isProduction ? '15m' : '8h';
  process.env.JWT_REFRESH_EXPIRE ||= isProduction ? '7d' : '30d';
  process.env.ENCRYPTION_KEY ||= 'rise-with-media-development-credential-key';
  process.env.MAX_FILE_SIZE ||= String(10 * 1024 * 1024);
  process.env.PAGINATION_LIMIT ||= '20';
  process.env.UPLOAD_DIR ||= path.join(serverRoot, 'uploads');
  const isPlaceholderGoogleId = !process.env.GOOGLE_CLIENT_ID || /^your_google_/i.test(process.env.GOOGLE_CLIENT_ID.trim());
  const isPlaceholderGoogleSecret = !process.env.GOOGLE_CLIENT_SECRET || /^your_google_/i.test(process.env.GOOGLE_CLIENT_SECRET.trim());
  const localGoogleCreds = (isPlaceholderGoogleId || isPlaceholderGoogleSecret)
    ? loadLocalGoogleClientSecretJson()
    : null;
  process.env.GOOGLE_CLIENT_ID = isPlaceholderGoogleId ? (localGoogleCreds?.clientId || '') : process.env.GOOGLE_CLIENT_ID.trim();
  process.env.GOOGLE_CLIENT_SECRET = isPlaceholderGoogleSecret ? (localGoogleCreds?.clientSecret || '') : process.env.GOOGLE_CLIENT_SECRET.trim();
  process.env.GOOGLE_REDIRECT_URI ||= '';
};

export const getEnv = () => {
  return {
    nodeEnv: process.env.NODE_ENV,
    isProduction: process.env.NODE_ENV === 'production',
    port: Number(process.env.PORT) || 5001,
    clientUrl: process.env.CLIENT_URL,
    mongoUri: process.env.MONGO_URI,
    mongoDbName: process.env.MONGO_DB_NAME || undefined,
    jwtSecret: process.env.JWT_SECRET,
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
    jwtExpire: process.env.JWT_EXPIRE,
    jwtRefreshExpire: process.env.JWT_REFRESH_EXPIRE,
    encryptionKey: process.env.ENCRYPTION_KEY,
    uploadDir: process.env.UPLOAD_DIR,
    maxFileSize: Number(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024,
    paginationLimit: Number(process.env.PAGINATION_LIMIT) || 20,
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    googleRedirectUri: process.env.GOOGLE_REDIRECT_URI,
  };
};
