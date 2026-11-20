import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  MapPin,
  Plus,
  Edit2,
  Trash2,
  Phone,
  Mail,
  Navigation,
  Star,
  CheckCircle2,
  XCircle,
  Search,
  Clock,
  User,
  Users2,
  X,
  Compass,
  AlertTriangle,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

// Helper: Convert 24-hour time ('09:30') to 12-hour format ('9:30 AM')
const formatTo12Hour = (time24) => {
  if (!time24) return '';
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  const m = mStr || '00';
  if (isNaN(h)) return '';
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
};

// Helper: Parse 12-hour or arbitrary time string ('9:30 AM', '18:30') to 24-hour ('09:30')
const parseTo24Hour = (timeStr) => {
  if (!timeStr) return '';
  const match = timeStr.trim().match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (!match) return '';
  let h = parseInt(match[1], 10);
  const m = match[2];
  const ampm = match[3]?.toUpperCase();
  if (ampm === 'PM' && h < 12) h += 12;
  if (ampm === 'AM' && h === 12) h = 0;
  return `${String(h).padStart(2, '0')}:${m}`;
};

// Helper: Parse operating hours range string into start and end 24h times
const parseOperatingHoursRange = (rangeStr) => {
  if (!rangeStr) return { start: '09:30', end: '18:30' };
  if (/24\s*hours|24\/7/i.test(rangeStr)) {
    return { start: '00:00', end: '23:59' };
  }
  const parts = rangeStr.split(/[-–—to]/i);
  if (parts.length >= 2) {
    const start = parseTo24Hour(parts[0]) || '09:30';
    const end = parseTo24Hour(parts[1]) || '18:30';
    return { start, end };
  }
  return { start: '09:30', end: '18:30' };
};

