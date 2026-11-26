import { useEffect, useState } from 'react';
import {
  Briefcase,
  Check,
  Copy,
  Eye,
  EyeOff,
  KeyRound,
  X,
} from '@/components/ui/muiIcons';
import { toast } from 'sonner';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { SelectDropdown } from '../ui/SelectDropdown';
import { useCreateVendor, useUpdateVendor } from '../../hooks/useHR';

export const VENDOR_POSITIONS = [
  'Video Editor',
  'Videographer',
  'Photographer',
  'Graphic Designer',
  'Motion Designer',
  'Script Writer',
  'Voiceover Artist',
  'Social Media Manager',
  'Content Creator',
  'Web Developer',
  'UI/UX Designer',
  'Paid Ads Specialist',
  'Influencer / Talent',
  'Printer / Production',
  'Drone Operator',
];

const generateInitialPassword = () => {
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return `Vendor@${randomDigits}`;
};

export const AddVendorModal = ({ open, onOpenChange, vendor = null }) => {
  const createVendor = useCreateVendor();
  const updateVendor = useUpdateVendor();
  const isEditing = Boolean(vendor?._id);

  const [name, setName] = useState('');
  const [vendorCompany, setVendorCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [position, setPosition] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [vendorRateNotes, setVendorRateNotes] = useState('');
  const [notes, setNotes] = useState('');
  const [createdCredentials, setCreatedCredentials] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    setCreatedCredentials(null);
    setCopied(false);
    setShowPassword(false);

    if (vendor?._id) {
      setName(vendor.name || '');
      setVendorCompany(vendor.vendorCompany || '');
      setEmail(vendor.email || '');
      setPhone(vendor.phone || '');
      setPosition(vendor.position || '');
      setPassword('');
      setIsActive(vendor.isActive !== false);
      setVendorRateNotes(vendor.vendorRateNotes || '');
      setNotes(vendor.notes || '');
    } else {
      setName('');
      setVendorCompany('');
      setEmail('');
      setPhone('');
      setPosition('');
      setPassword(generateInitialPassword());
      setIsActive(true);
      setVendorRateNotes('');
      setNotes('');
    }
  }, [open, vendor]);

  const isSaving = createVendor.isPending || updateVendor.isPending;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !position.trim()) {
      toast.error('Please enter vendor name, email, and position');
      return;
    }

    if (!isEditing && String(password || '').trim().length < 6) {
      toast.error('Login password must be at least 6 characters');
      return;
    }

    if (isEditing && password.trim() && password.trim().length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    if (isEditing) {
      const payload = {
        name: name.trim(),
        vendorCompany: vendorCompany.trim(),
        email: email.trim(),
        phone: phone.trim(),
        position: position.trim(),
        isActive,
        vendorRateNotes: vendorRateNotes.trim(),
        notes: notes.trim(),
      };
      if (password.trim()) {
        payload.password = password.trim();
      }
      await updateVendor.mutateAsync({ id: vendor._id, data: payload });
      onOpenChange(false);
    } else {
      const res = await createVendor.mutateAsync({
        name: name.trim(),
        vendorCompany: vendorCompany.trim(),
        email: email.trim(),
        phone: phone.trim(),
        position: position.trim(),
        password: password.trim(),
        isActive,
        vendorRateNotes: vendorRateNotes.trim(),
        notes: notes.trim(),
      });
      if (res?.loginCredentials) {
        setCreatedCredentials(res.loginCredentials);
      } else {
        onOpenChange(false);
      }
    }
  };

  const handleCopyCredentials = async () => {
    if (!createdCredentials) return;
    const text = `Vendor Portal Login\nEmail: ${createdCredentials.email}\nPassword: ${createdCredentials.password}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Vendor login credentials copied');
      setTimeout(() => setCopied(false), 2000);
    } catch (_) {}
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        variant="side"
        noPadding
        hideCloseButton
        className="flex flex-col min-h-0 p-0 overflow-hidden bg-background"
      >
        <DialogHeader className="px-6 py-4 bg-background border-b border-border shrink-0 flex flex-row items-center justify-between gap-3 m-0 space-y-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/12 text-amber-600 dark:text-amber-400 shrink-0">
              <Briefcase size={20} />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-base sm:text-lg font-bold text-foreground truncate">
                {isEditing ? 'Edit Vendor Account' : 'Create Vendor Account'}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5 truncate">
                Separate external vendor directory with portal login & assigned position
              </DialogDescription>
            </div>
          </div>

          <DialogClose className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary/70 text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer">
            <X size={17} />
          </DialogClose>
        </DialogHeader>

        {createdCredentials ? (
          <div className="flex-1 p-6 flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/8 p-5 space-y-3">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold text-sm">
                  <KeyRound size={16} />
                  Vendor Portal Credentials Ready
                </div>
                <p className="text-xs text-muted-foreground">
                  Share these credentials with the vendor. When they sign in, they will see only tasks assigned to them and their own payment/bill status.
                </p>
                <div className="rounded-xl bg-background border border-border p-3.5 space-y-2 text-xs">
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground">Login Email:</span>
                    <span className="font-mono font-semibold text-foreground">{createdCredentials.email}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground">Password:</span>
                    <span className="font-mono font-semibold text-foreground">{createdCredentials.password}</span>
                  </div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleCopyCredentials}
                  className="w-full"
                >
                  {copied ? <Check size={14} className="mr-1.5" /> : <Copy size={14} className="mr-1.5" />}
                  {copied ? 'Copied!' : 'Copy Login Details'}
                </Button>
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="button" onClick={() => onOpenChange(false)}>
                Done
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 min-h-0 flex flex-col">
            <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5 space-y-4 custom-scrollbar">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Vendor Name *
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Arjun Kumar"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Company / Studio Name (Optional)
                </label>
                <Input
                  value={vendorCompany}
                  onChange={(e) => setVendorCompany(e.target.value)}
                  placeholder="e.g., PixelCraft Studio"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Vendor Position / Specialization *
                </label>
                <SelectDropdown
                  value={position}
                  onChange={(val) => setPosition(val || '')}
                  options={VENDOR_POSITIONS}
                  allowCustom={true}
                  placeholder="Choose or type vendor position..."
                  searchPlaceholder="Search position (e.g., Video Editor)..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    Login Email *
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vendor@studio.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    Phone Number
                  </label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-foreground">
                    {isEditing ? 'Reset Login Password (leave blank to keep current)' : 'Portal Login Password *'}
                  </label>
                  <button
                    type="button"
                    onClick={() => setPassword(generateInitialPassword())}
                    className="text-[11px] font-semibold text-primary hover:underline"
                  >
                    Generate Password
                  </button>
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isEditing ? 'Enter new password to reset...' : 'Min 6 characters'}
                    className="pr-10 font-mono"
                    required={!isEditing}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-border bg-secondary/20 px-4 py-3">
                <div>
                  <p className="text-xs font-semibold text-foreground">Enable Vendor Portal Login</p>
                  <p className="text-[11px] text-muted-foreground">
                    Vendor can log in to view only their assigned tasks and own payouts
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4 accent-primary cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Agreed Rate / Payment Terms (Optional)
                </label>
                <Input
                  value={vendorRateNotes}
                  onChange={(e) => setVendorRateNotes(e.target.value)}
                  placeholder="e.g., ₹1,500 per reel / Monthly retainer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Notes
                </label>
                <Textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Portfolio link, turnaround time, bank/UPI note..."
                />
              </div>
            </div>

            <div className="px-6 py-3.5 border-t border-border bg-card/60 shrink-0 flex items-center justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isSaving}>
                {isSaving ? 'Saving...' : isEditing ? 'Update Vendor' : 'Create Vendor & Login'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
