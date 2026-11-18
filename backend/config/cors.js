// =============================================
// CORS CONFIGURATION & ORIGIN RESOLVER
// =============================================
import { getEnv } from './env.js';

export const normalizeOrigin = (url) => {
  if (!url || typeof url !== 'string') return '';
  return url.trim().replace(/\/+$/, '').toLowerCase();
};

export const DEFAULT_ALLOWED_ORIGINS = [
  'https://company.risewithmedia.com',
  'http://company.risewithmedia.com',
  'https://risewithmedia.com',
  'http://risewithmedia.com',
  'http://82.29.166.169:82',
  'http://82.29.166.169',
  'http://82.29.166.169:80',
  'http://82.29.166.169:5001',
  'http://82.29.166.169:5005',
  'http://localhost',
  'http://localhost:80',
  'http://localhost:82',
  'http://localhost:5173',
  'http://localhost:5175',
  'http://localhost:3000',
  'http://localhost:5001',
  'http://localhost:5005',
  'http://localhost:4175',
  'http://127.0.0.1:82',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5175',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5001',
  'http://127.0.0.1:5005',
  'http://127.0.0.1:4175',
];

export const RISE_WITH_MEDIA_PATTERN = /^https?:\/\/([a-z0-9-]+\.)*risewithmedia\.com(:[0-9]+)?$/i;
export const LOCALHOST_PATTERN = /^https?:\/\/(localhost|127\.0\.0\.1)(:[0-9]+)?$/i;
export const IP_ORIGIN_PATTERN = /^https?:\/\/(?:[0-9]{1,3}\.){3}[0-9]{1,3}(?::[0-9]+)?$/i;

export const getAllowedOrigins = () => {
  const env = getEnv();
  const origins = new Set(DEFAULT_ALLOWED_ORIGINS.map(normalizeOrigin));

  if (process.env.ALLOWED_ORIGINS) {
    process.env.ALLOWED_ORIGINS.split(',').forEach((o) => {
      const trimmed = normalizeOrigin(o);
      if (trimmed) origins.add(trimmed);
    });
  }

  if (env.clientUrl) {
    origins.add(normalizeOrigin(env.clientUrl));
  }
  if (process.env.CLIENT_URL) {
    origins.add(normalizeOrigin(process.env.CLIENT_URL));
  }

  return origins;
};

export const isOriginAllowed = (origin, req = null) => {
  // Requests without an Origin header (same-origin GET/navigation, curl, server-to-server, mobile native)
  if (!origin) return true;

  const normalized = normalizeOrigin(origin);
  const allowedSet = getAllowedOrigins();

  // If wildcards are explicitly allowed in env
  if (process.env.ALLOWED_ORIGINS === '*' || allowedSet.has('*')) {
    return true;
  }

  // 1. Explicitly whitelisted origin
  if (allowedSet.has(normalized)) {
    return true;
  }

  // 2. Subdomain wildcard matching for risewithmedia.com
  if (RISE_WITH_MEDIA_PATTERN.test(normalized)) {
    return true;
  }

  // 3. Localhost matching
  if (LOCALHOST_PATTERN.test(normalized)) {
    return true;
  }

  // 4. IP-based access (VPS direct IP access e.g., http://82.29.166.169:82)
  if (IP_ORIGIN_PATTERN.test(normalized)) {
    return true;
  }

  // 5. Same-origin / same-host matching based on request headers (Host or X-Forwarded-Host)
  if (req) {
    try {
      const originUrl = new URL(origin);
      const originHost = originUrl.host.toLowerCase();
      const originHostname = originUrl.hostname.toLowerCase();

      // Check Host header (exact or hostname match)
      const hostHeader = (req.headers && req.headers.host) || (req.get ? req.get('host') : null);
      if (hostHeader) {
        const cleanHostHeader = hostHeader.toLowerCase();
        const headerHostname = cleanHostHeader.split(':')[0];
        if (originHost === cleanHostHeader || originHostname === headerHostname) {
          return true;
        }
      }

      // Check X-Forwarded-Host (reverse proxy / load balancer)
      const forwardedHost = req.headers && req.headers['x-forwarded-host'];
      if (forwardedHost) {
        const firstForwarded = forwardedHost.split(',')[0].trim().toLowerCase();
        const forwardedHostname = firstForwarded.split(':')[0];
        if (originHost === firstForwarded || originHostname === forwardedHostname) {
          return true;
        }
      }
    } catch {
      // Invalid origin URL format
    }
  }

  return false;
};

export const createCorsError = (origin) => {
  const err = new Error(`CORS policy: Origin ${origin} not allowed`);
  err.statusCode = 403;
  err.isCors = true;
  return err;
};

export const corsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      return callback(null, true);
    }
    return callback(createCorsError(origin));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'X-Workspace-Id',
    'x-workspace-id',
    'Idempotency-Key',
    'idempotency-key',
  ],
  optionsSuccessStatus: 200,
};

export const corsOptionsDelegate = (req, callback) => {
  const origin = req.headers?.origin;
  if (isOriginAllowed(origin, req)) {
    callback(null, {
      ...corsOptions,
      origin: true,
    });
  } else {
    callback(createCorsError(origin));
  }
};
