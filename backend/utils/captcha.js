import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const CAPTCHA_TTL_MS = 5 * 60 * 1000;
const MAX_TRACKED_JTIS = 5000;

// In-memory single-use tracker so solved or rejected tokens cannot be replayed
const consumedCaptchaJtis = new Map();

const getCaptchaSecret = () =>
  process.env.JWT_SECRET || 'dev-only-change-me-access-secret';

const CHALLENGE_CATEGORIES = [
  { key: 'camera', label: 'Camera' },
  { key: 'rocket', label: 'Rocket' },
  { key: 'briefcase', label: 'Briefcase' },
  { key: 'compass', label: 'Compass' },
  { key: 'bell', label: 'Bell' },
  { key: 'key', label: 'Key' },
];

const TILE_TONES = ['cyan', 'sky', 'emerald', 'amber', 'violet', 'rose'];
const TILE_TILTS = [-8, 6, -4, 9, -6, 4];

/**
 * Resolve configured external CAPTCHA provider in priority order:
 * 1. hCaptcha (`HCAPTCHA_SITE_KEY` + `HCAPTCHA_SECRET_KEY`)
 * 2. Cloudflare Turnstile (`TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET_KEY`)
 * 3. Google reCAPTCHA v2 (`RECAPTCHA_SITE_KEY` + `RECAPTCHA_SECRET_KEY`)
 */
