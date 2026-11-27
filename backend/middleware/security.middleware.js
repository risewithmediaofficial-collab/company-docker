// =============================================
// SECURITY SHIELD, HPP, SANITIZATION & LOAD SHEDDING
// =============================================

const MAX_JSON_DEPTH = 12;
const MAX_QUERY_KEYS = 50;
const MAX_QUERY_VALUE_LEN = 1000;
const MAX_URL_LENGTH = 4096;

const DANGEROUS_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
const ALLOWED_ARRAY_QUERY_PARAMS = new Set([
  'tags',
  'statuses',
  'ids',
  'platforms',
  'roles',
  'departments',
  'fields',
]);

/**
 * Escape user input before building a MongoDB $regex query (prevents ReDoS attacks).
 */
export const escapeRegex = (input, maxLength = 120) => {
  if (input === null || input === undefined) return '';
  const trimmed = String(input).trim().slice(0, maxLength);
  return trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Recursively validate depth and strip prototype-pollution / Mongo operator keys.
 */
export const inspectAndSanitizeObject = (value, maxDepth = MAX_JSON_DEPTH, depth = 0) => {
  if (depth > maxDepth) {
    return { valid: false, reason: 'Payload exceeds maximum nesting depth', value: null };
  }
  if (value === null || typeof value !== 'object') {
    return { valid: true, value };
  }
  if (Array.isArray(value)) {
    const out = [];
    for (let i = 0; i < value.length; i++) {
      const child = inspectAndSanitizeObject(value[i], maxDepth, depth + 1);
      if (!child.valid) return child;
      out.push(child.value);
    }
    return { valid: true, value: out };
  }

  const sanitized = {};
  for (const key of Object.keys(value)) {
    if (DANGEROUS_KEYS.has(key)) continue;
    if (key.startsWith('$') || key.includes('.')) continue;
    const child = inspectAndSanitizeObject(value[key], maxDepth, depth + 1);
    if (!child.valid) return child;
    sanitized[key] = child.value;
  }
  return { valid: true, value: sanitized };
};

/**
 * HTTP Parameter Pollution (HPP) & Query Injection Guard.
 * Collapses unexpected duplicated array params (?role=a&role=b -> 'b')
 * and caps query complexity to block DoS & operator injection via query string.
 */
export const hppProtection = (req, res, next) => {
  if (!req.query || typeof req.query !== 'object') return next();

  const keys = Object.keys(req.query);
  if (keys.length > MAX_QUERY_KEYS) {
    return res.status(400).json({
      success: false,
      message: 'Too many query parameters supplied',
    });
  }

  for (const key of keys) {
    if (DANGEROUS_KEYS.has(key) || key.startsWith('$') || key.includes('.')) {
      delete req.query[key];
      continue;
    }

    const val = req.query[key];
    if (Array.isArray(val)) {
      if (!ALLOWED_ARRAY_QUERY_PARAMS.has(key)) {
        const last = val[val.length - 1];
        req.query[key] = typeof last === 'string' ? last.slice(0, MAX_QUERY_VALUE_LEN) : last;
      } else {
        req.query[key] = val
          .slice(0, 50)
          .map((item) => (typeof item === 'string' ? item.slice(0, MAX_QUERY_VALUE_LEN) : item))
          .filter((item) => item === null || typeof item !== 'object');
      }
    } else if (val && typeof val === 'object') {
      // Block nested MongoDB operator objects in query string like ?email[$ne]=x
      delete req.query[key];
    } else if (typeof val === 'string' && val.length > MAX_QUERY_VALUE_LEN) {
      req.query[key] = val.slice(0, MAX_QUERY_VALUE_LEN);
    }
  }

  next();
};

/**
 * Request Shield: blocks null-byte probes, path traversal, oversized URLs,
 * prototype pollution payloads, and adds defense-in-depth security headers.
 */
export const requestShield = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)');

  const url = req.originalUrl || req.url || '';
  if (url.length > MAX_URL_LENGTH) {
    return res.status(414).json({
      success: false,
      message: 'Request URI exceeds allowed maximum length',
    });
  }

  if (url.includes('\0') || /%00/i.test(url)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid null-byte sequence in request',
    });
  }

  let decodedPath = url;
  try {
    decodedPath = decodeURIComponent(url.split('?')[0]);
  } catch {
    return res.status(400).json({
      success: false,
      message: 'Malformed URL encoding in request path',
    });
  }

  if (/(^|[\\/])\.\.([\\/]|$)/.test(decodedPath)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid path traversal sequence rejected',
    });
  }

  if (req.body && typeof req.body === 'object') {
    const check = inspectAndSanitizeObject(req.body, MAX_JSON_DEPTH);
    if (!check.valid) {
      return res.status(400).json({
        success: false,
        message: check.reason || 'Malformed or overly nested request body',
      });
    }
    req.body = check.value;
  }

  next();
};

/**
 * Malformed JSON / Oversized Payload Error Handler
 */
export const payloadErrorHandler = (err, req, res, next) => {
  if (!err) return next();
  if (err.type === 'entity.too.large' || err.status === 413) {
    return res.status(413).json({
      success: false,
      message: 'Request payload exceeds maximum allowed size',
    });
  }
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'Invalid malformed JSON payload',
    });
  }
  return next(err);
};

/**
 * Adaptive Load Shedder + Event Loop Monitor
 * Prevents OOM crashes and total process freeze during heavy traffic spikes or DoS floods.
 */
export const createLoadShedder = (options = {}) => {
  const maxConcurrent = Math.max(20, Number(options.maxConcurrent ?? process.env.MAX_CONCURRENT_REQUESTS) || 500);
  const lagThresholdMs = Math.max(50, Number(options.lagThresholdMs ?? process.env.EVENT_LOOP_LAG_THRESHOLD_MS) || 350);

  let inFlight = 0;
  let shedCount = 0;
  let eventLoopLagMs = 0;
  let lastTick = Date.now();

  const monitorInterval = setInterval(() => {
    const now = Date.now();
    const drift = now - lastTick - 250;
    eventLoopLagMs = Math.max(0, drift);
    lastTick = now;
  }, 250);
  if (typeof monitorInterval.unref === 'function') {
    monitorInterval.unref();
  }

  const middleware = (req, res, next) => {
    // Never shed health or readiness probes
    if (req.path === '/api/health' || req.path === '/api/ready') {
      return next();
    }

    if (inFlight >= maxConcurrent || (eventLoopLagMs > lagThresholdMs && inFlight > Math.floor(maxConcurrent * 0.5))) {
      shedCount += 1;
      res.setHeader('Retry-After', '2');
      return res.status(503).json({
        success: false,
        code: 'SERVER_BUSY',
        message: 'Server is experiencing high traffic load. Please retry shortly.',
      });
    }

    inFlight += 1;
    let decremented = false;
    const release = () => {
      if (!decremented) {
        decremented = true;
        inFlight = Math.max(0, inFlight - 1);
      }
    };

    res.once('finish', release);
    res.once('close', release);
    next();
  };

  middleware.getMetrics = () => ({
    inFlight,
    maxConcurrent,
    shedCount,
    eventLoopLagMs,
  });

  middleware.stop = () => clearInterval(monitorInterval);

  return middleware;
};
