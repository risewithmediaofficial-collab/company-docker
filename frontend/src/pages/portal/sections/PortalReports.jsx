import { useEffect, useState } from 'react';
import api from '../../../api';
import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, IndianRupee, Users, Phone,
  UserPlus, Wallet, BarChart3, Download, RefreshCw
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { formatINR } from '../../../utils/currency';
import { CardSkeleton, ChartSkeleton, TableSkeleton } from '../../../components/ui/Skeleton';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const KPI_CONFIG = [
  { key: 'adSpend',       label: 'Ad Spend',           icon: IndianRupee, color: '#f59e0b', currency: true },
  { key: 'optIns',        label: 'Opt-Ins',            icon: Users,       color: '#6366f1', currency: false },
  { key: 'callsBooked',   label: 'Calls Booked',       icon: Phone,       color: '#10b981', currency: false },
  { key: 'newClients',    label: 'New Clients',        icon: UserPlus,    color: '#3b82f6', currency: false },
  { key: 'cashCollected', label: 'Cash Collected',     icon: Wallet,      color: '#8b5cf6', currency: true },
  { key: 'totalRevenue',  label: 'Contracted Revenue', icon: BarChart3,   color: '#ec4899', currency: true },
];

function fmt(n, currency = false) {
  if (n === undefined || n === null) return currency ? formatINR(0) : '0';
  if (currency) return formatINR(n);
  return Number(n).toLocaleString('en-IN');
}

