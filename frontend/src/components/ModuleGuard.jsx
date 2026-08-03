import { useSelector } from 'react-redux';
import { Lock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * ModuleGuard — wraps any page/component that requires a specific module.
 *
 * Usage:
 *   <ModuleGuard module="finance">
 *     <Finance />
 *   </ModuleGuard>
 *
 * If the user is a superAdmin → always passes through.
 * If the org has the module enabled → renders children.
 * Otherwise → renders the upgrade prompt.
 */
const ModuleGuard = ({ module: moduleName, children }) => {
  const { user } = useSelector((state) => state.auth);
  const organization = user?.organization;

  // Platform super admin bypasses all guards
  if (user?.role === 'superAdmin') return children;

  // If org data isn't loaded yet, let it through (avoids flash)
  if (!organization) return children;

  const isEnabled = organization?.enabledModules?.[moduleName];

  if (!isEnabled) {
    return <UpgradePrompt module={moduleName} />;
  }

  return children;
};

// Module display names
const moduleNames = {
  finance:     'Finance & Invoicing',
  hr:          'HR & Hiring',
  attendance:  'Attendance Tracking',
  smm:         'Social Media Manager',
  portal:      'Client Portal',
  sop:         'Standard Operating Procedures',
  assets:      'Asset Library',
  proposals:   'Proposals & Contracts',
  reports:     'Reports & Analytics',
  automations: 'Automation Rules',
  influencers: 'Influencer Hub',
  ai:          'AI Features',
};

const UpgradePrompt = ({ module: moduleName }) => {
  const displayName = moduleNames[moduleName] || moduleName;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4"
    >
      <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center mb-5">
        <Lock size={28} className="text-indigo-400" />
      </div>
      <h2 className="text-xl font-bold text-white mb-2">{displayName} — Not Enabled</h2>
      <p className="text-slate-400 max-w-md mb-6 text-sm leading-relaxed">
        The <span className="text-white font-semibold">{displayName}</span> module is not included in your current plan.
        Contact the platform admin to enable this module for your organization.
      </p>
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 max-w-sm w-full text-left space-y-2 mb-6">
        <p className="text-white text-sm font-semibold mb-3">To get access:</p>
        <p className="text-slate-400 text-sm">📞 Contact your platform admin</p>
        <p className="text-slate-400 text-sm">💬 Request an upgrade to a higher plan</p>
        <p className="text-slate-400 text-sm">✅ Admin enables it for your organization</p>
      </div>
    </motion.div>
  );
};

export { UpgradePrompt };
export default ModuleGuard;