export const getCaptchaProviderConfig = () => {
  const hSite = String(process.env.HCAPTCHA_SITE_KEY || '').trim();
  const hSecret = String(process.env.HCAPTCHA_SECRET_KEY || '').trim();
  if (hSite && hSecret) {
    return {
      mode: 'hcaptcha',
      label: 'hCaptcha',
      siteKey: hSite,
      secretKey: hSecret,
      verifyUrl: 'https://api.hcaptcha.com/siteverify',
    };
  }

  const tSite = String(process.env.TURNSTILE_SITE_KEY || '').trim();
  const tSecret = String(process.env.TURNSTILE_SECRET_KEY || '').trim();
  if (tSite && tSecret) {
    return {
      mode: 'turnstile',
      label: 'Cloudflare Turnstile',
      siteKey: tSite,
      secretKey: tSecret,
      verifyUrl: 'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    };
  }

  const rSite = String(process.env.RECAPTCHA_SITE_KEY || '').trim();
  const rSecret = String(process.env.RECAPTCHA_SECRET_KEY || '').trim();
  if (rSite && rSecret) {
    return {
      mode: 'recaptcha',
      label: 'reCAPTCHA',
      siteKey: rSite,
      secretKey: rSecret,
      verifyUrl: 'https://www.google.com/recaptcha/api/siteverify',
    };
  }

  return null;
};

const pruneConsumedJtis = (now = Date.now()) => {
  for (const [jti, expMs] of consumedCaptchaJtis.entries()) {
    if (expMs <= now) consumedCaptchaJtis.delete(jti);
  }
  while (consumedCaptchaJtis.size > MAX_TRACKED_JTIS) {
    const oldestKey = consumedCaptchaJtis.keys().next().value;
    if (!oldestKey) break;
    consumedCaptchaJtis.delete(oldestKey);
  }
};

const computeProofDigest = (jti, answerValue, secret) =>
  crypto
    .createHmac('sha256', secret)
    .update(`human:${jti}:${answerValue}`)
    .digest('hex');

const shuffleInPlace = (items) => {
  for (let i = items.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1);
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
};

const normalizeSelectionAnswer = (raw) => {
  const str = String(raw || '').trim();
  if (!str) return '';
  // Tile indices are comma-separated digits like "0,2,5"
  if (/^\d+(\s*,\s*\d+)*$/.test(str)) {
    const uniqueSorted = [...new Set(str.split(',').map((s) => Number(s.trim())))].sort((a, b) => a - b);
    return uniqueSorted.join(',');
  }
  return str;
};

const mintSignedCaptchaToken = (answerValue) => {
  const jti = crypto.randomUUID();
  const secret = getCaptchaSecret();
  const proofDigest = computeProofDigest(jti, answerValue, secret);
  const captchaToken = jwt.sign(
    { jti, proofDigest, issuedAt: Date.now(), tokenType: 'robot_captcha' },
    secret,
    { expiresIn: Math.floor(CAPTCHA_TTL_MS / 1000) }
  );
  return { jti, proofDigest, captchaToken };
};

export const generateCaptchaChallenge = () => {
  const provider = getCaptchaProviderConfig();
  if (provider) {
    return {
      mode: provider.mode,
      siteKey: provider.siteKey,
      expiresInSeconds: Math.floor(CAPTCHA_TTL_MS / 1000),
    };
  }

  // Built-in hCaptcha-style 6-tile interactive icon challenge
  const target = CHALLENGE_CATEGORIES[crypto.randomInt(0, CHALLENGE_CATEGORIES.length)];
  const distractors = CHALLENGE_CATEGORIES.filter((c) => c.key !== target.key);
  const targetCount = crypto.randomInt(2, 4); // 2 or 3 matching tiles out of 6

  const pool = [];
  for (let i = 0; i < targetCount; i++) {
    pool.push(target);
  }
  while (pool.length < 6) {
    pool.push(distractors[crypto.randomInt(0, distractors.length)]);
  }
  shuffleInPlace(pool);

  const matchingIndices = [];
  const tiles = pool.map((cat, idx) => {
    if (cat.key === target.key) matchingIndices.push(idx);
    return {
      id: idx,
      icon: cat.key,
      label: cat.label,
      bgTone: TILE_TONES[(idx + crypto.randomInt(0, TILE_TONES.length)) % TILE_TONES.length],
      tilt: TILE_TILTS[(idx + crypto.randomInt(0, TILE_TILTS.length)) % TILE_TILTS.length],
    };
  });

  const expectedSelection = matchingIndices.sort((a, b) => a - b).join(',');
  const { captchaToken } = mintSignedCaptchaToken(expectedSelection);

  return {
    mode: 'robot_check',
    captchaToken,
    challengePrompt: `Please click each image containing a ${target.label}`,
    targetLabel: target.label,
    targetIcon: target.key,
    tiles,
    expiresInSeconds: Math.floor(CAPTCHA_TTL_MS / 1000),
  };
};

export const verifyCaptchaChallenge = async ({ captchaToken, captchaAnswer }) => {
  const provider = getCaptchaProviderConfig();

  // External CAPTCHA provider verification (hCaptcha / Cloudflare Turnstile / Google reCAPTCHA)
  if (provider) {
    const rawAnswer = String(captchaAnswer || '').trim();
    const rawToken = String(captchaToken || '').trim();
    const providerTags = new Set(['hcaptcha', 'turnstile', 'recaptcha']);
    const token =
      rawAnswer && !providerTags.has(rawAnswer)
        ? rawAnswer
        : !providerTags.has(rawToken)
        ? rawToken
        : '';

    if (!token) {
      return { valid: false, message: `Please complete the ${provider.label} verification` };
    }
    try {
      const resp = await fetch(provider.verifyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ secret: provider.secretKey, response: token }).toString(),
      });
      const data = await resp.json();
      if (!data?.success) {
        return { valid: false, message: `${provider.label} verification failed. Please try again.` };
      }
      return { valid: true };
    } catch {
      return { valid: false, message: `Unable to verify ${provider.label} right now. Please try again.` };
    }
  }

  // Built-in signed single-use challenge verification
  const normalizedAnswer = normalizeSelectionAnswer(captchaAnswer);
  if (!captchaToken || !normalizedAnswer) {
    return { valid: false, message: 'Please complete the human verification challenge to continue' };
  }

  try {
    const secret = getCaptchaSecret();
    const decoded = jwt.verify(String(captchaToken).trim(), secret);
    if (decoded?.tokenType !== 'robot_captcha' || !decoded.jti || !decoded.proofDigest) {
      return { valid: false, message: 'Invalid human verification token' };
    }

    const now = Date.now();
    pruneConsumedJtis(now);

    if (consumedCaptchaJtis.has(decoded.jti)) {
      return { valid: false, message: 'Verification expired or already used. Please verify again.' };
    }

    // Burn challenge on attempt to prevent replay attacks
    const expMs = decoded.exp ? decoded.exp * 1000 : now + CAPTCHA_TTL_MS;
    consumedCaptchaJtis.set(decoded.jti, expMs);

    const expectedDigest = computeProofDigest(decoded.jti, normalizedAnswer, secret);
    const a = Buffer.from(String(decoded.proofDigest), 'utf8');
    const b = Buffer.from(expectedDigest, 'utf8');
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return { valid: false, message: 'Verification mismatch. Please try again.' };
    }

    return { valid: true };
  } catch (err) {
    return {
      valid: false,
      message:
        err?.name === 'TokenExpiredError'
          ? 'Verification expired. Please verify again.'
          : 'Invalid human verification. Please try again.',
    };
  }
};

/**
 * Interactive two-step verification helper:
 * Validates the user's tile selection, burns the tile challenge, and issues a single-use
 * pass token + proof for form submission (login / register).
 */
export const verifyInteractiveCaptchaStep = async ({ captchaToken, captchaAnswer }) => {
  const result = await verifyCaptchaChallenge({ captchaToken, captchaAnswer });
  if (!result.valid) {
    return { valid: false, message: result.message };
  }
  const passAnswer = crypto.randomBytes(16).toString('hex');
  const { captchaToken: passToken } = mintSignedCaptchaToken(passAnswer);
  return {
    valid: true,
    captchaToken: passToken,
    challengeProof: passAnswer,
    expiresInSeconds: Math.floor(CAPTCHA_TTL_MS / 1000),
  };
};

export const isTermsAccepted = (value) => value === true || value === 'true' || value === 1 || value === '1';
