import { motion } from 'framer-motion';
import { Palette, Image, Type, Globe, Download, ExternalLink } from 'lucide-react';

const COLORS = [
  { name: 'Primary',    hex: '#6366f1' },
  { name: 'Secondary',  hex: '#8b5cf6' },
  { name: 'Accent',     hex: '#ec4899' },
  { name: 'Success',    hex: '#10b981' },
  { name: 'Warning',    hex: '#f59e0b' },
  { name: 'Dark BG',    hex: '#0a0a14' },
];

const FONTS = [
  { name: 'Primary Font',   sample: 'Inter',    style: 'font-sans', usage: 'Headlines, UI' },
  { name: 'Secondary Font',  sample: 'Outfit',   style: 'font-sans', usage: 'Body copy, paragraphs' },
];

const ASSETS = [
  { name: 'Primary Logo – PNG',     size: '245 KB', type: 'PNG' },
  { name: 'Primary Logo – SVG',     size: '18 KB',  type: 'SVG' },
  { name: 'Logo Dark BG',           size: '230 KB', type: 'PNG' },
  { name: 'Logo Light BG',          size: '228 KB', type: 'PNG' },
  { name: 'Icon / Favicon',         size: '12 KB',  type: 'ICO' },
  { name: 'Brand Guidelines PDF',   size: '4.2 MB', type: 'PDF' },
];

export default function BrandAssets({ dark }) {
  const txt    = dark ? 'text-white' : 'text-slate-800';
  const sub    = dark ? 'text-slate-400' : 'text-slate-500';
  const card   = dark ? 'rgba(255,255,255,0.04)' : '#fff';
  const border = dark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.07)';

  return (
    <div className="p-6 space-y-5 max-w-5xl mx-auto">
      <div>
        <h2 className={`text-xl font-black ${txt}`}>Brand Assets</h2>
        <p className={`text-xs mt-0.5 ${sub}`}>Your brand colours, fonts, logos, and design resources.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Colours */}
        <div className="rounded-2xl p-5" style={{ background: card, border }}>
          <div className="flex items-center gap-2 mb-4">
            <Palette size={15} className="text-pink-400" />
            <h3 className={`text-sm font-bold ${txt}`}>Brand Colours</h3>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {COLORS.map(c => (
              <div key={c.name}>
                <div className="h-12 rounded-xl mb-1.5" style={{ background: c.hex }} />
                <p className={`text-[10px] font-bold ${txt}`}>{c.name}</p>
                <p className="text-[10px] text-slate-500 font-mono">{c.hex}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Typography */}
        <div className="rounded-2xl p-5" style={{ background: card, border }}>
          <div className="flex items-center gap-2 mb-4">
            <Type size={15} className="text-indigo-400" />
            <h3 className={`text-sm font-bold ${txt}`}>Typography</h3>
          </div>
          {FONTS.map(f => (
            <div key={f.name} className="mb-4 p-3 rounded-xl"
              style={{ background: dark ? 'rgba(255,255,255,0.04)' : '#f8fafc' }}>
              <p className={`text-[10px] ${sub} mb-1`}>{f.name} · {f.usage}</p>
              <p className="text-2xl font-bold" style={{ color: dark ? '#fff' : '#0f172a' }}>
                {f.sample}
              </p>
              <p className={`text-xs mt-1 ${sub}`}>Aa Bb Cc Dd Ee 1 2 3</p>
            </div>
          ))}
        </div>
      </div>

      {/* Logo downloads */}
      <div className="rounded-2xl overflow-hidden" style={{ background: card, border }}>
        <div className="flex items-center gap-2 px-5 py-3"
          style={{ background: dark ? 'rgba(99,102,241,0.08)' : '#f8fafc',
                   borderBottom: dark ? '1px solid rgba(255,255,255,0.05)' : '1px solid #f1f5f9' }}>
          <Image size={14} className="text-indigo-400" />
          <h3 className={`text-xs font-bold ${txt}`}>Logo Files</h3>
        </div>
        <div className="divide-y" style={{ borderColor: dark ? 'rgba(255,255,255,0.04)' : '#f1f5f9' }}>
          {ASSETS.map(a => (
            <motion.div key={a.name} whileHover={{ x: 3 }}
              className="flex items-center gap-3 px-5 py-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: '#6366f120' }}>
                <Image size={13} className="text-indigo-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-semibold ${txt}`}>{a.name}</p>
                <p className={`text-[10px] ${sub}`}>{a.type} · {a.size}</p>
              </div>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold"
                style={{ background: '#6366f120', color: '#818cf8', border: '1px solid #6366f140' }}>
                <Download size={10} /> Download
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Usage guidelines note */}
      <div className="rounded-2xl p-5" style={{ background: '#6366f112', border: '1px solid #6366f130' }}>
        <div className="flex items-start gap-3">
          <Globe size={16} className="text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <p className={`text-xs font-bold mb-1 ${txt}`}>Brand Usage Guidelines</p>
            <p className={`text-[11px] leading-relaxed ${sub}`}>
              These assets are exclusively for use in content created by our agency on your behalf.
              Please do not redistribute or modify brand assets without prior written approval.
              For questions, contact your account manager via Support.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
