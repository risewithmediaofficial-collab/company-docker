import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Suspense, lazy, useEffect } from 'react';
import { fetchMe } from './store/slices/authSlice';
import { Toaster as SonnerToaster } from 'sonner';
import BannerNotificationHost from './components/notifications/BannerNotificationHost';
import { CookieConsentBanner } from './components/common/CookieConsentBanner';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Route-Level Code Splitting (Lazy-loaded chunks)
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Landing = lazy(() => import('./pages/Landing'));
const AboutPage = lazy(() => import('./pages/public/AboutPage'));
const CapabilitiesPage = lazy(() => import('./pages/public/CapabilitiesPage'));
const MetricsPage = lazy(() => import('./pages/public/MetricsPage'));
const PricingPage = lazy(() => import('./pages/public/PricingPage'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const SelectPlan = lazy(() => import('./pages/auth/SelectPlan'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));
const GoogleOAuthCallback = lazy(() => import('./pages/auth/GoogleOAuthCallback'));
const Leads = lazy(() => import('./pages/crm/Leads'));
const LeadDetails = lazy(() => import('./pages/crm/LeadDetails'));
const SOPDashboard = lazy(() => import('./pages/sop/SOPDashboard'));
const Proposals = lazy(() => import('./pages/proposals/Proposals'));
const ProposalDetails = lazy(() => import('./pages/proposals/ProposalDetails'));
const ClientProposals = lazy(() => import('./pages/proposals/ClientProposals'));
const AddTask = lazy(() => import('./pages/tasks/AddTask'));
const TaskDetails = lazy(() => import('./pages/tasks/TaskDetails'));
const Projects = lazy(() => import('./pages/projects/Projects'));
const ProjectDetails = lazy(() => import('./pages/projects/ProjectDetails'));
const Clients = lazy(() => import('./pages/clients/Clients'));
const ClientDetails = lazy(() => import('./pages/clients/ClientDetails'));
const ClientVault = lazy(() => import('./pages/clients/ClientVault'));
const ClientFollowups = lazy(() => import('./pages/clients/ClientFollowups'));
const Tasks = lazy(() => import('./pages/tasks/Tasks'));
const ContentCalendar = lazy(() => import('./pages/tasks/ContentCalendar'));
const InfluencersDashboard = lazy(() => import('./pages/influencers/InfluencersDashboard'));
const Finance = lazy(() => import('./pages/finance/Finance'));
const CallHistoryDashboard = lazy(() => import('./pages/finance/CallHistoryDashboard'));
const HR = lazy(() => import('./pages/hr/HR'));
const Reports = lazy(() => import('./pages/reports/Reports'));
const Attendance = lazy(() => import('./pages/employee/Attendance'));
const MyEODReports = lazy(() => import('./pages/employee/MyEODReports'));
const ReferralDashboard = lazy(() => import('./pages/referral/ReferralDashboard'));
const Users = lazy(() => import('./pages/admin/Users'));
const CompanyRequests = lazy(() => import('./pages/admin/CompanyRequests'));
const DomainRenewals = lazy(() => import('./pages/admin/DomainRenewals'));
const AuditLogs = lazy(() => import('./pages/admin/AuditLogs'));
const RecycleBin = lazy(() => import('./pages/admin/RecycleBin'));
const AssetsLibrary = lazy(() => import('./pages/assets/AssetsLibrary'));
const Settings = lazy(() => import('./pages/Settings'));
const BranchesPage = lazy(() => import('./pages/BranchesPage'));
const NotFound = lazy(() => import('./pages/NotFound'));
const PortalDashboard = lazy(() => import('./pages/portal/sections/PortalDashboard'));
const PortalInvoices = lazy(() => import('./pages/portal/sections/PortalInvoices'));
const PortalTasks = lazy(() => import('./pages/portal/sections/PortalTasks'));
const PortalAdBudget = lazy(() => import('./pages/portal/sections/PortalAdBudget'));
const PortalSMMTracker = lazy(() => import('./pages/portal/sections/PortalSMMTracker'));
const VendorDashboard = lazy(() => import('./pages/vendor/VendorDashboard'));
const VendorFinance = lazy(() => import('./pages/vendor/VendorFinance'));

// Social Media Manager Module Pages - One-Page Tracker Only
const SMMOnePageTracker = lazy(() => import('./pages/smm/SMMOnePageTracker'));

// Platform Admin Pages (SaaS)
const PlatformLayout = lazy(() => import('./pages/platform/PlatformLayout'));
const PlatformDashboard = lazy(() => import('./pages/platform/PlatformDashboard'));
const Companies = lazy(() => import('./pages/platform/Companies'));
const CompanyDetail = lazy(() => import('./pages/platform/CompanyDetail'));
const PlatformAnalytics = lazy(() => import('./pages/platform/PlatformAnalytics'));

// Development Module Pages
const DevelopmentDashboard = lazy(() => import('./pages/development/DevelopmentDashboard'));
const DevelopmentBoard = lazy(() => import('./pages/development/DevelopmentBoard'));
const MyDevTasks = lazy(() => import('./pages/development/MyDevTasks'));
const DevelopmentSprints = lazy(() => import('./pages/development/DevelopmentSprints'));
const DevelopmentReviews = lazy(() => import('./pages/development/DevelopmentReviews'));
const DevelopmentQA = lazy(() => import('./pages/development/DevelopmentQA'));
const DevelopmentReleases = lazy(() => import('./pages/development/DevelopmentReleases'));

// ─── Shared Loading Screen ────────────────────────────────────────────────────
const LoadingScreen = () => (
  <div className="flex h-screen w-full flex-col items-center justify-center bg-[#0d0d0d] text-white">
    <div className="relative flex items-center justify-center">
      <div className="h-14 w-14 animate-spin rounded-full border-4 border-zinc-800 border-t-zinc-200 border-r-zinc-400" />
      <div className="absolute h-3.5 w-3.5 rounded-full bg-zinc-200" />
    </div>
    <p className="mt-6 text-sm font-bold tracking-widest uppercase text-zinc-200">
      Rise With Media
    </p>
    <span className="mt-1 text-[10px] text-zinc-500 tracking-wider">Connecting Hub…</span>
  </div>
);

const CLIENT_ROLES = ['client', 'clientAdmin', 'clientMember'];
const STAFF_ROLES = ['employee', 'intern', 'editor', 'designer', 'adsManager', 'accountManager', 'financeManager'];
const INTERNAL_TEAM_ROLES = ['superAdmin', 'admin', 'organizationOwner', 'manager', ...STAFF_ROLES];

// ─── Protected Route ──────────────────────────────────────────────────────────
const ProtectedRoute = ({ isAuthenticated, user, loading, allowedRoles, children }) => {
  // Still resolving session — don't redirect prematurely
  if (loading && !user) return null;

  // Truly unauthenticated
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // Token valid but user profile not yet fetched (edge case)
  if (!user) return null;

  // SuperAdmin, Admin, and OrganizationOwner have unrestricted workspace access
  if (user.role === 'superAdmin' || user.role === 'admin' || user.role === 'organizationOwner') {
    return children;
  }

  // RBAC & Granular Permission check
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const p = user.permissions || {};
    if (p.canAccessSmm && (allowedRoles.includes('employee') || allowedRoles.includes('manager'))) {
      return children;
    }
    if ((p.canManageFinance || p.canViewFinanceOverview) && (allowedRoles.includes('manager') || allowedRoles.includes('superAdmin'))) {
      return children;
    }
    if (p.canManageLeads && (allowedRoles.includes('manager') || allowedRoles.includes('employee') || allowedRoles.includes('referral'))) {
      return children;
    }
    if ((p.canManageHR || p.canManageEmployees) && (allowedRoles.includes('manager') || allowedRoles.includes('superAdmin'))) {
      return children;
    }
    if ((p.canViewReports || p.canViewAnalytics) && (allowedRoles.includes('manager') || allowedRoles.includes('superAdmin'))) {
      return children;
    }
    if (p.canUploadAssets && (allowedRoles.includes('employee') || allowedRoles.includes('manager'))) {
      return children;
    }
    if (p.canAssignTasks && (allowedRoles.includes('manager') || allowedRoles.includes('superAdmin'))) {
      return children;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};

// ─── App ──────────────────────────────────────────────────────────────────────
const App = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user, organization, loading, authChecked } = useSelector((state) => state.auth);
  const postLoginTarget =
    user?.role === 'organizationOwner' && organization?.billingSetupRequired
      ? '/select-plan'
      : user?.role === 'organizationOwner' && organization?.companySetupRequired
      ? '/settings?section=company'
      : '/';

  useEffect(() => {
    // Fetch user profile once: token present, no user object, not already loading, and not yet checked
    if (isAuthenticated && !user && !loading && !authChecked) {
      dispatch(fetchMe());
    }
  }, [dispatch, isAuthenticated, user, loading, authChecked]);

  const isResolvingInitialAuth = isAuthenticated && !user && !authChecked;

  return (
    <>
      {isResolvingInitialAuth ? (
        <LoadingScreen />
      ) : (
        <Router future={{ v7_relativeSplatPath: true }}>
      <SonnerToaster
        position="top-right"
        closeButton
        toastOptions={{
          className: 'bg-popover text-foreground border-0 shadow-[0_12px_32px_rgba(0,0,0,0.1)] rounded-xl',
        }}
      />
      <BannerNotificationHost />
      <CookieConsentBanner />
      <Suspense fallback={null}>
        <Routes>
          {/* ── Public Standalone Pages (gowap.in style) ────────────────── */}
          <Route path="/our-story" element={<AboutPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/what-we-do" element={<CapabilitiesPage />} />
          <Route path="/capabilities" element={<CapabilitiesPage />} />
          <Route path="/features" element={<CapabilitiesPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/our-impact" element={<MetricsPage />} />
          <Route path="/metrics" element={<MetricsPage />} />
          <Route path="/overview" element={<MetricsPage />} />
          <Route path="/home" element={<Landing />} />
          <Route path="/landing" element={<Landing />} />
          {!isAuthenticated && <Route path="/" element={<Landing />} />}

          {/* ── Redirect legacy external free trial URL to clean Register flow ─ */}
          <Route path="/register-company" element={<Navigate to={!isAuthenticated ? '/register' : postLoginTarget} replace />} />

          {/* ── Post-Login Plan & Razorpay Checkout Gate ────────────────── */}
          <Route
            path="/select-plan"
            element={(
              <ProtectedRoute isAuthenticated={isAuthenticated} user={user} loading={loading}>
                <SelectPlan />
              </ProtectedRoute>
            )}
          />

          {/* ── Auth Routes ─────────────────────────────────────────────── */}
          <Route path="/auth/google/callback" element={<GoogleOAuthCallback />} />
          <Route element={<AuthLayout />}>
            <Route path="/login"                  element={!isAuthenticated ? <Login />          : <Navigate to={postLoginTarget} replace />} />
            <Route path="/login/:companySlug"      element={<Login />} />
            <Route path="/:companySlug/login"      element={<Login />} />
            <Route path="/:companySlug"            element={<Login />} />
            <Route path="/register"               element={!isAuthenticated ? <Login initialView="signup" /> : <Navigate to={postLoginTarget} replace />} />
            <Route path="/forgot-password"        element={!isAuthenticated ? <ForgotPassword /> : <Navigate to={postLoginTarget} replace />} />
            <Route path="/reset-password/:token" element={!isAuthenticated ? <ResetPassword /> : <Navigate to={postLoginTarget} replace />} />
          </Route>

          {/* ── Platform Admin Routes (superAdmin only) ───────────────────── */}
          <Route
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} user={user} loading={loading} allowedRoles={['superAdmin']}>
                <PlatformLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/platform" element={<PlatformDashboard />} />
            <Route path="/platform/companies" element={<Companies />} />
            <Route path="/platform/requests" element={<Companies defaultTab="requests" />} />
            <Route path="/platform/company-requests" element={<Companies defaultTab="requests" />} />
            <Route path="/platform/companies/:id" element={<CompanyDetail />} />
            <Route path="/platform/analytics" element={<PlatformAnalytics />} />
          </Route>

          {/* ── Protected Shell ─────────────────────────────────────────── */}
          <Route
            element={(
              <ProtectedRoute isAuthenticated={isAuthenticated} user={user} loading={loading}>
                <MainLayout />
              </ProtectedRoute>
            )}
          >
          {/* Root (Authenticated Dashboard) */}
          {isAuthenticated && (
            <Route
              path="/"
              element={
                CLIENT_ROLES.includes(user?.role) ? (
                  <PortalDashboard user={user} />
                ) : user?.role === 'vendor' ? (
                  <VendorDashboard />
                ) : (
                  <Dashboard />
                )
              }
            />
          )}

          {/* CRM */}
          <Route path="/crm/leads" element={
            <ProtectedRoute isAuthenticated={isAuthenticated} user={user} loading={loading} allowedRoles={[...INTERNAL_TEAM_ROLES, 'referral']}>
              <Leads />
            </ProtectedRoute>
          } />
          <Route path="/crm/leads/:id" element={
            <ProtectedRoute isAuthenticated={isAuthenticated} user={user} loading={loading} allowedRoles={[...INTERNAL_TEAM_ROLES, 'referral']}>
              <LeadDetails />
            </ProtectedRoute>
          } />

          <Route path="/sop" element={
            <ProtectedRoute isAuthenticated={isAuthenticated} user={user} loading={loading} allowedRoles={INTERNAL_TEAM_ROLES}>
              <SOPDashboard />
            </ProtectedRoute>
          } />

          <Route path="/proposals" element={
            CLIENT_ROLES.includes(user?.role) ? (
              <ClientProposals />
            ) : (
              <ProtectedRoute isAuthenticated={isAuthenticated} user={user} loading={loading} allowedRoles={['superAdmin', 'admin', 'organizationOwner', 'manager']}>
                <Proposals />
              </ProtectedRoute>
            )
          } />
          <Route path="/proposals/new" element={
            <ProtectedRoute isAuthenticated={isAuthenticated} user={user} loading={loading} allowedRoles={['superAdmin', 'admin', 'organizationOwner', 'manager']}>
              <ProposalDetails />
            </ProtectedRoute>
          } />
          <Route path="/proposals/:id" element={
            <ProtectedRoute isAuthenticated={isAuthenticated} user={user} loading={loading} allowedRoles={['superAdmin', 'admin', 'organizationOwner', 'manager', ...CLIENT_ROLES]}>
              <ProposalDetails />
            </ProtectedRoute>
          } />
          <Route path="/client/proposals" element={
            <ProtectedRoute isAuthenticated={isAuthenticated} user={user} loading={loading} allowedRoles={CLIENT_ROLES}>
              <ClientProposals />
            </ProtectedRoute>
          } />

          {/* Projects */}
          <Route path="/projects" element={
            <ProtectedRoute isAuthenticated={isAuthenticated} user={user} loading={loading} allowedRoles={[...INTERNAL_TEAM_ROLES, ...CLIENT_ROLES]}>
              <Projects />
            </ProtectedRoute>
          } />
          <Route path="/projects/:id" element={
            <ProtectedRoute isAuthenticated={isAuthenticated} user={user} loading={loading} allowedRoles={[...INTERNAL_TEAM_ROLES, ...CLIENT_ROLES]}>
              <ProjectDetails />
            </ProtectedRoute>
          } />

          {/* Clients */}
          <Route path="/clients" element={
            <ProtectedRoute isAuthenticated={isAuthenticated} user={user} loading={loading} allowedRoles={['superAdmin', 'admin', 'organizationOwner', 'founder', 'manager', 'accountManager', 'employee', 'editor', 'designer', 'adsManager', 'financeManager', 'intern']}>
              <Clients />
            </ProtectedRoute>
          } />
          <Route path="/clients/:id" element={
            <ProtectedRoute isAuthenticated={isAuthenticated} user={user} loading={loading} allowedRoles={['superAdmin', 'admin', 'organizationOwner', 'founder', 'manager', 'accountManager', 'employee', 'client', 'clientAdmin', 'clientMember', 'editor', 'designer', 'adsManager', 'financeManager', 'intern']}>
              <ClientDetails />
            </ProtectedRoute>
          } />
          <Route path="/client-vault" element={
            <ProtectedRoute isAuthenticated={isAuthenticated} user={user} loading={loading} allowedRoles={['superAdmin', 'admin', 'organizationOwner', 'founder', 'manager', 'accountManager', 'employee', 'client', 'clientAdmin', 'clientMember', 'editor', 'designer', 'adsManager', 'financeManager', 'intern']}>
              <ClientVault />
            </ProtectedRoute>
          } />
          <Route path="/client-followups" element={
            <ProtectedRoute isAuthenticated={isAuthenticated} user={user} loading={loading} allowedRoles={['superAdmin', 'admin', 'organizationOwner', 'founder', 'manager', 'accountManager', 'employee']}>
              <ClientFollowups />
            </ProtectedRoute>
          } />



          {/* Tasks & Calendar */}
          <Route path="/tasks" element={
            CLIENT_ROLES.includes(user?.role) ? (
              <PortalTasks />
            ) : (
              <ProtectedRoute isAuthenticated={isAuthenticated} user={user} loading={loading} allowedRoles={[...INTERNAL_TEAM_ROLES, 'vendor']}>
                <Tasks />
              </ProtectedRoute>
            )
          } />
          <Route path="/manager-tasks" element={
            <ProtectedRoute isAuthenticated={isAuthenticated} user={user} loading={loading} allowedRoles={['manager']}>
              <Tasks />
            </ProtectedRoute>
          } />
          <Route path="/tasks/new" element={
            <ProtectedRoute isAuthenticated={isAuthenticated} user={user} loading={loading} allowedRoles={['superAdmin', 'admin', 'organizationOwner', 'manager']}>
              <AddTask />
            </ProtectedRoute>
          } />
          <Route path="/tasks/:id" element={
            <ProtectedRoute isAuthenticated={isAuthenticated} user={user} loading={loading} allowedRoles={[...INTERNAL_TEAM_ROLES, 'vendor', ...CLIENT_ROLES]}>
              <TaskDetails />
            </ProtectedRoute>
          } />
          <Route path="/my-finance" element={
            <ProtectedRoute isAuthenticated={isAuthenticated} user={user} loading={loading} allowedRoles={['vendor']}>
              <VendorFinance />
            </ProtectedRoute>
          } />
          <Route path="/calendar" element={
            <ProtectedRoute isAuthenticated={isAuthenticated} user={user} loading={loading} allowedRoles={[...INTERNAL_TEAM_ROLES, ...CLIENT_ROLES, 'referral']}>
              <ContentCalendar />
            </ProtectedRoute>
          } />
          <Route path="/influencers" element={
            <ProtectedRoute isAuthenticated={isAuthenticated} user={user} loading={loading} allowedRoles={['superAdmin', 'admin', 'organizationOwner', 'manager']}>
              <InfluencersDashboard />
            </ProtectedRoute>
          } />
          <Route path="/daily-tasks" element={
            <ProtectedRoute isAuthenticated={isAuthenticated} user={user} loading={loading} allowedRoles={[...INTERNAL_TEAM_ROLES, ...CLIENT_ROLES, 'referral']}>
              <ContentCalendar defaultView="day" />
            </ProtectedRoute>
          } />
          <Route path="/daily_tasks" element={<Navigate to="/daily-tasks" replace />} />

          {/* Finance OS */}
          <Route path="/finance" element={
            CLIENT_ROLES.includes(user?.role) || user?.role === 'vendor' ? <Navigate to="/" replace /> : (
              <ProtectedRoute isAuthenticated={isAuthenticated} user={user} loading={loading} allowedRoles={['superAdmin', 'admin', 'organizationOwner', 'manager', 'financeManager', 'accountManager', 'employee']}>
                <Finance />
              </ProtectedRoute>
            )
          } />
          <Route path="/finance/:section" element={
            CLIENT_ROLES.includes(user?.role) || user?.role === 'vendor' ? <Navigate to="/" replace /> : (
              <ProtectedRoute isAuthenticated={isAuthenticated} user={user} loading={loading} allowedRoles={['superAdmin', 'admin', 'organizationOwner', 'manager', 'financeManager', 'accountManager', 'employee']}>
                <Finance />
              </ProtectedRoute>
            )
          } />
          <Route path="/call-history" element={
            <ProtectedRoute isAuthenticated={isAuthenticated} user={user} loading={loading} allowedRoles={INTERNAL_TEAM_ROLES}>
              <CallHistoryDashboard />
            </ProtectedRoute>
          } />

          {/* HR — admin/manager only */}
          <Route path="/hr" element={
            <ProtectedRoute isAuthenticated={isAuthenticated} user={user} loading={loading} allowedRoles={['superAdmin', 'admin', 'organizationOwner', 'manager']}>
              <HR />
            </ProtectedRoute>
          } />

          {/* Reports — admin/manager only */}
          <Route path="/reports" element={
            <ProtectedRoute isAuthenticated={isAuthenticated} user={user} loading={loading} allowedRoles={['superAdmin', 'admin', 'organizationOwner', 'manager']}>
              <Reports />
            </ProtectedRoute>
          } />
          <Route path="/assets" element={
            <ProtectedRoute isAuthenticated={isAuthenticated} user={user} loading={loading} allowedRoles={['superAdmin', 'admin', 'organizationOwner', 'manager']}>
              <AssetsLibrary />
            </ProtectedRoute>
          } />
          <Route path="/domain-renewals" element={
            <ProtectedRoute isAuthenticated={isAuthenticated} user={user} loading={loading} allowedRoles={['superAdmin', 'admin', 'organizationOwner', 'manager']}>
              <DomainRenewals />
            </ProtectedRoute>
          } />

          {/* Attendance */}
          <Route path="/attendance" element={
            <ProtectedRoute isAuthenticated={isAuthenticated} user={user} loading={loading} allowedRoles={INTERNAL_TEAM_ROLES}>
              <Attendance />
            </ProtectedRoute>
          } />
          <Route path="/my-eod-reports" element={
            <ProtectedRoute isAuthenticated={isAuthenticated} user={user} loading={loading} allowedRoles={INTERNAL_TEAM_ROLES}>
              <MyEODReports />
            </ProtectedRoute>
          } />

          {/* Referral */}
          <Route path="/referral" element={
            <ProtectedRoute isAuthenticated={isAuthenticated} user={user} loading={loading} allowedRoles={['superAdmin', 'manager', 'referral']}>
              <ReferralDashboard />
            </ProtectedRoute>
          } />

          {/* Team Directory & User Management */}
          <Route path="/admin/users" element={
            <ProtectedRoute isAuthenticated={isAuthenticated} user={user} loading={loading} allowedRoles={['superAdmin', 'organizationOwner', 'admin', 'manager']}>
              <Users />
            </ProtectedRoute>
          } />
          <Route path="/admin/company-requests" element={
            <ProtectedRoute isAuthenticated={isAuthenticated} user={user} loading={loading} allowedRoles={['superAdmin']}>
              <CompanyRequests />
            </ProtectedRoute>
          } />
          <Route path="/admin/companies" element={
            <ProtectedRoute isAuthenticated={isAuthenticated} user={user} loading={loading} allowedRoles={['superAdmin']}>
              <CompanyRequests />
            </ProtectedRoute>
          } />
          <Route path="/admin/manager-assignments" element={<Navigate to="/admin/users" replace />} />

          {/* System Audit Logs & Recycle Bin — Super Admin, Admin, Manager */}
          <Route path="/audit-logs" element={
            <ProtectedRoute isAuthenticated={isAuthenticated} user={user} loading={loading} allowedRoles={['superAdmin', 'admin', 'manager']}>
              <AuditLogs />
            </ProtectedRoute>
          } />
          <Route path="/recycle-bin" element={
            <ProtectedRoute isAuthenticated={isAuthenticated} user={user} loading={loading} allowedRoles={['superAdmin', 'admin', 'manager']}>
              <RecycleBin />
            </ProtectedRoute>
          } />

          {/* Settings & Branches — any authenticated user */}
          <Route path="/settings" element={<Settings />} />
          <Route path="/branches" element={<BranchesPage />} />

          {/* Social Media & Ads - One-Page Tracker Only */}
          <Route path="/smm" element={
            <ProtectedRoute isAuthenticated={isAuthenticated} user={user} loading={loading} allowedRoles={INTERNAL_TEAM_ROLES}>
              <SMMOnePageTracker />
            </ProtectedRoute>
          } />
          <Route path="/smm/tracker" element={<Navigate to="/smm" replace />} />
          <Route path="/smm/*" element={<Navigate to="/smm" replace />} />

          {/* Development Module Routes */}
          <Route path="/development" element={
            <ProtectedRoute isAuthenticated={isAuthenticated} user={user} loading={loading} allowedRoles={INTERNAL_TEAM_ROLES}>
              <DevelopmentDashboard />
            </ProtectedRoute>
          } />
          <Route path="/development/board" element={
            <ProtectedRoute isAuthenticated={isAuthenticated} user={user} loading={loading} allowedRoles={INTERNAL_TEAM_ROLES}>
              <DevelopmentBoard />
            </ProtectedRoute>
          } />
          <Route path="/development/my-tasks" element={
            <ProtectedRoute isAuthenticated={isAuthenticated} user={user} loading={loading} allowedRoles={INTERNAL_TEAM_ROLES}>
              <MyDevTasks />
            </ProtectedRoute>
          } />
          <Route path="/development/sprints" element={
            <ProtectedRoute isAuthenticated={isAuthenticated} user={user} loading={loading} allowedRoles={INTERNAL_TEAM_ROLES}>
              <DevelopmentSprints />
            </ProtectedRoute>
          } />
          <Route path="/development/reviews" element={
            <ProtectedRoute isAuthenticated={isAuthenticated} user={user} loading={loading} allowedRoles={INTERNAL_TEAM_ROLES}>
              <DevelopmentReviews />
            </ProtectedRoute>
          } />
          <Route path="/development/qa" element={
            <ProtectedRoute isAuthenticated={isAuthenticated} user={user} loading={loading} allowedRoles={INTERNAL_TEAM_ROLES}>
              <DevelopmentQA />
            </ProtectedRoute>
          } />
          <Route path="/development/releases" element={
            <ProtectedRoute isAuthenticated={isAuthenticated} user={user} loading={loading} allowedRoles={INTERNAL_TEAM_ROLES}>
              <DevelopmentReleases />
            </ProtectedRoute>
          } />

          {/* Client Portal Sections */}
          <Route path="/portal/invoices" element={
            <ProtectedRoute isAuthenticated={isAuthenticated} user={user} loading={loading} allowedRoles={[...CLIENT_ROLES, 'superAdmin', 'manager']}>
              <PortalInvoices />
            </ProtectedRoute>
          } />
          <Route path="/portal/tasks" element={
            <ProtectedRoute isAuthenticated={isAuthenticated} user={user} loading={loading} allowedRoles={[...CLIENT_ROLES, 'superAdmin', 'manager']}>
              <PortalTasks />
            </ProtectedRoute>
          } />
          <Route path="/portal/tracker" element={
            <ProtectedRoute isAuthenticated={isAuthenticated} user={user} loading={loading} allowedRoles={[...CLIENT_ROLES, 'superAdmin', 'manager']}>
              <PortalSMMTracker />
            </ProtectedRoute>
          } />
          <Route path="/portal/ad-budget" element={
            <ProtectedRoute isAuthenticated={isAuthenticated} user={user} loading={loading} allowedRoles={[...CLIENT_ROLES, 'superAdmin', 'manager']}>
              <PortalAdBudget />
            </ProtectedRoute>
          } />
          <Route path="/portal/downloads" element={<Navigate to="/" replace />} />
          <Route path="/portal/reports" element={<Navigate to="/" replace />} />
          <Route path="/portal/assets" element={<Navigate to="/" replace />} />
          <Route path="/portal/support" element={<Navigate to="/" replace />} />
          <Route path="/portal/guidelines" element={<Navigate to="/" replace />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
        </Router>
      )}
    </>
  );
};

export default App;
