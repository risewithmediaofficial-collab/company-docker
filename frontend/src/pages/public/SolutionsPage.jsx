import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Building2, TrendingUp, Briefcase, Layers } from 'lucide-react';
import PublicLayout from '../../components/public/PublicLayout';
import SeoHead from '../../components/seo/SeoHead';
import { renderBrandText } from '../../components/common/BrandText';

const SOLUTIONS_DATA = {
  overview: {
    canonicalPath: '/solutions',
    title: 'CRM Solutions for Agencies, Sales Teams & Small Businesses | Agency Upscale',
    description:
      'Explore how Agency Upscale serves as a digital marketing CRM, sales CRM, and affordable small business client management platform in India and worldwide.',
    eyebrow: 'CRM Solutions',
    h1: 'One CRM Platform Built for Agencies, Sales Teams, and Growing Businesses',
    intro:
      'Whether you are starting with a free workspace or running a multi-branch agency, Agency Upscale adapts to how your team wins leads, delivers projects, and collects payments.',
    cards: [
      {
        title: 'Digital Marketing Agencies',
        path: '/solutions/marketing-agencies',
        icon: Layers,
        summary:
          'Manage client retainers, 31-day social media calendars, ad budgets, creative approvals, and GST invoices in one place.',
      },
      {
        title: 'Sales Teams',
        path: '/solutions/sales-teams',
        icon: TrendingUp,
        summary:
          'Track every inquiry on a visual pipeline, set follow-up reminders, send proposals, and convert won deals into active clients in one click.',
      },
      {
        title: 'Small & Growing Businesses',
        path: '/solutions/small-businesses',
        icon: Building2,
        summary:
          'Move away from scattered spreadsheets and WhatsApp threads with an affordable CRM starting free and scaling to ₹10/month Starter and beyond.',
      },
    ],
    questions: [
      {
        q: 'What is Agency Upscale?',
        a: 'Agency Upscale is a SaaS CRM and business management software designed to help agencies, sales teams, and growing companies manage leads, clients, tasks, social media calendars, and billing from one workspace.',
      },
      {
        q: 'Does Agency Upscale work for both budget teams and large agencies?',
        a: 'Yes. Teams can start on the Free Forever plan or ₹10/month Starter plan for core CRM, clients, and tasks, and upgrade to Growth (₹2,999/mo) or Enterprise Pro (₹6,999/mo) for Finance, HR, SMM Tracker, and multi-branch operations.',
      },
    ],
  },
  'marketing-agencies': {
    canonicalPath: '/solutions/marketing-agencies',
    title: 'Digital Marketing Agency CRM Software | Agency Upscale',
    description:
      'Run your digital marketing agency with client management, 31-day social media content trackers, ad spend tracking, client portal approvals, and GST invoicing.',
    eyebrow: 'For Digital Marketing Agencies',
    h1: 'Digital Marketing CRM Software Built for Creative & Performance Agencies',
    intro:
      'Stop juggling separate tools for client onboarding, content calendars, ad budgets, and monthly billing. Agency Upscale brings your entire agency workflow together.',
    bullets: [
      '31-day Social Media One-Page Tracker for reels, posts, shoots, and edits',
      'Client Portal so clients review deliverables, tasks, and invoices without messy chats',
      'Campaign and ad budget tracking alongside retainer invoicing and GST billing',
      'Client Vault to store credentials and project links securely per client',
    ],
    questions: [
      {
        q: 'How does a digital marketing CRM help agencies save time?',
        a: 'Instead of updating spreadsheets and chasing approvals over chat, account managers, editors, and designers work from one shared task pipeline with clear due dates and client portal sign-offs.',
      },
      {
        q: 'Can agencies manage multiple brands or branches?',
        a: 'Yes. Each plan includes dedicated branch limits—from 1 branch on Free and 2 on Starter up to 5 on Growth and 25 branches on Enterprise Pro.',
      },
    ],
  },
  'sales-teams': {
    canonicalPath: '/solutions/sales-teams',
    title: 'Lead & Sales CRM Software for Growing Teams | Agency Upscale',
    description:
      'Organize sales leads, track follow-ups, send interactive proposals, and convert prospects into paying clients with Agency Upscale Sales CRM.',
    eyebrow: 'For Sales Teams',
    h1: 'Simple Lead Management & Sales CRM Software That Turns Inquiries Into Clients',
    intro:
      'Never lose a warm lead in spreadsheets or missed callbacks. Track every deal stage from first call to signed proposal and instant project kickoff.',
    bullets: [
      'Visual Kanban and table pipeline across every sales stage',
      'Today, overdue, and scheduled follow-up reminders for sales reps',
      'Interactive proposals with 1-click conversion into client projects',
      'Call history logs and team ownership tracking per lead',
    ],
    questions: [
      {
        q: 'How can sales teams organize leads using Agency Upscale?',
        a: 'Sales reps log every inquiry in the CRM & Leads board, assign priority and deal value, schedule follow-up dates, and move leads across stages until won.',
      },
      {
        q: 'What happens after a sales deal is won?',
        a: 'Accepted proposals and won leads convert cleanly into client accounts and project boards so your delivery team can start immediately.',
      },
    ],
  },
  'small-businesses': {
    canonicalPath: '/solutions/small-businesses',
    title: 'Affordable Small Business CRM Software (India & Global) | Agency Upscale',
    description:
      'Start with a free CRM or ₹10/mo Starter plan and scale up to enterprise workflows. Manage customers, tasks, attendance, and invoices easily.',
    eyebrow: 'For Small & Growing Businesses',
    h1: 'Affordable Small Business CRM Software That Grows With Your Team',
    intro:
      'Built for teams moving beyond spreadsheets—start free or at ₹10/month and unlock advanced finance, HR, and multi-branch operations whenever your business is ready.',
    bullets: [
      'Free Forever plan (up to 3 clients, 2 team seats, 1 branch) to get started with zero risk',
      'Starter plan at ₹10/month with 5 GB storage, 15 clients, 8 seats, and 2 branches',
      'Preview and fill forms in advanced modules before upgrading to Growth or Enterprise Pro',
      'GPS-verified attendance, EOD reports, and GST-ready invoicing built for India and global teams',
    ],
    questions: [
      {
        q: 'Why choose Agency Upscale over spreadsheets for a small business?',
        a: 'Spreadsheets break as soon as multiple team members update customer statuses, invoices, and follow-ups. A CRM keeps one live record for every client, task, and payment.',
      },
      {
        q: 'Can small businesses in India generate GST invoices?',
        a: 'Yes. The Growth and Enterprise Pro plans include GST invoicing, payment tracking, expense logs, and financial reports.',
      },
    ],
  },
};

