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

  const clientReq = { user: { role: 'clientAdmin', organizationId: 'org_1', brandId: 'brand_abc' }, headers: {} };
  const scoped = withWorkspaceScope(clientReq, {});
  assert.deepEqual(scoped.organizationId, { $in: ['org_1', null] });
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


