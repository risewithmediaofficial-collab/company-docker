import React from 'react';
import { ThumbsUp, CheckCircle2, Headphones, UserCheck, Star } from 'lucide-react';

/**
 * StatsBanner Component
 * Styled exactly like the user's reference image:
 * Soft gradient rounded card with left-hand impact headline and 4 green-icon stats columns.
 */
const StatsBanner = ({
  title = 'We are proud of our works',
  subtitle = 'We bring solutions to make life easier for our customers.',
  stats = [
    {
      iconType: 'thumbsUp',
      value: '4,000+',
      label: 'Happy Customers',
    },
    {
      iconType: 'checkCircle',
      value: '1,200+',
      label: 'Active Projects',
    },
    {
      iconType: 'support',
      value: 'Unified',
      label: 'Support Team',
    },
    {
      iconType: 'attrition',
      value: '<1%',
      label: 'Client Attrition',
    },
  ],
}) => {
  return (
    <section className="py-8 sm:py-12 px-4 sm:px-8 max-w-7xl mx-auto">
      <div className="rounded-3xl sm:rounded-[32px] bg-gradient-to-r from-emerald-50/90 via-teal-50/60 to-cyan-50/80 border border-emerald-100/80 p-8 sm:p-12 lg:p-14 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Heading & Description */}
          <div className="lg:col-span-4 text-left space-y-2">
            <h2 className="font-extrabold text-2xl sm:text-3xl lg:text-[32px] text-slate-950 tracking-tight leading-snug">
              {title}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
              {subtitle}
            </p>
          </div>

          {/* Right Column: 4 Stats with Green Icons */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 items-center text-center">
            
            {/* Stat 1: Thumbs Up with Stars */}
            <div className="flex flex-col items-center">
              <div className="relative mb-2 flex items-center justify-center">
                <div className="flex gap-0.5 absolute -top-2">
                  <Star size={7} className="fill-emerald-500 text-emerald-500" />
                  <Star size={8} className="fill-emerald-500 text-emerald-500 -mt-0.5" />
                  <Star size={7} className="fill-emerald-500 text-emerald-500" />
                </div>
                <ThumbsUp size={28} className="text-emerald-600 stroke-[2.2]" />
              </div>
              <span className="font-extrabold text-2xl sm:text-3xl text-slate-950 block tracking-tight">
                {stats[0].value}
              </span>
              <span className="text-xs sm:text-sm font-semibold text-slate-600 mt-1 block">
                {stats[0].label}
              </span>
            </div>

            {/* Stat 2: Check Circle */}
            <div className="flex flex-col items-center">
              <div className="mb-2 flex items-center justify-center">
                <CheckCircle2 size={30} className="text-emerald-600 stroke-[2.2]" />
              </div>
              <span className="font-extrabold text-2xl sm:text-3xl text-slate-950 block tracking-tight">
                {stats[1].value}
              </span>
              <span className="text-xs sm:text-sm font-semibold text-slate-600 mt-1 block">
                {stats[1].label}
              </span>
            </div>

            {/* Stat 3: Unified Headset Support */}
            <div className="flex flex-col items-center">
              <div className="mb-2 flex items-center justify-center">
                <Headphones size={30} className="text-emerald-600 stroke-[2.2]" />
              </div>
              <span className="font-extrabold text-2xl sm:text-3xl text-slate-950 block tracking-tight">
                {stats[2].value}
              </span>
              <span className="text-xs sm:text-sm font-semibold text-slate-600 mt-1 block">
                {stats[2].label}
              </span>
            </div>

            {/* Stat 4: User Profile with Retention Star */}
            <div className="flex flex-col items-center">
              <div className="relative mb-2 flex items-center justify-center">
                <UserCheck size={28} className="text-emerald-600 stroke-[2.2]" />
                <Star size={8} className="fill-emerald-500 text-emerald-500 absolute -bottom-0.5 -right-1" />
              </div>
              <span className="font-extrabold text-2xl sm:text-3xl text-slate-950 block tracking-tight">
                {stats[3].value}
              </span>
              <span className="text-xs sm:text-sm font-semibold text-slate-600 mt-1 block">
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
