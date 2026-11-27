import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, HelpCircle, Globe } from 'lucide-react';
import PublicLayout from '../../components/public/PublicLayout';
import SeoHead from '../../components/seo/SeoHead';
import { BrandWordmark } from '../../components/common/BrandText';

const ContactPage = () => {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact Agency Upscale',
    url: 'https://agencyupscale.com/contact',
    mainEntity: {
      '@type': 'Organization',
      name: 'Agency Upscale',
      url: 'https://agencyupscale.com/',
      email: 'risewithmediaofficial@gmail.com',
    },
  };

  return (
    <PublicLayout>
      <SeoHead
        title="Contact & Support | Agency Upscale CRM"
        description="Contact Agency Upscale for SaaS CRM onboarding, pricing questions, enterprise multi-branch setup, or customer support in India and worldwide."
        canonicalPath="/contact"
        jsonLd={jsonLd}
      />

      <section className="pt-14 sm:pt-20 pb-16 px-4 sm:px-8 max-w-4xl mx-auto">
        <p className="text-xs sm:text-sm font-extrabold tracking-widest text-[#07c8f9] uppercase mb-3">
          Contact &amp; Support
        </p>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-950 tracking-tight">
          Get in Touch With <BrandWordmark spaced />
        </h1>
        <p className="mt-4 text-base text-slate-600 leading-relaxed max-w-2xl">
          Have questions about plans, agency onboarding, or multi-branch setups for India or international teams? Reach out directly to our support team.
        </p>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-[#0586a8] flex items-center justify-center mb-4">
              <Mail size={20} />
            </div>
            <h2 className="text-lg font-bold text-slate-950">Email Support &amp; Sales</h2>
            <p className="mt-2 text-sm text-slate-600">
              For workspace setup, billing inquiries, or enterprise assistance:
            </p>
            <a
              href="mailto:risewithmediaofficial@gmail.com"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-[#0586a8] hover:underline break-all"
            >
              risewithmediaofficial@gmail.com
            </a>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-[#0586a8] flex items-center justify-center mb-4">
              <Globe size={20} />
            </div>
            <h2 className="text-lg font-bold text-slate-950">Start Online Anytime</h2>
            <p className="mt-2 text-sm text-slate-600">
              Create your <BrandWordmark spaced /> account directly, test modules, and pick a plan inside your workspace.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                to="/register"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-[#0586a8] hover:underline"
              >
                Register Workspace <ArrowRight size={14} />
              </Link>
              <Link
                to="/faq"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-700 hover:underline"
              >
                <HelpCircle size={14} /> Read FAQ
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default ContactPage;
