import React from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../../components/public/PublicLayout';
import SeoHead from '../../components/seo/SeoHead';
import { BrandWordmark } from '../../components/common/BrandText';

const SECTIONS = [
  {
    title: '1. Information We Collect',
    body: 'When you create a workspace or sign in to Agency Upscale, we collect basic account details such as your name, email address, phone number (if provided), organization/branch name, and role. If you sign in with Google OAuth, we receive only your verified Google name, email address, and profile avatar.',
  },
  {
    title: '2. How We Use Your Information',
    body: 'We use your account and workspace information strictly to authenticate you, isolate your organization data, deliver CRM, project, social media calendar, HR attendance, and invoicing features, process subscription payments via Razorpay, and provide customer support.',
  },
  {
    title: '3. Google OAuth & Third-Party Services',
    body: 'Google Sign-In is used solely to verify your identity and create or access your Agency Upscale account. We do not sell your personal information, and we do not share your Google user data with third-party advertisers. Subscription payments are processed securely by Razorpay.',
  },
  {
    title: '4. Multi-Tenant Data Isolation & Security',
    body: 'Each organization workspace is logically isolated. Client credentials, leads, invoices, tasks, and uploaded files are accessible only to authorized members of your organization according to role-based permissions. Sensitive credentials stored in the Client Vault are encrypted at rest.',
  },
  {
    title: '5. Cookies & Browser Storage',
    body: 'We use essential authentication tokens, cookies, and browser storage to keep your session secure, prevent automated abuse, and remember interface preferences. You can review or adjust optional cache preferences anytime from the Cookies & Cache link in the footer.',
  },
  {
    title: '6. Data Retention & Account Deletion',
    body: 'We retain your workspace data while your account remains active. Workspace owners or users may request data export or deletion at any time by contacting our support team.',
  },
  {
    title: '7. Contact Us',
    body: 'If you have questions about this Privacy Policy or how your data is handled, email us at risewithmediaofficial@gmail.com or visit our Contact page.',
  },
];

const PrivacyPolicyPage = () => {
  return (
    <PublicLayout>
      <SeoHead
        title="Privacy Policy | Agency Upscale"
        description="Read how Agency Upscale collects, protects, and uses workspace, CRM, and Google OAuth account data."
        canonicalPath="/privacy-policy"
      />
      <section className="pt-14 sm:pt-20 pb-16 px-4 sm:px-8 max-w-4xl mx-auto">
        <p className="text-xs sm:text-sm font-extrabold tracking-widest text-[#07c8f9] uppercase mb-3">
          Legal &amp; Data Protection
        </p>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-950 tracking-tight">
          Privacy Policy
        </h1>
        <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed">
          Effective Date: November 27, 2026 • Applies to <BrandWordmark spaced /> (
          <span className="font-semibold text-slate-800">agencyupscale.com</span> and{' '}
          <span className="font-semibold text-slate-800">app.agencyupscale.com</span>).
        </p>

        <div className="mt-10 space-y-6">
          {SECTIONS.map((sec) => (
            <article key={sec.title} className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-bold text-slate-950">{sec.title}</h2>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">{sec.body}</p>
            </article>
          ))}
        </div>

        <div className="mt-10 rounded-2xl bg-slate-50 border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-950">Need help with privacy or data requests?</h2>
            <p className="text-sm text-slate-600 mt-1">
              Email <span className="font-semibold text-slate-800">risewithmediaofficial@gmail.com</span> or reach us on the{' '}
              <Link to="/contact" className="text-[#0586a8] font-semibold hover:underline">
                Contact page
              </Link>
              .
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

export default PrivacyPolicyPage;
