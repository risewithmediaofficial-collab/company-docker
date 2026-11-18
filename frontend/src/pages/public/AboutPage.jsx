import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
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
          {/* Plain Text Header (NO ROUNDED PILL) */}
          <p className="text-xs sm:text-sm font-bold tracking-widest text-[#12B7D4] uppercase mb-4">
            About the Software
          </p>

          <h1 className="font-extrabold text-4xl sm:text-6xl lg:text-[68px] text-slate-950 tracking-tight leading-[1.08]">
            Built to Make Running Your Agency
            <span className="bg-gradient-to-r from-[#12B7D4] via-[#0ea5c6] to-[#12B7D4] bg-clip-text text-transparent animate-text-shimmer block mt-1 sm:mt-2">
              Simple and Stress-Free.
            </span>
          </h1>

          <p className="mt-4 sm:mt-5 text-base sm:text-lg text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
            RiseWithMedia brings your client inquiries, social media tasks, client reviews, and GST billing into one easy place. No confusing setup, no complicated words.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-start sm:justify-center gap-3.5">
            <Link
              to="/register-company"
              className="px-8 sm:px-10 py-3.5 sm:py-4 rounded-full bg-[#12B7D4] hover:bg-[#0ea5c6] text-white font-bold text-sm sm:text-base shadow-lg shadow-[#12B7D4]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Register Company</span>
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/login"
              className="px-7 sm:px-9 py-3.5 sm:py-4 rounded-full bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-sm sm:text-base transition-all flex items-center justify-center shadow-2xs"
            >
              Login to Workspace
            </Link>
          </div>
        </div>
      </section>

      {/* ── CLEAN ZIG-ZAG SECTIONS (NO CARDS, PLAIN TEXT LABELS, HUMAN-MADE CSS) ── */}
      <div className="py-20 sm:py-28 px-4 sm:px-8 max-w-6xl mx-auto space-y-24 sm:space-y-32">

        {/* ── ZIG-ZAG 01: Why We Built This ── */}
        <ScrollReveal>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start pb-16 border-b border-slate-100">
            <div className="lg:col-span-5 space-y-4 text-left">
              <p className="text-xs font-bold tracking-widest text-[#12B7D4] uppercase">
                01 — Why We Built This
              </p>
              <h2 className="font-extrabold text-3xl sm:text-4xl lg:text-[42px] text-slate-950 tracking-tight leading-[1.15]">
                Stop Juggling Five
                <span className="bg-gradient-to-r from-[#12B7D4] via-[#0ea5c6] to-[#12B7D4] bg-clip-text text-transparent animate-text-shimmer block mt-1">
                  Scattered Apps.
                </span>
              </h2>
              <p className="text-base text-slate-600 font-medium leading-relaxed pt-1">
                Most agencies lose hours each day switching between WhatsApp chats, Excel spreadsheets, email threads, and invoicing software. We put everything under one simple roof.
              </p>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-7 text-left pt-1">
              <div className="border-l-2 border-[#12B7D4] pl-4 space-y-1">
                <h3 className="font-bold text-slate-900 text-base">One Unified Login</h3>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">Your entire agency team accesses daily tasks, calendars, and clients from one place.</p>
              </div>
              <div className="border-l-2 border-slate-200 pl-4 space-y-1">
                <h3 className="font-bold text-slate-900 text-base">Zero Learning Curve</h3>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">Straightforward interface designed so any team member understands it in 5 minutes.</p>
              </div>
              <div className="border-l-2 border-slate-200 pl-4 space-y-1">
                <h3 className="font-bold text-slate-900 text-base">No More Lost Notes</h3>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">All client briefs, deliverables, and revision notes stay permanently attached to the project.</p>
              </div>
              <div className="border-l-2 border-slate-200 pl-4 space-y-1">
                <h3 className="font-bold text-slate-900 text-base">Always Accountable</h3>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">See exactly who owns each graphic, reel, or invoice and when it is due.</p>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* ── ZIG-ZAG 02: Built for Agency Rhythm (Alternating) ── */}
        <ScrollReveal>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start pb-16 border-b border-slate-100">
            <div className="lg:col-span-7 order-2 lg:order-1 grid grid-cols-1 sm:grid-cols-2 gap-7 text-left pt-1">
              <div className="border-l-2 border-[#12B7D4] pl-4 space-y-1">
                <h3 className="font-bold text-slate-900 text-base">Step 1 — Capture Lead</h3>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">Log client phone number, requirements, and budget quote in seconds.</p>
              </div>
              <div className="border-l-2 border-slate-200 pl-4 space-y-1">
                <h3 className="font-bold text-slate-900 text-base">Step 2 — Schedule Posts</h3>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">Stage graphics, reels, and captions directly on the agency monthly calendar.</p>
              </div>
              <div className="border-l-2 border-slate-200 pl-4 space-y-1">
                <h3 className="font-bold text-slate-900 text-base">Step 3 — 1-Tap Client Review</h3>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">Client approves the creative directly on their phone with zero password needed.</p>
              </div>
              <div className="border-l-2 border-slate-200 pl-4 space-y-1">
                <h3 className="font-bold text-slate-900 text-base">Step 4 — Send GST Invoice</h3>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">Generate 18% GST tax invoice PDF with bank details ready in 30 seconds.</p>
              </div>
            </div>

            <div className="lg:col-span-5 order-1 lg:order-2 space-y-4 text-left">
              <p className="text-xs font-bold tracking-widest text-[#12B7D4] uppercase">
                02 — Agency Rhythm
              </p>
              <h2 className="font-extrabold text-3xl sm:text-4xl lg:text-[42px] text-slate-950 tracking-tight leading-[1.15]">
                Designed Around How
                <span className="bg-gradient-to-r from-[#12B7D4] via-[#0ea5c6] to-[#12B7D4] bg-clip-text text-transparent animate-text-shimmer block mt-1">
                  Agencies Actually Work.
                </span>
              </h2>
              <p className="text-base text-slate-600 font-medium leading-relaxed pt-1">
                We didn't build software with 500 complicated settings you'll never use. We built the exact 4 things every marketing agency needs every morning.
              </p>
            </div>
          </div>
        </ScrollReveal>

        {/* ── ZIG-ZAG 03: 100% Privacy & Safety ── */}
        <ScrollReveal>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            <div className="lg:col-span-5 space-y-4 text-left">
              <p className="text-xs font-bold tracking-widest text-[#12B7D4] uppercase">
                03 — 100% Privacy & Safety
              </p>
              <h2 className="font-extrabold text-3xl sm:text-4xl lg:text-[42px] text-slate-950 tracking-tight leading-[1.15]">
                Your Clients and Data
                <span className="bg-gradient-to-r from-[#12B7D4] via-[#0ea5c6] to-[#12B7D4] bg-clip-text text-transparent animate-text-shimmer block mt-1">
                  Stay 100% Yours.
                </span>
              </h2>
              <p className="text-base text-slate-600 font-medium leading-relaxed pt-1">
                Your agency receives its own dedicated company workspace. Your staff, clients, rates, and projects are strictly isolated and protected.
              </p>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-7 text-left pt-1">
              <div className="border-l-2 border-[#12B7D4] pl-4 space-y-1">
                <h3 className="font-bold text-slate-900 text-base">Isolated Database</h3>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">Every agency has dedicated space; other agencies cannot access your records.</p>
              </div>
              <div className="border-l-2 border-slate-200 pl-4 space-y-1">
                <h3 className="font-bold text-slate-900 text-base">Staff Access Control</h3>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">Employees only see clients and tasks assigned to them by their managers.</p>
              </div>
              <div className="border-l-2 border-slate-200 pl-4 space-y-1">
                <h3 className="font-bold text-slate-900 text-base">Automated Daily Backups</h3>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">Continuous database backups ensure your project deliverables are never lost.</p>
              </div>
              <div className="border-l-2 border-slate-200 pl-4 space-y-1">
                <h3 className="font-bold text-slate-900 text-base">Company Subdomain</h3>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">Custom agency workspace URL so your clients recognize your brand.</p>
              </div>
            </div>
          </div>
        </ScrollReveal>

      </div>

      {/* ── BOTTOM CTA ── */}
      <section className="bg-slate-900 text-white py-16 sm:py-20 px-4 sm:px-8 border-t border-slate-800 text-left sm:text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <p className="text-xs sm:text-sm font-bold tracking-widest text-[#12B7D4] uppercase">
            Start Running Your Agency Smarter
          </p>
          <h2 className="font-extrabold text-3xl sm:text-5xl text-white tracking-tight leading-tight">
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
              className="px-8 sm:px-10 py-3.5 sm:py-4 rounded-full bg-[#12B7D4] hover:bg-[#0ea5c6] text-white font-bold text-sm sm:text-base shadow-lg shadow-[#12B7D4]/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
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
