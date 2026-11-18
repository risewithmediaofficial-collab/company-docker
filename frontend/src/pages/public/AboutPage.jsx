import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Users2,
  Calendar,
  FileText,
  Smile,
  ShieldCheck,
  Sparkles,
  Clock,
  HeartHandshake
} from 'lucide-react';
import PublicLayout from '../../components/public/PublicLayout';
import HeroPattern from '../../components/public/HeroPattern';
import ScrollReveal from '../../components/public/ScrollReveal';

const AboutPage = () => {
  return (
    <PublicLayout>
      {/* ── HERO HEADER WITH PATTERN CUT-OFF ── */}
      <section className="relative overflow-hidden border-b border-slate-200/80 pt-12 sm:pt-20 pb-14 sm:pb-16 px-4 sm:px-8 text-left sm:text-center">
        <HeroPattern />
        
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-slate-200/90 mb-5 shadow-2xs self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-[#12B7D4] animate-pulse" />
            <span className="text-xs sm:text-sm font-bold text-slate-800 tracking-wide uppercase font-sans">
              About the Software
            </span>
          </div>

          <h1 className="font-display font-black text-4xl sm:text-6xl text-slate-950 tracking-tight leading-tight">
            Built to Make Running Your Agency
            <span className="bg-gradient-to-r from-[#12B7D4] via-[#0ea5c6] to-[#12B7D4] bg-clip-text text-transparent animate-text-shimmer block mt-1">
              Simple and Stress-Free.
            </span>
          </h1>

          <p className="mt-4 text-base sm:text-lg text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
            RiseWithMedia brings your client inquiries, social media tasks, client reviews, and GST billing into one easy place. No confusing setup, no complicated words.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-start sm:justify-center gap-3">
            <Link
              to="/register-company"
              className="px-8 py-3.5 rounded-full bg-[#12B7D4] hover:bg-[#0ea5c6] text-white font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Register Company</span>
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/login"
              className="px-7 py-3.5 rounded-full bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-sm transition-all flex items-center justify-center shadow-2xs"
            >
              Login to Workspace
            </Link>
          </div>
        </div>
      </section>

      {/* ── ZIG-ZAG SECTIONS (NO CARDS, MINIMAL TEXT, BLACK & BLUE ANIMATION) ── */}
      <div className="py-20 sm:py-28 px-4 sm:px-8 max-w-6xl mx-auto space-y-28 sm:space-y-36">

        {/* ── ZIG-ZAG 1: Stop Using 5 Scattered Tools ── */}
        <ScrollReveal>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            <div className="lg:col-span-7 space-y-4 text-left">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#12B7D4] bg-[#12B7D4]/10 px-3.5 py-1 rounded-full">
                01 / Why We Built This
              </span>
              <h2 className="font-display font-black text-3xl sm:text-5xl text-slate-950 tracking-tight leading-tight">
                Stop Juggling Five
                <span className="bg-gradient-to-r from-[#12B7D4] via-[#0ea5c6] to-[#12B7D4] bg-clip-text text-transparent animate-text-shimmer block sm:inline-block sm:ml-2">
                  Different Apps.
                </span>
              </h2>
              <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed">
                Most agencies lose hours each day switching between WhatsApp chats, Excel spreadsheets, email threads, and invoicing software. We put everything under one simple roof.
              </p>
              <div className="pt-2 space-y-2.5 text-sm font-bold text-slate-800">
                <div className="flex items-center gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-[#12B7D4]/15 text-[#12B7D4] flex items-center justify-center shrink-0">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  <span>One single login for your entire marketing agency</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-[#12B7D4]/15 text-[#12B7D4] flex items-center justify-center shrink-0">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  <span>Easy enough that any team member can use it immediately</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-gradient-to-br from-slate-50 to-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-4">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400 block">The Difference</span>
              <div className="space-y-3">
                <div className="p-3.5 bg-rose-50/70 border border-rose-200/60 rounded-xl text-xs space-y-1">
                  <span className="font-bold text-rose-700 block">Before RiseWithMedia:</span>
                  <p className="text-slate-600">Lost client notes, delayed design approvals, manual Excel tax bills.</p>
                </div>
                <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/60 rounded-xl text-xs space-y-1">
                  <span className="font-bold text-emerald-700 block">With RiseWithMedia:</span>
                  <p className="text-slate-700 font-medium">All clients in one place, 1-tap phone approvals, automatic GST bills.</p>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* ── ZIG-ZAG 2: Built For Real Indian Agency Needs ── */}
        <ScrollReveal>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            <div className="lg:col-span-5 order-2 lg:order-1 bg-gradient-to-br from-slate-50 to-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-4">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400 block">Day-to-Day Flow</span>
              <div className="space-y-2.5">
                <div className="p-3 bg-white rounded-xl border border-slate-200/70 flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-800">1. Capture Client Lead</span>
                  <span className="text-[#12B7D4]">Instant</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200/70 flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-800">2. Plan Monthly Posts</span>
                  <span className="text-[#12B7D4]">Calendar</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200/70 flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-800">3. Client Approves on Phone</span>
                  <span className="text-emerald-600">1-Tap</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200/70 flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-800">4. Send GST Invoice</span>
                  <span className="text-emerald-600">30 Seconds</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 order-1 lg:order-2 space-y-4 text-left">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#12B7D4] bg-[#12B7D4]/10 px-3.5 py-1 rounded-full">
                02 / Built for Agency Rhythm
              </span>
              <h2 className="font-display font-black text-3xl sm:text-5xl text-slate-950 tracking-tight leading-tight">
                Designed Around How
                <span className="bg-gradient-to-r from-[#12B7D4] via-[#0ea5c6] to-[#12B7D4] bg-clip-text text-transparent animate-text-shimmer block sm:inline-block sm:ml-2">
                  Agencies Actually Work.
                </span>
              </h2>
              <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed">
                We didn't build software with 500 complicated settings you'll never use. We built the exact 4 things every marketing agency needs every morning.
              </p>
              <div className="pt-2 space-y-2.5 text-sm font-bold text-slate-800">
                <div className="flex items-center gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-[#12B7D4]/15 text-[#12B7D4] flex items-center justify-center shrink-0">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  <span>GST-ready tax billing with SGST & CGST split</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-[#12B7D4]/15 text-[#12B7D4] flex items-center justify-center shrink-0">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  <span>Direct phone reviews without forcing clients to install apps</span>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* ── ZIG-ZAG 3: Data Safety & Complete Privacy ── */}
        <ScrollReveal>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            <div className="lg:col-span-7 space-y-4 text-left">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#12B7D4] bg-[#12B7D4]/10 px-3.5 py-1 rounded-full">
                03 / 100% Privacy & Safety
              </span>
              <h2 className="font-display font-black text-3xl sm:text-5xl text-slate-950 tracking-tight leading-tight">
                Your Clients and Data
                <span className="bg-gradient-to-r from-[#12B7D4] via-[#0ea5c6] to-[#12B7D4] bg-clip-text text-transparent animate-text-shimmer block sm:inline-block sm:ml-2">
                  Stay 100% Yours.
                </span>
              </h2>
              <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed">
                Your agency receives its own dedicated company workspace. Your staff, clients, rates, and projects are strictly isolated and protected.
              </p>
              <div className="pt-2 space-y-2.5 text-sm font-bold text-slate-800">
                <div className="flex items-center gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-[#12B7D4]/15 text-[#12B7D4] flex items-center justify-center shrink-0">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  <span>Isolated database space for every registered agency</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-[#12B7D4]/15 text-[#12B7D4] flex items-center justify-center shrink-0">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  <span>Employees only access the clients they work with</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-gradient-to-br from-slate-50 to-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-4">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400 block">Workspace Security</span>
              <div className="p-4 bg-white rounded-xl border border-slate-200/70 space-y-3 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">Dedicated Agency Space</p>
                    <p className="text-xs text-slate-500">Zero data shared across companies</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-semibold">
                  <span>Daily Auto Backups</span>
                  <span className="text-emerald-600 font-bold">Active 24/7</span>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

      </div>

      {/* ── BOTTOM CTA ── */}
      <section className="bg-slate-900 text-white py-16 sm:py-20 px-4 sm:px-8 border-t border-slate-800 text-left sm:text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight leading-tight">
            See How Simple Your{' '}
            <span className="bg-gradient-to-r from-[#12B7D4] via-[#38bdf8] to-[#12B7D4] bg-clip-text text-transparent animate-text-shimmer">
              Agency Can Be.
            </span>
          </h2>
          <p className="text-slate-300 text-sm sm:text-base font-medium max-w-xl mx-auto">
            Get your agency workspace set up in minutes. Register today and manage your clients with zero stress.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-start sm:justify-center gap-3.5">
            <Link
              to="/register-company"
              className="px-8 sm:px-10 py-3.5 sm:py-4 rounded-full bg-[#12B7D4] hover:bg-[#0ea5c6] text-white font-black text-sm sm:text-base shadow-lg shadow-[#12B7D4]/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Register Company</span>
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/login"
              className="px-7 sm:px-9 py-3.5 sm:py-4 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 font-bold text-sm sm:text-base transition-all flex items-center justify-center"
            >
              Login to Account
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default AboutPage;
