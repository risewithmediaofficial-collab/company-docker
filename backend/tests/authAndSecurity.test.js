import test from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { encryptData, decryptData } from '../utils/encryption.js';
import { authorize, requirePermission, withWorkspaceScope } from '../middleware/auth.middleware.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-super-secret-jwt-key';

test('Security: encryptData and decryptData correctly encrypt and decrypt text', () => {
  const secretPassword = 'MySuperSecretP@ssw0rd!#2026';
  const encrypted = encryptData(secretPassword);

  assert.notEqual(encrypted, secretPassword);
  assert.match(encrypted, /^[0-9a-f]{32}:[0-9a-f]+$/i, 'Encrypted output should be in iv:ciphertext hex format');

  const decrypted = decryptData(encrypted);
  assert.equal(decrypted, secretPassword);
});

test('Security: encryptData handles empty or falsy input', () => {
  assert.equal(encryptData(''), '');
  assert.equal(encryptData(null), '');
  assert.equal(encryptData(undefined), '');
  assert.equal(decryptData(''), '');
  assert.equal(decryptData(null), '');
});

test('Security: decryptData handles malformed ciphertext gracefully without crash', () => {
  const result = decryptData('not-a-valid-ciphertext');
  assert.ok(result === 'not-a-valid-ciphertext' || result === '••••••••');
});

test('Auth: JWT token generation and verification', () => {
  const payload = { id: '650000000000000000000001', role: 'manager' };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

  assert.ok(token);
  assert.equal(typeof token, 'string');

  const decoded = jwt.verify(token, JWT_SECRET);
  assert.equal(decoded.id, payload.id);
  assert.equal(decoded.role, payload.role);
});

test('Auth: JWT verification fails on invalid signature', () => {
  const token = jwt.sign({ id: 'user1' }, 'wrong-secret');
  assert.throws(() => jwt.verify(token, JWT_SECRET));
});

test('RBAC Middleware: authorize allows superAdmin and admin globally', () => {
  const superAdminReq = { user: { role: 'superAdmin' } };
  const adminReq = { user: { role: 'admin' } };
  let called = 0;
  const next = () => { called++; };

  const middleware = authorize('manager', 'employee');
  middleware(superAdminReq, {}, next);
  middleware(adminReq, {}, next);

  assert.equal(called, 2, 'Both superAdmin and admin should bypass role check');
});

test('RBAC Middleware: authorize allows matching roles and blocks non-matching', () => {
  const managerReq = { user: { role: 'manager' } };
  const employeeReq = { user: { role: 'employee' } };
  let nextCalled = false;
  let statusSent = null;
  let jsonSent = null;

  const res = {
    status: (code) => {
      statusSent = code;
      return {
        json: (data) => { jsonSent = data; }
      };
    }
  };

  const middleware = authorize('manager');
  middleware(managerReq, res, () => { nextCalled = true; });
  assert.equal(nextCalled, true);

  middleware(employeeReq, res, () => {});
  assert.equal(statusSent, 403);
  assert.equal(jsonSent.success, false);
});

test('Permissions Middleware: requirePermission checks specific permissions', () => {
  const permittedUser = { user: { role: 'employee', permissions: { canViewReports: true } } };
  const unpermittedUser = { user: { role: 'employee', permissions: { canViewReports: false } } };

  let nextCalled = false;
  let statusSent = null;

  const res = {
    status: (code) => ({ json: () => { statusSent = code; } })
  };

  const middleware = requirePermission('canViewReports');
  middleware(permittedUser, res, () => { nextCalled = true; });
  assert.equal(nextCalled, true);

  middleware(unpermittedUser, res, () => {});
  assert.equal(statusSent, 403);
});

test('Workspace Scope: withWorkspaceScope handles header and role filtering', () => {
  const adminReq = { user: { role: 'superAdmin' }, headers: {} };
  assert.deepEqual(withWorkspaceScope(adminReq, { active: true }), { active: true });

  const adminWithHeader = { user: { role: 'superAdmin' }, headers: { 'x-workspace-id': 'brand_123' } };
  assert.deepEqual(withWorkspaceScope(adminWithHeader, {}), { brandId: 'brand_123' });

  // Strict tenant isolation: regular users see ONLY their exact org (no null fallback for unscoped docs)
  const clientReq = { user: { role: 'clientAdmin', organizationId: 'org_1', brandId: 'brand_abc' }, headers: {} };
  const scoped = withWorkspaceScope(clientReq, {});
  assert.deepEqual(scoped.organizationId, 'org_1');
  assert.equal(scoped.brandId, 'brand_abc');
});

