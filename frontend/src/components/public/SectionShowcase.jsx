import React from 'react';
import {
  Check,
  CheckCheck,
  MessageSquare,
  Calendar,
  Instagram,
  FileText,
  ShieldCheck,
  Smartphone,
  Download,
  Building2,
  Clock,
  Sparkles,
  QrCode,
  Zap,
} from 'lucide-react';

/**
 * 16-point smooth wavy scalloped seal path in 100x100 viewBox
 */
const SCALLOP_PATH =
  'M 50 4 Q 50 4 54 6.9 Q 58 9.8 62.8 8.7 Q 67.6 7.5 70.2 11.7 Q 72.8 15.9 77.7 16.7 Q 82.5 17.5 83.3 22.4 Q 84.1 27.2 88.3 29.8 Q 92.5 32.4 91.3 37.2 Q 90.2 42 93.1 46 Q 96 50 93.1 54 Q 90.2 58 91.3 62.8 Q 92.5 67.6 88.3 70.2 Q 84.1 72.8 83.3 77.7 Q 82.5 82.5 77.7 83.3 Q 72.8 84.1 70.2 88.3 Q 67.6 92.5 62.8 91.3 Q 58 90.2 54 93.1 Q 50 96 46 93.1 Q 42 90.2 37.2 91.3 Q 32.4 92.5 29.8 88.3 Q 27.2 84.1 22.4 83.3 Q 17.5 82.5 16.7 77.7 Q 15.9 72.8 11.7 70.2 Q 7.5 67.6 8.7 62.8 Q 9.8 58 6.9 54 Q 4 50 6.9 46 Q 9.8 42 8.7 37.2 Q 7.5 32.4 11.7 29.8 Q 15.9 27.2 16.7 22.4 Q 17.5 17.5 22.4 16.7 Q 27.2 15.9 29.8 11.7 Q 32.4 7.5 37.2 8.7 Q 42 9.8 46 6.9 Z';

/**
 * SectionShowcase Component
 * Recreates the modern SaaS smartphone showcase with floating stickers,
 * dashed trajectory orbits, scalloped checkmark seal, and chat bubbles
 * exactly matching the reference design.
 */
