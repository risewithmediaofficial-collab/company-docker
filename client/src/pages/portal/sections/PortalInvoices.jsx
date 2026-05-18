import { useEffect, useState } from 'react';
import api from '../../../api';
import { motion } from 'framer-motion';
import { Receipt, Download, AlertCircle, CheckCircle2, Clock, XCircle } from 'lucide-react';

import { TableSkeleton } from '../../../components/ui/Skeleton';

const STATUS_MAP = {
  draft:   { label: 'Draft',   color: '#64748b', icon: Clock },
  sent:    { label: 'Sent',    color: '#3b82f6', icon: Clock },
  paid:    { label: 'Paid',    color: '#10b981', icon: CheckCircle2 },
  overdue: { label: 'Overdue', color: '#ef4444', icon: XCircle },
  void:    { label: 'Void',    color: '#64748b', icon: XCircle },
};

export default function PortalInvoices({ dark }) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    api.get('/portal/invoices')
      .then(r => setInvoices(r.data.invoices || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const txt    = dark ? 'text-white' : 'text-slate-800';
  const sub    = dark ? 'text-slate-400' : 'text-slate-500';
  const card   = dark ? 'rgba(255,255,255,0.04)' : '#fff';
  const border = dark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.07)';

  const total   = invoices.reduce((s, i) => s + (i.total || 0), 0);
  const paid    = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + (i.total || 0), 0);
  const pending = invoices.filter(i => i.status === 'sent').reduce((s, i) => s + (i.total || 0), 0);
  const overdue = invoices.filter(i => i.status === 'overdue').length;

  return (
    <div className="p-6 space-y-5 max-w-5xl mx-auto">
      <div>
        <h2 className={`text-xl font-black ${txt}`}>Invoices</h2>
        <p className={`text-xs mt-0.5 ${sub}`}>View and track all your billing and payment history.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Invoiced', val: `$${total.toLocaleString()}`, color: '#6366f1' },
          { label: 'Amount Paid',    val: `$${paid.toLocaleString()}`,  color: '#10b981' },
          { label: 'Pending',        val: `$${pending.toLocaleString()}`, color: '#f59e0b' },
          { label: 'Overdue',        val: overdue,                       color: '#ef4444' },
        ].map(s => (
          <motion.div key={s.label} whileHover={{ y: -2 }}
            className="rounded-2xl p-4" style={{ background: `${s.color}15`, border: `1px solid ${s.color}30` }}>
            <p className="text-xs font-medium mb-1" style={{ color: s.color }}>{s.label}</p>
            <p className={`text-xl font-black ${txt}`}>{s.val}</p>
          </motion.div>
        ))}
      </div>

      {loading ? (
        <TableSkeleton columns={6} rows={5} dark={dark} />
      ) : !invoices.length ? (
        <div className="flex flex-col items-center py-16 rounded-2xl" style={{ border }}>
          <Receipt size={36} className="text-slate-500 mb-3" />
          <p className={`text-sm font-medium ${sub}`}>No invoices yet</p>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ border }}>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ background: dark ? 'rgba(99,102,241,0.08)' : '#f8fafc' }}>
                  {['Invoice #','Date','Due Date','Amount','Status','Action'].map(h => (
                    <th key={h} className={`text-left px-4 py-3 font-semibold whitespace-nowrap ${sub}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv, i) => {
                  const st = STATUS_MAP[inv.status] || STATUS_MAP.draft;
                  const Icon = st.icon;
                  return (
                    <tr key={inv._id}
                      style={{ borderTop: dark ? '1px solid rgba(255,255,255,0.04)' : '1px solid #f1f5f9',
                               background: i % 2 === 1 ? (dark ? 'rgba(255,255,255,0.015)' : '#fafafa') : 'transparent' }}>
                      <td className={`px-4 py-3 font-bold ${txt}`}>{inv.invoiceNumber || `INV-${i+1}`}</td>
                      <td className={`px-4 py-3 ${sub}`}>{inv.createdAt ? new Date(inv.createdAt).toLocaleDateString() : '—'}</td>
                      <td className={`px-4 py-3 ${sub}`}>{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '—'}</td>
                      <td className={`px-4 py-3 font-bold ${txt}`}>${(inv.total || 0).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full w-fit"
                          style={{ background: `${st.color}20`, color: st.color }}>
                          <Icon size={9} /> {st.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-all"
                          onClick={() => window.open(`/api/finance/invoices/${inv._id}`, '_blank')}>
                          <Download size={11} /> Download
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
