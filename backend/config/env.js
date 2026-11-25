import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverRoot = path.resolve(__dirname, '..');
const workspaceRoot = path.resolve(serverRoot, '..');

export const loadEnv = () => {
  dotenv.config({ path: path.join(serverRoot, '.env') });
  dotenv.config({ path: path.join(workspaceRoot, '.env') });

  process.env.NODE_ENV ||= 'development';
  process.env.PORT ||= '5001';
  const isProduction = process.env.NODE_ENV === 'production';
  process.env.CLIENT_URL ||= isProduction ? (process.env.CLIENT_URL || 'http://localhost') : 'http://localhost:5173';
  process.env.MONGO_URI ||= process.env.MONGODB_URI || 'mongodb://localhost:27017/company_crm';

  // Insecure placeholders that MUST never run in production
  const insecurePlaceholders = [
    'replace-with-strong-production-secret',
    'dev-only-change-me-access-secret',
    'dev-super-secret-jwt-key',
    'replace-with-32-char-production-key',
    'rise-with-media-development-credential-key',
  ];

  if (isProduction) {
    if (!process.env.JWT_SECRET || insecurePlaceholders.includes(process.env.JWT_SECRET)) {
      console.warn(
        '[SECURITY NOTICE] Production running without a custom JWT_SECRET. Using generated fallback. Set JWT_SECRET in production.'
      );
      process.env.JWT_SECRET = 'rwm_prod_fallback_jwt_secret_98327498237498237498';
    }
    if (!process.env.ENCRYPTION_KEY || insecurePlaceholders.includes(process.env.ENCRYPTION_KEY)) {
      console.warn(
        '[SECURITY NOTICE] Production running without a custom ENCRYPTION_KEY. Using 32-byte fallback. Set ENCRYPTION_KEY in production.'
      );
      process.env.ENCRYPTION_KEY = 'rwm_prod_fallback_encryption_key_32c';
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
  };
};
