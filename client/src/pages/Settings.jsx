import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Bell,
  Briefcase,
  Camera,
  Globe,
  KeyRound,
  Lock,
  Mail,
  Palette,
  Phone,
  Save,
  Shield,
  User,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { toggleDarkMode } from '../store/slices/uiSlice';
import { updateCurrentUser } from '../store/slices/authSlice';
import {
  useChangePassword,
  useSettings,
  useUpdatePreferences,
  useUpdateProfileSettings,
} from '../hooks/useSettings';

const sections = [
  { id: 'profile', label: 'Profile Info', icon: User },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'permissions', label: 'Permissions', icon: Shield },
];

const Settings = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { darkMode } = useSelector((state) => state.ui);
  const { data, isLoading } = useSettings();
  const updateProfile = useUpdateProfileSettings();
  const updatePreferences = useUpdatePreferences();
  const changePassword = useChangePassword();
  const [activeSection, setActiveSection] = useState('profile');

  const settings = data?.settings;
  const profileUser = data?.user || user;
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    position: '',
  });

  const [preferences, setPreferences] = useState({
    notifications: {},
    appearance: {},
    regional: {},
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (!profileUser) return;
    setProfileData({
      name: profileUser.name || '',
      email: profileUser.email || '',
      phone: profileUser.phone || '',
      department: profileUser.department || '',
      position: profileUser.position || '',
    });
  }, [profileUser]);

  useEffect(() => {
    if (!settings) return;
    setPreferences({
      notifications: settings.notifications || {},
      appearance: settings.appearance || {},
      regional: settings.regional || {},
    });
  }, [settings]);

  const permissions = useMemo(() => profileUser?.permissions || {}, [profileUser]);

  const handleProfileChange = (event) => {
    setProfileData({ ...profileData, [event.target.name]: event.target.value });
  };

  const saveProfile = async () => {
    const saved = await updateProfile.mutateAsync({
      name: profileData.name,
      phone: profileData.phone,
      department: profileData.department,
      position: profileData.position,
    });
    dispatch(updateCurrentUser(saved));
    return saved;
  };

  const handlePasswordFieldChange = (event) => {
    setPasswordData({ ...passwordData, [event.target.name]: event.target.value });
  };

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('Fill in all password fields');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    await changePassword.mutateAsync({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const savePreferences = async (nextPreferences = preferences) => {
    await updatePreferences.mutateAsync(nextPreferences);
  };

  const setNotification = (key, value) => {
    const next = {
      ...preferences,
      notifications: { ...preferences.notifications, [key]: value },
    };
    setPreferences(next);
    savePreferences(next);
  };

  const setRegional = (key, value) => {
    setPreferences({
      ...preferences,
      regional: { ...preferences.regional, [key]: value },
    });
  };

  if (isLoading) {
    return <div className="h-96 rounded-2xl border border-border bg-card animate-pulse" />;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground text-sm">Manage your profile, security, and preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                activeSection === section.id
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              <section.icon size={18} className="mr-3" />
              {section.label}
            </button>
          ))}
        </div>

        <div className="lg:col-span-3">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-card rounded-2xl border border-border shadow-sm p-6 md:p-8"
          >
            {activeSection === 'profile' && (
              <div className="space-y-8">
                <div className="flex flex-col md:flex-row items-center gap-8 border-b border-border pb-8">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-primary to-blue-600 flex items-center justify-center text-white text-3xl font-black shadow-xl overflow-hidden">
                      {profileUser?.avatar ? <img src={profileUser.avatar} alt="" className="h-full w-full object-cover" /> : profileUser?.name?.charAt(0)}
                    </div>
                    <button className="absolute -bottom-2 -right-2 p-2 bg-card rounded-xl border border-border shadow-lg text-primary hover:bg-primary hover:text-white transition-all">
                      <Camera size={16} />
                    </button>
                  </div>
                  <div className="text-center md:text-left">
                    <h3 className="text-xl font-bold">{profileUser?.name}</h3>
                    <p className="text-sm text-muted-foreground capitalize">{profileUser?.role} / {profileUser?.department || 'Operations'}</p>
                    <p className="mt-2 text-xs text-muted-foreground">Email changes are restricted to administrators.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    ['name', 'Full Name', User, 'text'],
                    ['email', 'Email Address', Mail, 'email'],
                    ['phone', 'Phone Number', Phone, 'text'],
                    ['department', 'Department', Briefcase, 'text'],
                    ['position', 'Position', Briefcase, 'text'],
                  ].map(([name, label, Icon, type]) => (
                    <div key={name} className="space-y-2">
                      <label className="ml-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</label>
                      <div className="relative">
                        <Icon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                          type={type}
                          name={name}
                          value={profileData[name]}
                          onChange={handleProfileChange}
                          disabled={name === 'email'}
                          className="w-full pl-12 pr-4 py-3 rounded-xl bg-secondary/30 border border-border text-sm focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-70"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={saveProfile}
                    disabled={updateProfile.isPending}
                    className="flex items-center px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-60"
                  >
                    <Save size={18} className="mr-2" />
                    {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            )}

            {activeSection === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold">Notification Preferences</h3>
                  <p className="text-sm text-muted-foreground">Choose which updates should reach you.</p>
                </div>
                {[
                  ['email', 'Email notifications'],
                  ['inApp', 'In-app notifications'],
                  ['taskUpdates', 'Task updates'],
                  ['leadUpdates', 'Lead updates'],
                  ['financeAlerts', 'Finance alerts'],
                  ['dailyDigest', 'Daily digest'],
                ].map(([key, label]) => (
                  <label key={key} className="flex items-center justify-between rounded-xl border border-border bg-secondary/20 p-4">
                    <span className="text-sm font-semibold">{label}</span>
                    <input
                      type="checkbox"
                      checked={Boolean(preferences.notifications?.[key])}
                      onChange={(event) => setNotification(key, event.target.checked)}
                      className="h-5 w-5 rounded border-border text-primary focus:ring-primary"
                    />
                  </label>
                ))}
              </div>
            )}

            {activeSection === 'appearance' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-bold">Theme Preferences</h3>
                  <p className="text-sm text-muted-foreground">Customize how the platform looks for you.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => !darkMode && dispatch(toggleDarkMode())}
                    className={`p-6 rounded-xl border-2 transition-all flex flex-col items-center gap-4 ${darkMode ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-zinc-900 text-white flex items-center justify-center shadow-lg">
                      <Palette size={24} />
                    </div>
                    <span className="font-bold">Dark Mode</span>
                  </button>
                  <button
                    onClick={() => darkMode && dispatch(toggleDarkMode())}
                    className={`p-6 rounded-xl border-2 transition-all flex flex-col items-center gap-4 ${!darkMode ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-zinc-100 text-zinc-900 flex items-center justify-center shadow-lg border border-border">
                      <Palette size={24} />
                    </div>
                    <span className="font-bold">Light Mode</span>
                  </button>
                </div>

                <div className="pt-8 border-t border-border">
                  <h3 className="text-lg font-bold mb-4">Regional Settings</h3>
                  <div className="grid gap-4 md:grid-cols-3">
                    {[
                      ['language', 'Language', ['en-US', 'en-GB', 'es-ES', 'fr-FR']],
                      ['timezone', 'Timezone', ['Asia/Calcutta', 'UTC', 'America/New_York', 'Europe/London']],
                      ['currency', 'Currency', ['USD', 'INR', 'EUR', 'GBP']],
                    ].map(([key, label, options]) => (
                      <label key={key} className="space-y-2">
                        <span className="text-xs font-bold text-muted-foreground uppercase">{label}</span>
                        <select
                          value={preferences.regional?.[key] || options[0]}
                          onChange={(event) => setRegional(key, event.target.value)}
                          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                        >
                          {options.map((option) => <option key={option}>{option}</option>)}
                        </select>
                      </label>
                    ))}
                  </div>
                  <button
                    onClick={() => savePreferences()}
                    disabled={updatePreferences.isPending}
                    className="mt-6 inline-flex items-center rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
                  >
                    <Globe size={16} className="mr-2" />
                    Save Regional Settings
                  </button>
                </div>
              </div>
            )}

            {activeSection === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold">Security</h3>
                  <p className="text-sm text-muted-foreground">Manage your password for this account.</p>
                </div>

                <div className="rounded-2xl border border-border bg-secondary/20 p-5 space-y-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold">Password management</p>
                      <p className="mt-1 text-sm text-muted-foreground">Change your password here, or keep using the reset-email flow from the sign-in screen if you ever get locked out.</p>
                    </div>
                    <div className="rounded-xl bg-primary/10 p-3 text-primary">
                      <KeyRound size={18} />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    {[
                      ['currentPassword', 'Current password'],
                      ['newPassword', 'New password'],
                      ['confirmPassword', 'Confirm new password'],
                    ].map(([name, label]) => (
                      <label key={name} className="space-y-2">
                        <span className="ml-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
                        <input
                          type="password"
                          name={name}
                          value={passwordData[name]}
                          onChange={handlePasswordFieldChange}
                          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm transition-all focus:ring-2 focus:ring-primary/20"
                        />
                      </label>
                    ))}
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleChangePassword}
                      disabled={changePassword.isPending}
                      className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 disabled:opacity-60"
                    >
                      {changePassword.isPending ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'permissions' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold">Role & Permissions</h3>
                <div className="rounded-xl border border-border bg-secondary/20 p-5">
                  <p className="text-sm font-semibold capitalize">{profileUser?.role}</p>
                  <p className="mt-1 text-sm text-muted-foreground">Access is enforced by protected API routes and role checks.</p>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {Object.entries(permissions).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between rounded-xl border border-border p-4">
                      <span className="text-sm font-medium">{key.replace(/([A-Z])/g, ' $1')}</span>
                      <span className={`text-xs font-bold ${value ? 'text-emerald-600' : 'text-muted-foreground'}`}>{value ? 'Enabled' : 'Disabled'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
