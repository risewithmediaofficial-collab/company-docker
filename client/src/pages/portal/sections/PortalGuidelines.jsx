import { motion } from 'framer-motion';
import { BookOpen, CheckCircle2, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

const SECTIONS = [
  {
    title: 'How the Portal Works',
    items: [
      { q: 'What is the Client Portal?', a: 'Your Client Portal is a dedicated workspace where you can review and approve content, track campaign performance, access reports, download assets, and communicate directly with your team — all in one place.' },
      { q: 'How do I navigate the portal?', a: 'Use the left sidebar to switch between sections: Dashboard, Content Review, Calendar, Reports, Downloads, Brand Assets, Invoices, Support, and Guidelines.' },
    ],
  },
  {
    title: 'Content Approval Process',
    items: [
      { q: 'How does content get submitted for review?', a: 'When your team finishes a piece of content, it is moved to "Send to Client" status. It will immediately appear in your "Ready for Review" tab under Content Review.' },
      { q: 'How do I approve content?', a: 'In the Content Review tab, find the item and click "Approve". You can optionally add a comment before confirming. The item will then move to "Approved" status.' },
      { q: 'How do I request a revision?', a: 'Click "Revise" next to any content item and fill in your revision notes. Your team will be notified and the item will be moved back into editing.' },
      { q: 'What happens after I approve?', a: 'Approved content is moved to the scheduling queue. Your team will schedule it for posting at the agreed time. Once published, it moves to "Posted" and eventually "Done".' },
      { q: 'Can I leave comments without approving or rejecting?', a: 'Yes — click the "View" button on any content item to open a detailed view where you can add feedback comments.' },
    ],
  },
  {
    title: 'Reports & Performance',
    items: [
      { q: 'When is reporting data updated?', a: 'Your account manager updates the AF Reporting Board monthly, typically within the first 5 business days of the following month.' },
      { q: 'Can I download my reports?', a: 'Yes — head to the Reports section and click "Export CSV" to download all monthly data as a spreadsheet.' },
      { q: 'What do the KPI metrics mean?', a: 'Ad Spend: total money spent on paid advertising. Opt-Ins: new leads who registered interest. Calls Booked: discovery/strategy calls scheduled. New Clients: new clients acquired. Cash Collected: payments received. Contracted Revenue: total new revenue signed.' },
    ],
  },
  {
    title: 'Billing & Invoices',
    items: [
      { q: 'Where can I find my invoices?', a: 'Go to the Invoices section in the sidebar. All your invoices are listed with their status, amount, and due date.' },
      { q: 'How do I pay an invoice?', a: 'Invoices marked as "Sent" or "Overdue" need payment. Contact your account manager or use the payment link sent to your email.' },
    ],
  },
  {
    title: 'Getting Help',
    items: [
      { q: 'How do I contact my account manager?', a: 'Go to the Support section and submit a support ticket, or email us directly. We respond within 24 business hours Mon–Fri.' },
      { q: 'What is the typical response time?', a: 'We aim to respond to all support tickets within 24 business hours. Urgent issues are escalated and addressed within 4 hours.' },
    ],
  },
];

export default function PortalGuidelines({ dark }) {
  const [openSection, setOpenSection] = useState(0);
  const [openItem, setOpenItem]       = useState(null);

  const txt    = dark ? 'text-white' : 'text-slate-800';
  const sub    = dark ? 'text-slate-400' : 'text-slate-500';
  const card   = dark ? 'rgba(255,255,255,0.04)' : '#fff';
  const border = dark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.07)';

  return (
    <div className="p-6 space-y-5 max-w-4xl mx-auto">
      <div>
        <h2 className={`text-xl font-black ${txt}`}>Guidelines & FAQ</h2>
        <p className={`text-xs mt-0.5 ${sub}`}>Everything you need to know about using this portal.</p>
      </div>

      {/* Quick tips */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { emoji: '✅', label: 'Approve content from Ready for Review' },
          { emoji: '📊', label: 'Track monthly KPIs in Reports section' },
          { emoji: '💬', label: 'Submit requests via Support tickets' },
        ].map(tip => (
          <div key={tip.label} className="flex items-center gap-3 p-4 rounded-2xl"
            style={{ background: '#6366f112', border: '1px solid #6366f130' }}>
            <span className="text-xl">{tip.emoji}</span>
            <p className={`text-xs font-medium ${txt}`}>{tip.label}</p>
          </div>
        ))}
      </div>

      {/* FAQ Accordion */}
      {SECTIONS.map((section, si) => (
        <div key={section.title} className="rounded-2xl overflow-hidden" style={{ border }}>
          <button onClick={() => setOpenSection(openSection === si ? -1 : si)}
            className="w-full flex items-center gap-3 px-5 py-4 text-left"
            style={{ background: dark ? 'rgba(99,102,241,0.07)' : '#f8fafc' }}>
            <BookOpen size={14} className="text-indigo-400" />
            <span className={`text-sm font-bold flex-1 ${txt}`}>{section.title}</span>
            <ChevronDown size={14} className="text-slate-400 transition-transform"
              style={{ transform: openSection === si ? 'rotate(180deg)' : '' }} />
          </button>

          {openSection === si && (
            <div className="divide-y" style={{ borderColor: dark ? 'rgba(255,255,255,0.04)' : '#f1f5f9' }}>
              {section.items.map((item, ii) => {
                const key = `${si}-${ii}`;
                const isOpen = openItem === key;
                return (
                  <div key={item.q}>
                    <button onClick={() => setOpenItem(isOpen ? null : key)}
                      className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-white/5 transition-all">
                      <ChevronRight size={12} className="text-indigo-400 shrink-0 transition-transform"
                        style={{ transform: isOpen ? 'rotate(90deg)' : '' }} />
                      <span className={`text-xs font-semibold flex-1 ${txt}`}>{item.q}</span>
                    </button>
                    {isOpen && (
                      <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }}
                        className="px-10 pb-4">
                        <p className={`text-xs leading-relaxed ${sub}`}>{item.a}</p>
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}

      {/* Bottom callout */}
      <div className="rounded-2xl p-5 flex items-center gap-4"
        style={{ background: 'linear-gradient(135deg,#6366f115,#8b5cf615)', border: '1px solid #6366f130' }}>
        <CheckCircle2 size={24} className="text-indigo-400 shrink-0" />
        <div>
          <p className={`text-sm font-bold ${txt}`}>Still have questions?</p>
          <p className={`text-xs ${sub} mt-0.5`}>
            Don't hesitate to reach out via the Support section. Your dedicated account manager is here to help.
          </p>
        </div>
      </div>
    </div>
  );
}
