import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link, Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Building2, LayoutDashboard, BarChart3, Clock,
  ChevronLeft, Shield
} from 'lucide-react';
import axios from 'axios';

const navItems = [
  { label: 'Overview', icon: LayoutDashboard, path: '/platform', id: 'overview' },
  { label: 'Companies', icon: Building2, path: '/platform/companies', id: 'companies' },
  { label: 'Company Requests', icon: Clock, path: '/platform/companies?tab=requests', id: 'requests' },
  { label: 'Analytics', icon: BarChart3, path: '/platform/analytics', id: 'analytics' },
];

const PlatformLayout = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();
  const [pendingCount, setPendingCount] = useState(0);

  // Guard: Only superAdmin can access
  useEffect(() => {
    if (user && user.role !== 'superAdmin') {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  // Fetch pending registration requests count for notification badge
  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) return;
        const res = await axios.get('/api/platform/organizations?status=pending&limit=1', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPendingCount(res.data.total || 0);
      } catch (err) {
        // quiet fallback
      }
    };

    fetchPendingCount();
    const interval = setInterval(fetchPendingCount, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, [location.pathname, location.search]);

  if (!user || user.role !== 'superAdmin') return null;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Platform Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-white border-r border-slate-200/80 flex flex-col shadow-xs">
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-slate-100 gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center flex-shrink-0 shadow-sm shadow-indigo-600/20">
            <Shield size={16} className="text-white" />
          </div>
          <div>
            <p className="text-slate-900 text-sm font-bold leading-tight">Platform Admin</p>
            <p className="text-indigo-600 text-[10px] font-semibold uppercase tracking-wider">Super Admin Console</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isRequests = item.id === 'requests';
            const isCompanies = item.id === 'companies';
            
            let active = false;
            if (isRequests) {
              active =
                location.pathname === '/platform/requests' ||
                location.pathname === '/platform/company-requests' ||
                (location.pathname === '/platform/companies' && (location.search.includes('tab=requests') || location.search.includes('status=pending')));
            } else if (isCompanies) {
              active =
                location.pathname.startsWith('/platform/companies') &&
                !location.search.includes('tab=requests') &&
                !location.search.includes('status=pending');
            } else {
              active = location.pathname === item.path;
            }

            return (
              <Link
                key={item.id}
                to={item.path}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={18} className={isRequests && pendingCount > 0 && !active ? 'text-amber-600' : ''} />
                  <span>{item.label}</span>
                </div>

                {isRequests && pendingCount > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-bold transition-all ${
                      active
                        ? 'bg-white text-indigo-700'
                        : 'bg-amber-100 text-amber-800 border border-amber-300 shadow-xs animate-pulse'
                    }`}
                  >
                    {pendingCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-4 border-t border-slate-100 space-y-2">
          <div className="flex items-center gap-3 px-3 py-2 bg-slate-50/80 rounded-xl border border-slate-100">
            <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 text-xs font-bold">
              {user?.name?.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-slate-900 text-xs font-semibold truncate">{user?.name}</p>
              <p className="text-slate-500 text-[10px] truncate">{user?.email}</p>
            </div>
          </div>
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all"
          >
            <ChevronLeft size={16} />
            <span>Back to App</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-slate-50">
        <Outlet />
      </main>
    </div>
  );
};

export default PlatformLayout;