export const BranchManager = ({ companyId, companyName, isSuperAdmin = false, autoOpenAdd = false }) => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Clock Selection State
  const [startTime, setStartTime] = useState('09:30');
  const [endTime, setEndTime] = useState('18:30');

  // Form State
  const initialForm = {
    name: '',
    code: '',
    isHeadquarters: false,
    managerName: '',
    managerEmail: '',
    managerPhone: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    postalCode: '',
    operatingHours: '9:30 AM - 6:30 PM',
    workingDays: 'Monday - Saturday',
    latitude: '',
    longitude: '',
    radiusKm: 0.5,
    isActive: true,
    notes: '',
  };
  const [formData, setFormData] = useState(initialForm);

  const token = () => localStorage.getItem('accessToken');
  const headers = () => ({ Authorization: `Bearer ${token()}` });

  const apiBase = useMemo(() => {
    if (companyId) {
      return `/api/platform/organizations/${companyId}/branches`;
    }
    return `/api/branches`;
  }, [companyId]);

  const fetchBranches = async () => {
    setLoading(true);
    try {
      const url = companyId
        ? `/api/platform/organizations/${companyId}/branches`
        : `/api/branches`;
      const res = await axios.get(url, { headers: headers() });
      if (res.data?.success) {
        setBranches(res.data.branches || []);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch company branches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, [companyId]);

  useEffect(() => {
    if (autoOpenAdd) {
      handleOpenAdd();
    }
  }, [autoOpenAdd]);

  // Sync clock time changes to formData.operatingHours
  const updateTimes = (newStart, newEnd) => {
    setStartTime(newStart);
    setEndTime(newEnd);
    if (newStart === '00:00' && (newEnd === '23:59' || newEnd === '00:00')) {
      setFormData((prev) => ({ ...prev, operatingHours: '24 Hours' }));
    } else {
      const formatted = `${formatTo12Hour(newStart)} - ${formatTo12Hour(newEnd)}`;
      setFormData((prev) => ({ ...prev, operatingHours: formatted }));
    }
  };

  const handleOpenAdd = () => {
    setEditingBranch(null);
    setFormData(initialForm);
    setStartTime('09:30');
    setEndTime('18:30');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (branch) => {
    setEditingBranch(branch);
    const parsedTimes = parseOperatingHoursRange(branch.operatingHours);
    setStartTime(parsedTimes.start);
    setEndTime(parsedTimes.end);

    setFormData({
      name: branch.name || '',
      code: branch.code || '',
      isHeadquarters: !!branch.isHeadquarters,
      managerName: branch.managerName || '',
      managerEmail: branch.managerEmail || '',
      managerPhone: branch.managerPhone || '',
      phone: branch.phone || '',
      email: branch.email || '',
      address: branch.address || '',
      city: branch.city || '',
      state: branch.state || '',
      country: branch.country || 'India',
      postalCode: branch.postalCode || '',
      operatingHours: branch.operatingHours || '9:30 AM - 6:30 PM',
      workingDays: branch.workingDays || 'Monday - Saturday',
      latitude: branch.latitude != null ? branch.latitude : '',
      longitude: branch.longitude != null ? branch.longitude : '',
      radiusKm: branch.radiusKm != null ? branch.radiusKm : 0.5,
      isActive: branch.isActive !== undefined ? branch.isActive : true,
      notes: branch.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleAutoGPS = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    toast.info('Acquiring current GPS coordinates...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData((prev) => ({
          ...prev,
          latitude: Number(pos.coords.latitude.toFixed(6)),
          longitude: Number(pos.coords.longitude.toFixed(6)),
        }));
        toast.success(`Coordinates captured: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
      },
      (err) => {
        toast.error(`GPS Error: ${err.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Branch name is required');
      return;
    }
    if (!formData.city.trim()) {
      toast.error('City is required');
      return;
    }

    setSubmitting(true);
    try {
      if (editingBranch) {
        const url = companyId
          ? `/api/platform/organizations/${companyId}/branches/${editingBranch._id}`
          : `/api/branches/${editingBranch._id}`;
        const res = await axios.put(url, formData, { headers: headers() });
        if (res.data?.success) {
          toast.success(`Branch "${formData.name}" updated successfully`);
          setIsModalOpen(false);
          fetchBranches();
        }
      } else {
        const payload = companyId ? { ...formData, organizationId: companyId } : formData;
        const res = await axios.post(apiBase, payload, { headers: headers() });
        if (res.data?.success) {
          toast.success(`Branch "${formData.name}" created successfully`);
          setIsModalOpen(false);
          fetchBranches();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save branch');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (branch) => {
    try {
      const url = companyId
        ? `/api/platform/organizations/${companyId}/branches/${branch._id}`
        : `/api/branches/${branch._id}`;
      const res = await axios.put(url, { isActive: !branch.isActive }, { headers: headers() });
      if (res.data?.success) {
        toast.success(`Branch marked ${!branch.isActive ? 'Active' : 'Inactive'}`);
        fetchBranches();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update branch status');
    }
  };

  const handleDelete = async (branchId) => {
    try {
      const url = companyId
        ? `/api/platform/organizations/${companyId}/branches/${branchId}`
        : `/api/branches/${branchId}`;
      const res = await axios.delete(url, { headers: headers() });
      if (res.data?.success) {
        toast.success('Branch deleted successfully');
        setDeleteConfirmId(null);
        fetchBranches();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete branch');
    }
  };

  const filteredBranches = useMemo(() => {
    return branches.filter((b) => {
      if (statusFilter === 'active' && !b.isActive) return false;
      if (statusFilter === 'inactive' && b.isActive) return false;
      if (search) {
        const term = search.toLowerCase();
        return (
          b.name?.toLowerCase().includes(term) ||
          b.city?.toLowerCase().includes(term) ||
          b.code?.toLowerCase().includes(term) ||
          b.managerName?.toLowerCase().includes(term) ||
          b.address?.toLowerCase().includes(term)
        );
      }
      return true;
    });
  }, [branches, search, statusFilter]);

  const stats = useMemo(() => {
    const total = branches.length;
    const active = branches.filter((b) => b.isActive).length;
    const hq = branches.find((b) => b.isHeadquarters);
    const totalEmployees = branches.reduce((sum, b) => sum + (b.employeeCount || 0), 0);
    return { total, active, hqName: hq?.name || 'None Set', totalEmployees };
  }, [branches]);

  return (
    <div className="space-y-6">
      {/* Top Stats Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 shadow-sm rounded-2xl p-4">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <div className="w-6 h-6 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Building2 size={14} />
            </div>
            <span>Total Branches</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{stats.total}</div>
        </div>

        <div className="bg-white border border-slate-200/80 shadow-sm rounded-2xl p-4">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <div className="w-6 h-6 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 size={14} />
            </div>
            <span>Active Branches</span>
          </div>
          <div className="text-2xl font-bold text-emerald-600 mt-2">{stats.active}</div>
        </div>

        <div className="bg-white border border-slate-200/80 shadow-sm rounded-2xl p-4">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <div className="w-6 h-6 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <Star size={14} />
            </div>
            <span>Headquarters</span>
          </div>
          <div className="text-sm font-bold text-amber-700 mt-2 truncate" title={stats.hqName}>
            {stats.hqName}
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 shadow-sm rounded-2xl p-4">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <div className="w-6 h-6 rounded-lg bg-cyan-50 flex items-center justify-center text-cyan-600">
              <Users2 size={14} />
            </div>
            <span>Assigned Staff</span>
          </div>
          <div className="text-2xl font-bold text-cyan-700 mt-2">{stats.totalEmployees}</div>
        </div>
      </div>

      {/* Control Bar: Search + Filter + Add Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search branches by name, city, code, manager..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/10 shadow-sm"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-indigo-600 shadow-sm"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>

          <button
            onClick={fetchBranches}
            className="p-2.5 rounded-xl bg-white border border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all shadow-sm"
            title="Refresh"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-all shadow-md shadow-indigo-600/20"
        >
          <Plus size={16} />
          <span>Add New Branch</span>
        </button>
      </div>

      {/* Branch Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-slate-100 animate-pulse border border-slate-200" />
          ))}
        </div>
      ) : filteredBranches.length === 0 ? (
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-12 text-center">
          <Building2 size={42} className="mx-auto text-slate-400 mb-3" />
          <h3 className="text-slate-900 font-semibold text-base">No Branches Found</h3>
          <p className="text-slate-500 text-sm mt-1 max-w-md mx-auto">
            {search || statusFilter !== 'all'
              ? 'No branch locations match your filters.'
              : companyName
              ? `No branch locations added for ${companyName} yet. Add the head office or regional branches.`
              : 'Add your company head office and branch offices to manage regional staff and operations.'}
          </p>
          <button
            onClick={handleOpenAdd}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-all shadow-sm"
          >
            <Plus size={14} />
            <span>Create First Branch</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBranches.map((branch) => (
            <motion.div
              key={branch._id}
              layout
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`relative bg-white border rounded-2xl p-5 flex flex-col justify-between transition-all hover:shadow-md ${
                branch.isHeadquarters
                  ? 'border-amber-300 bg-amber-50/20 shadow-amber-500/5'
                  : 'border-slate-200/90 shadow-sm hover:border-indigo-300'
              }`}
            >
              <div>
                {/* Header: Title + Badges */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-slate-900 font-bold text-base">{branch.name}</h4>
                      {branch.code && (
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-mono font-semibold border border-slate-200">
                          {branch.code}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {branch.isHeadquarters && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          <Star size={11} className="fill-amber-500 text-amber-500" />
                          Headquarters
                        </span>
                      )}
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                          branch.isActive
                            ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                            : 'text-slate-600 bg-slate-100 border border-slate-200'
                        }`}
                      >
                        {branch.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  {/* Actions dropdown/buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(branch)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-all"
                      title="Edit Branch"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(branch._id)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-600 transition-all"
                      title="Delete Branch"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Address & City */}
                <div className="mt-4 space-y-1.5">
                  <div className="flex items-start gap-2 text-xs text-slate-600">
                    <MapPin size={14} className="text-slate-400 mt-0.5 shrink-0" />
                    <span>
                      {branch.address ? `${branch.address}, ` : ''}
                      <strong>{branch.city}</strong>
                      {branch.state ? `, ${branch.state}` : ''}
                      {branch.postalCode ? ` - ${branch.postalCode}` : ''}
                      {branch.country ? `, ${branch.country}` : ''}
                    </span>
                  </div>

                  {/* Manager in-charge */}
                  {branch.managerName && (
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <User size={14} className="text-indigo-500 shrink-0" />
                      <span>
                        Manager: <strong>{branch.managerName}</strong>
                        {branch.managerPhone ? ` (${branch.managerPhone})` : ''}
                      </span>
                    </div>
                  )}

                  {/* Contact Info */}
                  <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-500">
                    {branch.phone && (
                      <span className="flex items-center gap-1">
                        <Phone size={12} className="text-slate-400" />
                        {branch.phone}
                      </span>
                    )}
                    {branch.email && (
                      <span className="flex items-center gap-1">
                        <Mail size={12} className="text-slate-400" />
                        {branch.email}
                      </span>
                    )}
                  </div>

                  {/* Operating Hours */}
                  {branch.operatingHours && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 pt-1">
                      <Clock size={13} className="text-slate-400" />
                      <span>{branch.operatingHours}</span>
                      {branch.workingDays && (
                        <span className="text-slate-400">({branch.workingDays})</span>
                      )}
                    </div>
                  )}

                  {/* Geofence info */}
                  {branch.latitude && branch.longitude && (
                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-mono pt-1">
                      <Navigation size={12} className="text-emerald-600 shrink-0" />
                      <span>
                        GPS: {Number(branch.latitude).toFixed(4)}, {Number(branch.longitude).toFixed(4)} (Radius: {branch.radiusKm || 0.5} km)
                      </span>
                    </div>
                  )}

                  {/* Notes */}
                  {branch.notes && (
                    <p className="text-xs text-slate-500 italic pt-1 line-clamp-2">"{branch.notes}"</p>
                  )}
                </div>
              </div>

              {/* Card Footer: Employee count + status toggle */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                  <Users2 size={14} className="text-slate-400" />
                  <span>{branch.employeeCount || 0} Staff assigned</span>
                </div>

                <button
                  onClick={() => handleToggleStatus(branch)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                    branch.isActive
                      ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  {branch.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </div>

              {/* Delete Confirmation Overlay */}
              {deleteConfirmId === branch._id && (
                <div className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-2xl p-5 flex flex-col justify-center items-center text-center z-10 space-y-3 border border-rose-200 shadow-lg">
                  <AlertTriangle size={28} className="text-rose-600" />
                  <div>
                    <h5 className="text-slate-900 font-bold text-sm">Delete Branch?</h5>
                    <p className="text-slate-500 text-xs mt-1">
                      Employees assigned to "{branch.name}" will be unassigned.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setDeleteConfirmId(null)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium hover:bg-slate-200 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleDelete(branch._id)}
                      className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-md shadow-rose-600/20"
                    >
                      Confirm Delete
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* ── CREATE / EDIT BRANCH MODAL (Normal / Light Colors) ── */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl text-slate-900 space-y-6 max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
                    <Building2 size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {editingBranch ? `Edit Branch: ${editingBranch.name}` : 'Add New Branch Location'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {companyName ? `Assigning to ${companyName}` : 'Configure company branch, manager, and location'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Basic Branch Info */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Branch Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Hosur Corporate Office, Bangalore Tech Hub"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/10 shadow-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Branch Code</label>
                    <input
                      type="text"
                      placeholder="e.g. HSR-HQ, BLR-01"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 font-mono placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/10 uppercase shadow-sm"
                    />
                  </div>
                </div>

                {/* Headquarters Checkbox */}
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-amber-50 border border-amber-200">
                  <input
                    type="checkbox"
                    id="isHeadquarters"
                    checked={formData.isHeadquarters}
                    onChange={(e) => setFormData({ ...formData, isHeadquarters: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-0 border-slate-300"
                  />
                  <label htmlFor="isHeadquarters" className="text-xs text-amber-900 cursor-pointer select-none">
                    <strong className="text-amber-950">Set as Company Headquarters (HQ)</strong> — marks this as the primary registered office for the company.
                  </label>
                </div>

                {/* Manager In-Charge Info */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <div className="text-xs font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
                    <User size={13} />
                    <span>Branch Manager In-Charge</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs text-slate-600 font-medium">Manager Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Rajesh Kumar"
                        value={formData.managerName}
                        onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 shadow-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-600 font-medium">Manager Phone</label>
                      <input
                        type="text"
                        placeholder="+91 98765 43210"
                        value={formData.managerPhone}
                        onChange={(e) => setFormData({ ...formData, managerPhone: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 shadow-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-600 font-medium">Manager Email</label>
                      <input
                        type="email"
                        placeholder="manager@company.com"
                        value={formData.managerEmail}
                        onChange={(e) => setFormData({ ...formData, managerEmail: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 shadow-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Address Details */}
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Street Address</label>
                    <input
                      type="text"
                      placeholder="Suite #, Building, Tech Park, Street address..."
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 shadow-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">
                        City <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Hosur"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 shadow-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">State</label>
                      <input
                        type="text"
                        placeholder="e.g. Tamil Nadu"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 shadow-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Country</label>
                      <input
                        type="text"
                        placeholder="India"
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 shadow-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Postal / PIN Code</label>
                      <input
                        type="text"
                        placeholder="e.g. 635109"
                        value={formData.postalCode}
                        onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 shadow-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Numbers */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Branch Phone</label>
                    <input
                      type="text"
                      placeholder="e.g. 04344-123456"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 shadow-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Branch Email</label>
                    <input
                      type="email"
                      placeholder="branch@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 shadow-sm"
                    />
                  </div>
                </div>

                {/* ── Operating Hours via Clock Selection (No manual typing needed) ── */}
                <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock size={14} className="text-indigo-600" />
                      <span>Operating Hours (Select From Clock)</span>
                    </div>
                    {/* Active Formatted Badge */}
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold border border-indigo-200">
                      {formData.operatingHours || '9:30 AM - 6:30 PM'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs text-slate-600 font-medium flex items-center gap-1">
                        <span>Opening Time (Clock)</span>
                      </label>
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => updateTimes(e.target.value, endTime)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 font-mono focus:outline-none focus:border-indigo-600 shadow-sm cursor-pointer"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-600 font-medium flex items-center gap-1">
                        <span>Closing Time (Clock)</span>
                      </label>
                      <input
                        type="time"
                        value={endTime}
                        onChange={(e) => updateTimes(startTime, e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 font-mono focus:outline-none focus:border-indigo-600 shadow-sm cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Quick Preset Buttons */}
                  <div className="flex items-center gap-2 flex-wrap pt-1">
                    <span className="text-[11px] text-slate-500 font-medium">Quick Presets:</span>
                    <button
                      type="button"
                      onClick={() => updateTimes('09:00', '18:00')}
                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-indigo-50 border border-slate-200 text-slate-700 text-[11px] font-medium transition-all shadow-2xs"
                    >
                      9:00 AM - 6:00 PM
                    </button>
                    <button
                      type="button"
                      onClick={() => updateTimes('09:30', '18:30')}
                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-indigo-50 border border-slate-200 text-slate-700 text-[11px] font-medium transition-all shadow-2xs"
                    >
                      9:30 AM - 6:30 PM
                    </button>
                    <button
                      type="button"
                      onClick={() => updateTimes('10:00', '19:00')}
                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-indigo-50 border border-slate-200 text-slate-700 text-[11px] font-medium transition-all shadow-2xs"
                    >
                      10:00 AM - 7:00 PM
                    </button>
                    <button
                      type="button"
                      onClick={() => updateTimes('00:00', '23:59')}
                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-indigo-50 border border-slate-200 text-slate-700 text-[11px] font-medium transition-all shadow-2xs"
                    >
                      24 Hours
                    </button>
                  </div>
                </div>

                {/* Working Days */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Working Days</label>
                  <select
                    value={formData.workingDays}
                    onChange={(e) => setFormData({ ...formData, workingDays: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-600 shadow-sm"
                  >
                    <option value="Monday - Saturday">Monday - Saturday (Standard)</option>
                    <option value="Monday - Friday">Monday - Friday (5 Days)</option>
                    <option value="All 7 Days">All 7 Days (Continuous)</option>
                    <option value="Monday - Friday + Alt Saturday">Monday - Friday + Alt Saturday</option>
                  </select>
                </div>

                {/* GPS Coordinates & Geofencing (Attendance) */}
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Navigation size={13} className="text-emerald-600" />
                      <span>GPS Geofencing for Attendance Check-in (Optional)</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleAutoGPS}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-emerald-100/70 text-emerald-700 text-xs font-semibold transition-all border border-emerald-300 shadow-xs"
                    >
                      <Compass size={12} />
                      <span>Capture My GPS</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs text-slate-600 font-medium">Latitude</label>
                      <input
                        type="number"
                        step="any"
                        placeholder="e.g. 12.7409"
                        value={formData.latitude}
                        onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 font-mono shadow-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-600 font-medium">Longitude</label>
                      <input
                        type="number"
                        step="any"
                        placeholder="e.g. 77.8253"
                        value={formData.longitude}
                        onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 font-mono shadow-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-600 font-medium">Radius (Kilometers)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        max="20"
                        placeholder="0.5"
                        value={formData.radiusKm}
                        onChange={(e) => setFormData({ ...formData, radiusKm: Number(e.target.value) })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 shadow-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Internal Notes</label>
                  <textarea
                    rows={2}
                    placeholder="Specific branch notes, floor details, key contacts..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 resize-none shadow-sm"
                  />
                </div>

                {/* Submit Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-all disabled:opacity-50 shadow-md shadow-indigo-600/20"
                  >
                    <Building2 size={16} />
                    <span>{submitting ? 'Saving...' : editingBranch ? 'Update Branch' : 'Create Branch'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BranchManager;
