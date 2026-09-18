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
    <div className="min-h-screen bg-[#090a0f] flex">
      {/* Platform Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-black/40 border-r border-white/5 flex flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-white/5 gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
            <Shield size={16} className="text-white" />
          </div>
          <div>
            <p className="text-white text-sm font-bold leading-tight">Platform Admin</p>
            <p className="text-indigo-400 text-[10px] font-medium uppercase tracking-wider">Super Admin Console</p>
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
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={18} className={isRequests && pendingCount > 0 && !active ? 'text-amber-400' : ''} />
                  <span>{item.label}</span>
                </div>

                {isRequests && pendingCount > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-bold transition-all ${
                      active
                        ? 'bg-white text-indigo-700'
                        : 'bg-amber-500 text-black shadow-sm shadow-amber-500/20 animate-pulse'
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
        <div className="p-4 border-t border-white/5 space-y-2">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-indigo-600/30 flex items-center justify-center text-indigo-300 text-xs font-bold">
              {user?.name?.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-semibold truncate">{user?.name}</p>
              <p className="text-slate-500 text-[10px] truncate">{user?.email}</p>
            </div>
          </div>
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:bg-white/5 hover:text-white transition-all"
          >
            <ChevronLeft size={18} />
            Back to App
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default PlatformLayout;
