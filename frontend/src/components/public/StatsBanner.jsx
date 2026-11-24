import React from 'react';
import { ThumbsUp, CheckCircle2, Receipt, ShieldCheck, Star } from 'lucide-react';

/**
 * StatsBanner Component
 * Styled exactly like the user's reference image:
 * Soft gradient rounded card with left-hand impact headline and 4 green-icon stats columns,
 * featuring the agency platform pillars:
 * - All-in-One / NO MORE SCATTERED APPS
 * - Fast Approvals / ZERO CONFUSING EMAILS
 * - Invoices / READY IN 1-CLICK
 * - 100% Private / SAFE FOR YOUR TEAM
 */
const StatsBanner = ({
  title = 'Built for Everyday Agency Life',
  subtitle = 'Simple tools designed to keep your team organized, fast, and stress-free.',
  stats = [
    {
      iconType: 'thumbsUp',
      value: 'All-in-One',
      label: 'No More Messy Apps',
    },
    {
      iconType: 'checkCircle',
      value: 'Fast Approvals',
      label: 'Zero Confusing Emails',
    },
    {
      iconType: 'receipt',
      value: 'Invoices',
      label: 'Bills in 1-Click',
    },
    {
      iconType: 'shield',
      value: '100% Private',
      label: 'Safe for Your Team',
    },
  ],
}) => {
  return (
    <section className="py-6 sm:py-12 px-4 sm:px-8 max-w-6xl mx-auto">
      <div className="rounded-2xl sm:rounded-[32px] bg-gradient-to-r from-emerald-50/90 via-teal-50/60 to-cyan-50/80 border border-emerald-100/80 p-5 sm:p-10 lg:p-12 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Heading & Description */}
          <div className="lg:col-span-4 text-left space-y-1.5 sm:space-y-2">
            <h2 className="font-extrabold text-xl sm:text-3xl lg:text-[32px] text-slate-950 tracking-tight leading-snug">
              {title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              {subtitle}
            </p>
          </div>

          {/* Right Column: 4 Stats with Green Icons & Logo Blue Sub-labels */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 items-center text-center">
            
            {/* Stat 1: Thumbs Up with Stars -> All-in-One */}
            <div className="flex flex-col items-center">
              <div className="relative mb-2 flex items-center justify-center">
                <div className="flex gap-0.5 absolute -top-2">
                  <Star size={7} className="fill-emerald-500 text-emerald-500" />
                  <Star size={8} className="fill-emerald-500 text-emerald-500 -mt-0.5" />
                  <Star size={7} className="fill-emerald-500 text-emerald-500" />
                </div>
                <ThumbsUp size={28} className="text-emerald-600 stroke-[2.2]" />
              </div>
              <span className="font-extrabold text-lg sm:text-xl lg:text-2xl text-slate-950 block tracking-tight leading-tight">
                {stats[0].value}
              </span>
              <span className="text-[11px] sm:text-xs font-bold text-[#12B7D4] uppercase tracking-wider mt-1.5 block">
                {stats[0].label}
              </span>
            </div>

            {/* Stat 2: Check Circle -> Fast Approvals */}
            <div className="flex flex-col items-center">
              <div className="mb-2 flex items-center justify-center">
                <CheckCircle2 size={30} className="text-emerald-600 stroke-[2.2]" />
              </div>
              <span className="font-extrabold text-lg sm:text-xl lg:text-2xl text-slate-950 block tracking-tight leading-tight">
                {stats[1].value}
              </span>
              <span className="text-[11px] sm:text-xs font-bold text-[#12B7D4] uppercase tracking-wider mt-1.5 block">
                {stats[1].label}
              </span>
            </div>

            {/* Stat 3: Receipt -> Invoices */}
            <div className="flex flex-col items-center">
              <div className="mb-2 flex items-center justify-center">
                <Receipt size={30} className="text-emerald-600 stroke-[2.2]" />
              </div>
              <span className="font-extrabold text-lg sm:text-xl lg:text-2xl text-slate-950 block tracking-tight leading-tight">
                {stats[2].value}
              </span>
              <span className="text-[11px] sm:text-xs font-bold text-[#12B7D4] uppercase tracking-wider mt-1.5 block">
                {stats[2].label}
              </span>
            </div>

            {/* Stat 4: ShieldCheck -> 100% Private */}
            <div className="flex flex-col items-center">
              <div className="relative mb-2 flex items-center justify-center">
                <ShieldCheck size={30} className="text-emerald-600 stroke-[2.2]" />
                <Star size={8} className="fill-emerald-500 text-emerald-500 absolute -bottom-0.5 -right-1" />
              </div>
              <span className="font-extrabold text-lg sm:text-xl lg:text-2xl text-slate-950 block tracking-tight leading-tight">
                {stats[3].value}
              </span>
              <span className="text-[11px] sm:text-xs font-bold text-[#12B7D4] uppercase tracking-wider mt-1.5 block">
                {stats[3].label}
              </span>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

export default StatsBanner;
