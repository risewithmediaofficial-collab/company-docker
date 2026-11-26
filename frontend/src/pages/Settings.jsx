import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
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
  Trash2,
  User,
  Eye,
  EyeOff,
  BellRing,
  CheckCircle2,
  AlertTriangle,
  Send,
  Laptop,
  Crop,
  Clock,
  VolumeX,
  Volume2,
  Building2,
} from '@/components/ui/muiIcons';
import { CreditCard, HardDrive, ExternalLink, Copy, Upload, Sparkles, Clock as LucideClock, Navigation, Compass, MapPin } from 'lucide-react';
import { formatStorageQuota } from '../components/billing/PricingPlansGrid';

const formatTimeTo12Hour = (time24) => {
  if (!time24) return '';
  const [hStr, mStr] = String(time24).split(':');
  let h = parseInt(hStr, 10);
  const m = mStr || '00';
  if (Number.isNaN(h)) return '';
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
};
import BranchManager from '../components/branches/BranchManager';
import { toast } from 'sonner';
import { SelectDropdown } from '../components/ui/SelectDropdown';
import { ProfileImageCropModal } from '../components/modals/ProfileImageCropModal';
import { toggleDarkMode } from '../store/slices/uiSlice';
import { updateCurrentUser, updateOrganization } from '../store/slices/authSlice';
import {
  useChangePassword,
  useSettings,
  useUpdateCompanySettings,
  useUpdatePreferences,
  useUpdateProfileSettings,
  useUploadProfileAvatar,
} from '../hooks/useSettings';
import { getAssetUrl } from '../utils/assetUrl';
import api from '../api';
import {
  getBrowserNotificationPermission,
  requestBrowserNotificationPermission,
  sendBrowserNotification,
  triggerBannerNotification,
  isBrowserNotificationSupported,
} from '../utils/browserNotification';
import { sendTestPushNotification } from '../utils/webPush';

const INDUSTRY_OPTIONS = [
  'Digital Marketing Agency',
  'Creative & Design Studio',
  'PR & Communications',
  'Web & App Development',
  'Social Media Agency',
  'Advertising Agency',
  'Performance Marketing',
  'Branding Agency',
  'IT & Software Consulting',
  'Other / Services',
];

const sections = [
  { id: 'profile', label: 'Profile Info', icon: User },
  { id: 'company', label: 'Company & GST Details', icon: Briefcase },
  { id: 'billing', label: 'Plan & Storage', icon: CreditCard },
  { id: 'branches', label: 'Branches & Locations', icon: Building2 },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'permissions', label: 'Permissions', icon: Shield },
];

