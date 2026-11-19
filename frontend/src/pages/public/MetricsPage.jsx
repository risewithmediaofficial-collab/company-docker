import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  ShieldCheck,
  Zap,
  Lock,
  Database,
  Clock,
  TrendingUp,
  Server,
  Activity,
  CheckCircle2,
  Cpu,
  RefreshCw,
  HardDrive,
} from 'lucide-react';
import PublicLayout from '../../components/public/PublicLayout';
import HeroPattern from '../../components/public/HeroPattern';
import ScrollReveal from '../../components/public/ScrollReveal';
import StatsBanner from '../../components/public/StatsBanner';

export const MetricsPage = () => {
  return (
    <PublicLayout
      ctaTitle="Reliable Infrastructure For Your Agency."
      ctaSubtitle="Focus on creative campaigns while we keep your agency operations smooth, fast, and dependable."
    >
      {/* ── 1. HERO HEADER ── */}
      <section className="relative overflow-hidden border-b border-slate-200/80 pt-12 sm:pt-20 pb-14 sm:pb-16 px-4 sm:px-8 text-left sm:text-center">
        <HeroPattern />

        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#12B7D4]/10 border border-[#12B7D4]/25 text-[#0d99b2] text-xs font-black uppercase tracking-wider mb-4">
            <TrendingUp size={13} className="text-[#12B7D4]" />
            <span>Proven Agency Benchmarks</span>
          </div>

          <h1 className="font-extrabold text-3xl sm:text-5xl lg:text-[58px] text-slate-950 tracking-tight leading-[1.16]">
            Measurable Impact.
            <span className="text-[#12B7D4] block mt-1 sm:mt-2 pb-1">
              Enterprise Reliability.
            </span>
          </h1>

          <p className="mt-4 sm:mt-5 text-base sm:text-lg text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
            Discover the tangible hours saved, faster payment cycles, and rock-solid cloud infrastructure powering marketing agencies worldwide.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-start sm:justify-center gap-3.5">
            <Link
              to="/register-company"
              className="px-8 sm:px-10 py-3.5 sm:py-4 rounded-full bg-[#12B7D4] hover:bg-[#0ea5c6] text-white font-bold text-sm sm:text-base shadow-lg shadow-[#12B7D4]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Start Free Trial</span>
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/what-we-do"
              className="px-7 sm:px-9 py-3.5 sm:py-4 rounded-full bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-sm sm:text-base transition-all flex items-center justify-center shadow-2xs"
            >
              View 22 Capabilities
            </Link>
          </div>
        </div>
      </section>

      {/* ── 2. IMPACT STATS BANNER ── */}
      <StatsBanner
        title="Real Agency Impact Benchmarks"
        subtitle="Measurable numbers verified across active creative studios and performance agencies."
      />

      {/* ── 3. FOUR MEASURABLE OUTCOMES (CARDS GRID) ── */}
      <section className="py-14 sm:py-20 px-4 sm:px-8 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <p className="text-xs font-bold uppercase tracking-widest text-[#12B7D4]">
            Proven ROI
          </p>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-950 tracking-tight mt-1">
            What Happens When Chaos Disappears
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-2 leading-relaxed">
            Eliminating scattered group chats and disconnected apps translates to immediate, measurable gains.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-2 hover:border-[#12B7D4]/40 transition-all">
            <span className="text-3xl sm:text-4xl font-black text-[#12B7D4] block">12+ Hrs</span>
            <h3 className="font-bold text-slate-900 text-sm">Saved Weekly Per Manager</h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Automated client reminder alerts, instant 18% GST invoicing, and EOD work reporting replace hours of manual status checks.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-2 hover:border-emerald-400 transition-all">
            <span className="text-3xl sm:text-4xl font-black text-emerald-600 block">99.8%</span>
            <h3 className="font-bold text-slate-900 text-sm">On-Time Deliverables</h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Social media calendar staging and monthly SMM deliverable counters ensure reels and posts are published without missed deadlines.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-2 hover:border-indigo-400 transition-all">
            <span className="text-3xl sm:text-4xl font-black text-indigo-600 block">3.2x</span>
            <h3 className="font-bold text-slate-900 text-sm">Faster Client Approvals</h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Private 1-tap review token links let busy clients approve Instagram graphics on their mobile screen in under 10 seconds.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-2 hover:border-purple-400 transition-all">
            <span className="text-3xl sm:text-4xl font-black text-purple-600 block">0%</span>
            <h3 className="font-bold text-slate-900 text-sm">Lost Client Credentials</h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Encrypted Client Vault completely eliminates dangerous password sharing in group chats and unencrypted sticky notes.
            </p>
          </div>
        </div>
      </section>

      {/* ── 4. ENTERPRISE DATA ISOLATION & SPEED SHOWCASE (UNIQUE ARCHITECTURE CARDS) ── */}
      <div className="space-y-0">
        
        {/* Showcase 01: Multi-Tenant Database Security (Slate Tint BG) */}
        <section className="py-14 sm:py-20 px-4 sm:px-8 bg-slate-50/70 border-y border-slate-200/80">
          <div className="max-w-6xl mx-auto">
            <ScrollReveal>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
                
                {/* Left: Text & Features (Neatly Constrained with Card Bullets) */}
                <div className="lg:col-span-7 space-y-4 text-left">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-black uppercase tracking-wider">
                    <Lock size={12} />
                    <span>Security & Compliance</span>
                  </span>

                  <h2 className="font-extrabold text-2xl sm:text-3xl lg:text-[40px] text-slate-950 tracking-tight leading-[1.2]">
                    Your Agency Data
                    <span className="text-[#12B7D4] block mt-1">
                      Stays 100% Private.
                    </span>
                  </h2>

                  <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed max-w-xl">
                    Every agency on RiseWithMedia OS gets a dedicated tenant workspace. Other companies can never view your client lists, contracts, or financial numbers.
                  </p>

                  <div className="space-y-3 pt-2 max-w-xl">
                    <div className="flex items-start gap-3 p-3 rounded-2xl bg-white border border-slate-200/80 hover:border-[#12B7D4]/40 hover:shadow-xs transition-all">
                      <div className="h-7 w-7 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={14} className="stroke-[3]" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm leading-snug">Strict Database Tenant Isolation</h3>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed mt-0.5">Separate organization partitions ensure your client retainers and proposals remain private.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-2xl bg-white border border-slate-200/80 hover:border-[#12B7D4]/40 hover:shadow-xs transition-all">
                      <div className="h-7 w-7 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={14} className="stroke-[3]" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm leading-snug">Encrypted HTTPS & SSL Protocol</h3>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed mt-0.5">Bank-grade 256-bit encryption protects all proposal approvals and invoice transactions.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-2xl bg-white border border-slate-200/80 hover:border-[#12B7D4]/40 hover:shadow-xs transition-all">
                      <div className="h-7 w-7 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={14} className="stroke-[3]" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm leading-snug">Automated Cloud Backups</h3>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed mt-0.5">Daily automated snapshots ensure client files and task records can never be lost.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Unique Enterprise Tenant Security Visual Card (NO PHONE MOCKUP DUPLICATION) */}
                <div className="lg:col-span-5 flex justify-center">
                  <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <ShieldCheck size={16} className="text-emerald-600" />
                        <span className="text-xs font-black text-slate-900">Tenant Isolation Barrier</span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        AES-256 Active
                      </span>
                    </div>

                    {/* Isolated Tenant Blocks */}
                    <div className="space-y-2.5">
                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <Database size={15} className="text-[#12B7D4]" />
                          <div>
                            <p className="text-xs font-bold text-slate-900">Agency Alpha Workspace</p>
                            <p className="text-[10px] text-slate-500 font-mono">schema: org_tenant_01</p>
                          </div>
                        </div>
                        <Lock size={13} className="text-emerald-600" />
                      </div>

                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <Database size={15} className="text-[#12B7D4]" />
                          <div>
                            <p className="text-xs font-bold text-slate-900">Creative Beta Studio</p>
                            <p className="text-[10px] text-slate-500 font-mono">schema: org_tenant_02</p>
                          </div>
                        </div>
                        <Lock size={13} className="text-emerald-600" />
                      </div>

                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <Database size={15} className="text-[#12B7D4]" />
                          <div>
                            <p className="text-xs font-bold text-slate-900">Performance Gamma Team</p>
                            <p className="text-[10px] text-slate-500 font-mono">schema: org_tenant_03</p>
                          </div>
                        </div>
                        <Lock size={13} className="text-emerald-600" />
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500">
                      <span className="flex items-center gap-1.5 text-emerald-600">
                        <CheckCircle2 size={13} />
                        Zero Cross-Tenant Leakage
                      </span>
                      <span className="text-slate-400">SOC2 Type II Ready</span>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Showcase 02: Performance & Speed (White BG) */}
        <section className="py-14 sm:py-20 px-4 sm:px-8 bg-white border-b border-slate-200/80">
          <div className="max-w-6xl mx-auto">
            <ScrollReveal>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
                
                {/* Left: Speed Visual Card (Alternating Side - NO PHONE MOCKUP DUPLICATION) */}
                <div className="lg:col-span-5 order-2 lg:order-1 flex justify-center">
                  <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <Activity size={16} className="text-[#12B7D4]" />
                        <span className="text-xs font-black text-slate-900">Cloud Telemetry & Health</span>
                      </div>
                      <span className="text-[10px] font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-full border border-cyan-200">
                        99.98% Uptime
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1 text-left">
                        <span className="text-[10px] font-bold uppercase text-slate-400">P99 API Latency</span>
                        <p className="text-xl font-black text-slate-950">&lt; 85ms</p>
                        <p className="text-[10px] text-emerald-600 font-bold">● High Speed Edge</p>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1 text-left">
                        <span className="text-[10px] font-bold uppercase text-slate-400">Websocket Sync</span>
                        <p className="text-xl font-black text-slate-950">Instant</p>
                        <p className="text-[10px] text-emerald-600 font-bold">● Zero Packet Loss</p>
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1 text-left">
                      <div className="flex justify-between text-xs font-bold text-slate-700">
                        <span>PWA Offline Cache</span>
                        <span className="text-emerald-600">Active</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-[#12B7D4] h-full w-full" />
                      </div>
                      <p className="text-[10px] text-slate-500 font-medium">Native install supported on Android and iOS</p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500">
                      <span className="flex items-center gap-1.5 text-emerald-600">
                        <CheckCircle2 size={13} />
                        Automated Cloud Failover
                      </span>
                      <span className="text-slate-400">Real-time Telemetry</span>
                    </div>
                  </div>
                </div>

                {/* Right: Text & Features */}
                <div className="lg:col-span-7 order-1 lg:order-2 space-y-4 text-left">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-800 text-[11px] font-black uppercase tracking-wider">
                    <Zap size={12} />
                    <span>Speed & Reliability</span>
                  </span>

                  <h2 className="font-extrabold text-2xl sm:text-3xl lg:text-[40px] text-slate-950 tracking-tight leading-[1.2]">
                    Sub-Second Page Loads.
                    <span className="text-[#12B7D4] block mt-1">
                      Smooth on Any Smartphone.
                    </span>
                  </h2>

                  <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed max-w-xl">
                    Built on high-speed cloud infrastructure. Whether your team is in the office or clients are checking proposals on 4G mobile, the portal responds in milliseconds.
                  </p>

                  <div className="space-y-3 pt-2 max-w-xl">
                    <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:bg-white hover:border-[#12B7D4]/40 hover:shadow-xs transition-all">
                      <div className="h-7 w-7 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={14} className="stroke-[3]" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm leading-snug">Instant Progressive Web App (PWA)</h3>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed mt-0.5">Installable straight to iPhone and Android home screens without app store downloads.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:bg-white hover:border-[#12B7D4]/40 hover:shadow-xs transition-all">
                      <div className="h-7 w-7 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={14} className="stroke-[3]" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm leading-snug">Real-Time Data Synchronization</h3>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed mt-0.5">Task completions, attendance clock-ins, and invoice payments reflect immediately.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:bg-white hover:border-[#12B7D4]/40 hover:shadow-xs transition-all">
                      <div className="h-7 w-7 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={14} className="stroke-[3]" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm leading-snug">Zero Downtime Deployments</h3>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed mt-0.5">Continuous platform updates ship seamlessly without interrupting client workflows.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

      </div>

      {/* ── 5. FINAL ACTION BANNER ── */}
      <section className="py-14 sm:py-20 px-4 sm:px-8 max-w-6xl mx-auto">
        <ScrollReveal>
          <div className="p-8 sm:p-14 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white relative overflow-hidden shadow-2xl text-center sm:text-left flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-2 max-w-2xl">
              <span className="text-xs font-black uppercase tracking-widest text-[#12B7D4] block">
                Enterprise Agency Cloud
              </span>
              <h3 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
                Scale your agency on infrastructure built to last.
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed pt-1">
                Zero setup headaches. 14-day free trial. Unlimited team members included.
              </p>
            </div>
            <Link
              to="/register-company"
              className="px-8 py-4 rounded-full bg-[#12B7D4] hover:bg-[#0ea5c6] text-white font-bold text-sm sm:text-base shadow-lg shadow-[#12B7D4]/30 transition-all flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <span>Start Free Trial</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </ScrollReveal>
      </section>
    </PublicLayout>
  );
};

export default MetricsPage;