const SectionShowcase = ({ type = 'leads' }) => {
  // Configuration per feature type
  const configs = {
    leads: {
      sealText: 'Lead Verified',
      bubbleText: '₹75k Retainer Won',
      topBadgeIcon: MessageSquare,
      topBadgeBg: 'bg-[#25D366]',
      topBadgeBorder: 'border-emerald-300',
      notificationTag: 'WhatsApp Inquiry',
      notificationTitle: 'Rohit Sharma • Nexa Retail',
      notificationDesc: '"Need Meta ad campaigns & monthly reels. Budget ₹75k."',
      btnText: 'Quick Quote',
      btnSecondary: 'View Lead',
      renderPhoneScreen: () => (
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs">
                RS
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-900 leading-tight">Rohit Sharma</p>
                <p className="text-[10px] text-emerald-600 font-semibold">Online • WhatsApp</p>
              </div>
            </div>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
              Qualified
            </span>
          </div>

          <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-2.5 text-left space-y-1">
            <p className="text-[11px] font-semibold text-slate-800 leading-relaxed">
              "Hi RiseWithMedia! We need full Meta ad management & 12 reels for Diwali. Budget is ₹75,000/mo."
            </p>
            <p className="text-[9px] text-slate-400 text-right">10:42 AM</p>
          </div>

          <div className="bg-slate-100 rounded-xl p-2 text-left space-y-1">
            <div className="flex justify-between text-[10px] font-bold text-slate-600">
              <span>Service: SMM + Meta Ads</span>
              <span className="text-slate-900">₹75,000/mo</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div className="bg-[#12B7D4] h-full w-4/5" />
            </div>
            <p className="text-[9px] text-slate-500 font-medium">Stage: Proposal Sent • Follow-up Today</p>
          </div>
        </div>
      ),
    },

    calendar: {
      sealText: 'Calendar Synced',
      bubbleText: 'Scheduled 6:00 PM',
      topBadgeIcon: Instagram,
      topBadgeBg: 'bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600',
      topBadgeBorder: 'border-pink-300',
      notificationTag: 'Creative Staged',
      notificationTitle: 'Diwali Festive Launch',
      notificationDesc: '5 carousel graphics & hashtags attached.',
      btnText: 'Preview Post',
      btnSecondary: 'Schedule',
      renderPhoneScreen: () => (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 text-white flex items-center justify-center font-bold text-xs">
                FB
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-900 leading-tight">FreshBites Cafe</p>
                <p className="text-[10px] text-slate-400 font-semibold">Sponsored • Instagram</p>
              </div>
            </div>
            <span className="text-[10px] bg-cyan-50 text-cyan-700 font-bold px-2 py-0.5 rounded-full border border-cyan-200">
              Friday 6 PM
            </span>
          </div>

          {/* Ad Creative Mockup Preview */}
          <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-2xs">
            <div className="h-28 bg-gradient-to-br from-cyan-500 via-teal-600 to-slate-900 flex flex-col items-center justify-center p-3 text-white text-center">
              <span className="text-[9px] font-black uppercase tracking-widest text-cyan-200 mb-0.5">Special Promo</span>
              <p className="text-sm font-extrabold leading-tight">Weekend 30% Off Feast</p>
              <p className="text-[10px] text-white/80 mt-1">Gourmet Bowls & Live Music</p>
            </div>
            <div className="bg-white p-2 text-left">
              <p className="text-[10px] font-semibold text-slate-800 line-clamp-1">
                "Reserve your table today! Link in bio. #FreshBites #WeekendVibes"
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 pt-0.5">
            <span>Copywriter: Staged</span>
            <span className="text-emerald-600 font-extrabold">✓ Graphics Ready</span>
          </div>
        </div>
      ),
    },

    approvals: {
      sealText: 'Approved in 4m',
      bubbleText: 'Approved by CEO',
      topBadgeIcon: Smartphone,
      topBadgeBg: 'bg-[#12B7D4]',
      topBadgeBorder: 'border-cyan-300',
      notificationTag: '1-Tap Sign-off',
      notificationTitle: 'Q4 Launch Creative',
      notificationDesc: 'Client review link generated. Zero login needed.',
      btnText: 'Approve Post',
      btnSecondary: 'Request Edit',
      renderPhoneScreen: () => (
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
            <div className="text-left">
              <p className="text-[10px] font-bold text-[#12B7D4] uppercase tracking-wider">portal.risewithmedia.com</p>
              <p className="text-xs font-bold text-slate-900">Diwali Campaign Post #04</p>
            </div>
            <span className="text-[10px] bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded-full border border-amber-200">
              Needs Sign-off
            </span>
          </div>

          <div className="rounded-2xl border-2 border-dashed border-[#12B7D4]/40 bg-[#12B7D4]/5 p-3 text-center space-y-1.5">
            <Sparkles size={18} className="text-[#12B7D4] mx-auto" />
            <p className="text-xs font-bold text-slate-900">Instagram Ad Carousel Preview</p>
            <p className="text-[10px] text-slate-500">Staged for Friday, 6:00 PM</p>
          </div>

          {/* Realistic 1-Tap Client Review Buttons */}
          <div className="space-y-1.5 pt-1">
            <div className="w-full py-2.5 rounded-xl bg-[#12B7D4] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-[#12B7D4]/25">
              <Check size={14} className="stroke-[3]" />
              <span>Approve Post</span>
            </div>
            <div className="w-full py-1.5 rounded-xl bg-white border border-slate-300 text-slate-700 text-[11px] font-semibold text-center">
              Request Edit
            </div>
          </div>
        </div>
      ),
    },

    billing: {
      sealText: '18% GST Compliant',
      bubbleText: 'Paid via UPI QR',
      topBadgeIcon: QrCode,
      topBadgeBg: 'bg-emerald-600',
      topBadgeBorder: 'border-emerald-300',
      notificationTag: 'GST Tax Invoice',
      notificationTitle: 'Invoice #RWM-2026-089',
      notificationDesc: 'Auto CGST (9%) + SGST (9%) calculated.',
      btnText: 'Download PDF',
      btnSecondary: 'View Bill',
      renderPhoneScreen: () => (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
            <div className="text-left">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">TAX INVOICE</p>
              <p className="text-xs font-bold text-slate-900">#RWM-2026-089</p>
            </div>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-md border border-emerald-300">
              PAID IN FULL
            </span>
          </div>

          <div className="bg-slate-100/90 rounded-2xl p-2.5 text-left space-y-1.5 text-[11px]">
            <div className="flex justify-between font-semibold text-slate-700">
              <span>Monthly SMM Retainer</span>
              <span className="font-bold text-slate-900">₹50,000.00</span>
            </div>
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>CGST (9.0%)</span>
              <span>₹4,500.00</span>
            </div>
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>SGST (9.0%)</span>
              <span>₹4,500.00</span>
            </div>
            <div className="border-t border-slate-300/80 pt-1 flex justify-between font-extrabold text-xs text-slate-950">
              <span>Total Amount</span>
              <span className="text-[#12B7D4]">₹59,000.00</span>
            </div>
          </div>

          <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-[10px] font-bold text-emerald-800">
            <div className="flex items-center gap-1.5">
              <CheckCheck size={14} className="text-emerald-600" />
              <span>UPI & Bank Received</span>
            </div>
            <span className="text-slate-500 font-normal">HDFC •• 4912</span>
          </div>
        </div>
      ),
    },

    attendance: {
      sealText: 'Selfie Verified',
      bubbleText: 'Present On-Time',
      topBadgeIcon: ShieldCheck,
      topBadgeBg: 'bg-[#12B7D4]',
      topBadgeBorder: 'border-cyan-300',
      notificationTag: 'Attendance Active',
      notificationTitle: 'Priya Nair • Sr. Designer',
      notificationDesc: 'Checked in at 09:28 AM with mobile selfie.',
      btnText: 'View Log',
      btnSecondary: 'Team Status',
      renderPhoneScreen: () => (
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
            <div className="text-left">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">TEAM ATTENDANCE</p>
              <p className="text-xs font-bold text-slate-900">Today • 18 Nov 2026</p>
            </div>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
              100% Present
            </span>
          </div>

          <div className="p-2.5 rounded-2xl bg-white border border-slate-200 text-left space-y-1.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#12B7D4]/15 text-[#12B7D4] flex items-center justify-center font-bold text-xs">
                  PN
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Priya Nair</p>
                  <p className="text-[10px] text-slate-500">Sr. Graphic Designer</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                09:28 AM
              </span>
            </div>
            <div className="text-[10px] text-slate-600 pt-1 flex items-center gap-1">
              <Check size={11} className="text-emerald-500 stroke-[3]" />
              <span>Selfie Snapshot & Office HQ Verified</span>
            </div>
          </div>

          <div className="bg-slate-100 rounded-xl p-2 text-left flex items-center justify-between text-[10px] font-bold text-slate-600">
            <span>Workspace: 100% Private</span>
            <span className="text-emerald-600 font-extrabold">Data Isolated</span>
          </div>
        </div>
      ),
    },

    privacy: {
      sealText: '100% Private',
      bubbleText: 'Strictly Isolated',
      topBadgeIcon: ShieldCheck,
      topBadgeBg: 'bg-slate-900',
      topBadgeBorder: 'border-slate-700',
      notificationTag: 'Company Tenant',
      notificationTitle: 'Dedicated Agency DB',
      notificationDesc: 'Zero data bleed between agencies.',
      btnText: 'Security Spec',
      btnSecondary: 'Backups',
      renderPhoneScreen: () => (
        <div className="space-y-3 text-left">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">TENANT SECURITY</p>
              <p className="text-xs font-bold text-slate-900">Isolated Workspace Space</p>
            </div>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
              Active
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-100 space-y-1 text-[11px] font-medium text-slate-700">
            <p className="font-bold text-slate-900">workspace.risewithmedia.com</p>
            <p className="text-[10px] text-slate-500">Strict Multi-Tenant Database Partition</p>
            <div className="pt-1 flex items-center gap-1.5 text-emerald-600 font-bold text-[10px]">
              <Check size={12} className="stroke-[3]" />
              <span>Client Records 100% Protected</span>
            </div>
          </div>

          <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-[10px] font-bold text-emerald-800 flex justify-between">
            <span>Daily Encrypted Backups</span>
            <span>24/7 Monitored</span>
          </div>
        </div>
      ),
    },

    speed: {
      sealText: '0.38s Ultra Fast',
      bubbleText: 'Under 0.4s Load',
      topBadgeIcon: Zap,
      topBadgeBg: 'bg-amber-500',
      topBadgeBorder: 'border-amber-300',
      notificationTag: 'Edge Performance',
      notificationTitle: 'Instant Mobile Load',
      notificationDesc: 'Optimized lightweight bundles on 4G & WiFi.',
      btnText: 'View Metrics',
      btnSecondary: 'CDN Ping',
      renderPhoneScreen: () => (
        <div className="space-y-3 text-left">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">INFRASTRUCTURE</p>
              <p className="text-xs font-bold text-slate-900">Global Edge Network</p>
            </div>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
              99.98% Up
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-gradient-to-br from-[#12B7D4]/10 via-cyan-50 to-white border border-[#12B7D4]/30 text-center space-y-1">
            <p className="text-2xl font-black text-slate-950 tracking-tight">0.38s</p>
            <p className="text-[10px] font-bold text-[#12B7D4] uppercase tracking-wider">Full Interactive Time</p>
          </div>

          <div className="space-y-1 text-[10px] font-medium text-slate-600">
            <div className="flex justify-between">
              <span>Client Portal Response</span>
              <span className="font-bold text-emerald-600">12ms</span>
            </div>
            <div className="flex justify-between">
              <span>Mobile 4G Performance</span>
              <span className="font-bold text-emerald-600">Grade A+</span>
            </div>
          </div>
        </div>
      ),
    },

    rhythm: {
      sealText: 'Daily Flow Done',
      bubbleText: '4 Steps in 1 Hub',
      topBadgeIcon: Sparkles,
      topBadgeBg: 'bg-[#12B7D4]',
      topBadgeBorder: 'border-cyan-300',
      notificationTag: 'Agency Rhythm',
      notificationTitle: 'Morning To Evening',
      notificationDesc: 'Leads, schedule, approvals, and GST billing.',
      btnText: 'Start Flow',
      btnSecondary: 'Overview',
      renderPhoneScreen: () => (
        <div className="space-y-2.5 text-left">
          <div className="flex items-center justify-between pb-1 border-b border-slate-200">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">OPERATING RHYTHM</p>
              <p className="text-xs font-bold text-slate-900">4 Connected Steps</p>
            </div>
            <span className="text-[10px] bg-[#12B7D4]/15 text-[#0e7490] font-bold px-2 py-0.5 rounded-full">
              Seamless
            </span>
          </div>

          <div className="space-y-1.5 text-[10px] font-bold">
            <div className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between">
              <span>1. Capture Lead</span>
              <Check size={12} className="stroke-[3]" />
            </div>
            <div className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between">
              <span>2. Schedule Posts</span>
              <Check size={12} className="stroke-[3]" />
            </div>
            <div className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between">
              <span>3. 1-Tap Client Review</span>
              <Check size={12} className="stroke-[3]" />
            </div>
            <div className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between">
              <span>4. Generate GST Bill</span>
              <Check size={12} className="stroke-[3]" />
            </div>
          </div>
        </div>
      ),
    },
  };

  const item = configs[type] || configs.leads;
  const TopBadgeIcon = item.topBadgeIcon;

  return (
    <div className="relative w-full max-w-[380px] sm:max-w-[420px] mx-auto py-8 px-4 flex items-center justify-center select-none">
      
      {/* ── BACKGROUND DASHED ORBITAL PATH (Linking Stickers) ── */}
      <svg
        className="absolute -inset-2 w-[calc(100%+16px)] h-[calc(100%+16px)] pointer-events-none overflow-visible"
        viewBox="0 0 400 400"
        fill="none"
      >
        <path
          d="M 50 320 C 20 180, 80 50, 260 40 C 350 45, 380 120, 360 260 C 340 360, 180 390, 80 340"
          stroke="#94a3b8"
          strokeWidth="2"
          strokeDasharray="6 6"
          strokeLinecap="round"
          opacity="0.55"
        />
      </svg>

      {/* ── FLOATING STICKER 1: Popping Notification Card (Top-Left) ── */}
      <div className="absolute -top-3 -left-3 sm:-left-8 z-30 max-w-[190px] sm:max-w-[210px] bg-white/95 backdrop-blur-md p-2.5 sm:p-3 rounded-2xl shadow-xl border border-slate-200/90 text-left transition-transform duration-300 hover:scale-105">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-[9px] font-black uppercase tracking-wider text-emerald-700">
            {item.notificationTag}
          </span>
        </div>
        <p className="text-[11px] sm:text-xs font-bold text-slate-900 leading-snug truncate">
          {item.notificationTitle}
        </p>
        <p className="text-[9px] sm:text-[10px] text-slate-500 font-medium leading-relaxed mt-0.5 line-clamp-2">
          {item.notificationDesc}
        </p>
        <div className="mt-2 flex items-center gap-1.5">
          <span className="px-2 py-0.5 rounded-md bg-[#12B7D4] text-white text-[9px] font-bold shadow-2xs">
            {item.btnText}
          </span>
          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[9px] font-semibold border border-slate-200">
            {item.btnSecondary}
          </span>
        </div>
      </div>

      {/* ── FLOATING STICKER 2: Top-Right App/Feature Circular Badge ── */}
      <div
        className={`absolute -top-3 -right-2 sm:-right-4 z-30 w-11 h-11 sm:w-12 sm:h-12 rounded-full ${item.topBadgeBg} ${item.topBadgeBorder} border-2 text-white flex items-center justify-center shadow-lg transition-transform duration-300 hover:scale-110`}
        title={item.sealText}
      >
        <TopBadgeIcon size={22} className="stroke-[2.5]" />
      </div>

      {/* ── SMARTPHONE DEVICE MOCKUP (Central Anchor) ── */}
      <div className="w-[240px] sm:w-[270px] bg-slate-900 rounded-[38px] p-2.5 shadow-2xl shadow-slate-900/20 border-4 border-slate-800 relative z-20 transition-transform duration-300 hover:scale-[1.01]">
        {/* Dynamic Island / Notch */}
        <div className="w-16 h-3.5 bg-slate-900 rounded-full mx-auto mb-2 flex items-center justify-end pr-1.5">
          <div className="w-2 h-2 rounded-full bg-slate-800" />
        </div>

        {/* Screen Content Wrapper */}
        <div className="bg-slate-50 rounded-[30px] overflow-hidden border border-slate-200/60 p-3 min-h-[280px] sm:min-h-[300px]">
          {item.renderPhoneScreen()}
        </div>

        {/* Phone Bottom Pill Indicator */}
        <div className="w-24 h-1 bg-slate-700 rounded-full mx-auto mt-2" />
      </div>

      {/* ── FLOATING STICKER 3: Scalloped Circular Checkmark Seal Badge (Bottom-Left on Orbit) ── */}
      <div
        className="absolute -bottom-2 -left-3 sm:-left-6 z-30 flex items-center gap-2 group transition-transform duration-300 hover:scale-105"
      >
        <div className="relative flex items-center justify-center filter drop-shadow-md">
          <svg viewBox="0 0 100 100" className="w-14 h-14 sm:w-16 sm:h-16 text-emerald-500 fill-current">
            <path d={SCALLOP_PATH} />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <Check size={22} className="text-white stroke-[3.5]" />
          </div>
        </div>
        <div className="hidden sm:block bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-xl shadow-md border border-slate-200/90 text-left">
          <p className="text-[10px] font-bold text-slate-900 leading-tight">{item.sealText}</p>
          <p className="text-[8px] font-bold text-emerald-600 uppercase">100% Verified</p>
        </div>
      </div>

      {/* ── FLOATING STICKER 4: Action Chat Bubble with Double Checkmarks (Right/Bottom) ── */}
      <div
        className="absolute bottom-6 -right-2 sm:-right-6 z-30 px-3.5 py-1.5 rounded-full bg-emerald-50/95 backdrop-blur-md border border-emerald-300/90 shadow-lg text-emerald-900 font-bold text-xs sm:text-sm flex items-center gap-1.5 -rotate-2 transition-transform duration-300 hover:rotate-0 hover:scale-105"
      >
        <span>{item.bubbleText}</span>
        <CheckCheck size={15} className="text-emerald-600 shrink-0" />
      </div>

    </div>
  );
};

export default SectionShowcase;
