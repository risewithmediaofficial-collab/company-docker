import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  CheckSquare, 
  DollarSign, 
  Users2, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  FileText,
  Clock,
  MessageSquare,
  BarChart3,
  Award,
  Zap,
  IndianRupee,
  FileCheck,
  Download,
  Palette,
  Receipt,
  HeadphonesIcon,
  BookOpen,
  Calendar
} from 'lucide-react';
import { toggleSidebar } from '../../store/slices/uiSlice';
import { motion } from 'framer-motion';
import WorkspaceSwitcher from './WorkspaceSwitcher';

const Sidebar = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { sidebarOpen } = useSelector((state) => state.ui);
  const { user } = useSelector((state) => state.auth);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const sidebarVariants = {
    mobile: {
      width: 256,
      x: sidebarOpen ? 0 : -256,
    },
    desktop: {
      width: sidebarOpen ? 256 : 80,
      x: 0,
    }
  };

  const menuItems = {
    superAdmin: [
      { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
      { name: 'CRM & Leads', icon: TrendingUp, path: '/crm/leads' },
      { name: 'Projects', icon: Briefcase, path: '/projects' },
      { name: 'Clients', icon: Users, path: '/clients' },
      { name: 'Tasks', icon: CheckSquare, path: '/tasks' },
      { name: 'Content Calendar', icon: FileText, path: '/calendar' },
      { name: 'Message Center', icon: MessageSquare, path: '/chat' },
      { name: 'Finance', icon: IndianRupee, path: '/finance' },
      { name: 'HR & Hiring', icon: Users2, path: '/hr' },
      { name: 'Automations', icon: Zap, path: '/automations' },
      { name: 'Reports', icon: BarChart3, path: '/reports' },
      { name: 'Portal Manager', icon: FileText, path: '/portal-manager' },
      { name: 'Users', icon: Users2, path: '/admin/users' },
    ],
    manager: [
      { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
      { name: 'Clients', icon: Users, path: '/clients' },
      { name: 'Projects', icon: Briefcase, path: '/projects' },
      { name: 'Team Tasks', icon: CheckSquare, path: '/tasks' },
      { name: 'Content Calendar', icon: FileText, path: '/calendar' },
      { name: 'Message Center', icon: MessageSquare, path: '/chat' },
      { name: 'Reports', icon: BarChart3, path: '/reports' },
      { name: 'Portal Manager', icon: FileText, path: '/portal-manager' },
    ],
    employee: [
      { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
      { name: 'My Tasks', icon: CheckSquare, path: '/tasks' },
      { name: 'Attendance', icon: Clock, path: '/attendance' },
      { name: 'Message Center', icon: MessageSquare, path: '/chat' },
    ],
    client: [
      { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
      { name: 'Content Review', icon: FileCheck, path: '/portal/review' },
      { name: 'Content Calendar', icon: Calendar, path: '/calendar' },
      { name: 'Reports', icon: BarChart3, path: '/portal/reports' },
      { name: 'Downloads', icon: Download, path: '/portal/downloads' },
      { name: 'Brand Assets', icon: Palette, path: '/portal/assets' },
      { name: 'Invoices', icon: Receipt, path: '/finance' },
      { name: 'Support', icon: HeadphonesIcon, path: '/portal/support' },
      { name: 'Guidelines', icon: BookOpen, path: '/portal/guidelines' },
      { name: 'Message Center', icon: MessageSquare, path: '/chat' },
    ],
    referral: [
      { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
      { name: 'Leads', icon: TrendingUp, path: '/crm/leads' },
      { name: 'Earnings', icon: Award, path: '/referral' },
    ],
  };

  const currentMenu = menuItems[user?.role] || menuItems.employee;

  return (
    <>
      {/* Mobile Sidebar Overlay Backdrop */}
      {isMobile && sidebarOpen && (
        <div 
          onClick={() => dispatch(toggleSidebar())}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300"
        />
      )}

      <motion.aside 
        initial={false}
        animate={isMobile ? sidebarVariants.mobile : sidebarVariants.desktop}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="fixed left-0 top-0 h-screen bg-card border-r border-border z-50 flex flex-col shadow-xl"
      >
        {/* Logo Section */}
        <div className="h-16 flex items-center px-6 border-b border-border">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-background p-1.5 shadow-sm">
            <img
              src="/branding/rise-with-media-logo.png"
              alt="RISE WITH MEDIA logo"
              className="h-full w-full object-contain"
            />
          </div>
          {(sidebarOpen || isMobile) && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="ml-3 flex min-w-0 flex-col leading-tight"
            >
              <span className="truncate text-[11px] font-black uppercase tracking-[0.22em] text-primary/80">Rise With</span>
              <span className="truncate text-sm font-bold uppercase tracking-[0.18em] text-foreground">Media</span>
            </motion.div>
          )}
        </div>

        <WorkspaceSwitcher sidebarOpen={sidebarOpen || isMobile} />

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {currentMenu.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => isMobile && dispatch(toggleSidebar())}
              className={`flex items-center p-3 rounded-xl transition-all duration-200 group ${
                location.pathname === item.path 
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' 
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              <item.icon size={22} className={`${location.pathname === item.path ? '' : 'group-hover:scale-110 transition-transform'}`} />
              {(sidebarOpen || isMobile) && (
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="ml-3 font-medium text-sm"
                >
                  {item.name}
                </motion.span>
              )}
            </Link>
          ))}
        </div>

        {/* Footer Section */}
        <div className="p-4 border-t border-border">
          <Link
            to="/settings"
            onClick={() => isMobile && dispatch(toggleSidebar())}
            className={`flex items-center p-3 rounded-xl transition-all ${
              location.pathname === '/settings' 
                ? 'bg-primary/10 text-primary' 
                : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
            }`}
          >
            <Settings size={22} />
            {(sidebarOpen || isMobile) && (
              <span className="ml-3 font-medium text-sm">Settings</span>
            )}
          </Link>
          
          {!isMobile && (
            <button
              onClick={() => dispatch(toggleSidebar())}
              className="mt-2 w-full flex items-center justify-center p-2 rounded-xl text-muted-foreground hover:bg-secondary transition-colors"
            >
              {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
            </button>
          )}
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