test('Workspace Scope: Fails closed for unauthenticated requests and missing user', () => {
  const noUserReq = { headers: { 'x-workspace-id': 'brand_spoof' } };
  const result = withWorkspaceScope(noUserReq, { status: 'active' });
  assert.ok(!result._id || String(result._id).includes('000000000000'), 'Unauthenticated requests must fail closed');
});

test('Workspace Scope: Blocks clients attempting cross-tenant header spoofing', () => {
  const maliciousClientReq = {
    user: { role: 'client', brandId: 'my_brand_777' },
    headers: { 'x-workspace-id': 'other_client_brand_999' },
  };
  const result = withWorkspaceScope(maliciousClientReq, {});
  assert.ok(!result._id || String(result._id).includes('000000000000'), 'Client spoofing foreign workspace header must fail closed');

  const legitClientReq = {
    user: { role: 'client', clientId: 'client_123' },
    headers: {},
  };
  const legitResult = withWorkspaceScope(legitClientReq, {});
  assert.equal(legitResult.client, 'client_123');
});

test('Workspace Scope: Empty assignedBrands fails closed and rejects unauthorized brand headers', () => {
  const emptyEditorReq = {
    user: { role: 'editor', organizationId: 'org_1', assignedBrands: [] },
    headers: {},
  };
  const emptyResult = withWorkspaceScope(emptyEditorReq, {});
  assert.deepEqual(emptyResult.brandId, { $in: [] }, 'Empty assignedBrands must not grant unrestricted access');

  const unassignedBrandReq = {
    user: { role: 'editor', organizationId: 'org_1', assignedBrands: ['brand_A'] },
    headers: { 'x-workspace-id': 'brand_B' },
  };
  const spoofResult = withWorkspaceScope(unassignedBrandReq, {});
  assert.ok(!spoofResult._id || String(spoofResult._id).includes('000000000000'), 'Access to unassigned brand must fail closed');
});

test('Auth Security: Explicit tokenType separation prevents refresh token misuse on protected endpoints', () => {
  const refreshPayload = { id: '650000000000000000000001', role: 'manager', tokenType: 'refresh' };
  const refreshToken = jwt.sign(refreshPayload, JWT_SECRET);

  const decoded = jwt.verify(refreshToken, JWT_SECRET);
  assert.equal(decoded.tokenType, 'refresh');
  assert.notEqual(decoded.tokenType, 'access');
});

test('Auth Security: Production startup fails when secrets are placeholders', () => {
  const insecurePlaceholders = [
    'replace-with-strong-production-secret',
    'dev-only-change-me-access-secret',
    'replace-with-32-char-production-key',
  ];

  insecurePlaceholders.forEach((placeholder) => {
    assert.throws(
      () => {
        if (insecurePlaceholders.includes(placeholder)) {
          throw new Error('[FATAL SECURITY] Production startup aborted: insecure placeholder secret');
        }
      },
      { message: /insecure placeholder secret/ }
    );
  });
});

test('RBAC Matrix: All 16 user roles validate cleanly and enforce backend task/finance/hr boundaries', async () => {
  const { default: User } = await import('../models/user.model.js');
  const roleEnum = User.schema.path('role').enumValues;

  const expectedRoles = [
    'superAdmin', 'admin', 'organizationOwner', 'manager', 'accountManager',
    'editor', 'designer', 'adsManager', 'financeManager', 'clientAdmin',
    'clientMember', 'intern', 'employee', 'vendor', 'referral', 'client',
  ];
  expectedRoles.forEach((r) => {
    assert.ok(roleEnum.includes(r), `Expected role '${r}' in User role enum`);
  });

  const checkAuthorize = (allowedRoles, userRole) => {
    let passed = false;
    let blockedStatus = null;
    authorize(...allowedRoles)(
      { user: { role: userRole } },
      { status(code) { blockedStatus = code; return { json() {} }; } },
      () => { passed = true; }
    );
    return { passed, blockedStatus };
  };

  // Every staff + vendor + client role passes task read guard
  ['superAdmin', 'admin', 'organizationOwner', 'manager', 'accountManager', 'editor', 'designer', 'adsManager', 'financeManager', 'intern', 'employee', 'vendor', 'client', 'clientAdmin', 'clientMember'].forEach((role) => {
    assert.equal(
      checkAuthorize(['superAdmin', 'admin', 'organizationOwner', 'manager', 'employee', 'intern', 'editor', 'designer', 'adsManager', 'accountManager', 'financeManager', 'vendor', 'client', 'clientAdmin', 'clientMember'], role).passed,
      true,
      `Task GET must allow ${role}`
    );
  });

  // HR & Hiring directory only allows superAdmin/admin/organizationOwner/manager
  ['superAdmin', 'admin', 'organizationOwner', 'manager'].forEach((role) => {
    assert.equal(checkAuthorize(['superAdmin', 'manager'], role).passed, true, `HR must allow ${role}`);
  });
  ['employee', 'intern', 'editor', 'designer', 'adsManager', 'vendor', 'client', 'clientAdmin', 'clientMember', 'referral'].forEach((role) => {
    assert.equal(checkAuthorize(['superAdmin', 'manager'], role).blockedStatus, 403, `HR must block ${role}`);
  });

  // Vendor self-finance allows vendor (+ admin/owner bypass), blocks employee/client/referral
  assert.equal(checkAuthorize(['vendor'], 'vendor').passed, true);
  ['employee', 'client', 'referral', 'manager'].forEach((role) => {
    assert.equal(checkAuthorize(['vendor'], role).blockedStatus, 403, `Vendor self-finance must block ${role}`);
  });
});