const SolutionsPage = ({ solutionKey = 'overview' }) => {
  const data = SOLUTIONS_DATA[solutionKey] || SOLUTIONS_DATA.overview;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://agencyupscale.com/' },
          { '@type': 'ListItem', position: 2, name: 'Solutions', item: 'https://agencyupscale.com/solutions' },
          ...(solutionKey !== 'overview'
            ? [{ '@type': 'ListItem', position: 3, name: data.eyebrow, item: `https://agencyupscale.com${data.canonicalPath}` }]
            : []),
        ],
      },
      {
        '@type': 'SoftwareApplication',
        name: 'Agency Upscale',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        url: `https://agencyupscale.com${data.canonicalPath}`,
        description: data.description,
      },
    ],
  };

  return (
    <PublicLayout>
      <SeoHead
        title={data.title}
        description={data.description}
        canonicalPath={data.canonicalPath}
        jsonLd={jsonLd}
      />

      <section className="pt-14 sm:pt-20 pb-12 px-4 sm:px-8 max-w-6xl mx-auto">
        <div className="max-w-3xl">
          <p className="text-xs sm:text-sm font-extrabold tracking-widest text-[#07c8f9] uppercase mb-3">
            {data.eyebrow}
          </p>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-950 tracking-tight leading-tight">
            {renderBrandText(data.h1)}
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            {renderBrandText(data.intro)}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              to="/register"
              className="px-6 py-3 rounded-full bg-[#07c8f9] hover:bg-[#06b4e0] text-white text-sm font-bold inline-flex items-center gap-2 shadow-sm"
            >
              <span>Get Started Free</span>
              <ArrowRight size={15} />
            </Link>
            <Link
              to="/pricing"
              className="px-6 py-3 rounded-full bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-sm font-bold"
            >
              View Pricing
            </Link>
          </div>
        </div>

        {data.cards ? (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.cards.map((card) => {
              const Icon = card.icon;
              return (
                <Link
                  key={card.path}
                  to={card.path}
                  className="group rounded-2xl border border-slate-200 bg-white p-6 hover:border-[#07c8f9]/60 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="w-11 h-11 rounded-xl bg-cyan-50 text-[#0586a8] flex items-center justify-center mb-4">
                      <Icon size={20} />
                    </div>
                    <h2 className="text-lg font-bold text-slate-950 group-hover:text-[#0586a8]">
                      {card.title}
                    </h2>
                    <p className="mt-2 text-sm text-slate-600 leading-relaxed">{card.summary}</p>
                  </div>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-[#0586a8]">
                    Explore solution <ArrowRight size={13} />
                  </span>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50/70 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-slate-950 mb-4 flex items-center gap-2">
              <Briefcase size={18} className="text-[#0586a8]" />
              Key Workflows Included
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {data.bullets.map((b) => (
                <li key={b} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <Check size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-14 space-y-6 max-w-3xl">
          {data.questions.map((item) => (
            <article key={item.q} className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-bold text-slate-950">{renderBrandText(item.q)}</h2>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">{renderBrandText(item.a)}</p>
            </article>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
};

export default SolutionsPage;
