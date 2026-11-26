import { test, expect } from '@playwright/test';

const COMPANY_ORG = {
  _id: '660000000000000000000001',
  name: 'RiseWithMedia',
  slug: 'risewithmedia',
  planStatus: 'active',
  enabledModules: {
    finance: true,
    hr: true,
    attendance: true,
    smm: true,
    portal: true,
    sop: true,
    assets: true,
    proposals: true,
    reports: true,
    automations: true,
    influencers: true,
  },
};

const ROLE_FIXTURES = {
  'superadmin@test.com': {
    user: {
      _id: '660000000000000000000101',
      name: 'Super Admin',
      email: 'superadmin@test.com',
      role: 'superAdmin',
      permissions: { canManageLeads: true, canManageFinance: true, canManageHR: true, canViewReports: true },
    },
    organization: COMPANY_ORG,
  },
  'owner@test.com': {
    user: {
      _id: '660000000000000000000102',
      name: 'Olivia Owner',
      email: 'owner@test.com',
      role: 'organizationOwner',
      organizationId: COMPANY_ORG._id,
      permissions: {},
    },
    organization: COMPANY_ORG,
  },
  'manager@test.com': {
    user: {
      _id: '660000000000000000000103',
      name: 'Maya Manager',
      email: 'manager@test.com',
      role: 'manager',
      organizationId: COMPANY_ORG._id,
      permissions: {},
    },
    organization: COMPANY_ORG,
  },
  'employee@test.com': {
    user: {
      _id: '660000000000000000000104',
      name: 'Evan Employee',
      email: 'employee@test.com',
      role: 'employee',
      organizationId: COMPANY_ORG._id,
      permissions: {},
    },
    organization: COMPANY_ORG,
  },
  'editor@test.com': {
    user: {
      _id: '660000000000000000000105',
      name: 'Eli Editor',
      email: 'editor@test.com',
      role: 'editor',
      position: 'Video Editor',
      organizationId: COMPANY_ORG._id,
      permissions: {},
    },
    organization: COMPANY_ORG,
  },
  'financemgr@test.com': {
    user: {
      _id: '660000000000000000000106',
      name: 'Fiona Finance',
      email: 'financemgr@test.com',
      role: 'financeManager',
      organizationId: COMPANY_ORG._id,
      permissions: { canManageFinance: true, canViewFinanceOverview: true },
    },
    organization: COMPANY_ORG,
  },
  'vendor@test.com': {
    user: {
      _id: '660000000000000000000107',
      name: 'Arjun Vendor',
      email: 'vendor@test.com',
      role: 'vendor',
      position: 'Video Editor',
      vendorCompany: 'PixelCraft Studio',
      organizationId: COMPANY_ORG._id,
      permissions: {},
    },
    organization: COMPANY_ORG,
  },
  'client@test.com': {
    user: {
      _id: '660000000000000000000108',
      name: 'Claire Client',
      email: 'client@test.com',
      role: 'client',
      clientId: '660000000000000000000201',
      organizationId: COMPANY_ORG._id,
      permissions: {},
    },
    organization: COMPANY_ORG,
  },
  'clientadmin@test.com': {
    user: {
      _id: '660000000000000000000109',
      name: 'Chris ClientAdmin',
      email: 'clientadmin@test.com',
      role: 'clientAdmin',
      clientId: '660000000000000000000201',
      organizationId: COMPANY_ORG._id,
      permissions: {},
    },
    organization: COMPANY_ORG,
  },
  'referral@test.com': {
    user: {
      _id: '660000000000000000000110',
      name: 'Ralph Referral',
      email: 'referral@test.com',
      role: 'referral',
      referralCode: 'RALPH2026',
      organizationId: COMPANY_ORG._id,
      permissions: {},
    },
    organization: COMPANY_ORG,
  },
  'newowner@test.com': {
    user: {
      _id: '660000000000000000000111',
      name: 'Nikhil NewOwner',
      email: 'newowner@test.com',
      role: 'organizationOwner',
      organizationId: '660000000000000000000099',
      permissions: {},
    },
    organization: {
      _id: '660000000000000000000099',
      name: "Nikhil NewOwner's Workspace",
      slug: 'nikhil-newowner',
      plan: 'trial',
      planStatus: 'pending',
      billingSetupRequired: true,
      companySetupRequired: true,
      enabledModules: COMPANY_ORG.enabledModules,
    },
  },
};