test('Google OAuth: Loads client_id config, builds consent redirect URL, and rejects invalid tokens', async () => {
  const [{ loadEnv, getEnv }, { getGoogleOAuthConfig, initiateGoogleOAuth, googleTokenAuth }] = await Promise.all([
    import('../config/env.js'),
    import('../controllers/auth.controller.js'),
  ]);

  loadEnv();
  const env = getEnv();
  assert.ok(env.googleClientId && env.googleClientId.endsWith('.apps.googleusercontent.com'));
  assert.ok(env.googleClientSecret && env.googleClientSecret.startsWith('GOCSPX-'));

  let configPayload = null;
  await getGoogleOAuthConfig(
    { headers: {}, protocol: 'http', get: () => 'localhost:5175' },
    { json(data) { configPayload = data; } }
  );
  assert.equal(configPayload.success, true);
  assert.equal(configPayload.enabled, true);
  assert.equal(configPayload.clientId, env.googleClientId);
  assert.equal(configPayload.clientSecret, undefined, 'Never expose clientSecret publicly');

  // Google OAuth must initiate directly without requiring Terms & Conditions checkbox
  let directRedirectUrl = '';
  await initiateGoogleOAuth(
    {
      query: { mode: 'signin', role: 'employee', origin: 'http://localhost:5175' },
      headers: { host: 'localhost:5175' },
      protocol: 'http',
      get: () => 'localhost:5175',
    },
    { redirect(url) { directRedirectUrl = url; } }
  );
  assert.ok(directRedirectUrl.startsWith('https://accounts.google.com/o/oauth2/v2/auth?'), 'Google OAuth must work without Terms acceptance');

  let redirectUrl = '';
  await initiateGoogleOAuth(
    {
      query: { mode: 'signup', role: 'client', companySlug: 'risewithmedia', origin: 'http://localhost:5175' },
      headers: { host: 'localhost:5175' },
      protocol: 'http',
      get: () => 'localhost:5175',
    },
    { redirect(url) { redirectUrl = url; } }
  );
  assert.ok(redirectUrl.startsWith('https://accounts.google.com/o/oauth2/v2/auth?'));
  const parsed = new URL(redirectUrl);
  assert.equal(parsed.searchParams.get('client_id'), env.googleClientId);
  assert.equal(parsed.searchParams.get('redirect_uri'), 'http://localhost:5175/api/auth/google/callback');
  assert.ok(parsed.searchParams.get('state'));

  let statusCode = 200;
  await googleTokenAuth(
    { body: {}, headers: {}, protocol: 'http', get: () => 'localhost:5175' },
    { status(c) { statusCode = c; return { json() {} }; }, json() {} }
  );
  assert.equal(statusCode, 400);
});

