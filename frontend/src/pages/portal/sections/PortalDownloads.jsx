import { motion } from 'framer-motion';
import { FileText, Video, Image, Link, Download, ExternalLink } from 'lucide-react';

const DOWNLOADS = [
  {
    category: 'Reports',
    icon: FileText,
    color: '#6366f1',
    items: [
      { name: 'Monthly Performance Report – Template', type: 'PDF', size: '1.2 MB' },
      { name: 'Quarterly Review Summary',              type: 'PDF', size: '890 KB' },
    ],
  },
  {
    category: 'Guides',
    icon: FileText,
    color: '#10b981',
    items: [
      { name: 'Client Onboarding Guide',    type: 'PDF', size: '2.4 MB' },
      { name: 'Content Approval Handbook',  type: 'PDF', size: '1.1 MB' },
      { name: 'Campaign Best Practices',    type: 'PDF', size: '980 KB' },
    ],
  },
  {
    category: 'Templates',
    icon: FileText,
    color: '#f59e0b',
    items: [
      { name: 'Feedback Form Template',    type: 'DOCX', size: '48 KB' },
      { name: 'Content Brief Template',    type: 'DOCX', size: '62 KB' },
      { name: 'Social Media Copy Template',type: 'DOCX', size: '54 KB' },
    ],
  },
];

export default function PortalDownloads({ dark }) {
  const txt    = dark ? 'text-white' : 'text-slate-800';
  const sub    = dark ? 'text-slate-400' : 'text-slate-500';
  const card   = dark ? 'rgba(255,255,255,0.04)' : '#fff';
  const border = dark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.07)';

  return (
    <div className="p-6 space-y-5 max-w-5xl mx-auto">
      <div>
        <h2 className={`text-xl font-black ${txt}`}>Downloads</h2>
        <p className={`text-xs mt-0.5 ${sub}`}>Access all your reports, templates, and resources.</p>
      </div>

      {DOWNLOADS.map(cat => {
        const Icon = cat.icon;
        return (
          <div key={cat.category} className="rounded-2xl overflow-hidden" style={{ background: card, border }}>
            <div className="flex items-center gap-2 px-5 py-3"
              style={{ background: `${cat.color}12`, borderBottom: dark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)' }}>
              <Icon size={14} style={{ color: cat.color }} />
              <h3 className={`text-xs font-bold ${txt}`}>{cat.category}</h3>
            </div>
            <div className="divide-y" style={{ borderColor: dark ? 'rgba(255,255,255,0.04)' : '#f1f5f9' }}>
              {cat.items.map(item => (
                <motion.div key={item.name} whileHover={{ x: 3 }}
                  className="flex items-center gap-3 px-5 py-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: `${cat.color}20` }}>
                    <FileText size={13} style={{ color: cat.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold ${txt}`}>{item.name}</p>
                    <p className={`text-[10px] ${sub}`}>{item.type} · {item.size}</p>
                  </div>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all"
                    style={{ background: `${cat.color}20`, color: cat.color, border: `1px solid ${cat.color}40` }}>
                    <Download size={10} /> Download
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Quick Links */}
      <div className="rounded-2xl p-5" style={{ background: card, border }}>
        <h3 className={`text-sm font-bold mb-3 ${txt}`}>Quick Links</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { label: 'Agency Website',    url: '#', icon: ExternalLink },
            { label: 'Video Tutorials',   url: '#', icon: Video },
            { label: 'Knowledge Base',    url: '#', icon: FileText },
            { label: 'Image Library',     url: '#', icon: Image },
            { label: 'Shared Drive',      url: '#', icon: Link },
            { label: 'Agency Portal',     url: '#', icon: ExternalLink },
          ].map(lnk => (
            <motion.a key={lnk.label} href={lnk.url} whileHover={{ y: -2 }}
              className="flex items-center gap-2 p-3 rounded-xl transition-all"
              style={{ background: dark ? 'rgba(255,255,255,0.04)' : '#f8fafc',
                       border: dark ? '1px solid rgba(255,255,255,0.07)' : '1px solid #e2e8f0' }}>
              <lnk.icon size={13} className="text-indigo-400" />
              <span className={`text-xs font-medium ${txt}`}>{lnk.label}</span>
            </motion.a>
          ))}
        </div>
      </div>
    </div>
  );
}