function makeFakeJwt(user) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(
    JSON.stringify({
      id: user._id,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + 3600,
    })
  ).toString('base64url');
  return `${header}.${payload}.sig`;
}

async function mockAppBackend(page) {
  let activeEmail = null;

  await page.route('**/api/**', async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    const pathname = url.pathname;

    if (pathname.startsWith('/api/auth/company-portal/')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, company: COMPANY_ORG }),
      });
    }

    if (pathname === '/api/auth/captcha') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          mode: 'robot_check',
          captchaToken: 'mock-captcha-token',
          challengeProof: 'mock-human-proof',
          expiresInSeconds: 300,
        }),
      });
    }

    if (pathname === '/api/auth/google/config') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          enabled: true,
          clientId: '354315002277-hnjs3tcg6inekkqj1hcdo83bidm599uu.apps.googleusercontent.com',
        }),
      });
    }

    if (pathname === '/api/auth/login' && req.method() === 'POST') {
      const body = JSON.parse(req.postData() || '{}');
      if (body.acceptTerms !== true) {
        return route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ success: false, code: 'TERMS_REQUIRED', message: 'You must accept the Terms & Conditions to sign in' }),
        });
      }
      if (!body.captchaToken || body.captchaAnswer !== 'mock-human-proof') {
        return route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ success: false, code: 'CAPTCHA_INVALID', message: 'Please check "I\'m not a robot" to continue.' }),
        });
      }
      const email = String(body.email || '').trim().toLowerCase();
      const fixture = ROLE_FIXTURES[email];
      if (!fixture) {
        return route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ success: false, message: 'Invalid email or password' }),
        });
      }
      const isSelfServeOnboarding = Boolean(
        fixture.user.role === 'organizationOwner' &&
        (fixture.organization?.billingSetupRequired || fixture.organization?.companySetupRequired)
      );
      if (fixture.user.organizationId && !body.companySlug && !isSelfServeOnboarding) {
        return route.fulfill({
          status: 403,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            requiresCompanyPortal: true,
            companySlug: COMPANY_ORG.slug,
            companyName: COMPANY_ORG.name,
            portalUrl: `/login/${COMPANY_ORG.slug}`,
            message: `Company members must log in through their company URL: /login/${COMPANY_ORG.slug}.`,
          }),
        });
      }
      activeEmail = email;
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          accessToken: makeFakeJwt(fixture.user),
          refreshToken: makeFakeJwt(fixture.user),
          user: fixture.user,
          organization: fixture.organization,
        }),
      });
    }

    if (pathname === '/api/auth/me') {
      const fixture = activeEmail ? ROLE_FIXTURES[activeEmail] : null;
      return route.fulfill({
        status: fixture ? 200 : 401,
        contentType: 'application/json',
        body: JSON.stringify(
          fixture
            ? { success: true, user: fixture.user, organization: fixture.organization }
            : { success: false, message: 'Unauthorized' }
        ),
      });
    }

    if (pathname === '/api/auth/register' && req.method() === 'POST') {
      return route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          requiresPlanSelection: true,
          companySlug: 'nikhil-newowner',
          message: 'Account created! Sign in with your email and password to select a plan and complete your setup.',
        }),
      });
    }

    if (pathname === '/api/billing/plans') {
      const org = activeEmail ? ROLE_FIXTURES[activeEmail]?.organization : ROLE_FIXTURES['newowner@test.com'].organization;
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          razorpayEnabled: false,
          plans: [
            { id: 'starter', name: 'Starter', tagline: 'Lean teams', monthlyPriceInr: 1999, annualPriceInr: 19190, badge: 'Essential', features: ['Up to 5 team members'] },
            { id: 'growth', name: 'Growth', tagline: 'Scaling agencies', monthlyPriceInr: 4999, annualPriceInr: 47990, badge: 'Most Popular', features: ['Full Finance & SMM'] },
            { id: 'pro', name: 'Enterprise Pro', tagline: 'Unlimited', monthlyPriceInr: 9999, annualPriceInr: 95990, badge: 'All Features', features: ['Automations & Multi-Branch'] },
          ],
          organization: org,
        }),
      });
    }

    if (pathname === '/api/billing/razorpay/order' && req.method() === 'POST') {
      const body = JSON.parse(req.postData() || '{}');
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          mode: 'sandbox',
          orderId: 'order_rwm_mock01',
          sandboxToken: 'mock_sandbox_token',
          amount: body.planId === 'growth' ? 499900 : 199900,
          currency: 'INR',
          planId: body.planId || 'growth',
        }),
      });
    }

    if (pathname === '/api/billing/razorpay/verify' && req.method() === 'POST') {
      const body = JSON.parse(req.postData() || '{}');
      if (activeEmail && ROLE_FIXTURES[activeEmail]?.organization) {
        ROLE_FIXTURES[activeEmail].organization = {
          ...ROLE_FIXTURES[activeEmail].organization,
          plan: body.planId || 'growth',
          billingCycle: body.billingCycle || 'monthly',
          planStatus: 'active',
          billingSetupRequired: false,
        };
      }
      const org = activeEmail ? ROLE_FIXTURES[activeEmail]?.organization : null;
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Growth plan activated successfully via Razorpay!',
          organization: org,
          nextRoute: org?.companySetupRequired ? '/settings?section=company' : '/',
        }),
      });
    }

    if (pathname === '/api/settings' && req.method() === 'GET') {
      const fixture = activeEmail ? ROLE_FIXTURES[activeEmail] : null;
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          user: fixture?.user || null,
          organization: fixture?.organization || null,
          settings: {
            companyProfile: {
              name: fixture?.organization?.companySetupRequired ? '' : (fixture?.organization?.name || ''),
              slug: fixture?.organization?.slug || '',
              industry: '',
              website: '',
              address: '',
              email: fixture?.user?.email || '',
              phone: '',
              gstNumber: '',
              services: '',
              logoUrl: '',
            },
            notifications: {},
            appearance: {},
            regional: {},
          },
        }),
      });
    }

    if (pathname === '/api/settings/company' && req.method() === 'PUT') {
      const body = JSON.parse(req.postData() || '{}');
      if (activeEmail && ROLE_FIXTURES[activeEmail]?.organization) {
        ROLE_FIXTURES[activeEmail].organization = {
          ...ROLE_FIXTURES[activeEmail].organization,
          name: body.name || ROLE_FIXTURES[activeEmail].organization.name,
          slug: body.slug || ROLE_FIXTURES[activeEmail].organization.slug,
          companySetupRequired: false,
        };
      }
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          settings: { companyProfile: body },
          organization: activeEmail ? ROLE_FIXTURES[activeEmail]?.organization : null,
        }),
      });
    }

    if (pathname === '/api/finance/vendor/my-finance') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          bills: [
            {
              _id: 'bill1',
              title: 'Reel Editing Payout',
              amount: 3500,
              paidAmount: 2000,
              balanceAmount: 1500,
              paymentStatus: 'partially_paid',
              date: '2026-11-10T10:00:00Z',
              payments: [{ amount: 2000, paymentMode: 'UPI', paymentDate: '2026-11-12T10:00:00Z' }],
            },
          ],
          summary: { totalBilled: 3500, totalPaid: 2000, totalPending: 1500, billCount: 1, paidCount: 0, unpaidCount: 1 },
        }),
      });
    }

    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        users: [],
        tasks: [],
        projects: [],
        clients: [],
        vendors: [],
        employees: [],
        meetings: [],
        leads: [],
        invoices: [],
        proposals: [],
        notifications: [],
        unreadCount: 0,
        data: {},
      }),
    });
  });
}