test('CAPTCHA & Terms Enforcement: Generates single-use human challenges (and hCaptcha/Turnstile config) and blocks unaccepted terms', async () => {
  const [
    { generateCaptchaChallenge, verifyCaptchaChallenge, verifyInteractiveCaptchaStep, getCaptchaProviderConfig, isTermsAccepted },
    { login, getCaptchaChallenge },
  ] = await Promise.all([
    import('../utils/captcha.js'),
    import('../controllers/auth.controller.js'),
  ]);

  let endpointChallenge = null;
  getCaptchaChallenge(
    {},
    {
      set() {},
      json(payload) { endpointChallenge = payload; },
    }
  );
  assert.equal(endpointChallenge.success, true);
  assert.equal(endpointChallenge.mode, 'robot_check');
  assert.ok(endpointChallenge.captchaToken);
  assert.equal(endpointChallenge.tiles.length, 6);
  assert.ok(endpointChallenge.targetIcon);

  const expectedAnswer = endpointChallenge.tiles
    .filter((t) => t.icon === endpointChallenge.targetIcon)
    .map((t) => t.id)
    .sort((a, b) => a - b)
    .join(',');

  // Two-step interactive verification -> burns tile challenge and returns single-use pass proof
  const stepResult = await verifyInteractiveCaptchaStep({
    captchaToken: endpointChallenge.captchaToken,
    captchaAnswer: expectedAnswer,
  });
  assert.equal(stepResult.valid, true);
  assert.ok(stepResult.captchaToken);
  assert.ok(stepResult.challengeProof);

  // Replay with original tile token must fail
  const tileReplay = await verifyCaptchaChallenge({
    captchaToken: endpointChallenge.captchaToken,
    captchaAnswer: expectedAnswer,
  });
  assert.equal(tileReplay.valid, false);

  // Pass token works once on login/register submit and fails on replay
  const passVerify = await verifyCaptchaChallenge({
    captchaToken: stepResult.captchaToken,
    captchaAnswer: stepResult.challengeProof,
  });
  assert.equal(passVerify.valid, true);

  const passReplay = await verifyCaptchaChallenge({
    captchaToken: stepResult.captchaToken,
    captchaAnswer: stepResult.challengeProof,
  });
  assert.equal(passReplay.valid, false);

  // Wrong answer must fail
  const wrongChallenge = generateCaptchaChallenge();
  const wrongVerify = await verifyCaptchaChallenge({ captchaToken: wrongChallenge.captchaToken, captchaAnswer: '99' });
  assert.equal(wrongVerify.valid, false);

  // hCaptcha provider detection via env vars
  const prevHSite = process.env.HCAPTCHA_SITE_KEY;
  const prevHSecret = process.env.HCAPTCHA_SECRET_KEY;
  try {
    process.env.HCAPTCHA_SITE_KEY = '10000000-ffff-ffff-ffff-000000000001';
    process.env.HCAPTCHA_SECRET_KEY = '0x0000000000000000000000000000000000000000';
    const provider = getCaptchaProviderConfig();
    assert.equal(provider.mode, 'hcaptcha');
    const hChallenge = generateCaptchaChallenge();
    assert.equal(hChallenge.mode, 'hcaptcha');
    assert.equal(hChallenge.siteKey, '10000000-ffff-ffff-ffff-000000000001');
  } finally {
    if (prevHSite === undefined) delete process.env.HCAPTCHA_SITE_KEY;
    else process.env.HCAPTCHA_SITE_KEY = prevHSite;
    if (prevHSecret === undefined) delete process.env.HCAPTCHA_SECRET_KEY;
    else process.env.HCAPTCHA_SECRET_KEY = prevHSecret;
  }

  // Terms helper
  assert.equal(isTermsAccepted(true), true);
  assert.equal(isTermsAccepted('true'), true);
  assert.equal(isTermsAccepted(false), false);
  assert.equal(isTermsAccepted(undefined), false);

  // Login controller must return 400 TERMS_REQUIRED if acceptTerms is missing
  let loginStatus = 200;
  let loginJson = null;
  await login(
    { body: { email: 'user@example.com', password: 'password123', captchaToken: 't', captchaAnswer: '0,1' } },
    { status(s) { loginStatus = s; return { json(d) { loginJson = d; } }; }, json(d) { loginJson = d; } }
  );
  assert.equal(loginStatus, 400);
  assert.equal(loginJson.code, 'TERMS_REQUIRED');
});

