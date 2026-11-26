import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const CAPTCHA_TTL_MS = 5 * 60 * 1000;
const MAX_TRACKED_JTIS = 5000;

// In-memory single-use tracker so solved or rejected tokens cannot be replayed
const consumedCaptchaJtis = new Map();

const getCaptchaSecret = () =>
  process.env.JWT_SECRET || 'dev-only-change-me-access-secret';

const getRecaptchaKeys = () => ({
  siteKey: String(process.env.RECAPTCHA_SITE_KEY || '').trim(),
  secretKey: String(process.env.RECAPTCHA_SECRET_KEY || '').trim(),
});

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

const computeProofDigest = (jti, nonce, secret) =>
  crypto
    .createHmac('sha256', secret)
    .update(`human:${jti}:${nonce}`)
    .digest('hex');

export const generateCaptchaChallenge = () => {
  const { siteKey, secretKey } = getRecaptchaKeys();
  if (siteKey && secretKey) {
    return {
      mode: 'recaptcha',
      siteKey,
      expiresInSeconds: Math.floor(CAPTCHA_TTL_MS / 1000),
    };
  }

  const jti = crypto.randomUUID();
  const nonce = crypto.randomBytes(12).toString('hex');
  const secret = getCaptchaSecret();
  const proofDigest = computeProofDigest(jti, nonce, secret);
  const captchaToken = jwt.sign(
    { jti, proofDigest, issuedAt: Date.now(), tokenType: 'robot_captcha' },
    secret,
    { expiresIn: Math.floor(CAPTCHA_TTL_MS / 1000) }
  );

  return {
    mode: 'robot_check',
    captchaToken,
    challengeProof: proofDigest,
    nonce,
    expiresInSeconds: Math.floor(CAPTCHA_TTL_MS / 1000),
  };
};

export const verifyCaptchaChallenge = async ({ captchaToken, captchaAnswer }) => {
  const { siteKey, secretKey } = getRecaptchaKeys();

  // Mode A: Google reCAPTCHA v2 verification when keys are configured
  if (siteKey && secretKey) {
    const token = String(captchaToken || captchaAnswer || '').trim();
    if (!token) {
      return { valid: false, message: 'Please complete the "I\'m not a robot" verification' };
    }
    try {
      const resp = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ secret: secretKey, response: token }).toString(),
      });
      const data = await resp.json();
      if (!data?.success) {
        return { valid: false, message: 'reCAPTCHA verification failed. Please try again.' };
      }
      return { valid: true };
    } catch {
      return { valid: false, message: 'Unable to verify reCAPTCHA right now. Please try again.' };
    }
  }

  // Mode B: Signed single-use "I'm not a robot" server challenge
  if (!captchaToken || !String(captchaAnswer || '').trim()) {
    return { valid: false, message: 'Please check "I\'m not a robot" to continue' };
  }

  try {
    const secret = getCaptchaSecret();
    const decoded = jwt.verify(String(captchaToken).trim(), secret);
    if (decoded?.tokenType !== 'robot_captcha' || !decoded.jti || !decoded.proofDigest) {
      return { valid: false, message: 'Invalid "I\'m not a robot" verification token' };
    }

    const now = Date.now();
    pruneConsumedJtis(now);

    if (consumedCaptchaJtis.has(decoded.jti)) {
      return { valid: false, message: 'Verification expired or already used. Please verify again.' };
    }

    // Burn challenge on attempt to prevent replay attacks
    const expMs = decoded.exp ? decoded.exp * 1000 : now + CAPTCHA_TTL_MS;
    consumedCaptchaJtis.set(decoded.jti, expMs);

    const a = Buffer.from(String(decoded.proofDigest), 'utf8');
    const b = Buffer.from(String(captchaAnswer || '').trim(), 'utf8');
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return { valid: false, message: 'Robot verification mismatch. Please try again.' };
    }

    return { valid: true };
  } catch (err) {
    return {
      valid: false,
      message: err?.name === 'TokenExpiredError'
        ? 'Verification expired. Please check "I\'m not a robot" again.'
        : 'Invalid robot verification. Please try again.',
    };
  }
};

export const isTermsAccepted = (value) => value === true || value === 'true' || value === 1 || value === '1';
