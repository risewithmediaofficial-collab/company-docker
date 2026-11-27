import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Calendar } from 'lucide-react';
import PublicLayout from '../../components/public/PublicLayout';
import SeoHead from '../../components/seo/SeoHead';
import { BrandWordmark } from '../../components/common/BrandText';

const BLOG_ARTICLES = [
  {
    slug: 'what-is-digital-marketing-crm-for-agencies',
    title: 'What Is a Digital Marketing CRM and How Does It Help Agencies?',
    description:
      'Learn how digital marketing CRM software connects lead tracking, client onboarding, social media calendars, and monthly invoicing in one agency workspace.',
    publishedAt: '2026-11-27',
    readTime: '4 min read',
    category: 'Agency CRM',
    sections: [
      {
        heading: 'Why generic spreadsheets slow down digital marketing agencies',
        body: 'Most agencies start with separate spreadsheets for leads, Google Docs for content calendars, and manual tools for billing. As soon as an agency handles more than a few retainers, client messages, shoot dates, and pending invoices fall through the cracks.',
      },
      {
        heading: 'What a digital marketing CRM does differently',
        body: 'A dedicated agency CRM keeps the entire lifecycle connected: when a lead converts in your sales pipeline, the client profile, project board, task list, and monthly social media tracker all live under one client record.',
      },
      {
        heading: 'Key workflows to look for',
        body: 'Look for lead pipelines, client credential vaults, role-based team permissions, content approval calendars, and GST-ready invoicing so account managers and finance teams work from the same numbers.',
      },
    ],
  },
  {
    slug: 'crm-vs-spreadsheets-for-small-businesses',
    title: 'CRM vs Spreadsheets: Which Is Better for Small Businesses?',
    description:
      'Compare spreadsheets and affordable SaaS CRM software for small businesses in India and worldwide, including when it makes sense to switch.',
    publishedAt: '2026-11-27',
    readTime: '4 min read',
    category: 'Small Business CRM',
    sections: [
      {
        heading: 'Where spreadsheets work—and where they break',
        body: 'Spreadsheets are fine for a solo founder tracking ten contacts. Once two or more people start updating lead statuses, follow-up dates, and payment receipts, version conflicts and forgotten reminders cost real revenue.',
      },
      {
        heading: 'Why affordable SaaS CRM plans remove the cost barrier',
        body: 'Modern SaaS CRM platforms no longer require enterprise budgets. With options like a Free Forever plan or a ₹10/month Starter plan, small businesses can move to structured lead and client management right away.',
      },
      {
        heading: 'Scaling smoothly as your team grows',
        body: 'When your team expands to multiple branches, payroll, and recurring billing, an all-in-one CRM lets you upgrade your workspace without migrating data to a new tool.',
      },
    ],
  },
  {
    slug: 'how-to-manage-multiple-agency-clients',
    title: 'How Agencies Can Manage Multiple Clients Without Chaos',
    description:
      'Practical workflow tips for agencies managing multiple client retainers, creative tasks, social media posts, and client approvals.',
    publishedAt: '2026-11-27',
    readTime: '5 min read',
    category: 'Agency Operations',
    sections: [
      {
        heading: 'Centralize every client account in a single directory',
        body: 'Store primary contacts, contract dates, assigned managers, and secure credential links in one Clients 360 directory so new team members never ask around for logins or history.',
      },
      {
        heading: 'Separate internal task queues from client approvals',
        body: 'Give writers, designers, and video editors clear Kanban stages internally, and use a Client Portal so clients only review finished items ready for approval.',
      },
      {
        heading: 'Tie project delivery to billing and follow-ups',
        body: 'Track monthly deliverables alongside invoices and payment reminders so nothing is missed at renewal time.',
      },
    ],
  },
];