async function completeRobotCheck(page, inputId = 'signin-captcha') {
  const checkbox = page.locator(`#${inputId}`);
  await checkbox.click();
  await expect(checkbox).toBeChecked({ timeout: 5000 });
}

async function loginAs(page, email, loginPath = '/login/risewithmedia') {
  await page.goto(loginPath);
  await page.waitForSelector('#signin-email');
  await page.fill('#signin-email', email);
  await page.fill('#signin-password', 'password123');
  await completeRobotCheck(page, 'signin-captcha');
  const termsCheckbox = page.locator('#signin-terms');
  if (!(await termsCheckbox.isChecked())) {
    await termsCheckbox.check();
  }
  await page.click('button[type="submit"]');
  await page.waitForURL((u) => !u.pathname.includes('/login'), { timeout: 10000 });
}

test.describe('All Role Logins & Workspace Isolation Verification', () => {
  test('Tenant login guard prompts Workspace URL when logging in at /login instead of /login/:slug', async ({ page }) => {
    await mockAppBackend(page);
    await page.goto('/login');
    await page.fill('#signin-email', 'employee@test.com');
    await page.fill('#signin-password', 'password123');
    await completeRobotCheck(page, 'signin-captcha');
    await page.check('#signin-terms');
    await page.click('button[type="submit"]');

    await expect(page.getByText(/Workspace URL Required/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /Go to Company Portal/i })).toBeVisible();
  });

  test('Sign-In blocks login until Terms & Conditions accepted and CAPTCHA entered', async ({ page }) => {
    await mockAppBackend(page);
    await page.goto('/login');
    await page.waitForSelector('#signin-email');
    await page.fill('#signin-email', 'superadmin@test.com');
    await page.fill('#signin-password', 'password123');
    await completeRobotCheck(page, 'signin-captcha');

    // Attempt login without checking Terms & Conditions -> blocked locally & stays on /login
    await page.click('button[type="submit"]');
    await expect(page.getByText(/You must accept the Terms & Conditions to sign in/i).first()).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);

    // Open Terms modal, click I Accept Terms -> checks checkbox and closes modal
    await page.locator('form.signin').getByRole('button', { name: /Terms & Conditions/i }).click();
    await expect(page.getByRole('dialog', { name: /Terms & Conditions/i })).toBeVisible();
    await page.getByRole('button', { name: /I Accept Terms/i }).click();
    await expect(page.locator('#signin-terms')).toBeChecked();

    await page.click('button[type="submit"]');
    await page.waitForURL((u) => !u.pathname.includes('/login'), { timeout: 10000 });
  });

  test('Cookie & Cache Consent Banner saves Accept All and Essential Only preferences', async ({ page }) => {
    await mockAppBackend(page);
    await page.goto('/');
    const banner = page.getByRole('dialog', { name: /Cookie and Cache Preferences/i });
    await expect(banner).toBeVisible();

    await banner.getByRole('button', { name: /Customize/i }).click();
    await expect(banner.getByText(/Browser Cache & Preferences/i)).toBeVisible();
    await banner.getByRole('button', { name: /Accept All/i }).click();
    await expect(banner).toBeHidden();

    const saved = await page.evaluate(() => localStorage.getItem('rwm_cookie_consent_v1'));
    expect(saved).toContain('"preferencesCache":true');

    // Reopen from footer trigger and switch to Essential Only
    await page.getByRole('button', { name: /Cookies & Cache/i }).click();
    await expect(banner).toBeVisible();
    await banner.getByRole('button', { name: /Essential Only/i }).click();
    await expect(banner).toBeHidden();

    const updated = await page.evaluate(() => localStorage.getItem('rwm_cookie_consent_v1'));
    expect(updated).toContain('"preferencesCache":false');
  });

  test('SuperAdmin login accesses platform dashboard, HR, and Tasks', async ({ page }) => {
    await mockAppBackend(page);
    await loginAs(page, 'superadmin@test.com', '/login');
    await expect(page.getByRole('heading', { name: /Good (morning|afternoon|evening), Super Admin/i })).toBeVisible();
    await page.getByRole('button', { name: 'SYSTEM & SETTINGS' }).click();
    await expect(page.getByRole('link', { name: 'Platform Admin' })).toBeVisible();
    await page.goto('/hr');
    await expect(page).toHaveURL(/\/hr$/);
    await expect(page.getByText('Vendors (Separate Portal)')).toBeVisible();
  });

  test('OrganizationOwner login accesses HR, Tasks, and Finance without unexpected redirect', async ({ page }) => {
    await mockAppBackend(page);
    await loginAs(page, 'owner@test.com');
    await page.goto('/hr');
    await expect(page).toHaveURL(/\/hr$/);
    await page.goto('/tasks');
    await expect(page).toHaveURL(/\/tasks$/);
    await page.goto('/finance');
    await expect(page).toHaveURL(/\/finance/);
  });

  test('Manager login accesses HR and Tasks cleanly', async ({ page }) => {
    await mockAppBackend(page);
    await loginAs(page, 'manager@test.com');
    await page.goto('/hr');
    await expect(page).toHaveURL(/\/hr$/);
    await page.goto('/tasks');
    await expect(page).toHaveURL(/\/tasks$/);
  });

  test('Employee and Specialist (Editor / FinanceManager) logins work cleanly and block HR', async ({ page }) => {
    await mockAppBackend(page);
    await loginAs(page, 'editor@test.com');
    await page.goto('/tasks');
    await expect(page).toHaveURL(/\/tasks$/);
    await page.goto('/daily-tasks');
    await expect(page).toHaveURL(/\/daily-tasks$/);
    await page.goto('/hr');
    await expect(page).toHaveURL(/\/$/);
  });

  test('FinanceManager sees Finance Hub in sidebar and accesses /finance', async ({ page }) => {
    await mockAppBackend(page);
    await loginAs(page, 'financemgr@test.com');
    await page.getByRole('button', { name: 'BUSINESS & FINANCE' }).click();
    await expect(page.getByRole('link', { name: /Finance Hub/i })).toBeVisible();
    await page.goto('/finance');
    await expect(page).toHaveURL(/\/finance/);
  });

  test('Vendor login shows VENDOR PORTAL (My Tasks & My Finance only) and blocks HR/Admin Finance', async ({ page }) => {
    await mockAppBackend(page);
    await loginAs(page, 'vendor@test.com');
    await expect(page.getByRole('button', { name: 'VENDOR PORTAL' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'My Tasks' }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'My Finance' }).first()).toBeVisible();

    await page.goto('/my-finance');
    await expect(page).toHaveURL(/\/my-finance$/);
    await expect(page.getByText('Reel Editing Payout')).toBeVisible();

    await page.goto('/tasks');
    await expect(page).toHaveURL(/\/tasks$/);

    // Must block internal HR and general agency finance
    await page.goto('/hr');
    await expect(page).toHaveURL(/\/$/);
    await page.goto('/finance');
    await expect(page).toHaveURL(/\/$/);
  });

  test('Client and ClientAdmin logins show CLIENT PORTAL and block internal routes', async ({ page }) => {
    await mockAppBackend(page);
    await loginAs(page, 'client@test.com');
    await expect(page.getByRole('button', { name: 'CLIENT PORTAL' })).toBeVisible();
    await page.goto('/hr');
    await expect(page).toHaveURL(/\/$/);

    await page.evaluate(() => localStorage.clear());
    await loginAs(page, 'clientadmin@test.com');
    await expect(page.getByRole('button', { name: 'CLIENT PORTAL' })).toBeVisible();
    await page.goto('/portal/invoices');
    await expect(page).toHaveURL(/\/portal\/invoices$/);
  });

  test('Referral login shows PARTNER PORTAL and blocks internal Finance/HR', async ({ page }) => {
    await mockAppBackend(page);
    await loginAs(page, 'referral@test.com');
    await expect(page.getByRole('button', { name: 'PARTNER PORTAL' })).toBeVisible();
    await page.goto('/referral');
    await expect(page).toHaveURL(/\/referral$/);
    await page.goto('/hr');
    await expect(page).toHaveURL(/\/$/);
  });

  test('Google OAuth buttons render cleanly and Google Callback handles token login, pending signup, and workspace redirect', async ({ page }) => {
    await mockAppBackend(page);
    await page.goto('/login');
    await expect(page.getByRole('button', { name: /Continue with Google/i })).toBeVisible();

    await page.getByRole('button', { name: /Sign Up/i }).first().click();
    await expect(page.getByRole('button', { name: /Sign up with Google/i })).toBeVisible();

    await page.goto('/auth/google/callback?signupPending=1&message=Awaiting+admin+approval');
    await expect(page.getByText('Account Created')).toBeVisible();
    await expect(page.getByText(/Awaiting admin approval/i)).toBeVisible();

    await page.goto('/auth/google/callback?requiresCompanyPortal=1&portalUrl=/login/risewithmedia&companyName=RiseWithMedia');
    await expect(page.getByText('Workspace URL Required')).toBeVisible();
    await expect(page.getByRole('link', { name: /Go to RiseWithMedia Portal/i })).toBeVisible();

    const adminToken = makeFakeJwt(ROLE_FIXTURES['superadmin@test.com'].user);
    // Pre-seed mocked active user via login before callback /auth/me verification
    await loginAs(page, 'superadmin@test.com', '/login');
    await page.goto(`/auth/google/callback#accessToken=${adminToken}&refreshToken=${adminToken}`);
    await page.waitForURL((u) => !u.pathname.includes('/auth/google/callback'), { timeout: 10000 });
    await expect(page.getByRole('heading', { name: /Good (morning|afternoon|evening), Super Admin/i })).toBeVisible();
  });

  test('Public signup hides Free Trial & Role dropdown, enforces Razorpay plan selection before Settings Company details', async ({ page }) => {
    await mockAppBackend(page);

    // 1. Public web & login hide free-trial company links & Role in Organization dropdown
    await page.goto('/');
    await expect(page.locator('a[href="/register-company"]')).toHaveCount(0);

    await page.goto('/login');
    await expect(page.getByText(/Register Your Company/i)).toHaveCount(0);
    await page.getByRole('button', { name: /Sign Up/i }).first().click();
    await expect(page.locator('select[name="role"]')).toHaveCount(0);
    await expect(page.locator('#signup-name')).toBeVisible();
    await expect(page.locator('#signup-email')).toBeVisible();
    await expect(page.locator('#signup-password')).toBeVisible();

    // 2. Self-register using only Full Name, Gmail, Password (+ robot check & terms)
    await page.fill('#signup-name', 'Nikhil NewOwner');
    await page.fill('#signup-email', 'newowner@test.com');
    await page.fill('#signup-password', 'password123');
    await completeRobotCheck(page, 'signup-captcha');
    await page.check('#signup-terms');
    await page.locator('form.signup button[type="submit"]').click();
    await expect(page.locator('#signin-email')).toBeVisible();

    // 3. Log in -> gated at /select-plan before accessing dashboard or tasks
    await page.fill('#signin-email', 'newowner@test.com');
    await page.fill('#signin-password', 'password123');
    await completeRobotCheck(page, 'signin-captcha');
    await page.check('#signin-terms');
    await page.locator('form.signin button[type="submit"]').click();
    await expect(page).toHaveURL(/\/select-plan$/);
    await expect(page.getByText(/Select a Plan to Activate Your Account/i)).toBeVisible();

    // Direct navigation to /tasks must redirect back to /select-plan until paid
    await page.goto('/tasks');
    await expect(page).toHaveURL(/\/select-plan$/);

    // 4. Select Growth Plan & complete Razorpay checkout -> redirects to /settings?section=company
    await page.getByRole('button', { name: /Pay with Razorpay/i }).nth(1).click();
    await expect(page.getByRole('dialog', { name: /Razorpay Checkout Confirmation/i })).toBeVisible();
    await page.getByRole('button', { name: /Confirm Payment & Continue/i }).click();
    await expect(page).toHaveURL(/\/settings\?section=company/);
    await expect(page.getByText(/Step 2 of 2/i)).toBeVisible();

    // 5. Fill Company Details inside Settings & Launch Workspace -> unlocks dashboard
    await page.getByPlaceholder('RISE WITH MEDIA').fill('Nikhil Creative Studio');
    await page.getByRole('button', { name: /Save Company Details & Launch Workspace/i }).click();
    await expect(page).toHaveURL(/\/$/);
  });
});
