import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  Users2,
  Calendar,
  FileText,
  ShieldCheck,
  Clock,
  Sparkles,
  Smile,
  Send,
  Lock,
  ThumbsUp,
  Receipt,
  UserCheck
} from 'lucide-react';
import PublicLayout from '../components/public/PublicLayout';
import HeroPattern from '../components/public/HeroPattern';
import ScrollReveal from '../components/public/ScrollReveal';

const Landing = () => {
  return (
    <PublicLayout>
      {/* ── HERO SECTION (Pattern cut off right below action buttons) ── */}
      <section className="relative overflow-hidden border-b border-slate-200/80 pt-12 sm:pt-20 pb-14 sm:pb-16 px-4 sm:px-8 text-left sm:text-center">
        {/* Pattern strictly bounded inside Hero Section using ONLY Logo Blue #12B7D4 */}
        <HeroPattern />

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto">
          {/* Simple Everyday Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-slate-200/90 mb-6 self-start sm:self-auto shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#12B7D4] animate-pulse" />
            <span className="text-xs sm:text-sm font-bold text-slate-800 tracking-wide uppercase font-sans">
              Simple Software for Marketing Agencies
            </span>
          </div>

          {/* Big Clean Title (Black & Blue with Shimmer Animation) */}
          <h1 className="font-display font-extrabold text-5xl sm:text-7xl lg:text-[76px] text-slate-950 tracking-tight leading-[1.06]">
            Manage Your Agency.
          </h1>
          <h1 className="font-display font-extrabold text-5xl sm:text-7xl lg:text-[76px] bg-gradient-to-r from-[#12B7D4] via-[#0ea5c6] to-[#12B7D4] bg-clip-text text-transparent animate-text-shimmer tracking-tight leading-[1.06] mt-1 sm:mt-2">
            All in One Place.
          </h1>

          {/* Simple Human Subtitle */}
          <p className="mt-5 text-lg sm:text-2xl font-bold text-slate-800 tracking-tight">
            Clients. Social Media. Fast Approvals. GST Bills.
          </p>

          <p className="mt-3 text-sm sm:text-base text-slate-600 font-medium max-w-xl mx-auto leading-relaxed">
            Stop switching between scattered spreadsheets and endless chats. Everything your marketing agency needs in one clear, simple flow.
          </p>

          {/* Registration & Login Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-start sm:justify-center gap-3.5">
            <Link
              to="/register-company"
              className="px-8 sm:px-10 py-3.5 sm:py-4 rounded-full bg-[#12B7D4] hover:bg-[#0ea5c6] text-white font-black text-sm sm:text-base shadow-lg shadow-[#12B7D4]/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Register Company</span>
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/login"
              className="px-7 sm:px-9 py-3.5 sm:py-4 rounded-full bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-sm sm:text-base transition-all flex items-center justify-center shadow-2xs"
            >
              Login to Account
            </Link>
          </div>
        </div>
      </section>

      {/* ── HIGHLIGHTS STRIP ── */}
      <section className="bg-white py-8 px-4 sm:px-8 border-b border-slate-100">
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-left sm:text-center">
          <div>
            <span className="font-display font-black text-2xl sm:text-3xl text-slate-950 block">All-in-One</span>
            <span className="text-xs font-bold text-[#12B7D4] uppercase tracking-wider mt-0.5 block">No More Scattered Apps</span>
          </div>
          <div>
            <span className="font-display font-black text-2xl sm:text-3xl text-slate-950 block">Fast Approvals</span>
            <span className="text-xs font-bold text-[#12B7D4] uppercase tracking-wider mt-0.5 block">Zero Confusing Emails</span>
          </div>
          <div>
            <span className="font-display font-black text-2xl sm:text-3xl text-slate-950 block">GST Bills</span>
            <span className="text-xs font-bold text-[#12B7D4] uppercase tracking-wider mt-0.5 block">Ready in 1-Click</span>
          </div>
          <div>
            <span className="font-display font-black text-2xl sm:text-3xl text-slate-950 block">100% Private</span>
            <span className="text-xs font-bold text-[#12B7D4] uppercase tracking-wider mt-0.5 block">Safe for Your Team</span>
          </div>
        </div>
      </section>

      {/* ── ZIG-ZAG SECTIONS (NO CARDS, REDUCED TEXT, BLACK & BLUE ANIMATION, SMOOTH SCROLL) ── */}
      <div className="py-20 sm:py-28 px-4 sm:px-8 max-w-6xl mx-auto space-y-28 sm:space-y-36">

        {/* ── ZIG-ZAG 1: Client & Deal Tracker (Left: Text, Right: Visual Detail) ── */}
        <ScrollReveal>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-4 text-left">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#12B7D4] bg-[#12B7D4]/10 px-3.5 py-1 rounded-full">
                01 / Client & Deal Tracker
              </span>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-[44px] text-slate-950 tracking-tight leading-[1.15]">
                Never Lose a Lead.
                <span className="bg-gradient-to-r from-[#12B7D4] via-[#0ea5c6] to-[#12B7D4] bg-clip-text text-transparent animate-text-shimmer block mt-1">
                  Never Miss a Follow-up.
                </span>
              </h2>
              <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed">
                Keep all client phone numbers, requirements, and deal details organized so nobody forgets a follow-up.
              </p>
              <div className="pt-2 space-y-2.5 text-sm font-bold text-slate-800">
                <div className="flex items-center gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-[#12B7D4]/15 text-[#12B7D4] flex items-center justify-center shrink-0">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  <span>Save client phone numbers and notes in one place</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-[#12B7D4]/15 text-[#12B7D4] flex items-center justify-center shrink-0">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  <span>Know which deals are new, quoted, or closed</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-[#12B7D4]/15 text-[#12B7D4] flex items-center justify-center shrink-0">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  <span>Fast search by client name or service type</span>
                </div>
              </div>
            </div>

            {/* Right Visual Highlight (Open Minimalist Display, No Fake Mockup) */}
            <div className="lg:col-span-5 bg-gradient-to-br from-slate-50 to-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400">Live Client Tracker</span>
                <span className="text-xs font-bold text-[#12B7D4] bg-[#12B7D4]/10 px-2.5 py-0.5 rounded-full">Updated Today</span>
              </div>
              
              <div className="space-y-3">
                <div className="p-3.5 bg-white rounded-xl border border-slate-200/70 flex items-center justify-between shadow-2xs">
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-900 text-sm">Zenith Hospital Campaign</p>
                    <p className="text-xs text-slate-500 font-medium">₹85,000 / Month • SMM & Ads</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">Signed Deal</span>
                </div>

                <div className="p-3.5 bg-white rounded-xl border border-slate-200/70 flex items-center justify-between shadow-2xs">
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-900 text-sm">Apex Real Estate Reels</p>
                    <p className="text-xs text-slate-500 font-medium">₹45,000 / Month • Video Shoot</p>
                  </div>
                  <span className="text-xs font-bold text-[#12B7D4] bg-[#12B7D4]/10 px-2 py-1 rounded-md">Follow-up Today</span>
                </div>

                <div className="p-3.5 bg-white rounded-xl border border-slate-200/70 flex items-center justify-between shadow-2xs">
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-900 text-sm">Sunrise Fitness Brand</p>
                    <p className="text-xs text-slate-500 font-medium">₹30,000 / Month • SEO & Content</p>
                  </div>
                  <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-md">Proposal Sent</span>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* ── ZIG-ZAG 2: Social Media Calendar (Left: Visual Detail, Right: Text) ── */}
        <ScrollReveal>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Left Visual Highlight (Open Minimalist Display) */}
            <div className="lg:col-span-5 order-2 lg:order-1 bg-gradient-to-br from-slate-50 to-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400">Monthly SMM Calendar</span>
                <span className="text-xs font-bold text-slate-700">October 2026</span>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 bg-white rounded-xl border border-slate-200/70 space-y-1.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#12B7D4]">Tomorrow • 6:00 PM</span>
                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Ready to Post</span>
                  </div>
                  <p className="font-bold text-slate-900 text-sm">Festive Offer Reel (Instagram)</p>
                  <p className="text-xs text-slate-500">Designer: Sarah • Caption & Hashtags Ready</p>
                </div>

                <div className="p-3.5 bg-white rounded-xl border border-slate-200/70 space-y-1.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-600">Friday • 11:00 AM</span>
                    <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">Design Pending</span>
                  </div>
                  <p className="font-bold text-slate-900 text-sm">Customer Testimonial Carousel</p>
                  <p className="text-xs text-slate-500">Copy Approved • Raw Assets Attached</p>
                </div>
              </div>
            </div>

            {/* Right Content */}
            <div className="lg:col-span-7 order-1 lg:order-2 space-y-4 text-left">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#12B7D4] bg-[#12B7D4]/10 px-3.5 py-1 rounded-full">
                02 / Social Media Calendar
              </span>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-[44px] text-slate-950 tracking-tight leading-[1.15]">
                Plan a Month of Content.
                <span className="bg-gradient-to-r from-[#12B7D4] via-[#0ea5c6] to-[#12B7D4] bg-clip-text text-transparent animate-text-shimmer block mt-1">
                  Ready in 10 Minutes.
                </span>
              </h2>
              <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed">
                Visual agency calendar for your designers and writers. Everyone knows what needs to be created, approved, and posted.
              </p>
              <div className="pt-2 space-y-2.5 text-sm font-bold text-slate-800">
                <div className="flex items-center gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-[#12B7D4]/15 text-[#12B7D4] flex items-center justify-center shrink-0">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  <span>Visual monthly grid for posts, reels, and stories</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-[#12B7D4]/15 text-[#12B7D4] flex items-center justify-center shrink-0">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  <span>Writers and designers stay completely synced</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-[#12B7D4]/15 text-[#12B7D4] flex items-center justify-center shrink-0">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  <span>Zero missed deadlines or last-minute panics</span>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* ── ZIG-ZAG 3: Client Approvals (Left: Text, Right: Visual Detail) ── */}
        <ScrollReveal>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-4 text-left">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#12B7D4] bg-[#12B7D4]/10 px-3.5 py-1 rounded-full">
                03 / 1-Tap Client Approvals
              </span>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-[44px] text-slate-950 tracking-tight leading-[1.15]">
                Clients Approve on Phone.
                <span className="bg-gradient-to-r from-[#12B7D4] via-[#0ea5c6] to-[#12B7D4] bg-clip-text text-transparent animate-text-shimmer block mt-1">
                  Zero Endless Calls.
                </span>
              </h2>
              <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed">
                Give each client a private link to review creative designs. They tap to approve in seconds or request changes without endless calls.
              </p>
              <div className="pt-2 space-y-2.5 text-sm font-bold text-slate-800">
                <div className="flex items-center gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-[#12B7D4]/15 text-[#12B7D4] flex items-center justify-center shrink-0">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  <span>Clients preview designs right on their smartphone</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-[#12B7D4]/15 text-[#12B7D4] flex items-center justify-center shrink-0">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  <span>Instant 1-tap sign-off with recorded timestamp</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-[#12B7D4]/15 text-[#12B7D4] flex items-center justify-center shrink-0">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  <span>No password needed for clients to review work</span>
                </div>
              </div>
            </div>

            {/* Right Visual Highlight (Open Minimalist Display) */}
            <div className="lg:col-span-5 bg-gradient-to-br from-slate-50 to-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400">Client Sign-Off Flow</span>
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <ThumbsUp size={12} /> Approved
                </span>
              </div>

              <div className="p-4 bg-white rounded-xl border border-slate-200/70 space-y-3 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#12B7D4]/15 text-[#12B7D4] flex items-center justify-center font-black">
                    RM
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">Campaign Creative Approval</p>
                    <p className="text-xs text-slate-500">Approved by Rajesh Kumar (CEO)</p>
                  </div>
                </div>
                <div className="bg-emerald-50 text-emerald-700 text-xs font-bold p-2.5 rounded-lg flex items-center gap-2">
                  <Check size={14} />
                  <span>Post approved for publishing tomorrow</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-xs text-slate-600 font-medium flex items-center justify-between">
                <span>Client Review Speed</span>
                <span className="font-bold text-slate-900">Average 4 minutes</span>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* ── ZIG-ZAG 4: GST Billing (Left: Visual Detail, Right: Text) ── */}
        <ScrollReveal>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Left Visual Highlight (Open Minimalist Display) */}
            <div className="lg:col-span-5 order-2 lg:order-1 bg-gradient-to-br from-slate-50 to-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400">Instant GST Bill</span>
                <span className="text-xs font-bold text-[#12B7D4]">Ready in 1-Click</span>
              </div>

              <div className="p-4 bg-white rounded-xl border border-slate-200/70 space-y-2.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">TAX INVOICE #RWM-2026-104</span>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Paid</span>
                </div>
                <p className="font-black text-2xl text-slate-950">₹59,000</p>
                <div className="text-xs text-slate-600 space-y-1 pt-1 border-t border-slate-100 font-medium">
                  <div className="flex justify-between">
                    <span>Base Retainer:</span>
                    <span>₹50,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>18% GST (9% CGST + 9% SGST):</span>
                    <span>₹9,000</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-[#12B7D4]/10 rounded-xl text-xs text-[#0e8fa6] font-bold flex items-center justify-between">
                <span>Automatic GST Calculation</span>
                <span>PDF Download Ready</span>
              </div>
            </div>

            {/* Right Content */}
            <div className="lg:col-span-7 order-1 lg:order-2 space-y-4 text-left">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#12B7D4] bg-[#12B7D4]/10 px-3.5 py-1 rounded-full">
                04 / Fast GST Billing
              </span>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-[44px] text-slate-950 tracking-tight leading-[1.15]">
                Generate Clean Tax Invoices.
                <span className="bg-gradient-to-r from-[#12B7D4] via-[#0ea5c6] to-[#12B7D4] bg-clip-text text-transparent animate-text-shimmer block mt-1">
                  Ready in 30 Seconds.
                </span>
              </h2>
              <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed">
                Create clean tax invoices in seconds with automatic GST calculation. Download PDF receipts immediately.
              </p>
              <div className="pt-2 space-y-2.5 text-sm font-bold text-slate-800">
                <div className="flex items-center gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-[#12B7D4]/15 text-[#12B7D4] flex items-center justify-center shrink-0">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  <span>Automatic 18% GST and tax calculations</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-[#12B7D4]/15 text-[#12B7D4] flex items-center justify-center shrink-0">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  <span>Instant PDF invoice download for clients</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-[#12B7D4]/15 text-[#12B7D4] flex items-center justify-center shrink-0">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  <span>Track paid, partial, and pending payments</span>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* ── ZIG-ZAG 5: Staff Attendance & Privacy (Left: Text, Right: Visual Detail) ── */}
        <ScrollReveal>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-4 text-left">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#12B7D4] bg-[#12B7D4]/10 px-3.5 py-1 rounded-full">
                05 / Staff Attendance & Workspace
              </span>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-[44px] text-slate-950 tracking-tight leading-[1.15]">
                Safe, Private Workspace.
                <span className="bg-gradient-to-r from-[#12B7D4] via-[#0ea5c6] to-[#12B7D4] bg-clip-text text-transparent animate-text-shimmer block mt-1">
                  Built for Your Entire Team.
                </span>
              </h2>
              <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed">
                Simple selfie check-in for team attendance, role permissions so staff only see what they need, and your client data stays 100% private.
              </p>
              <div className="pt-2 space-y-2.5 text-sm font-bold text-slate-800">
                <div className="flex items-center gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-[#12B7D4]/15 text-[#12B7D4] flex items-center justify-center shrink-0">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  <span>Quick selfie attendance check-in for staff</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-[#12B7D4]/15 text-[#12B7D4] flex items-center justify-center shrink-0">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  <span>Staff only see tasks and clients assigned to them</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-[#12B7D4]/15 text-[#12B7D4] flex items-center justify-center shrink-0">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  <span>Your company data stays completely separate and safe</span>
                </div>
              </div>
            </div>

            {/* Right Visual Highlight (Open Minimalist Display) */}
            <div className="lg:col-span-5 bg-gradient-to-br from-slate-50 to-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400">Team Check-In Status</span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">All Present</span>
              </div>

              <div className="p-4 bg-white rounded-xl border border-slate-200/70 space-y-2.5 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#12B7D4]/15 text-[#12B7D4] flex items-center justify-center font-bold">
                    <Smile size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">Selfie Check-In: 9:28 AM</p>
                    <p className="text-xs text-slate-500 font-medium">Verified on Mobile • On Time</p>
                  </div>
                </div>
                <p className="text-xs text-slate-600 pt-1 border-t border-slate-100 font-medium">
                  Monthly attendance and work hours calculated automatically.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700 font-bold flex items-center justify-between">
                <span>Private Company URL</span>
                <span className="text-[#12B7D4]">yourcompany.risewithmedia.com</span>
              </div>
            </div>
          </div>
        </ScrollReveal>

      </div>

      {/* ── BOTTOM CTA SECTION (Distinct Register & Login Buttons) ── */}
      <section className="bg-slate-900 text-white py-16 sm:py-20 px-4 sm:px-8 border-t border-slate-800 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-left sm:text-center relative z-10 space-y-6">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#12B7D4] bg-[#12B7D4]/20 px-3.5 py-1 rounded-full">
            Start Running Your Agency Smarter
          </span>
          <h2 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight leading-tight">
            Ready to Organize Your{' '}
            <span className="bg-gradient-to-r from-[#12B7D4] via-[#38bdf8] to-[#12B7D4] bg-clip-text text-transparent animate-text-shimmer">
              Entire Agency?
            </span>
          </h2>
          <p className="text-slate-300 text-sm sm:text-base font-medium max-w-xl mx-auto">
            Register your company in 2 minutes. Keep your clients happy, your team on track, and your bills on time.
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

export default Landing;
