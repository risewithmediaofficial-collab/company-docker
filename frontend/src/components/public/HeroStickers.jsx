import React from 'react';
import {
  CheckCircle2,
  Sparkles,
  Zap,
  Receipt,
  Star,
  Check,
  TrendingUp,
  ShieldCheck,
  Smile,
} from 'lucide-react';
import { InstagramIcon, WhatsAppIcon } from '../ui/SocialIcons';

/**
 * HeroStickers Component
 * Playful, tactile floating cards, badges, and doodle stickers flanking
 * the hero section of the landing page:
 * - Top-Left: "Deal Won" / Retainer Card with WhatsApp icon
 * - Bottom-Left: "1-Tap Client Approved" Reel review sticker
 * - Top-Right: "Instant Invoice Paid" UPI receipt sticker
 * - Bottom-Right: "Monthly Target 12/12" Deliverable progress sticker
 * - Decorative hand-drawn SVG arrow & sparkle stickers
 * - Mobile responsive pill ticker strip for smaller viewports
 */
export const HeroStickers = () => {
  return (
    <>
      {/* ── 1. DESKTOP FLOATING STICKERS (VISIBLE ON LG & XL SCREENS) ── */}
      <div className="pointer-events-none select-none">
        
        {/* ── STICKER A: DEAL WON RETAINER (TOP-LEFT) ── */}
        <div
          className="hidden xl:flex absolute top-12 left-4 2xl:left-14 z-20 flex-col gap-1.5 p-3 sm:p-3.5 rounded-2xl bg-white/95 backdrop-blur-md border border-emerald-200/90 shadow-xl shadow-emerald-500/10 -rotate-3 hover:rotate-0 transition-transform duration-300 animate-float pointer-events-auto max-w-[215px] text-left"
          style={{ animationDuration: '4.5s' }}
        >
          {/* Peel / Die-cut pin accent */}
          <div className="flex items-center justify-between gap-1.5">
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="w-5 h-5 rounded-full bg-[#25D366] text-white flex items-center justify-center shrink-0">
                <WhatsAppIcon size={11} />
              </div>
              <span className="text-[11px] font-extrabold text-slate-800 truncate">
                Nexa Retail
              </span>
            </div>
            <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
              ✓ Deal Won
            </span>
          </div>

          <div className="pt-0.5 flex items-baseline justify-between">
            <span className="text-sm font-black text-slate-950 tracking-tight">
              ₹75,000
              <span className="text-[10px] text-slate-400 font-bold">/mo</span>
            </span>
            <span className="text-[9px] font-extrabold text-[#12B7D4] bg-[#12B7D4]/10 px-1.5 py-0.2 rounded">
              Retainer
            </span>
          </div>

          <div className="pt-1 border-t border-slate-100 flex items-center gap-1 text-[9px] font-bold text-emerald-700">
            <Sparkles size={10} className="text-emerald-500 shrink-0" />
            <span className="truncate">Project tasks created in 1-tap</span>
          </div>
        </div>

        {/* ── STICKER B: 1-TAP CLIENT APPROVAL (BOTTOM-LEFT) ── */}
        <div
          className="hidden lg:flex absolute bottom-8 left-4 2xl:left-14 z-20 flex-col gap-2 p-3 sm:p-3.5 rounded-2xl bg-white/95 backdrop-blur-md border border-cyan-200/90 shadow-xl shadow-cyan-500/10 rotate-3 hover:rotate-0 transition-transform duration-300 animate-float pointer-events-auto max-w-[225px] text-left"
          style={{ animationDuration: '5s', animationDelay: '1.2s' }}
        >
          <div className="flex items-center justify-between gap-1.5">
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center shrink-0">
                <InstagramIcon size={11} />
              </div>
              <span className="text-[11px] font-extrabold text-slate-800 truncate">
                Festive Reel #03
              </span>
            </div>
            <span className="text-[9px] font-bold text-slate-400">09:41 AM</span>
          </div>

          {/* Client Approval Pill Button */}
          <div className="py-1 px-2.5 rounded-xl bg-gradient-to-r from-[#12B7D4] to-teal-500 text-white text-[10px] font-extrabold flex items-center justify-between shadow-xs">
            <span className="flex items-center gap-1">
              <Check size={11} className="stroke-[3]" />
              <span>Approved by Client</span>
            </span>
            <span className="text-[9px] opacity-90 font-mono">8 sec</span>
          </div>

          <p className="text-[9px] text-slate-500 font-medium leading-tight">
            "Looks stunning! Post on Friday 6 PM 🔥"
          </p>
        </div>

        {/* ── STICKER C: INVOICE PAID (TOP-RIGHT) ── */}
        <div
          className="hidden xl:flex absolute top-12 right-4 2xl:right-14 z-20 flex-col gap-1.5 p-3 sm:p-3.5 rounded-2xl bg-white/95 backdrop-blur-md border border-emerald-200/90 shadow-xl shadow-emerald-500/10 rotate-3 hover:rotate-0 transition-transform duration-300 animate-float pointer-events-auto max-w-[220px] text-left"
          style={{ animationDuration: '4.8s', animationDelay: '2s' }}
        >
          <div className="flex items-center justify-between gap-1.5">
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="w-5 h-5 rounded-full bg-cyan-100 text-[#12B7D4] flex items-center justify-center shrink-0">
                <Receipt size={12} className="stroke-[2.5]" />
              </div>
              <span className="text-[11px] font-extrabold text-slate-800 truncate">
                Bill #RWM-089
              </span>
            </div>
            <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
              PAID IN FULL
            </span>
          </div>

          <div className="pt-0.5 flex items-baseline justify-between">
            <span className="text-sm font-black text-slate-950 tracking-tight">
              ₹1,20,000
            </span>
            <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
              UPI Received
            </span>
          </div>

          <div className="pt-1 border-t border-slate-100 flex items-center gap-1 text-[9px] font-bold text-slate-500">
            <CheckCircle2 size={10} className="text-emerald-500 shrink-0" />
            <span className="truncate">Instant PDF receipt auto-sent</span>
          </div>
        </div>

        {/* ── STICKER D: MONTHLY DELIVERABLES TARGET (BOTTOM-RIGHT) ── */}
        <div
          className="hidden lg:flex absolute bottom-8 right-4 2xl:right-14 z-20 flex-col gap-2 p-3 sm:p-3.5 rounded-2xl bg-white/95 backdrop-blur-md border border-indigo-200/90 shadow-xl shadow-indigo-500/10 -rotate-2 hover:rotate-0 transition-transform duration-300 animate-float pointer-events-auto max-w-[215px] text-left"
          style={{ animationDuration: '5.2s', animationDelay: '0.6s' }}
        >
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-[11px] font-extrabold text-slate-800">
              Monthly SMM Target
            </span>
            <span className="text-[9px] font-black text-[#12B7D4] bg-[#12B7D4]/10 px-1.5 py-0.2 rounded-full">
              12 / 12 Reels
            </span>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden p-0.5 border border-slate-200/60">
              <div className="bg-gradient-to-r from-[#12B7D4] to-emerald-500 h-full w-full rounded-full" />
            </div>
          </div>

          <div className="flex items-center justify-between text-[9px] font-extrabold text-emerald-600">
            <span className="flex items-center gap-1">
              <span>🎯 100% On-Time Delivery</span>
            </span>
            <span className="text-slate-400 font-semibold">Zero Delays</span>
          </div>
        </div>

        {/* ── STICKER E: CUTE DIE-CUT STAMP (TOP-CENTER-LEFT) ── */}
        <div className="hidden 2xl:flex absolute top-6 left-1/4 -translate-x-12 z-10 items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200/90 text-[10px] font-black text-amber-900 shadow-sm rotate-6 select-none">
          <span>⚡</span>
          <span>Zero Chaos</span>
        </div>

        {/* ── STICKER F: 100% PRIVATE STAMP (TOP-CENTER-RIGHT) ── */}
        <div className="hidden 2xl:flex absolute top-6 right-1/4 translate-x-12 z-10 items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-50 border border-cyan-200/90 text-[10px] font-black text-cyan-900 shadow-sm -rotate-6 select-none">
          <ShieldCheck size={11} className="text-[#12B7D4]" />
          <span>100% Private Workspace</span>
        </div>

        {/* ── STICKER G: 5-STAR AGENCY RATING (MID-LEFT) ── */}
        <div className="hidden 2xl:flex absolute top-1/2 -translate-y-8 left-6 2xl:left-10 z-15 items-center gap-2 p-2 px-3 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-lg shadow-slate-900/5 rotate-6 hover:rotate-0 transition-transform duration-300 pointer-events-auto select-none">
          <div className="flex gap-0.5">
            <Star size={11} className="fill-amber-400 text-amber-400" />
            <Star size={11} className="fill-amber-400 text-amber-400" />
            <Star size={11} className="fill-amber-400 text-amber-400" />
            <Star size={11} className="fill-amber-400 text-amber-400" />
            <Star size={11} className="fill-amber-400 text-amber-400" />
          </div>
          <span className="text-[10px] font-bold text-slate-700">"Saved 15+ hrs/week"</span>
        </div>

        {/* ── STICKER H: GPS ATTENDANCE PUNCH (MID-RIGHT) ── */}
        <div className="hidden 2xl:flex absolute top-1/2 -translate-y-8 right-6 2xl:right-10 z-15 items-center gap-2 p-2 px-3 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-lg shadow-slate-900/5 -rotate-6 hover:rotate-0 transition-transform duration-300 pointer-events-auto select-none">
          <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-black">
            PN
          </div>
          <div className="text-left">
            <p className="text-[10px] font-bold text-slate-800 leading-none">Priya • Clocked In</p>
            <p className="text-[9px] text-emerald-600 font-semibold leading-none mt-0.5">📍 Office GPS Verified</p>
          </div>
        </div>

        {/* ── STICKER I: PLAYFUL HAND-DRAWN DOODLE ARROW (NEAR CTA) ── */}
        <div className="hidden xl:flex absolute bottom-4 left-1/4 translate-x-10 z-10 items-center gap-1 pointer-events-none select-none">
          <span className="text-[11px] font-extrabold text-[#12B7D4] -rotate-6 tracking-wide">
            Takes 2 mins ⚡
          </span>
          <svg width="28" height="22" viewBox="0 0 34 26" fill="none" className="text-[#12B7D4] stroke-current transform rotate-12 -mt-1">
            <path d="M2 18 C10 8, 22 6, 30 18 M22 14 L30 18 L26 24" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

      </div>

      {/* ── 2. MOBILE RESPONSIVE MICRO-STICKER TICKER (VISIBLE ON SMALL SCREENS) ── */}
      <div className="lg:hidden mt-6 flex items-center justify-center flex-wrap gap-2 text-[10px] font-bold select-none px-2">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 shadow-2xs">
          <span>🎉</span>
          <span>Deal Won: ₹75k/mo</span>
        </span>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-[#0d99b2] shadow-2xs">
          <span>⚡</span>
          <span>1-Tap Client Approved</span>
        </span>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-800 shadow-2xs">
          <span>✓</span>
          <span>Bill Paid (UPI)</span>
        </span>
      </div>
    </>
  );
};

export default HeroStickers;