export default function PortalReports({ dark }) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear]       = useState(new Date().getFullYear().toString());
  const [activeChart, setActiveChart] = useState('totalRevenue');

  const load = () => {
    setLoading(true);
    api.get(`/portal/reporting?year=${year}`)
      .then(r => r.data)
      .then(d => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [year]);

  const txt = dark ? 'text-white' : 'text-slate-800';
  const sub = dark ? 'text-slate-400' : 'text-slate-500';
  const card = dark ? 'rgba(255,255,255,0.04)' : '#fff';
  const border = dark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.07)';

  // Format entries for charts
  const chartEntries = (data?.entries || []).map(e => ({
    ...e,
    name: MONTHS[parseInt(e.month?.split('-')[1] || 1) - 1] || e.month,
  }));

  const kpi = KPI_CONFIG.find(k => k.key === activeChart) || KPI_CONFIG[0];

  const handleExport = () => {
    const rows = [
      ['Month','Ad Spend','Opt-Ins','Calls Booked','New Clients','Cash Collected','Contracted Revenue'],
      ...(data?.entries || []).map(e => [
        e.month, e.adSpend, e.optIns, e.callsBooked, e.newClients, e.cashCollected, e.totalRevenue
      ])
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `report-${year}.csv`; a.click();
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className={`text-xl font-black ${txt}`}>Performance Dashboard</h2>
          <p className={`text-xs mt-0.5 ${sub}`}>Monthly KPI tracking — AF Reporting Board</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={year} onChange={e => setYear(e.target.value)}
            className={`px-3 py-2 rounded-xl text-xs border outline-none ${dark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-800'}`}>
            {[2023,2024,2025,2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button onClick={load}
            className="p-2 rounded-xl text-slate-400 hover:text-white transition-all"
            style={{ background: dark ? 'rgba(255,255,255,0.05)' : '#f1f5f9' }}>
            <RefreshCw size={14} />
          </button>
          <button onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all"
            style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff' }}>
            <Download size={12} /> Export CSV
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-6 animate-pulse">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => (
              <CardSkeleton key={i} dark={dark} />
            ))}
          </div>
          <ChartSkeleton dark={dark} />
          <TableSkeleton columns={7} rows={6} dark={dark} />
        </div>
      ) : !data?.entries?.length ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl" style={{ border }}>
          <BarChart3 size={40} className="text-slate-500 mb-3" />
          <p className={`text-sm font-medium ${sub}`}>No reporting data for {year}</p>
          <p className="text-xs text-slate-500 mt-1">Your account manager will update this monthly.</p>
        </div>
      ) : (
        <>
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {KPI_CONFIG.map(k => {
              const val = data?.totals?.[k.key] ?? 0;
              const growth = data?.growth?.[k.key];
              const latestVal = data?.latestMonth?.[k.key] ?? 0;
              const isPos = parseFloat(growth) >= 0;
              return (
                <motion.button key={k.key} whileHover={{ y: -3 }} whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveChart(k.key)}
                  className="text-left rounded-2xl p-4 transition-all"
                  style={{
                    background: activeChart === k.key ? `${k.color}18` : card,
                    border: activeChart === k.key ? `1px solid ${k.color}50` : border,
                  }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${k.color}20` }}>
                      <k.icon size={15} style={{ color: k.color }} />
                    </div>
                    {growth !== undefined && (
                      <div className={`flex items-center gap-0.5 text-[10px] font-bold`}
                        style={{ color: isPos ? '#10b981' : '#ef4444' }}>
                        {isPos ? <TrendingUp size={10}/> : <TrendingDown size={10}/>}
                        {Math.abs(growth)}%
                      </div>
                    )}
                  </div>
                  <p className={`text-xl font-black mt-1 ${txt}`}>{fmt(val, k.currency)}</p>
                  <p className={`text-[10px] font-medium mt-0.5 ${sub}`}>{k.label}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Latest: {fmt(latestVal, k.currency)}
                  </p>
                </motion.button>
              );
            })}
          </div>

          {/* Main Trend Chart */}
          <div className="rounded-2xl p-5" style={{ background: card, border }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className={`text-sm font-bold ${txt}`}>{kpi.label} — Monthly Trend</h3>
                <p className={`text-[10px] ${sub}`}>{year} performance</p>
              </div>
              <div className="w-3 h-3 rounded-full" style={{ background: kpi.color }} />
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={chartEntries} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={dark ? '#1e293b' : '#f1f5f9'} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: dark ? '#64748b' : '#94a3b8' }} />
                <YAxis tick={{ fontSize: 10, fill: dark ? '#64748b' : '#94a3b8' }} />
                <Tooltip
                  contentStyle={{ background: dark ? '#0f172a' : '#fff', border: '1px solid #1e293b', borderRadius: 10, fontSize: 11 }}
                  labelStyle={{ color: dark ? '#fff' : '#0f172a', fontWeight: 700 }}
                />
                <Line type="monotone" dataKey={activeChart} stroke={kpi.color} strokeWidth={2.5}
                  dot={{ fill: kpi.color, r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Combined bar chart */}
          <div className="rounded-2xl p-5" style={{ background: card, border }}>
            <h3 className={`text-sm font-bold mb-4 ${txt}`}>All KPIs — Combined View</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartEntries} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={dark ? '#1e293b' : '#f1f5f9'} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: dark ? '#64748b' : '#94a3b8' }} />
                <YAxis tick={{ fontSize: 10, fill: dark ? '#64748b' : '#94a3b8' }} />
                <Tooltip
                  contentStyle={{ background: dark ? '#0f172a' : '#fff', border: '1px solid #1e293b', borderRadius: 10, fontSize: 11 }}
                />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="optIns"      fill="#6366f1" name="Opt-Ins"       radius={[3,3,0,0]} />
                <Bar dataKey="callsBooked" fill="#10b981" name="Calls Booked"  radius={[3,3,0,0]} />
                <Bar dataKey="newClients"  fill="#3b82f6" name="New Clients"   radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly Data Table */}
          <div className="rounded-2xl overflow-hidden" style={{ border }}>
            <div className="px-4 py-3" style={{ background: dark ? 'rgba(99,102,241,0.08)' : '#f8fafc' }}>
              <h3 className={`text-xs font-bold ${txt}`}>Monthly Breakdown</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ background: dark ? 'rgba(255,255,255,0.03)' : '#fafafa' }}>
                    {['Month','Ad Spend','Opt-Ins','Calls Booked','New Clients','Cash Collected','Contracted Revenue'].map(h => (
                      <th key={h} className={`text-left px-4 py-2.5 font-semibold whitespace-nowrap ${sub}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.entries.map((e, i) => (
                    <tr key={e._id || i}
                      style={{ borderTop: dark ? '1px solid rgba(255,255,255,0.04)' : '1px solid #f1f5f9' }}>
                      <td className={`px-4 py-2.5 font-bold ${txt}`}>
                        {MONTHS[parseInt(e.month?.split('-')[1]||1)-1]} {e.month?.split('-')[0]}
                      </td>
                      <td className="px-4 py-2.5 text-amber-400 font-semibold">{fmt(e.adSpend, true)}</td>
                      <td className={`px-4 py-2.5 ${txt}`}>{fmt(e.optIns)}</td>
                      <td className={`px-4 py-2.5 ${txt}`}>{fmt(e.callsBooked)}</td>
                      <td className={`px-4 py-2.5 ${txt}`}>{fmt(e.newClients)}</td>
                      <td className="px-4 py-2.5 text-emerald-400 font-semibold">{fmt(e.cashCollected, true)}</td>
                      <td className="px-4 py-2.5 text-pink-400 font-semibold">{fmt(e.totalRevenue, true)}</td>
                    </tr>
                  ))}
                  {/* Totals row */}
                  <tr style={{ background: dark ? 'rgba(99,102,241,0.08)' : '#f0f4ff', borderTop: '2px solid #6366f130' }}>
                    <td className={`px-4 py-2.5 font-black ${txt}`}>TOTAL</td>
                    <td className="px-4 py-2.5 text-amber-400 font-black">{fmt(data.totals?.adSpend, true)}</td>
                    <td className={`px-4 py-2.5 font-black ${txt}`}>{fmt(data.totals?.optIns)}</td>
                    <td className={`px-4 py-2.5 font-black ${txt}`}>{fmt(data.totals?.callsBooked)}</td>
                    <td className={`px-4 py-2.5 font-black ${txt}`}>{fmt(data.totals?.newClients)}</td>
                    <td className="px-4 py-2.5 text-emerald-400 font-black">{fmt(data.totals?.cashCollected, true)}</td>
                    <td className="px-4 py-2.5 text-pink-400 font-black">{fmt(data.totals?.totalRevenue, true)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
