// Maps SaaS plan enabledModules keys -> workspace routes and friendly upgrade metadata

export const MODULE_RULES = [
  {
    key: 'crm',
    name: 'CRM & Leads',
    prefixes: ['/crm'],
    minPlan: 'Free / Starter',
    description: 'Capture leads, score prospects, track deal stages, and convert leads into active clients.',
  },
  {
    key: 'clients',
    name: 'Clients 360 & Vault',
    prefixes: ['/clients', '/client-followups', '/client-vault'],
    minPlan: 'Free / Starter',
    description: 'Centralized client directory, account health, credential vault, and follow-up history.',
  },
  {
    key: 'projects',
    name: 'Projects & Development',
    prefixes: ['/projects', '/development'],
    minPlan: 'Free / Starter',
    description: 'Deliverable boards, timelines, sprints, and project profitability tracking.',
  },
  {
    key: 'tasks',
    name: 'Tasks & Daily Queue',
    prefixes: ['/tasks', '/manager-tasks', '/daily-tasks'],
    minPlan: 'Free / Starter',
    description: 'Kanban boards, task timers, EOD checklists, and team workload management.',
  },
  {
    key: 'portal',
    name: 'Client Portal',
    prefixes: ['/portal', '/client/proposals'],
    minPlan: 'Free / Starter',
    description: 'Client-facing dashboard for deliverables, approvals, and invoices.',
  },
  {
    key: 'assets',
    name: 'Asset Library',
    prefixes: ['/assets'],
    minPlan: 'Free / Starter',
    description: 'Organized creative files, brand guidelines, and client deliverable storage.',
  },
  {
    key: 'attendance',
    name: 'Attendance & EOD',
    prefixes: ['/attendance', '/my-eod-reports'],
    minPlan: 'Starter (₹10/mo)',
    description: 'GPS-geofenced clock-in/out, shift tracking, WFH requests, and daily EOD logs.',
  },
  {
    key: 'proposals',
    name: 'Proposals & Estimates',
    prefixes: ['/proposals'],
    minPlan: 'Starter (₹10/mo)',
    description: 'Create and send interactive client proposals with instant 1-click project conversion.',
  },
  {
    key: 'reports',
    name: 'Reports & Analytics',
    prefixes: ['/reports'],
    minPlan: 'Starter (₹10/mo)',
    description: 'Executive agency KPIs, team utilization metrics, and custom report exports.',
  },
  {
    key: 'sop',
    name: 'SOP Library',
    prefixes: ['/sop'],
    minPlan: 'Starter (₹10/mo)',
    description: 'Document agency playbooks, checklists, and onboarding guides for your team.',
  },
  {
    key: 'finance',
    name: 'Finance Hub & Billing',
    prefixes: ['/finance', '/domain-renewals', '/call-history'],
    minPlan: 'Growth (₹2,999/mo)',
    description: 'GST invoicing, recurring retainers, expense approvals, P&L statements, and domain renewals.',
  },
  {
    key: 'hr',
    name: 'HR, Hiring & Payroll',
    prefixes: ['/hr'],
    minPlan: 'Growth (₹2,999/mo)',
    description: 'Employee records, onboarding, leave workflows, salary payouts, and vendor management.',
  },
  {
    key: 'smm',
    name: 'Social Media & Content Calendar',
    prefixes: ['/smm', '/calendar'],
    minPlan: 'Growth (₹2,999/mo)',
    description: 'Monthly reel/post trackers, multi-client content calendars, and 1-tap client approvals.',
  },
  {
    key: 'influencers',
    name: 'Influencer Hub',
    prefixes: ['/influencers'],
    minPlan: 'Growth (₹2,999/mo)',
    description: 'Creator database, campaign deliverables, and talent payout tracking.',
  },
];

export const getModuleRuleForPath = (pathname = '') => {
  const path = String(pathname || '').toLowerCase();
  if (!path || path === '/' || path.startsWith('/settings') || path.startsWith('/select-plan') || path.startsWith('/branches') || path.startsWith('/admin') || path.startsWith('/platform')) {
    return null;
  }
  return MODULE_RULES.find((rule) => rule.prefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))) || null;
};

export const isModuleLocked = (pathname, organization, user) => {
  return Boolean(getLockedModuleForPath(pathname, organization, user));
};

export const getLockedModuleForPath = (pathname, organization, user) => {
  if (!organization || !organization.enabledModules) return null;
  if (user?.role === 'superAdmin') return null;

  const rule = getModuleRuleForPath(pathname);
  if (!rule) return null;

  // Only lock when the organization's plan explicitly sets enabledModules[key] === false
  if (organization.enabledModules[rule.key] === false) {
    return rule;
  }
  return null;
};