const Settings = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, organization } = useSelector((state) => state.auth);
  const { darkMode } = useSelector((state) => state.ui);
  const { data, isLoading } = useSettings();
  const updateProfile = useUpdateProfileSettings();
  const updateCompany = useUpdateCompanySettings();
  const uploadProfileAvatar = useUploadProfileAvatar();
  const updatePreferences = useUpdatePreferences();
  const changePassword = useChangePassword();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlSection = searchParams.get('section');
  const [activeSection, setActiveSection] = useState(() => {
    if (urlSection && sections.some((s) => s.id === urlSection)) return urlSection;
    if (organization?.companySetupRequired) return 'company';
    return 'profile';
  });

  useEffect(() => {
    const s = searchParams.get('section');
    if (s && sections.some((sec) => sec.id === s)) {
      setActiveSection(s);
    } else if (organization?.companySetupRequired) {
      setActiveSection('company');
    }
  }, [searchParams, organization?.companySetupRequired]);
  // Payment modal removed: purchases are disabled in this build.

  const settings = data?.settings;
  const profileUser = data?.user || user;
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    position: '',
  });
  const [currentAvatar, setCurrentAvatar] = useState('');
  const [avatarPreview, setAvatarPreview] = useState('');
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState('');
  const [cropImageFile, setCropImageFile] = useState(null);
  const [companyProfile, setCompanyProfile] = useState({
    name: '',
    slug: '',
    industry: '',
    website: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    postalCode: '',
    email: '',
    phone: '',
    gstNumber: '',
    services: '',
    logoUrl: '',
    openingTime: '09:30',
    closingTime: '18:30',
    operatingHours: '9:30 AM - 6:30 PM',
    workingDays: 'Monday - Saturday',
    lateGraceMinutes: 15,
    latitude: '',
    longitude: '',
    radiusKm: 0.5,
  });
  const [billingInfo, setBillingInfo] = useState(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

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
  const [showPasswordFields, setShowPasswordFields] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const [browserPermission, setBrowserPermission] = useState(() => getBrowserNotificationPermission());
  const [isTestingNotification, setIsTestingNotification] = useState(false);
  const [isTestingDelayed, setIsTestingDelayed] = useState(false);
  const [delayedCountdown, setDelayedCountdown] = useState(null);
  const [bannerSoundMuted, setBannerSoundMuted] = useState(() => {
    return localStorage.getItem('rwm_banner_sound_muted') === 'true';
  });

  const toggleBannerSound = () => {
    const next = !bannerSoundMuted;
    setBannerSoundMuted(next);
    localStorage.setItem('rwm_banner_sound_muted', String(next));
    toast.success(next ? 'Banner notification sound muted' : 'Banner notification sound unmuted');
  };

  const handleEnableBrowserNotifications = async () => {
    const res = await requestBrowserNotificationPermission();
    const updatedPerm = res?.permission || getBrowserNotificationPermission();
    setBrowserPermission(updatedPerm);
    window.dispatchEvent(new CustomEvent('rwm-push-state-changed', { detail: { active: updatedPerm === 'granted' } }));
    if (updatedPerm === 'granted') {
      toast.success('Banner notifications enabled on this device!');
    }
  };

  const handleTestNotification = async () => {
    setIsTestingNotification(true);
    try {
      // 1. In-App Floating Banner
      triggerBannerNotification({
        title: 'Banner Notification Working',
        message: 'Your in-app floating banner and system desktop notifications are verified and active.',
        link: '/settings',
        type: 'success',
      });

      // 2. Direct browser OS banner notification
      await sendBrowserNotification({
        title: 'Banner Notification Active',
        message: 'Rise With Media system desktop alerts are connected successfully.',
        link: '/settings',
      });

      // 3. Real-time notification through backend Socket.io pipeline
      await api.post('/notifications/test');
      toast.success('Test notification dispatched to banner and system!');
    } catch (err) {
      console.error('Test notification failed:', err);
      toast.error(err?.response?.data?.message || 'Failed to trigger test notification');
    } finally {
      setIsTestingNotification(false);
    }
  };

  const handleDelayedPushTest = async () => {
    setIsTestingDelayed(true);
    try {
      await sendTestPushNotification(10);
      setDelayedCountdown(10);
      const timer = setInterval(() => {
        setDelayedCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsTestingDelayed(false);
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setIsTestingDelayed(false);
    }
  };

  useEffect(() => {
    if (!profileUser) return;
    setProfileData({
      name: profileUser.name || '',
      email: profileUser.email || '',
      phone: profileUser.phone || '',
      department: profileUser.department || '',
      position: profileUser.position || '',
    });
    setCurrentAvatar(profileUser.avatar || '');
  }, [profileUser]);

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  useEffect(() => {
    if (!settings) return;
    setPreferences({
      notifications: settings.notifications || {},
      appearance: settings.appearance || {},
      regional: settings.regional || {},
    });
    setCompanyProfile({
      name: settings.companyProfile?.name || '',
      slug: settings.companyProfile?.slug || data?.organization?.slug || '',
      industry: settings.companyProfile?.industry || data?.organization?.industry || '',
      website: settings.companyProfile?.website || data?.organization?.website || '',
      address: settings.companyProfile?.address || '',
      city: settings.companyProfile?.city || '',
      state: settings.companyProfile?.state || '',
      country: settings.companyProfile?.country || 'India',
      postalCode: settings.companyProfile?.postalCode || '',
      email: settings.companyProfile?.email || '',
      phone: settings.companyProfile?.phone || '',
      gstNumber: settings.companyProfile?.gstNumber || '',
      services: settings.companyProfile?.services || '',
      logoUrl: settings.companyProfile?.logoUrl || '',
      openingTime: settings.companyProfile?.openingTime || '09:30',
      closingTime: settings.companyProfile?.closingTime || '18:30',
      operatingHours: settings.companyProfile?.operatingHours || '9:30 AM - 6:30 PM',
      workingDays: settings.companyProfile?.workingDays || 'Monday - Saturday',
      lateGraceMinutes: settings.companyProfile?.lateGraceMinutes ?? 15,
      latitude: settings.companyProfile?.latitude ?? '',
      longitude: settings.companyProfile?.longitude ?? '',
      radiusKm: settings.companyProfile?.radiusKm ?? 0.5,
    });
    if (data?.organization) {
      dispatch(updateOrganization(data.organization));
    }
  }, [settings, data?.organization, dispatch]);

  useEffect(() => {
    if (!['superAdmin', 'admin', 'organizationOwner'].includes(user?.role)) return;
    let active = true;
    api
      .get('/billing/plans')
      .then((res) => {
        if (active && res.data?.success) {
          setBillingInfo(res.data);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [user?.role]);

  const handleCompanyLogoUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid PNG, JPG, SVG, or WebP logo file');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Logo image must be under 2 MB');
      return;
    }
    setUploadingLogo(true);
    try {
      const uploadResult = await uploadProfileAvatar.mutateAsync(file);
      const uploadedUrl = uploadResult?.url || uploadResult?.file?.url || uploadResult?.data?.url;
      if (uploadedUrl) {
        setCompanyProfile((current) => ({ ...current, logoUrl: uploadedUrl }));
        toast.success('Company logo uploaded! Click Save to persist changes.');
      } else {
        toast.error('Upload succeeded, but logo URL was missing');
      }
    } catch {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setCompanyProfile((current) => ({ ...current, logoUrl: reader.result }));
          toast.success('Logo loaded in preview! Click Save to persist changes.');
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingLogo(false);
    }
  };

  const updateCompanyTimings = (openTime, closeTime) => {
    const formatted =
      openTime === '00:00' && closeTime === '23:59'
        ? '24 Hours'
        : `${formatTimeTo12Hour(openTime)} - ${formatTimeTo12Hour(closeTime)}`;
    setCompanyProfile((current) => ({
      ...current,
      openingTime: openTime,
      closingTime: closeTime,
      operatingHours: formatted,
    }));
  };

  const handleCaptureCompanyGPS = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    toast.info('Capturing current office GPS location...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCompanyProfile((current) => ({
          ...current,
          latitude: Number(pos.coords.latitude.toFixed(6)),
          longitude: Number(pos.coords.longitude.toFixed(6)),
        }));
        toast.success(
          `Office GPS captured: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`
        );
      },
      (err) => {
        toast.error(`GPS Error: ${err.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSaveCompanyDetails = async () => {
    if (!String(companyProfile.name || '').trim()) {
      toast.error('Please enter your Company / Agency Name');
      return;
    }
    const wasOnboarding = Boolean(organization?.companySetupRequired);
    const res = await updateCompany.mutateAsync(companyProfile);
    if (res?.organization) {
      dispatch(updateOrganization(res.organization));
    }
    if (wasOnboarding) {
      toast.success('Workspace company details saved! Redirecting to dashboard...');
      navigate('/', { replace: true });
    }
  };

  const permissions = useMemo(() => {
    if (profileUser?.role === 'superAdmin' || profileUser?.role === 'admin') {
      return {
        canViewReports: true,
        canManageFinance: true,
        canManageLeads: true,
        canManageHR: true,
        canApproveContent: true,
        canAssignTasks: true,
        canUploadAssets: true,
        canViewAnalytics: true,
        canManageEmployees: true,
        canAccessSmm: true,
        canViewFinanceOverview: true,
      };
    }
    return profileUser?.permissions || {};
  }, [profileUser]);

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

  const removeAvatar = async () => {
    const saved = await updateProfile.mutateAsync({ avatar: '' });
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarPreview('');
    setCurrentAvatar('');
    dispatch(updateCurrentUser(saved));
  };

  const handleAvatarFileSelect = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please choose a valid image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setCropImageSrc(reader.result);
      setCropImageFile(file);
      setIsCropModalOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropCurrentAvatar = () => {
    if (!currentAvatar) return;
    setCropImageSrc(getAssetUrl(currentAvatar));
    setCropImageFile(null);
    setIsCropModalOpen(true);
  };

  const handleCropComplete = async (croppedFile) => {
    try {
      const uploadResult = await uploadProfileAvatar.mutateAsync(croppedFile);
      const uploadedUrl = uploadResult.url || uploadResult.file?.url || uploadResult.data?.url;

      if (!uploadedUrl) {
        toast.error('Profile picture uploaded, but the image URL was missing');
        return;
      }

      const saved = await updateProfile.mutateAsync({ avatar: uploadedUrl });
      setCurrentAvatar(saved.avatar || uploadedUrl);
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
      setAvatarPreview('');
      dispatch(updateCurrentUser(saved));
      setIsCropModalOpen(false);
      toast.success('Profile picture updated successfully!');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save profile picture');
    }
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

    try {
      await changePassword.mutateAsync({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch {
      // Error handled by mutation onError toast
    }
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
    return <div className="h-96 rounded-2xl bg-card animate-pulse" />;
  }

  return (
    <div className="w-full flex flex-col gap-5 lg:h-[calc(100vh-7.5rem)] lg:overflow-hidden">
      <div className="shrink-0">
        <h1 className="text-2xl font-bold tracking-tight">Account Settings</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8 lg:flex-1 lg:min-h-0">
        <div
          data-testid="settings-static-sidebar"
          className="lg:col-span-1 flex flex-row overflow-x-auto lg:flex-col gap-1.5 pb-2 lg:pb-0 lg:h-full lg:overflow-y-auto custom-scrollbar lg:pr-1"
        >
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center px-4 py-3 min-h-[44px] rounded-xl text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0 lg:w-full cursor-pointer ${
                activeSection === section.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-card hover:text-foreground'
              }`}
            >
              <section.icon size={18} className="mr-2 sm:mr-3 shrink-0" />
              <span>{section.label}</span>
            </button>
          ))}
        </div>

        <div className="lg:col-span-3 lg:min-h-0 lg:h-full">
          <div
            key={activeSection}
            data-testid="settings-inline-scroll-view"
            className="bg-card rounded-2xl p-6 md:p-8 lg:h-full lg:overflow-y-auto custom-scrollbar animate-in fade-in duration-150"
          >
            {activeSection === 'profile' && (
              <div className="space-y-8">
                <div className="flex flex-col md:flex-row items-center gap-8 pb-4">
                  <div className="relative group">
                    <input
                      id="profile-avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarFileSelect}
                    />
                    <div className="w-24 h-24 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground text-3xl font-bold overflow-hidden">
                      {avatarPreview || currentAvatar ? <img src={getAssetUrl(avatarPreview || currentAvatar)} alt="" className="h-full w-full object-cover" /> : profileUser?.name?.charAt(0)}
                    </div>
                    <label
                      htmlFor="profile-avatar-upload"
                      aria-disabled={uploadProfileAvatar.isPending || updateProfile.isPending}
                      className={`absolute -bottom-2 -right-2 rounded-xl bg-background p-2 text-foreground shadow-sm transition-colors ${
                        uploadProfileAvatar.isPending || updateProfile.isPending
                          ? 'pointer-events-none opacity-60'
                          : 'cursor-pointer hover:bg-primary hover:text-primary-foreground'
                      }`}
                      title="Upload and crop photo"
                    >
                      <Camera size={16} />
                    </label>
                  </div>
                  <div className="text-center md:text-left">
                    <h3 className="text-xl font-bold">{profileUser?.name}</h3>
                    <p className="text-sm text-muted-foreground capitalize">{profileUser?.role} / {profileUser?.department || 'Operations'}</p>
                    <div className="mt-4 flex flex-wrap items-center gap-2.5 justify-center md:justify-start">
                      <label
                        htmlFor="profile-avatar-upload"
                        className={`inline-flex items-center rounded-xl bg-background px-4 py-2 text-sm font-semibold transition-colors ${
                          uploadProfileAvatar.isPending || updateProfile.isPending
                            ? 'pointer-events-none opacity-60'
                            : 'cursor-pointer hover:bg-secondary'
                        }`}
                      >
                        <Camera size={16} className="mr-2" />
                        {currentAvatar ? 'Change Photo & Crop' : 'Upload & Crop Photo'}
                      </label>
                      {currentAvatar ? (
                        <>
                          <button
                            type="button"
                            onClick={handleCropCurrentAvatar}
                            disabled={uploadProfileAvatar.isPending || updateProfile.isPending}
                            className="inline-flex items-center rounded-xl bg-background px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-secondary disabled:opacity-60 cursor-pointer"
                            title="Re-crop or adjust your current profile picture"
                          >
                            <Crop size={16} className="mr-2 text-primary" />
                            Crop / Adjust Current
                          </button>
                          <button
                            type="button"
                            onClick={removeAvatar}
                            disabled={updateProfile.isPending}
                            className="inline-flex items-center rounded-xl bg-background px-4 py-2 text-sm font-semibold text-destructive transition-colors hover:bg-secondary disabled:opacity-60 cursor-pointer"
                          >
                            <Trash2 size={16} className="mr-2" />
                            Remove
                          </button>
                        </>
                      ) : null}
                    </div>
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
                      <label className="ml-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</label>
                      <div className="relative">
                        <Icon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                          type={type}
                          name={name}
                          value={profileData[name]}
                          onChange={handleProfileChange}
                          disabled={name === 'email'}
                          className="w-full pl-12 pr-4 py-3 rounded-xl bg-background text-sm outline-none focus:ring-2 focus:ring-brand/40 transition-colors disabled:opacity-70"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={saveProfile}
                    disabled={updateProfile.isPending}
                    className="flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60 cursor-pointer"
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
                </div>

                {/* Native Desktop / Browser Push Notifications Card */}
                <div className="rounded-2xl bg-background p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-secondary text-foreground shrink-0">
                        <BellRing size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-foreground flex flex-wrap items-center gap-2">
                          Banner &amp; Push Notifications
                          <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-secondary text-foreground">
                            Heads-Up &amp; Desktop
                          </span>
                        </h4>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {browserPermission === 'granted' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary text-primary-foreground">
                          <CheckCircle2 size={13} /> Banner Alerts Active
                        </span>
                      ) : browserPermission === 'denied' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-secondary text-foreground">
                          <AlertTriangle size={13} /> Blocked in Browser
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-secondary text-muted-foreground">
                          <AlertTriangle size={13} /> Not Enabled
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 pt-1">
                    {browserPermission !== 'granted' && (
                      <button
                        type="button"
                        onClick={handleEnableBrowserNotifications}
                        className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                      >
                        <BellRing size={14} />
                        Enable Banner Notifications
                      </button>
                    )}

                    <button
                      type="button"
                      disabled={isTestingNotification}
                      onClick={handleTestNotification}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-xl hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-50"
                      title="Trigger both in-app top banner and desktop banner alert"
                    >
                      <BellRing size={14} className={isTestingNotification ? 'animate-bounce' : ''} />
                      {isTestingNotification ? 'Testing Banner...' : 'Test Banner Notification'}
                    </button>

                    <button
                      type="button"
                      disabled={isTestingDelayed}
                      onClick={handleDelayedPushTest}
                      className="flex items-center gap-2 px-3.5 py-2 bg-secondary text-secondary-foreground text-xs font-semibold rounded-xl hover:bg-secondary/80 transition-colors cursor-pointer disabled:opacity-50 tabular-nums"
                      title="Schedules a push in 10 seconds so you can close this tab and verify background delivery"
                    >
                      <Clock size={14} className={isTestingDelayed ? 'animate-spin' : ''} />
                      {delayedCountdown !== null ? `Arriving in ${delayedCountdown}s (close tab now!)` : 'Test Closed Tab (10s)'}
                    </button>

                    <button
                      type="button"
                      onClick={toggleBannerSound}
                      className="flex items-center gap-2 px-3.5 py-2 bg-secondary hover:bg-secondary/80 text-foreground text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                      title="Toggle audio chime on banner alerts"
                    >
                      {bannerSoundMuted ? <VolumeX size={14} className="text-muted-foreground" /> : <Volume2 size={14} className="text-foreground" />}
                      <span>{bannerSoundMuted ? 'Sound Muted' : 'Sound Enabled'}</span>
                    </button>
                  </div>
                </div>

                {/* Event Preferences */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Notification Types</h4>
                  {[
                    ['email', 'Email notifications'],
                    ['inApp', 'In-app notifications'],
                    ['taskUpdates', 'Task updates'],
                    ['leadUpdates', 'Lead updates'],
                    ['financeAlerts', 'Finance alerts'],
                    ['dailyDigest', 'Daily digest'],
                  ].map(([key, label]) => (
                    <label key={key} className="flex items-center justify-between rounded-xl bg-background p-4 cursor-pointer hover:bg-secondary/50 transition-colors">
                      <span className="text-sm font-semibold">{label}</span>
                      <input
                        type="checkbox"
                        checked={Boolean(preferences.notifications?.[key])}
                        onChange={(event) => setNotification(key, event.target.checked)}
                        className="h-5 w-5 rounded text-primary focus:ring-primary accent-foreground cursor-pointer"
                      />
                    </label>
                  ))}
                </div>
              </div>
            )}

            {activeSection === 'company' && (() => {
              const activeOrg = billingInfo?.organization || organization;
              const liveSlug = (companyProfile.slug || activeOrg?.slug || 'your-agency').trim();
              const liveWorkspaceUrl =
                typeof window !== 'undefined'
                  ? `${window.location.origin}/login/${liveSlug}`
                  : `/login/${liveSlug}`;
              const activePlanName =
                activeOrg?.plan === 'pro' ? 'Enterprise Pro' : activeOrg?.plan || 'Free';
              const activeStorageLimitMb = Number(
                billingInfo?.usage?.storageLimitMb ?? activeOrg?.storageLimitMb ?? 100
              );

              return (
                <div className="space-y-6">
                  {organization?.companySetupRequired && (
                    <div className="p-4 rounded-2xl bg-[#12B7D4]/10 border border-[#12B7D4]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-extrabold uppercase tracking-wider text-[#0e7490] dark:text-[#12B7D4]">
                          Step 2 of 2 • Complete Workspace Registration
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                          Fill in your company name, live workspace URL slug, logo, industry, website, and contact details below to finish activating your workspace.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold">Company Details &amp; GST Settings</h3>
                      {activeOrg?.plan && (
                        <p className="text-xs text-muted-foreground mt-0.5 capitalize">
                          Chosen Plan: <strong className="text-primary">{activePlanName}</strong> ({activeOrg.billingCycle || 'monthly'}) • {formatStorageQuota(activeStorageLimitMb)} Storage
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveSection('billing');
                          setSearchParams({ section: 'billing' });
                        }}
                        className="px-3.5 py-2 rounded-xl border border-border bg-background hover:bg-secondary text-xs font-bold transition-colors cursor-pointer"
                      >
                        View Plan &amp; Storage
                      </button>
                      <Link
                        to="/select-plan"
                        className="px-3.5 py-2 rounded-xl bg-[#12B7D4] hover:bg-[#0ea5c6] text-white text-xs font-extrabold transition-colors"
                      >
                        Upgrade Plan
                      </Link>
                    </div>
                  </div>

                  {/* Live Brand Badge + Live Workspace URL Box */}
                  <div className="grid gap-4 lg:grid-cols-2">
                    <div className="p-4 rounded-2xl border border-border bg-background flex items-center gap-4">
                      <div className="h-14 w-14 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-border flex items-center justify-center overflow-hidden shrink-0">
                        {companyProfile.logoUrl ? (
                          <img
                            src={getAssetUrl(companyProfile.logoUrl)}
                            alt="Company Logo"
                            className="h-full w-full object-contain p-1.5"
                          />
                        ) : (
                          <span className="text-lg font-black text-[#0B8694]">
                            {(companyProfile.name || 'RW').slice(0, 2).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-black text-sm text-foreground truncate">
                            {companyProfile.name || 'Your Agency Name'}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-cyan-500/15 text-[#0B8694] dark:text-[#12B7D4] text-[10px] font-extrabold">
                            + RWM
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {companyProfile.industry || 'Digital Marketing Agency'}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl border border-cyan-200 dark:border-cyan-900/50 bg-cyan-50/60 dark:bg-cyan-950/20 flex flex-col justify-between gap-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#0B8694] dark:text-[#12B7D4] flex items-center gap-1.5">
                          <Globe size={13} />
                          Live Workspace Login URL
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard?.writeText(liveWorkspaceUrl);
                              toast.success('Live workspace URL copied!');
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-border text-[11px] font-bold hover:bg-secondary cursor-pointer"
                          >
                            <Copy size={11} />
                            Copy URL
                          </button>
                          <a
                            href={liveWorkspaceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#12B7D4] text-white text-[11px] font-bold hover:opacity-90"
                          >
                            <ExternalLink size={11} />
                            Open
                          </a>
                        </div>
                      </div>
                      <p className="text-xs font-mono font-bold text-foreground truncate" data-testid="live-workspace-url">
                        {liveWorkspaceUrl}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="space-y-2">
                        <span className="ml-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Company Name *</span>
                        <input
                          value={companyProfile.name}
                          onChange={(event) => setCompanyProfile((current) => ({ ...current, name: event.target.value }))}
                          className="w-full rounded-xl bg-background px-4 py-3 text-sm font-bold text-foreground outline-none focus:ring-2 focus:ring-brand/40"
                          placeholder="RISE WITH MEDIA"
                        />
                      </label>
                      <label className="space-y-2">
                        <span className="ml-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Workspace URL Slug</span>
                        <input
                          value={companyProfile.slug}
                          onChange={(event) => setCompanyProfile((current) => ({ ...current, slug: event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') }))}
                          className="w-full rounded-xl bg-background px-4 py-3 text-sm font-mono text-foreground outline-none focus:ring-2 focus:ring-brand/40"
                          placeholder="your-agency"
                        />
                      </label>
                      <div className="space-y-2">
                        <span className="ml-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground block">Industry / Sector</span>
                        <SelectDropdown
                          value={companyProfile.industry}
                          onChange={(val) => setCompanyProfile((current) => ({ ...current, industry: val }))}
                          options={INDUSTRY_OPTIONS}
                          placeholder="Select Industry / Sector..."
                          searchPlaceholder="Search industry..."
                          allowCustom={true}
                          customInputPlaceholder="Enter custom industry / sector..."
                          buttonClassName="w-full rounded-xl bg-background px-4 py-3 text-sm"
                        />
                      </div>
                      <label className="space-y-2">
                        <span className="ml-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Website URL</span>
                        <input
                          value={companyProfile.website}
                          onChange={(event) => setCompanyProfile((current) => ({ ...current, website: event.target.value }))}
                          className="w-full rounded-xl bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand/40"
                          placeholder="https://youragency.com"
                        />
                      </label>
                      <label className="space-y-2">
                        <span className="ml-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">GSTIN / GST Number</span>
                        <input
                          value={companyProfile.gstNumber}
                          onChange={(event) => setCompanyProfile((current) => ({ ...current, gstNumber: event.target.value }))}
                          className="w-full rounded-xl bg-background px-4 py-3 text-sm font-bold tracking-wider text-primary outline-none focus:ring-2 focus:ring-brand/40"
                          placeholder="29ABCDE1234F1Z5"
                        />
                      </label>
                      <div className="space-y-2 md:col-span-2">
                        <span className="ml-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                          Company Logo Upload or Image URL
                        </span>
                        <div className="flex flex-wrap items-center gap-3">
                          <label className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-border bg-background hover:bg-secondary text-xs font-bold cursor-pointer transition-colors">
                            <Upload size={14} />
                            <span>{uploadingLogo ? 'Uploading...' : 'Upload Logo File'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleCompanyLogoUpload}
                              disabled={uploadingLogo}
                              className="hidden"
                            />
                          </label>
                          <input
                            value={companyProfile.logoUrl}
                            onChange={(event) => setCompanyProfile((current) => ({ ...current, logoUrl: event.target.value }))}
                            className="flex-1 min-w-[200px] rounded-xl bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand/40"
                            placeholder="https://domain.com/logo.png"
                          />
                          {companyProfile.logoUrl && (
                            <button
                              type="button"
                              onClick={() => setCompanyProfile((current) => ({ ...current, logoUrl: '' }))}
                              className="px-3 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold cursor-pointer"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                      <label className="space-y-2 md:col-span-2">
                        <span className="ml-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Registered Office Address</span>
                        <textarea
                          value={companyProfile.address}
                          onChange={(event) => setCompanyProfile((current) => ({ ...current, address: event.target.value }))}
                          rows={2}
                          className="w-full rounded-xl bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand/40"
                          placeholder="Street Address, Building, Landmark"
                        />
                      </label>
                      <label className="space-y-2">
                        <span className="ml-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">City *</span>
                        <input
                          value={companyProfile.city}
                          onChange={(event) => setCompanyProfile((current) => ({ ...current, city: event.target.value }))}
                          className="w-full rounded-xl bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand/40"
                          placeholder="e.g. Bengaluru / Hosur"
                        />
                      </label>
                      <label className="space-y-2">
                        <span className="ml-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">State</span>
                        <input
                          value={companyProfile.state}
                          onChange={(event) => setCompanyProfile((current) => ({ ...current, state: event.target.value }))}
                          className="w-full rounded-xl bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand/40"
                          placeholder="e.g. Karnataka / Tamil Nadu"
                        />
                      </label>
                      <label className="space-y-2">
                        <span className="ml-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Country</span>
                        <input
                          value={companyProfile.country}
                          onChange={(event) => setCompanyProfile((current) => ({ ...current, country: event.target.value }))}
                          className="w-full rounded-xl bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand/40"
                          placeholder="India"
                        />
                      </label>
                      <label className="space-y-2">
                        <span className="ml-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Postal / PIN Code</span>
                        <input
                          value={companyProfile.postalCode}
                          onChange={(event) => setCompanyProfile((current) => ({ ...current, postalCode: event.target.value }))}
                          className="w-full rounded-xl bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand/40"
                          placeholder="e.g. 560001"
                        />
                      </label>
                      <label className="space-y-2">
                        <span className="ml-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Official Email</span>
                        <input
                          value={companyProfile.email}
                          onChange={(event) => setCompanyProfile((current) => ({ ...current, email: event.target.value }))}
                          className="w-full rounded-xl bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand/40"
                          placeholder="hello@risewithmedia.com"
                        />
                      </label>
                      <label className="space-y-2">
                        <span className="ml-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Official Phone Number</span>
                        <input
                          value={companyProfile.phone}
                          onChange={(event) => setCompanyProfile((current) => ({ ...current, phone: event.target.value }))}
                          className="w-full rounded-xl bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand/40"
                          placeholder="+91 9876543210"
                        />
                      </label>
                      <label className="space-y-2 md:col-span-2">
                        <span className="ml-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Services / Agency Tagline</span>
                        <textarea
                          value={companyProfile.services}
                          onChange={(event) => setCompanyProfile((current) => ({ ...current, services: event.target.value }))}
                          rows={2}
                          className="w-full rounded-xl bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand/40"
                          placeholder="Social Media Management, Video Production, Meta & Google Ads, Web Development"
                        />
                      </label>

                      {/* Office & Attendance Shift Timings */}
                      <div className="md:col-span-2 p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200/70 dark:border-indigo-900/50 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-800 dark:text-indigo-300 flex items-center gap-1.5">
                            <LucideClock size={14} />
                            Office &amp; Attendance Timings
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs font-bold">
                            {companyProfile.operatingHours || '9:30 AM - 6:30 PM'}
                          </span>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-4">
                          <label className="space-y-1">
                            <span className="text-xs font-semibold text-muted-foreground">Opening Time</span>
                            <input
                              type="time"
                              value={companyProfile.openingTime || '09:30'}
                              onChange={(event) => updateCompanyTimings(event.target.value, companyProfile.closingTime || '18:30')}
                              className="w-full rounded-xl bg-background px-3 py-2.5 text-sm font-mono outline-none focus:ring-2 focus:ring-brand/40"
                            />
                          </label>
                          <label className="space-y-1">
                            <span className="text-xs font-semibold text-muted-foreground">Closing Time</span>
                            <input
                              type="time"
                              value={companyProfile.closingTime || '18:30'}
                              onChange={(event) => updateCompanyTimings(companyProfile.openingTime || '09:30', event.target.value)}
                              className="w-full rounded-xl bg-background px-3 py-2.5 text-sm font-mono outline-none focus:ring-2 focus:ring-brand/40"
                            />
                          </label>
                          <div className="space-y-1">
                            <span className="text-xs font-semibold text-muted-foreground block">Working Days</span>
                            <SelectDropdown
                              value={companyProfile.workingDays || 'Monday - Saturday'}
                              onChange={(val) =>
                                setCompanyProfile((current) => ({ ...current, workingDays: val || 'Monday - Saturday' }))
                              }
                              options={[
                                { value: 'Monday - Saturday', label: 'Monday - Saturday' },
                                { value: 'Monday - Friday', label: 'Monday - Friday (5 Days)' },
                                { value: 'All 7 Days', label: 'All 7 Days' },
                                { value: 'Monday - Friday + Alt Saturday', label: 'Mon - Fri + Alt Sat' },
                              ]}
                              placeholder="Select Working Days..."
                              searchPlaceholder="Search schedule..."
                              allowCustom={false}
                              allowDeselect={false}
                              buttonClassName="w-full rounded-xl bg-background px-3 py-2.5 text-sm"
                            />
                          </div>
                          <label className="space-y-1">
                            <span className="text-xs font-semibold text-muted-foreground">Late Grace (Mins)</span>
                            <input
                              type="number"
                              min="0"
                              max="120"
                              value={companyProfile.lateGraceMinutes ?? 15}
                              onChange={(event) => setCompanyProfile((current) => ({ ...current, lateGraceMinutes: Number(event.target.value) }))}
                              className="w-full rounded-xl bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand/40"
                            />
                          </label>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 pt-0.5">
                          <span className="text-[11px] font-medium text-muted-foreground">Quick Presets:</span>
                          {[
                            ['09:00', '18:00', '9:00 AM - 6:00 PM'],
                            ['09:30', '18:30', '9:30 AM - 6:30 PM'],
                            ['10:00', '19:00', '10:00 AM - 7:00 PM'],
                            ['00:00', '23:59', '24 Hours'],
                          ].map(([start, end, label]) => (
                            <button
                              key={label}
                              type="button"
                              onClick={() => updateCompanyTimings(start, end)}
                              className="px-2.5 py-1 rounded-lg bg-background border border-border text-[11px] font-semibold hover:bg-secondary cursor-pointer"
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Attendance GPS Coordinates & Geofencing */}
                      <div className="md:col-span-2 p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                            <Navigation size={14} />
                            Attendance GPS Coordinates &amp; Geofencing
                          </span>
                          <button
                            type="button"
                            onClick={handleCaptureCompanyGPS}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 text-xs font-bold hover:bg-emerald-100/70 cursor-pointer transition-colors"
                          >
                            <Compass size={13} />
                            <span>Capture My GPS</span>
                          </button>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-3">
                          <label className="space-y-1">
                            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                              <MapPin size={12} />
                              Attendance Latitude
                            </span>
                            <input
                              type="number"
                              step="any"
                              value={companyProfile.latitude ?? ''}
                              onChange={(event) => setCompanyProfile((current) => ({ ...current, latitude: event.target.value }))}
                              placeholder="e.g. 12.7409"
                              className="w-full rounded-xl bg-background px-3 py-2.5 text-sm font-mono outline-none focus:ring-2 focus:ring-brand/40"
                            />
                          </label>
                          <label className="space-y-1">
                            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                              <MapPin size={12} />
                              Attendance Longitude
                            </span>
                            <input
                              type="number"
                              step="any"
                              value={companyProfile.longitude ?? ''}
                              onChange={(event) => setCompanyProfile((current) => ({ ...current, longitude: event.target.value }))}
                              placeholder="e.g. 77.8253"
                              className="w-full rounded-xl bg-background px-3 py-2.5 text-sm font-mono outline-none focus:ring-2 focus:ring-brand/40"
                            />
                          </label>
                          <label className="space-y-1">
                            <span className="text-xs font-semibold text-muted-foreground">Geofence Radius (km)</span>
                            <input
                              type="number"
                              step="0.1"
                              min="0.1"
                              max="20"
                              value={companyProfile.radiusKm ?? 0.5}
                              onChange={(event) => setCompanyProfile((current) => ({ ...current, radiusKm: Number(event.target.value) }))}
                              placeholder="0.5"
                              className="w-full rounded-xl bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand/40"
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="button"
                        onClick={handleSaveCompanyDetails}
                        disabled={updateCompany.isPending}
                        className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60 cursor-pointer"
                      >
                        {updateCompany.isPending
                          ? 'Saving...'
                          : organization?.companySetupRequired
                          ? 'Save Company Details & Launch Workspace'
                          : 'Save Company Details & GST Settings'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}

            {activeSection === 'billing' && (() => {
              const activeOrg = billingInfo?.organization || organization || {};
              const usage = billingInfo?.usage || {};
              const plansList = billingInfo?.plans || [];
              const currentPlanObj = plansList.find((p) => p.id === activeOrg.plan);
              const storageUsedMb = Number(usage.storageUsedMb ?? 0);
              const storageLimitMb = Number(usage.storageLimitMb ?? activeOrg.storageLimitMb ?? currentPlanObj?.storageLimitMb ?? 100);
              const storagePercent = Math.min(100, Math.round((storageUsedMb / Math.max(1, storageLimitMb)) * 100));
              const clientCount = Number(usage.clientCount ?? 0);
              const maxClients = Number(usage.maxClients ?? activeOrg.maxClients ?? currentPlanObj?.maxClients ?? 3);
              const clientPercent = Math.min(100, Math.round((clientCount / Math.max(1, maxClients)) * 100));
              const userCount = Number(usage.userCount ?? 0);
              const maxUsers = Number(usage.maxUsers ?? activeOrg.maxUsers ?? currentPlanObj?.maxUsers ?? 2);
              const userPercent = Math.min(100, Math.round((userCount / Math.max(1, maxUsers)) * 100));
              const planTitle =
                currentPlanObj?.name ||
                (activeOrg.plan === 'pro' ? 'Enterprise Pro' : activeOrg.plan || 'Free');

              return (
                <div className="space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold">Subscription Plan &amp; Storage Usage</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        View your active storage tier, live client capacity, and upgrade mid-cycle anytime.
                      </p>
                    </div>
                    <Link
                      to="/select-plan"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#12B7D4] hover:bg-[#0ea5c6] text-white text-xs font-extrabold shadow-xs transition-colors"
                    >
                      <Sparkles size={14} />
                      <span>Upgrade Plan</span>
                    </Link>
                  </div>

                  {/* Active Plan Card */}
                  <div className="p-5 rounded-2xl border border-cyan-200 dark:border-cyan-900/60 bg-gradient-to-br from-cyan-50/70 via-background to-background flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-extrabold uppercase">
                          {activeOrg.planStatus || 'active'}
                        </span>
                        <span className="text-xs font-semibold text-muted-foreground capitalize">
                          {activeOrg.billingCycle || 'monthly'} billing
                        </span>
                      </div>
                      <h4 className="text-2xl font-black capitalize">{planTitle} Plan</h4>
                      <p className="text-xs text-muted-foreground">
                        {currentPlanObj?.tagline || `${formatStorageQuota(storageLimitMb)} storage • Up to ${maxClients} active clients`}
                      </p>
                    </div>
                    <div className="text-left sm:text-right space-y-1">
                      <p className="text-2xl font-black tabular-nums">
                        {currentPlanObj
                          ? `₹${Number(
                              activeOrg.billingCycle === 'annual'
                                ? currentPlanObj.annualPriceInr
                                : currentPlanObj.monthlyPriceInr
                            ).toLocaleString('en-IN')}`
                          : activeOrg.plan === 'free'
                          ? '₹0'
                          : 'Active'}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {activeOrg.billingCycle === 'annual' ? 'per year' : 'per month'}
                        {activeOrg.lastPaymentId ? ` • Ref ${activeOrg.lastPaymentId}` : ''}
                      </p>
                    </div>
                  </div>

                  {/* Quotas Grid */}
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="p-4 rounded-2xl border border-border bg-background space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="flex items-center gap-1.5 text-muted-foreground uppercase tracking-wider text-[11px]">
                          <HardDrive size={14} className="text-[#12B7D4]" />
                          Cloud Storage
                        </span>
                        <span>{storagePercent}%</span>
                      </div>
                      <p className="text-base font-black">
                        {storageUsedMb} MB <span className="text-xs font-semibold text-muted-foreground">/ {formatStorageQuota(storageLimitMb)}</span>
                      </p>
                      <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                        <div className="h-full rounded-full bg-[#12B7D4]" style={{ width: `${Math.max(4, storagePercent)}%` }} />
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl border border-border bg-background space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-muted-foreground uppercase tracking-wider text-[11px]">
                          Active Clients
                        </span>
                        <span>{clientPercent}%</span>
                      </div>
                      <p className="text-base font-black">
                        {clientCount} <span className="text-xs font-semibold text-muted-foreground">/ {maxClients} allowed</span>
                      </p>
                      <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.max(4, clientPercent)}%` }} />
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl border border-border bg-background space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-muted-foreground uppercase tracking-wider text-[11px]">
                          Team Members
                        </span>
                        <span>{userPercent}%</span>
                      </div>
                      <p className="text-base font-black">
                        {userCount} <span className="text-xs font-semibold text-muted-foreground">/ {maxUsers} seats</span>
                      </p>
                      <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                        <div className="h-full rounded-full bg-indigo-500" style={{ width: `${Math.max(4, userPercent)}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {activeSection === 'branches' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold">Company Branches & Regional Offices</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Manage your company's headquarters, regional branch offices, managers in-charge, and attendance geofencing.
                  </p>
                </div>
                <BranchManager autoOpenAdd={searchParams.get('create') === 'true'} />
              </div>
            )}

            {activeSection === 'appearance' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-bold">Theme Preferences</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => !darkMode && dispatch(toggleDarkMode())}
                    className={`p-6 rounded-2xl transition-all flex flex-col items-center gap-4 cursor-pointer ${
                      darkMode ? 'bg-secondary ring-2 ring-primary' : 'bg-background hover:bg-secondary/60'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-neutral-900 text-white flex items-center justify-center">
                      <Palette size={24} />
                    </div>
                    <span className="font-bold">Dark Mode</span>
                  </button>
                  <button
                    onClick={() => darkMode && dispatch(toggleDarkMode())}
                    className={`p-6 rounded-2xl transition-all flex flex-col items-center gap-4 cursor-pointer ${
                      !darkMode ? 'bg-secondary ring-2 ring-primary' : 'bg-background hover:bg-secondary/60'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-white text-neutral-900 flex items-center justify-center shadow-xs">
                      <Palette size={24} />
                    </div>
                    <span className="font-bold">Light Mode</span>
                  </button>
                </div>

                <div className="pt-4">
                  <h3 className="text-lg font-bold mb-4">Regional Settings</h3>
                  <div className="grid gap-4 md:grid-cols-3">
                    {[
                      ['language', 'Language', ['en-US', 'en-GB', 'es-ES', 'fr-FR']],
                      ['timezone', 'Timezone', ['Asia/Calcutta', 'UTC', 'America/New_York', 'Europe/London']],
                      ['currency', 'Currency', ['INR']],
                    ].map(([key, label, options]) => (
                      <div key={key} className="space-y-2">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">{label}</span>
                        <SelectDropdown
                          value={preferences.regional?.[key] || options[0]}
                          onChange={(val) => setRegional(key, val || options[0])}
                          options={options.map((option) => ({ value: option, label: option }))}
                          allowCustom={false}
                          allowDeselect={false}
                          className="w-full text-sm"
                          buttonClassName="h-11 px-3.5 rounded-xl bg-background border border-border/50 text-sm font-medium"
                        />
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => savePreferences()}
                    disabled={updatePreferences.isPending}
                    className="mt-6 inline-flex items-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60 cursor-pointer"
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
                </div>

                <div className="rounded-2xl bg-background p-5 space-y-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold">Password management</p>
                    </div>
                    <div className="rounded-xl bg-secondary p-3 text-foreground">
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
                        <span className="ml-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
                        <div className="relative">
                          <input
                            type={showPasswordFields[name] ? 'text' : 'password'}
                            name={name}
                            value={passwordData[name]}
                            onChange={handlePasswordFieldChange}
                            className="w-full rounded-xl bg-card px-4 py-3 pr-11 text-sm outline-none transition-colors focus:ring-2 focus:ring-brand/40"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswordFields((prev) => ({ ...prev, [name]: !prev[name] }))}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground cursor-pointer"
                            aria-label={showPasswordFields[name] ? 'Hide password' : 'Show password'}
                          >
                            {showPasswordFields[name] ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </label>
                    ))}
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleChangePassword}
                      disabled={changePassword.isPending}
                      className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60 cursor-pointer"
                    >
                      {changePassword.isPending ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'permissions' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold">Role &amp; Permissions</h3>
                <div className="rounded-2xl bg-background p-5">
                  <p className="text-sm font-semibold capitalize">{profileUser?.role}</p>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {Object.entries(permissions).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between rounded-xl bg-background p-4">
                      <span className="text-sm font-medium">{key.replace(/([A-Z])/g, ' $1')}</span>
                      <span className={`text-xs font-bold ${value ? 'text-foreground' : 'text-muted-foreground'}`}>{value ? 'Enabled' : 'Disabled'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ProfileImageCropModal
        open={isCropModalOpen}
        onOpenChange={setIsCropModalOpen}
        imageSrc={cropImageSrc}
        imageFile={cropImageFile}
        onCropComplete={handleCropComplete}
        isSaving={uploadProfileAvatar.isPending || updateProfile.isPending}
        profileUser={profileUser}
        onSelectNewImage={() => {
          document.getElementById('profile-avatar-upload')?.click();
        }}
      />
    </div>
  );
};

export default Settings;
