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
  Plane,
  Rocket,
  ThumbsUp,
  CheckCircle2,
} from 'lucide-react';
import { InstagramIcon, WhatsAppIcon, SocialIcon } from '../ui/SocialIcons';

/**
 * 16-point smooth wavy scalloped seal path in 100x100 viewBox
 */
const SCALLOP_PATH =
  'M 50 4 Q 50 4 54 6.9 Q 58 9.8 62.8 8.7 Q 67.6 7.5 70.2 11.7 Q 72.8 15.9 77.7 16.7 Q 82.5 17.5 83.3 22.4 Q 84.1 27.2 88.3 29.8 Q 92.5 32.4 91.3 37.2 Q 90.2 42 93.1 46 Q 96 50 93.1 54 Q 90.2 58 91.3 62.8 Q 92.5 67.6 88.3 70.2 Q 84.1 72.8 83.3 77.7 Q 82.5 82.5 77.7 83.3 Q 72.8 84.1 70.2 88.3 Q 67.6 92.5 62.8 91.3 Q 58 90.2 54 93.1 Q 50 96 46 93.1 Q 42 90.2 37.2 91.3 Q 32.4 92.5 29.8 88.3 Q 27.2 84.1 22.4 83.3 Q 17.5 82.5 16.7 77.7 Q 15.9 72.8 11.7 70.2 Q 7.5 67.6 8.7 62.8 Q 9.8 58 6.9 54 Q 4 50 6.9 46 Q 9.8 42 8.7 37.2 Q 7.5 32.4 11.7 29.8 Q 15.9 27.2 16.7 22.4 Q 17.5 17.5 22.4 16.7 Q 27.2 15.9 29.8 11.7 Q 32.4 7.5 37.2 8.7 Q 42 9.8 46 6.9 Z';

/**
 * SectionShowcase Component
 * Recreates the modern SaaS smartphone showcase with:
 * - Real smiling team member / founder cutout photo gesturing to the phone
 * - Pure visual floating stickers with NO TEXT (airplane/badge, WhatsApp circle, scalloped checkmark seal)
 * - Dotted grid pattern and dashed orbital trajectory
 * - Interactive smartphone mockup screen
 */