const BlogPage = () => {
  const { slug } = useParams();
  const article = slug ? BLOG_ARTICLES.find((a) => a.slug === slug) : null;

  if (slug && article) {
    const jsonLd = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Article',
          headline: article.title,
          description: article.description,
          datePublished: article.publishedAt,
          dateModified: article.publishedAt,
          author: { '@type': 'Organization', name: 'Agency Upscale' },
          publisher: { '@type': 'Organization', name: 'Agency Upscale', url: 'https://agencyupscale.com/' },
          mainEntityOfPage: `https://agencyupscale.com/blog/${article.slug}`,
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://agencyupscale.com/' },
            { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://agencyupscale.com/blog' },
            { '@type': 'ListItem', position: 3, name: article.title, item: `https://agencyupscale.com/blog/${article.slug}` },
          ],
        },
      ],
    };

    return (
      <PublicLayout>
        <SeoHead
          title={`${article.title} | Agency Upscale Blog`}
          description={article.description}
          canonicalPath={`/blog/${article.slug}`}
          ogType="article"
          jsonLd={jsonLd}
        />
        <article className="pt-14 sm:pt-20 pb-16 px-4 sm:px-8 max-w-3xl mx-auto">
          <Link to="/blog" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0586a8] hover:underline mb-6">
            <ArrowLeft size={14} /> Back to Blog
          </Link>
          <div className="flex items-center gap-3 text-xs text-slate-500 font-semibold mb-3">
            <span className="text-[#0586a8]">{article.category}</span>
            <span>•</span>
            <span className="inline-flex items-center gap-1"><Calendar size={12} /> {article.publishedAt}</span>
            <span>•</span>
            <span>{article.readTime}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight leading-tight">
            {article.title}
          </h1>
          <p className="mt-4 text-base text-slate-600 leading-relaxed">{article.description}</p>

          <div className="mt-10 space-y-8">
            {article.sections.map((sec) => (
              <section key={sec.heading}>
                <h2 className="text-xl font-bold text-slate-950">{sec.heading}</h2>
                <p className="mt-2 text-base text-slate-700 leading-relaxed">{sec.body}</p>
              </section>
            ))}
          </div>

          <div className="mt-12 rounded-2xl border border-slate-200 bg-slate-50 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-950">Try <BrandWordmark spaced /> with your team</h2>
              <p className="text-sm text-slate-600 mt-1">Start free or explore our affordable Starter and Growth plans.</p>
            </div>
            <Link to="/pricing" className="px-5 py-2.5 rounded-full bg-[#07c8f9] text-white text-xs font-bold shrink-0 text-center">
              View Pricing
            </Link>
          </div>
        </article>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <SeoHead
        title="Agency CRM & Business Management Blog | Agency Upscale"
        description="Practical guides on digital marketing CRM, client management, lead tracking, and agency workflows for teams in India and worldwide."
        canonicalPath="/blog"
      />
      <section className="pt-14 sm:pt-20 pb-16 px-4 sm:px-8 max-w-5xl mx-auto">
        <p className="text-xs sm:text-sm font-extrabold tracking-widest text-[#07c8f9] uppercase mb-3">
          Resources &amp; Guides
        </p>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-950 tracking-tight">
          <BrandWordmark spaced /> Blog
        </h1>
        <p className="mt-4 text-base text-slate-600 max-w-2xl">
          Practical guides on digital marketing CRM software, lead management, client portals, and scaling agency operations.
        </p>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          {BLOG_ARTICLES.map((post) => (
            <Link
              key={post.slug}
              to={`/blog/${post.slug}`}
              className="group rounded-2xl border border-slate-200 bg-white p-6 hover:border-[#07c8f9]/60 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <p className="text-xs font-bold text-[#0586a8] mb-2">{post.category}</p>
                <h2 className="text-lg font-bold text-slate-950 group-hover:text-[#0586a8] leading-snug">
                  {post.title}
                </h2>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{post.description}</p>
              </div>
              <div className="mt-5 flex items-center justify-between text-xs text-slate-500 font-semibold">
                <span>{post.readTime}</span>
                <span className="inline-flex items-center gap-1 text-[#0586a8] font-bold">
                  Read article <ArrowRight size={13} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
};

export default BlogPage;
