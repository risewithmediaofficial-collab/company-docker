import { useEffect, useMemo, useState } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  FileText,
  History,
  Timer,
  TrendingUp,
} from 'lucide-react';
import { EODReportModal } from '../../components/modals/EODReportModal';
import { useAttendance, useClockIn, useClockOut } from '../../hooks/useAttendance';

const Attendance = () => {
  const [time, setTime] = useState(new Date());
  const [showEOD, setShowEOD] = useState(false);
  const { data, isLoading } = useAttendance();
  const clockIn = useClockIn();
  const clockOut = useClockOut();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const records = data?.records || [];
  const summary = data?.summary || { present: 0, totalHours: '0.00', leave: 0, absent: 0 };
  const todayRecord = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return records.find((record) => record.date?.split('T')[0] === today);
  }, [records]);
  const isClockedIn = Boolean(todayRecord?.clockIn && !todayRecord?.clockOut);
  const eodSubmitted = Boolean(todayRecord?.eodReport?.submittedAt);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto animate-pulse space-y-6">
        <div className="h-64 bg-card rounded-3xl" />
        <div className="h-96 bg-card rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Daily Workspace</h1>
          <p className="text-muted-foreground text-sm">Track attendance, hours, and daily reports</p>
        </div>
        <button
          onClick={() => setShowEOD(true)}
          className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 disabled:opacity-50"
          disabled={!todayRecord?.clockIn}
        >
          <FileText size={18} className="mr-2" />
          {eodSubmitted ? 'Update EOD Report' : 'Submit EOD Report'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card p-8 rounded-3xl border border-border shadow-xl relative overflow-hidden text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
            <div className="relative z-10">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                <Timer size={32} className={isClockedIn ? 'animate-pulse' : ''} />
              </div>
              <h2 className="text-4xl font-black tracking-tighter mb-1">
                {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </h2>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-8">
                {time.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>

              {isClockedIn ? (
                <button
                  onClick={() => clockOut.mutate()}
                  disabled={clockOut.isPending}
                  className="w-full py-4 rounded-3xl bg-destructive text-white font-black text-lg shadow-xl shadow-destructive/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60"
                >
                  {clockOut.isPending ? 'Clocking Out...' : 'Clock Out'}
                </button>
              ) : (
                <button
                  onClick={() => clockIn.mutate()}
                  disabled={clockIn.isPending || Boolean(todayRecord?.clockOut)}
                  className="w-full py-4 rounded-3xl bg-primary text-white font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
                >
                  {todayRecord?.clockOut ? 'Shift Completed' : clockIn.isPending ? 'Clocking In...' : 'Clock In'}
                </button>
              )}

              <div className="flex items-center justify-center space-x-6 pt-6 text-sm font-bold text-muted-foreground">
                <div className="flex flex-col items-center">
                  <span className="text-xs uppercase tracking-tighter opacity-60">In</span>
                  <span className="text-foreground">{todayRecord?.clockIn ? new Date(todayRecord.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</span>
                </div>
                <div className="w-px h-8 bg-border" />
                <div className="flex flex-col items-center">
                  <span className="text-xs uppercase tracking-tighter opacity-60">Out</span>
                  <span className="text-foreground">{todayRecord?.clockOut ? new Date(todayRecord.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card p-6 rounded-3xl border border-border shadow-sm">
            <h3 className="font-bold flex items-center mb-6">
              <TrendingUp size={18} className="mr-2 text-emerald-500" />
              This Month Summary
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Days Present</span>
                <span className="font-bold text-emerald-600">{summary.present} Days</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Total Hours</span>
                <span className="font-bold">{summary.totalHours} hrs</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">EOD Submitted</span>
                <span className={`font-bold ${eodSubmitted ? 'text-emerald-600' : 'text-amber-600'}`}>{eodSubmitted ? 'Yes' : 'Pending'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border flex items-center justify-between bg-secondary/10">
              <h3 className="font-bold flex items-center">
                <History size={18} className="mr-2 text-primary" />
                Shift History
              </h3>
              <div className="flex items-center space-x-2">
                <button className="p-1.5 rounded-lg border border-border hover:bg-secondary transition-colors"><ChevronLeft size={16} /></button>
                <span className="text-xs font-bold uppercase tracking-widest">{new Date().toLocaleString('default', { month: 'long' })}</span>
                <button className="p-1.5 rounded-lg border border-border hover:bg-secondary transition-colors"><ChevronRight size={16} /></button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-muted-foreground font-medium border-b border-border">
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">In / Out</th>
                    <th className="px-6 py-4">Total Time</th>
                    <th className="px-6 py-4">EOD</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {records.map((record) => (
                    <tr key={record._id} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold">{new Date(record.date).toLocaleDateString([], { weekday: 'short', day: 'numeric' })}</div>
                        <div className="text-[10px] text-muted-foreground uppercase">{new Date(record.date).toLocaleDateString([], { month: 'long' })}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2 text-xs">
                          <span className="text-emerald-600 font-bold">{record.clockIn ? new Date(record.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</span>
                          <span className="text-muted-foreground opacity-40">to</span>
                          <span className="text-amber-600 font-bold">{record.clockOut ? new Date(record.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold">{record.totalHours?.toFixed(1) || '0.0'} hrs</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${record.eodReport?.submittedAt ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>
                          {record.eodReport?.submittedAt ? 'Submitted' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-600">
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {records.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-muted-foreground italic">No attendance records found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 rounded-3xl text-white shadow-xl flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold">Daily Closeout</h3>
              <p className="text-white/75 text-sm mt-1 max-w-[420px]">Submit your EOD report after logging work so managers can review progress and blockers.</p>
              <button onClick={() => setShowEOD(true)} className="mt-4 px-6 py-2.5 bg-white text-primary font-bold rounded-xl text-sm shadow-lg hover:bg-white/90 transition-all">
                {eodSubmitted ? 'Review Report' : 'Submit Report'}
              </button>
            </div>
            <Calendar size={80} className="opacity-20 hidden md:block" />
          </div>
        </div>
      </div>

      <EODReportModal open={showEOD} onOpenChange={setShowEOD} report={todayRecord?.eodReport} />
    </div>
  );
};

export default Attendance;