const SectionShowcase = ({ type = 'leads', person, showPerson = true }) => {
  // Configuration per feature type
  const configs = {
    leads: {
      personType: 'sitting',
      topBadgeIcon: Plane,
      topBadgeBg: 'bg-emerald-500',
      topBadgeBorder: 'border-emerald-300',
      chatBadgeIcon: MessageSquare,
      chatBadgeBg: 'bg-[#25D366]',
      chatBadgeBorder: 'border-emerald-300',
      notificationTag: 'Inquiry Received',
      notificationTitle: 'Rohit Sharma • Nexa Retail',
      notificationDesc: '"Need Meta ad campaigns & monthly reels. Budget ₹75k."',
      btnText: 'Quick Quote',
      btnSecondary: 'View Lead',
      renderPhoneScreen: () => (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-200">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
                RS
              </div>
              <div className="text-left min-w-0">
                <p className="text-xs font-bold text-slate-900 leading-tight truncate">Rohit Sharma</p>
                <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold truncate">
                  <span>Online •</span>
                  <WhatsAppIcon size={12} />
                  <span>WhatsApp</span>
                </div>
              </div>
            </div>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200 whitespace-nowrap shrink-0">
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
      personType: 'standing',
      topBadgeIcon: Instagram,
      topBadgeBg: 'bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600',
      topBadgeBorder: 'border-pink-300',
      chatBadgeIcon: Calendar,
      chatBadgeBg: 'bg-[#12B7D4]',
      chatBadgeBorder: 'border-cyan-300',
      notificationTag: 'Creative Staged',
      notificationTitle: 'Diwali Festive Launch',
      notificationDesc: '5 carousel graphics & hashtags attached.',
      btnText: 'Preview Post',
      btnSecondary: 'Schedule',
      renderPhoneScreen: () => (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-200">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
                FB
              </div>
              <div className="text-left min-w-0">
                <p className="text-xs font-bold text-slate-900 leading-tight truncate">FreshBites Cafe</p>
                <div className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold truncate">
                  <span>Sponsored •</span>
                  <InstagramIcon size={12} />
                  <span>Instagram</span>
                </div>
              </div>
            </div>
            <span className="text-[10px] bg-cyan-50 text-cyan-700 font-bold px-2 py-0.5 rounded-full border border-cyan-200 whitespace-nowrap shrink-0">
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
      personType: 'sitting',
      topBadgeIcon: CheckCircle2,
      topBadgeBg: 'bg-[#12B7D4]',
      topBadgeBorder: 'border-cyan-300',
      chatBadgeIcon: CheckCheck,
      chatBadgeBg: 'bg-emerald-500',
      chatBadgeBorder: 'border-emerald-300',
      notificationTag: '1-Tap Sign-off',
      notificationTitle: 'Q4 Launch Creative',
      notificationDesc: 'Client review link generated. Zero login needed.',
      btnText: 'Approve Post',
      btnSecondary: 'Request Edit',
      renderPhoneScreen: () => (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-1.5 pb-1.5 border-b border-slate-200">
            <div className="text-left min-w-0">
              <p className="text-[9px] sm:text-[10px] font-bold text-[#12B7D4] uppercase tracking-wider">Client Review</p>
              <p className="text-xs font-bold text-slate-900 truncate">Diwali Post #04</p>
            </div>
            <span className="text-[9px] sm:text-[10px] bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded-full border border-amber-200 whitespace-nowrap shrink-0">
              Needs Sign-off
            </span>
          </div>

          <div className="rounded-2xl border-2 border-dashed border-[#12B7D4]/40 bg-[#12B7D4]/5 p-2.5 sm:p-3 text-center space-y-1 sm:space-y-1.5">
            <div className="flex items-center justify-center gap-1.5">
              <InstagramIcon size={16} />
              <p className="text-xs font-bold text-slate-900 leading-snug">Instagram Ad Carousel Preview</p>
            </div>
            <p className="text-[10px] text-slate-500">Staged for Friday, 6:00 PM</p>
          </div>

          {/* Realistic 1-Tap Client Review Buttons */}
          <div className="space-y-1.5 pt-0.5 sm:pt-1">
            <div className="w-full py-2 sm:py-2.5 rounded-xl bg-[#12B7D4] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-[#12B7D4]/25">
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
      personType: 'standing',
      topBadgeIcon: QrCode,
      topBadgeBg: 'bg-emerald-600',
      topBadgeBorder: 'border-emerald-300',
      chatBadgeIcon: Zap,
      chatBadgeBg: 'bg-[#12B7D4]',
      chatBadgeBorder: 'border-cyan-300',
      notificationTag: 'GST Tax Invoice',
      notificationTitle: 'Invoice #RWM-2026-089',
      notificationDesc: 'Auto CGST (9%) + SGST (9%) calculated.',
      btnText: 'Download PDF',
      btnSecondary: 'View Bill',
      renderPhoneScreen: () => (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-slate-200">
            <div className="text-left min-w-0">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">TAX INVOICE</p>
              <p className="text-xs font-bold text-slate-900 truncate">#RWM-2026-089</p>
            </div>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-md border border-emerald-300 whitespace-nowrap shrink-0">
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
      personType: 'sitting',
      topBadgeIcon: ShieldCheck,
      topBadgeBg: 'bg-[#12B7D4]',
      topBadgeBorder: 'border-cyan-300',
      chatBadgeIcon: Clock,
      chatBadgeBg: 'bg-emerald-500',
      chatBadgeBorder: 'border-emerald-300',
      notificationTag: 'Attendance Active',
      notificationTitle: 'Priya Nair • Sr. Designer',
      notificationDesc: 'Checked in at 09:28 AM with mobile selfie.',
      btnText: 'View Log',
      btnSecondary: 'Team Status',
      renderPhoneScreen: () => (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-slate-200">
            <div className="text-left min-w-0">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">TEAM ATTENDANCE</p>
              <p className="text-xs font-bold text-slate-900 truncate">Today • 18 Nov 2026</p>
            </div>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200 whitespace-nowrap shrink-0">
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
      personType: 'standing',
      topBadgeIcon: ShieldCheck,
      topBadgeBg: 'bg-slate-900',
      topBadgeBorder: 'border-slate-700',
      chatBadgeIcon: Building2,
      chatBadgeBg: 'bg-emerald-600',
      chatBadgeBorder: 'border-emerald-300',
      notificationTag: 'Company Tenant',
      notificationTitle: 'Dedicated Agency DB',
      notificationDesc: 'Zero data bleed between agencies.',
      btnText: 'Security Spec',
      btnSecondary: 'Backups',
      renderPhoneScreen: () => (
        <div className="space-y-3 text-left">
          <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-slate-200">
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">TENANT SECURITY</p>
              <p className="text-xs font-bold text-slate-900 truncate">Isolated Workspace Space</p>
            </div>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200 whitespace-nowrap shrink-0">
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
      personType: 'sitting',
      topBadgeIcon: Zap,
      topBadgeBg: 'bg-amber-500',
      topBadgeBorder: 'border-amber-300',
      chatBadgeIcon: Smartphone,
      chatBadgeBg: 'bg-[#12B7D4]',
      chatBadgeBorder: 'border-cyan-300',
      notificationTag: 'Edge Performance',
      notificationTitle: 'Instant Mobile Load',
      notificationDesc: 'Optimized lightweight bundles on 4G & WiFi.',
      btnText: 'View Metrics',
      btnSecondary: 'CDN Ping',
      renderPhoneScreen: () => (
        <div className="space-y-3 text-left">
          <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-slate-200">
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">INFRASTRUCTURE</p>
              <p className="text-xs font-bold text-slate-900 truncate">Global Edge Network</p>
            </div>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200 whitespace-nowrap shrink-0">
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
      personType: 'standing',
      topBadgeIcon: Sparkles,
      topBadgeBg: 'bg-[#12B7D4]',
      topBadgeBorder: 'border-cyan-300',
      chatBadgeIcon: CheckCheck,
      chatBadgeBg: 'bg-emerald-500',
      chatBadgeBorder: 'border-emerald-300',
      notificationTag: 'Agency Rhythm',
      notificationTitle: 'Morning To Evening',
      notificationDesc: 'Leads, schedule, approvals, and GST billing.',
      btnText: 'Start Flow',
      btnSecondary: 'Overview',
      renderPhoneScreen: () => (
        <div className="space-y-2.5 text-left">
          <div className="flex items-center justify-between gap-2 pb-1 border-b border-slate-200">
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">OPERATING RHYTHM</p>
              <p className="text-xs font-bold text-slate-900 truncate">4 Connected Steps</p>
            </div>
            <span className="text-[10px] bg-[#12B7D4]/15 text-[#0e7490] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shrink-0">
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
  const ChatBadgeIcon = item.chatBadgeIcon;

  // Determine which person image to show (sitting vs standing) with WebP + PNG fallback
  const resolvedPersonType = person || item.personType;
  const webpSrc =
    resolvedPersonType === 'standing'
      ? '/images/people/person_thumbsup_tablet.webp'
      : '/images/people/person_happy_mobile.webp';
  const pngSrc =
    resolvedPersonType === 'standing'
      ? '/images/people/person_thumbsup_tablet.png'
      : '/images/people/person_happy_mobile.png';

  return (
    <div className="relative w-full max-w-[360px] xs:max-w-[400px] sm:max-w-[460px] mx-auto py-3 sm:py-6 px-1 xs:px-2 sm:px-6 flex items-center justify-center select-none">
      
      {/* ── AMBIENT SOFT GRADIENT GLOW (Behind Showcase) ── */}
      <div className="absolute -inset-4 bg-gradient-to-tr from-emerald-100/50 via-teal-50/40 to-cyan-100/50 rounded-full blur-2xl pointer-events-none -z-10" />

      {/* ── MINT DOTTED GRID PATTERN (Top-Left Backdrop, matching reference) ── */}
      <div className="absolute top-0 left-0 sm:-left-6 w-24 h-24 sm:w-28 sm:h-28 pointer-events-none opacity-45">
        <svg width="100%" height="100%" fill="none">
          <pattern id={`dot-grid-${type}`} width="12" height="12" patternUnits="userSpaceOnUse">
            <circle cx="2.5" cy="2.5" r="1.5" className="fill-emerald-500" />
          </pattern>
          <rect width="100%" height="100%" fill={`url(#dot-grid-${type})`} />
        </svg>
      </div>

      {/* ── BACKGROUND DASHED ORBITAL PATH (Linking Stickers) ── */}
      <svg
        className="absolute -inset-2 w-[calc(100%+16px)] h-[calc(100%+16px)] pointer-events-none overflow-visible"
        viewBox="0 0 400 400"
        fill="none"
      >
        <path
          d="M 50 320 C 20 180, 80 50, 260 40 C 350 45, 380 120, 360 260 C 340 360, 180 390, 80 340"
          stroke="#10b981"
          strokeWidth="2"
          strokeDasharray="6 6"
          strokeLinecap="round"
          opacity="0.38"
        />
      </svg>

      {/* ── FLOATING STICKER 1 (Top-Right): Feature Badge (WITHOUT TEXT) ── */}
      <div
        className={`absolute -top-2 right-2 sm:right-4 z-35 w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl ${item.topBadgeBg} ${item.topBadgeBorder} border-2 text-white flex items-center justify-center shadow-lg rotate-12 transition-transform duration-300 hover:rotate-0 hover:scale-110`}
        aria-hidden="true"
      >
        <TopBadgeIcon size={18} className="sm:hidden stroke-[2.5]" />
        <TopBadgeIcon size={22} className="hidden sm:block stroke-[2.5]" />
      </div>

      {/* ── SMARTPHONE DEVICE MOCKUP (Clean, unobstructed screen) ── */}
      <div className="w-[215px] xs:w-[235px] sm:w-[260px] bg-slate-900 rounded-[32px] sm:rounded-[38px] p-2 sm:p-2.5 shadow-2xl shadow-slate-900/20 border-[3px] sm:border-4 border-slate-800 relative z-20 transition-transform duration-300 hover:scale-[1.01]">
        {/* Dynamic Island / Notch */}
        <div className="w-14 sm:w-16 h-3 sm:h-3.5 bg-slate-900 rounded-full mx-auto mb-1.5 sm:mb-2 flex items-center justify-end pr-1.5">
          <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-slate-800" />
        </div>

        {/* Screen Content Wrapper */}
        <div className="bg-slate-50 rounded-[26px] sm:rounded-[30px] overflow-hidden border border-slate-200/60 p-2.5 sm:p-3 min-h-[260px] sm:min-h-[300px]">
          {item.renderPhoneScreen()}
        </div>

        {/* Phone Bottom Pill Indicator */}
        <div className="w-20 sm:w-24 h-1 bg-slate-700 rounded-full mx-auto mt-1.5 sm:mt-2" />
      </div>

      {/* ── REALISTIC CUTOUT PERSON (Gesturing to Phone Screen, matching reference image) ── */}
      {showPerson && (
        <div className="absolute -bottom-2 -right-1 sm:-right-4 z-30 pointer-events-none select-none">
          <picture className="w-[130px] xs:w-[155px] sm:w-[200px] max-h-[270px] drop-shadow-2xl transition-transform duration-300 hover:scale-105 block">
            <source srcSet={webpSrc} type="image/webp" />
            <img
              src={pngSrc}
              alt="Agency Team"
              className="w-full h-auto object-contain"
              loading="lazy"
              decoding="async"
              width="210"
              height="260"
            />
          </picture>
        </div>
      )}

      {/* ── FLOATING STICKER 2 (Middle-Right): Circular Chat Badge (WITHOUT TEXT) ── */}
      <div
        className={`absolute top-20 -right-1 sm:-right-3 z-35 w-8 h-8 sm:w-11 sm:h-11 rounded-full ${item.chatBadgeBg} ${item.chatBadgeBorder} border-2 text-white flex items-center justify-center shadow-lg -rotate-6 transition-transform duration-300 hover:rotate-0 hover:scale-110`}
        aria-hidden="true"
      >
        <ChatBadgeIcon size={16} className="sm:hidden stroke-[2.5]" />
        <ChatBadgeIcon size={20} className="hidden sm:block stroke-[2.5]" />
      </div>

      {/* ── FLOATING STICKER 3 (Bottom-Left): Scalloped Checkmark Seal Badge (WITHOUT TEXT) ── */}
      <div
        className="absolute bottom-3 left-1 sm:left-2 z-35 flex items-center justify-center filter drop-shadow-lg transition-transform duration-300 hover:scale-110 -rotate-3"
        aria-hidden="true"
      >
        <div className="relative flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-11 h-11 sm:w-15 sm:h-15 text-emerald-500 fill-current">
            <path d={SCALLOP_PATH} />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <Check size={18} className="sm:hidden text-white stroke-[3.5]" />
            <Check size={22} className="hidden sm:block text-white stroke-[3.5]" />
          </div>
        </div>
      </div>

    </div>
  );
};

export default SectionShowcase;