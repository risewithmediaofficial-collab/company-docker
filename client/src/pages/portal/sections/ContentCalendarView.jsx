import { useEffect, useState } from 'react';
import api from '../../../api';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { StatusBadge } from './PortalDashboard';

const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTHS_FULL = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const STATUS_COLORS = {
  'Draft':'#64748b','Editing':'#3b82f6','Send to Client':'#f59e0b',
  'Revision Requested':'#ef4444','Approved':'#10b981',
  'Scheduled':'#8b5cf6','Posted':'#14b8a6','Done':'#6366f1'
};

import { TableSkeleton } from '../../../components/ui/Skeleton';

export default function ContentCalendarView({ dark }) {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate]       = useState(new Date());

  useEffect(() => {
    api.get('/portal/content?limit=200')
      .then(r => setItems(r.data.items || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const txt  = dark ? 'text-white' : 'text-slate-800';
  const sub  = dark ? 'text-slate-400' : 'text-slate-500';
  const card = dark ? 'rgba(255,255,255,0.04)' : '#fff';
  const border = dark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.07)';

  const year  = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = Array.from({ length: firstDay + daysInMonth }, (_, i) =>
    i < firstDay ? null : i - firstDay + 1
  );

  const getItemsForDay = (day) => {
    if (!day) return [];
    return items.filter(item => {
      const d = item.datePosted || item.scheduledFor || item.createdAt;
      if (!d) return false;
      const dt = new Date(d);
      return dt.getFullYear() === year && dt.getMonth() === month && dt.getDate() === day;
    });
  };

  const today = new Date();

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-xl font-black ${txt}`}>Content Calendar</h2>
          <p className={`text-xs mt-0.5 ${sub}`}>See when your content is scheduled, posted, or due for review.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setDate(new Date(year, month - 1))}
            className="p-2 rounded-xl hover:bg-white/10 transition-all">
            <ChevronLeft size={16} className={sub} />
          </button>
          <span className={`text-sm font-bold min-w-[130px] text-center ${txt}`}>
            {MONTHS_FULL[month]} {year}
          </span>
          <button onClick={() => setDate(new Date(year, month + 1))}
            className="p-2 rounded-xl hover:bg-white/10 transition-all">
            <ChevronRight size={16} className={sub} />
          </button>
          <button onClick={() => setDate(new Date())}
            className="px-3 py-1.5 rounded-xl text-xs font-bold"
            style={{ background: '#6366f122', color: '#818cf8', border: '1px solid #6366f140' }}>
            Today
          </button>
        </div>
      </div>

      {loading ? (
        <TableSkeleton columns={7} rows={6} dark={dark} />
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ border }}>
          {/* Day headers */}
          <div className="grid grid-cols-7"
            style={{ background: dark ? 'rgba(99,102,241,0.08)' : '#f8fafc' }}>
            {DAYS.map(d => (
              <div key={d} className={`text-center py-3 text-[11px] font-bold ${sub}`}>{d}</div>
            ))}
          </div>

          {/* Calendar cells */}
          <div className="grid grid-cols-7">
            {cells.map((day, idx) => {
              const dayItems = getItemsForDay(day);
              const isToday = day && today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
              return (
                <div key={idx}
                  style={{
                    minHeight: 90,
                    background: isToday
                      ? dark ? 'rgba(99,102,241,0.12)' : '#eef2ff'
                      : day ? 'transparent' : dark ? 'rgba(0,0,0,0.2)' : '#f8fafc',
                    borderRight: idx % 7 !== 6 ? (dark ? '1px solid rgba(255,255,255,0.04)' : '1px solid #f1f5f9') : 'none',
                    borderBottom: dark ? '1px solid rgba(255,255,255,0.04)' : '1px solid #f1f5f9',
                  }}>
                  {day && (
                    <div className="p-1.5">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold mb-1.5 ${
                        isToday ? 'bg-indigo-500 text-white' : txt
                      }`}>
                        {day}
                      </div>
                      <div className="space-y-0.5">
                        {dayItems.slice(0, 3).map(item => (
                          <div key={item._id} title={item.taskName}
                            className="rounded px-1.5 py-0.5 text-[9px] font-semibold text-white truncate"
                            style={{ background: STATUS_COLORS[item.status] || '#6366f1' }}>
                            {item.taskName}
                          </div>
                        ))}
                        {dayItems.length > 3 && (
                          <div className="text-[9px] font-bold text-slate-400 px-1.5">
                            +{dayItems.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(STATUS_COLORS).map(([s, c]) => (
          <div key={s} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ background: c }} />
            <span className={`text-[10px] ${sub}`}>{s}</span>
          </div>
        ))}
      </div>

      {/* Upcoming items list */}
      <div className="rounded-2xl p-5" style={{ background: card, border }}>
        <h3 className={`text-sm font-bold mb-4 ${txt}`}>This Month's Content</h3>
        {items.filter(item => {
          const d = item.datePosted || item.scheduledFor || item.createdAt;
          if (!d) return false;
          const dt = new Date(d);
          return dt.getFullYear() === year && dt.getMonth() === month;
        }).length === 0 ? (
          <div className="text-center py-8">
            <Calendar size={32} className="mx-auto text-slate-500 mb-2" />
            <p className={`text-xs ${sub}`}>No content scheduled this month</p>
          </div>
        ) : (
          <div className="space-y-2">
            {items
              .filter(item => {
                const d = item.datePosted || item.scheduledFor || item.createdAt;
                if (!d) return false;
                const dt = new Date(d);
                return dt.getFullYear() === year && dt.getMonth() === month;
              })
              .sort((a, b) => {
                const da = new Date(a.datePosted || a.scheduledFor || a.createdAt);
                const db = new Date(b.datePosted || b.scheduledFor || b.createdAt);
                return da - db;
              })
              .map(item => {
                const d = new Date(item.datePosted || item.scheduledFor || item.createdAt);
                return (
                  <div key={item._id}
                    className="flex items-center gap-3 p-2.5 rounded-xl"
                    style={{ background: dark ? 'rgba(255,255,255,0.03)' : '#f8fafc' }}>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white text-[10px] font-black"
                      style={{ background: STATUS_COLORS[item.status] || '#6366f1' }}>
                      {d.getDate()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-semibold truncate ${txt}`}>{item.taskName}</p>
                      <p className={`text-[10px] ${sub}`}>{item.platform} · {item.contentType}</p>
                    </div>
                    <StatusBadge status={item.status} dark={dark} />
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
