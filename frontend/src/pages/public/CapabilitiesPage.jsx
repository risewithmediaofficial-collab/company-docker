import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import PublicLayout from '../../components/public/PublicLayout';
import HeroPattern from '../../components/public/HeroPattern';
import ScrollReveal from '../../components/public/ScrollReveal';

const CapabilitiesPage = () => {
  return (
    <PublicLayout>
      {/* ── HERO HEADER WITH PATTERN CUT-OFF ── */}
      <section className="relative overflow-hidden border-b border-slate-200/80 pt-12 sm:pt-20 pb-14 sm:pb-16 px-4 sm:px-8 text-left sm:text-center">
        <HeroPattern />

        <div className="relative z-10 max-w-3xl mx-auto">
          {/* Plain Text Title (NO ROUNDED PILL) */}
          <p className="text-xs sm:text-sm font-bold tracking-widest text-[#12B7D4] uppercase mb-4">
            Agency Capabilities
          </p>

          <h1 className="font-display font-extrabold text-4xl sm:text-6xl text-slate-950 tracking-tight leading-[1.08]">
            Simple Features Made For
            <span className="bg-gradient-to-r from-[#12B7D4] via-[#0ea5c6] to-[#12B7D4] bg-clip-text text-transparent animate-text-shimmer block mt-1">
              Your Daily Agency Work.
            </span>
          </h1>

          <p className="mt-4 text-base sm:text-lg text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
            Every feature is straightforward and easy to use. No complicated setup, no long training required.
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

      {/* ── CLEAN ZIG-ZAG SECTIONS (NO CARDS, PLAIN TEXT LABELS, HUMAN-MADE CSS) ── */}
      <div className="py-20 sm:py-28 px-4 sm:px-8 max-w-6xl mx-auto space-y-24 sm:space-y-32">

        {/* ── 01: Client & Deal Tracker ── */}
        <ScrollReveal>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start pb-16 border-b border-slate-100">
            <div className="lg:col-span-5 space-y-4 text-left">
              <p className="text-xs font-bold tracking-widest text-[#12B7D4] uppercase">
                01 — Client & Deal Tracker
              </p>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-[42px] text-slate-950 tracking-tight leading-[1.15]">
                Manage Every Client and Deal
                <span className="bg-gradient-to-r from-[#12B7D4] via-[#0ea5c6] to-[#12B7D4] bg-clip-text text-transparent animate-text-shimmer block mt-1">
                  Without Spreadsheet Clutter.
                </span>
              </h2>
              <p className="text-base text-slate-600 font-medium leading-relaxed pt-1">
                Save client phone numbers, requirement notes, project budgets, and follow-up dates in one clean interface.
              </p>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-7 text-left pt-1">
              <div className="border-l-2 border-[#12B7D4] pl-4 space-y-1">
                <h3 className="font-bold text-slate-900 text-base">Client Stage Tracking</h3>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">Follow deals from new lead inquiry to quoted proposal and signed retainer agreement.</p>
              </div>
              <div className="border-l-2 border-slate-200 pl-4 space-y-1">
                <h3 className="font-bold text-slate-900 text-base">Key Account Details</h3>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">Store client phone numbers, GSTIN numbers, billing addresses, and points of contact.</p>
              </div>
              <div className="border-l-2 border-slate-200 pl-4 space-y-1">
                <h3 className="font-bold text-slate-900 text-base">Follow-up Schedules</h3>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">Never lose a potential client due to forgotten follow-up calls or lost notes.</p>
              </div>
              <div className="border-l-2 border-slate-200 pl-4 space-y-1">
                <h3 className="font-bold text-slate-900 text-base">Direct Search & Filter</h3>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">Quickly filter clients by active status, monthly retainer value, or marketing service.</p>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* ── 02: Social Media Calendar (Alternating) ── */}
        <ScrollReveal>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start pb-16 border-b border-slate-100">
            <div className="lg:col-span-7 order-2 lg:order-1 grid grid-cols-1 sm:grid-cols-2 gap-7 text-left pt-1">
              <div className="border-l-2 border-[#12B7D4] pl-4 space-y-1">
                <h3 className="font-bold text-slate-900 text-base">Calendar Overview</h3>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">Group scheduled reels, carousel posts, and stories by posting dates on a visual grid.</p>
              </div>
              <div className="border-l-2 border-slate-200 pl-4 space-y-1">
                <h3 className="font-bold text-slate-900 text-base">Asset Attachments</h3>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">Upload creatives, video files, captions, and hashtag sets directly to each task.</p>
              </div>
              <div className="border-l-2 border-slate-200 pl-4 space-y-1">
                <h3 className="font-bold text-slate-900 text-base">Approval Statuses</h3>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">Instantly spot which posts are in review, approved, or pending revisions.</p>
              </div>
              <div className="border-l-2 border-slate-200 pl-4 space-y-1">
                <h3 className="font-bold text-slate-900 text-base">Multi-Client Planning</h3>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">Switch between client brands seamlessly without mixing up content schedules.</p>
              </div>
            </div>

            <div className="lg:col-span-5 order-1 lg:order-2 space-y-4 text-left">
              <p className="text-xs font-bold tracking-widest text-[#12B7D4] uppercase">
                02 — Social Media Calendar
              </p>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-[42px] text-slate-950 tracking-tight leading-[1.15]">
                Visual Agency Schedule for
                <span className="bg-gradient-to-r from-[#12B7D4] via-[#0ea5c6] to-[#12B7D4] bg-clip-text text-transparent animate-text-shimmer block mt-1">
                  Posts and Reels.
                </span>
              </h2>
              <p className="text-base text-slate-600 font-medium leading-relaxed pt-1">
                Coordinate your graphic designers, copywriters, and video editors on a unified monthly calendar.
              </p>
            </div>
          </div>
        </ScrollReveal>

        {/* ── 03: Client Approvals ── */}
        <ScrollReveal>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start pb-16 border-b border-slate-100">
            <div className="lg:col-span-5 space-y-4 text-left">
              <p className="text-xs font-bold tracking-widest text-[#12B7D4] uppercase">
                03 — 1-Tap Client Approvals
              </p>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-[42px] text-slate-950 tracking-tight leading-[1.15]">
                Clients Review on Their Phone
                <span className="bg-gradient-to-r from-[#12B7D4] via-[#0ea5c6] to-[#12B7D4] bg-clip-text text-transparent animate-text-shimmer block mt-1">
                  With 1-Tap Approval.
                </span>
              </h2>
              <p className="text-base text-slate-600 font-medium leading-relaxed pt-1">
                No app installation required for your clients. They receive a clean mobile link to review creatives and approve them in seconds.
              </p>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-7 text-left pt-1">
              <div className="border-l-2 border-[#12B7D4] pl-4 space-y-1">
                <h3 className="font-bold text-slate-900 text-base">Instant Mobile Links</h3>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">Clients tap a secure link on WhatsApp or SMS and immediately see full creative previews.</p>
              </div>
              <div className="border-l-2 border-slate-200 pl-4 space-y-1">
                <h3 className="font-bold text-slate-900 text-base">1-Tap Confirmation</h3>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">Approvals are saved with timestamp and client name directly to your campaign records.</p>
              </div>
              <div className="border-l-2 border-slate-200 pl-4 space-y-1">
                <h3 className="font-bold text-slate-900 text-base">In-Context Feedback</h3>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">If changes are requested, client feedback stays tied to the graphic, not lost in phone calls.</p>
              </div>
              <div className="border-l-2 border-slate-200 pl-4 space-y-1">
                <h3 className="font-bold text-slate-900 text-base">Reduced Turnaround Time</h3>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">Approvals take minutes instead of 3 days of back-and-forth phone tag.</p>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* ── 04: Fast GST Invoicing (Alternating) ── */}
        <ScrollReveal>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start pb-16 border-b border-slate-100">
            <div className="lg:col-span-7 order-2 lg:order-1 grid grid-cols-1 sm:grid-cols-2 gap-7 text-left pt-1">
              <div className="border-l-2 border-[#12B7D4] pl-4 space-y-1">
                <h3 className="font-bold text-slate-900 text-base">Automated Tax Math</h3>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">Enter retainer or project amount; CGST (9%) and SGST (9%) are calculated automatically.</p>
              </div>
              <div className="border-l-2 border-slate-200 pl-4 space-y-1">
                <h3 className="font-bold text-slate-900 text-base">PDF Receipts</h3>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">One-click PDF invoice generation with agency logo, GSTIN, PAN, and address.</p>
              </div>
              <div className="border-l-2 border-slate-200 pl-4 space-y-1">
                <h3 className="font-bold text-slate-900 text-base">Payment Status Tags</h3>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">Always know which client bills are fully paid, partially paid, or overdue.</p>
              </div>
              <div className="border-l-2 border-slate-200 pl-4 space-y-1">
                <h3 className="font-bold text-slate-900 text-base">Bank QR Integration</h3>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">Include your UPI QR code and bank account details directly on the invoice.</p>
              </div>
            </div>

            <div className="lg:col-span-5 order-1 lg:order-2 space-y-4 text-left">
              <p className="text-xs font-bold tracking-widest text-[#12B7D4] uppercase">
                04 — Fast GST Invoicing
              </p>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-[42px] text-slate-950 tracking-tight leading-[1.15]">
                Tax Invoices Created in Seconds
                <span className="bg-gradient-to-r from-[#12B7D4] via-[#0ea5c6] to-[#12B7D4] bg-clip-text text-transparent animate-text-shimmer block mt-1">
                  With 1-Click PDF.
                </span>
              </h2>
              <p className="text-base text-slate-600 font-medium leading-relaxed pt-1">
                Generate professional agency tax invoices with accurate GST rates, line items, and bank details.
              </p>
            </div>
          </div>
        </ScrollReveal>

        {/* ── 05: Staff Attendance & Workspace ── */}
        <ScrollReveal>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            <div className="lg:col-span-5 space-y-4 text-left">
              <p className="text-xs font-bold tracking-widest text-[#12B7D4] uppercase">
                05 — Staff Attendance & Workspace
              </p>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-[42px] text-slate-950 tracking-tight leading-[1.15]">
                Selfie Attendance and
                <span className="bg-gradient-to-r from-[#12B7D4] via-[#0ea5c6] to-[#12B7D4] bg-clip-text text-transparent animate-text-shimmer block mt-1">
                  100% Private Workspaces.
                </span>
              </h2>
              <p className="text-base text-slate-600 font-medium leading-relaxed pt-1">
                Staff check in from mobile with a quick selfie. Every company has an isolated workspace with custom branding.
              </p>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-7 text-left pt-1">
              <div className="border-l-2 border-[#12B7D4] pl-4 space-y-1">
                <h3 className="font-bold text-slate-900 text-base">Quick Selfie Check-in</h3>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">Staff take a 2-second selfie from their phone to mark daily attendance with timestamp.</p>
              </div>
              <div className="border-l-2 border-slate-200 pl-4 space-y-1">
                <h3 className="font-bold text-slate-900 text-base">Permission Management</h3>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">Control role visibility so team members only view the client work they are assigned to.</p>
              </div>
              <div className="border-l-2 border-slate-200 pl-4 space-y-1">
                <h3 className="font-bold text-slate-900 text-base">Dedicated Database Space</h3>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">No data bleed between agencies; your business numbers remain completely confidential.</p>
              </div>
              <div className="border-l-2 border-slate-200 pl-4 space-y-1">
                <h3 className="font-bold text-slate-900 text-base">Monthly Attendance Logs</h3>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">Automatic working day counts and attendance summaries ready for end-of-month payroll.</p>
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
          <h2 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight leading-tight">
            Ready to Try These Tools For{' '}
            <span className="bg-gradient-to-r from-[#12B7D4] via-[#38bdf8] to-[#12B7D4] bg-clip-text text-transparent animate-text-shimmer">
              Your Agency?
            </span>
          </h2>
          <p className="text-slate-300 text-sm sm:text-base font-medium max-w-xl mx-auto">
            Takes less than 2 minutes to register. Start with zero clutter and pure efficiency.
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

export default CapabilitiesPage;
