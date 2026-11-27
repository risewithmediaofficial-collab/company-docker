import React from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../../components/public/PublicLayout';
import SeoHead from '../../components/seo/SeoHead';

const FAQ_ITEMS = [
  {
    q: 'What is Agency Upscale?',
    a: 'Agency Upscale is a SaaS CRM and business management platform designed for digital marketing agencies, sales teams, and growing businesses to manage leads, clients, tasks, social media calendars, attendance, and invoices in one workspace.',
  },
  {
    q: 'Who can use Agency Upscale?',
    a: 'Digital marketing agencies, creative studios, freelancers scaling into teams, sales teams, and small-to-mid-sized businesses in India and internationally can use Agency Upscale.',
  },
  {
    q: 'What is digital marketing CRM software?',
    a: 'A digital marketing CRM combines lead and client management with agency delivery tools—such as project boards, social media content calendars, ad spend tracking, client portal approvals, and recurring retainer invoicing.',
  },
  {
    q: 'Does Agency Upscale offer a free or affordable starter plan?',
    a: 'Yes. Agency Upscale offers a Free Forever plan (100 MB storage, up to 3 clients, 2 team seats, 1 branch) and a Starter plan at ₹10/month (5 GB storage, up to 15 clients, 8 team seats, 2 branches), alongside Growth (₹2,999/mo) and Enterprise Pro (₹6,999/mo).',
  },
  {
    q: 'Can I test advanced modules before upgrading my plan?',
    a: 'Yes. You can open and fill forms across modules in preview mode. When you are ready to save records in higher-tier modules such as Finance, HR, or Social Media Tracker, the platform prompts you to upgrade.',
  },
  {
    q: 'How does Agency Upscale help manage multiple clients and branches?',
    a: 'Each client gets an organized profile in Clients 360, linked projects and tasks, and optional Client Portal access. Multi-branch teams can manage office locations and branch-level staff from 1 branch on Free up to 25 branches on Enterprise Pro.',
  },
  {
    q: 'How do I get started with Agency Upscale?',
    a: 'Visit the registration page, create your agency workspace, choose your plan, and start adding leads, clients, and team members immediately.',
  },
];

const FaqPage = () => {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_ITEMS.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };

  return (
    <PublicLayout>
      <SeoHead
        title="Frequently Asked Questions | Agency Upscale CRM"
        description="Find clear answers about Agency Upscale digital marketing CRM, pricing plans from Free to Enterprise Pro, client portals, GST billing, and multi-branch support."
        canonicalPath="/faq"
        jsonLd={jsonLd}
      />

      <section className="pt-14 sm:pt-20 pb-16 px-4 sm:px-8 max-w-4xl mx-auto">
        <p className="text-xs sm:text-sm font-extrabold tracking-widest text-[#07c8f9] uppercase mb-3">
          Help &amp; Answers
        </p>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-950 tracking-tight">
          Frequently Asked Questions
        </h1>
        <p className="mt-4 text-base text-slate-600 leading-relaxed">
          Clear, direct answers about how Agency Upscale works for digital marketing agencies, sales teams, and growing businesses.
        </p>

        <div className="mt-10 space-y-5">
          {FAQ_ITEMS.map((item) => (
            <article key={item.q} className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-bold text-slate-950">{item.q}</h2>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">{item.a}</p>
            </article>
          ))}
        </div>

        <div className="mt-10 rounded-2xl bg-slate-50 border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-950">Still have questions?</h2>
            <p className="text-sm text-slate-600 mt-1">
              Explore our <Link to="/features" className="text-[#0586a8] font-semibold hover:underline">features</Link>,{' '}
              <Link to="/pricing" className="text-[#0586a8] font-semibold hover:underline">pricing plans</Link>, or{' '}
              <Link to="/contact" className="text-[#0586a8] font-semibold hover:underline">contact our team</Link>.
            </p>
          </div>
          <Link
            to="/register"
            className="px-5 py-2.5 rounded-full bg-[#07c8f9] hover:bg-[#06b4e0] text-white text-xs font-bold shrink-0 text-center"
          >
            Create Workspace
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
};

export default FaqPage;