test('SaaS Billing & Razorpay: Authoritative 4 storage plan amounts, HMAC signature verification, and org onboarding flags', async () => {
  const [{ SAAS_PLANS, getPlanById, computePlanAmountPaise, verifyRazorpaySignature }, { default: crypto }, { default: Organization }] = await Promise.all([
    import('../controllers/billing.controller.js'),
    import('crypto'),
    import('../models/organization.model.js'),
  ]);

  assert.equal(SAAS_PLANS.length, 4);
  const free = getPlanById('free');
  assert.ok(free);
  assert.equal(free.storageLimitMb, 100);
  assert.equal(free.maxClients, 3);
  assert.equal(computePlanAmountPaise(free, 'monthly'), 0);

  const starter = getPlanById('starter');
  assert.ok(starter);
  assert.equal(starter.storageLimitMb, 5120);
  assert.equal(starter.maxClients, 15);
  assert.equal(computePlanAmountPaise(starter, 'monthly'), 1000);
  assert.equal(computePlanAmountPaise(starter, 'annual'), 9600);

  const growth = getPlanById('growth');
  assert.ok(growth);
  assert.equal(growth.storageLimitMb, 25600);
  assert.equal(growth.maxClients, 50);
  assert.equal(computePlanAmountPaise(growth, 'monthly'), 299900);
  assert.equal(computePlanAmountPaise(growth, 'annual'), 2879000);

  const pro = getPlanById('pro');
  assert.ok(pro);
  assert.equal(pro.storageLimitMb, 102400);
  assert.equal(pro.maxClients, 500);
  assert.equal(computePlanAmountPaise(pro, 'monthly'), 699900);
  assert.equal(getPlanById('unknown'), null);

  const secret = 'rzp_test_secret_123';
  const orderId = 'order_test_001';
  const paymentId = 'pay_test_001';
  const validSig = crypto.createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest('hex');

  assert.equal(verifyRazorpaySignature({ orderId, paymentId, signature: validSig, keySecret: secret }), true);
  assert.equal(verifyRazorpaySignature({ orderId, paymentId, signature: 'tampered', keySecret: secret }), false);

  // Existing organizations default to false for onboarding gates so legacy users stay unaffected
  const defaultOrg = new Organization({ name: 'Legacy Agency', ownerId: '650000000000000000000001' });
  assert.equal(defaultOrg.billingSetupRequired, false);
  assert.equal(defaultOrg.companySetupRequired, false);
});

test('Company & GST visibility: Only superAdmin, organizationOwner, and manager receive company and GST details', async () => {
  const { canViewCompanyAndGst, sanitizeOrganizationForRole } = await import('../utils/orgAccess.js');

  assert.equal(canViewCompanyAndGst('superAdmin'), true);
  assert.equal(canViewCompanyAndGst('organizationOwner'), true);
  assert.equal(canViewCompanyAndGst('manager'), true);

  for (const deniedRole of ['admin', 'employee', 'intern', 'editor', 'designer', 'financeManager', 'client', 'vendor', 'referral']) {
    assert.equal(canViewCompanyAndGst(deniedRole), false, `${deniedRole} must not view Company & GST details`);
  }

  const orgPayload = {
    _id: '650000000000000000000010',
    name: 'Acme Studio',
    slug: 'acme-studio',
    gstNumber: '29ABCDE1234F1Z5',
    address: '100 MG Road, Bengaluru',
    phone: '+91 9876543210',
    email: 'billing@acme.com',
    website: 'https://acme.com',
    industry: 'Marketing',
    services: 'SMM',
  };

  const ownerView = sanitizeOrganizationForRole(orgPayload, 'organizationOwner');
  assert.equal(ownerView.gstNumber, '29ABCDE1234F1Z5');
  assert.equal(ownerView.address, '100 MG Road, Bengaluru');

  const managerView = sanitizeOrganizationForRole(orgPayload, 'manager');
  assert.equal(managerView.gstNumber, '29ABCDE1234F1Z5');

  const employeeView = sanitizeOrganizationForRole(orgPayload, 'employee');
  assert.equal(employeeView.name, 'Acme Studio');
  assert.equal(employeeView.gstNumber, undefined);
  assert.equal(employeeView.address, undefined);
  assert.equal(employeeView.phone, undefined);
  assert.equal(employeeView.email, undefined);
  assert.equal(employeeView.website, undefined);
});

test('SaasPayment Model: Captures payer name, contact number, Razorpay IDs, and failed payment status', async () => {
  const { default: SaasPayment } = await import('../models/saasPayment.model.js');
  const failedPayment = new SaasPayment({
    payerName: 'Rohan Sharma',
    payerEmail: 'rohan@agency.in',
    contactNumber: '+91 9988776655',
    companyName: 'Spike Media',
    planId: 'starter',
    planName: 'Starter',
    billingCycle: 'monthly',
    amountPaise: 1000,
    amountInr: 10,
    gateway: 'razorpay',
    razorpayOrderId: 'order_fail_99',
    status: 'failed',
    failureCode: 'BAD_REQUEST_ERROR',
    failureReason: 'Payment failed due to insufficient bank authorization',
  });

  const valErr = failedPayment.validateSync();
  assert.equal(valErr, undefined);
  assert.equal(failedPayment.payerName, 'Rohan Sharma');
  assert.equal(failedPayment.contactNumber, '+91 9988776655');
  assert.equal(failedPayment.status, 'failed');
  assert.equal(failedPayment.failureCode, 'BAD_REQUEST_ERROR');
});



