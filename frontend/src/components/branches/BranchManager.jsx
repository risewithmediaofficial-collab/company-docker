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

export const BranchManager = ({ companyId, companyName, isSuperAdmin = false }) => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

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

  const handleOpenAdd = () => {
    setEditingBranch(null);
    setFormData(initialForm);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (branch) => {
    setEditingBranch(branch);
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
        <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase">
            <Building2 size={14} className="text-indigo-400" />
            <span>Total Branches</span>
          </div>
          <div className="text-2xl font-bold text-white mt-1">{stats.total}</div>
        </div>

        <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase">
            <CheckCircle2 size={14} className="text-emerald-400" />
            <span>Active Branches</span>
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{stats.active}</div>
        </div>

        <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase">
            <Star size={14} className="text-amber-400" />
            <span>Headquarters</span>
          </div>
          <div className="text-sm font-bold text-amber-300 mt-1 truncate" title={stats.hqName}>
            {stats.hqName}
          </div>
        </div>

        <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase">
            <Users2 size={14} className="text-cyan-400" />
            <span>Assigned Staff</span>
          </div>
          <div className="text-2xl font-bold text-cyan-400 mt-1">{stats.totalEmployees}</div>
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
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all" className="bg-slate-900 text-white">All Status</option>
            <option value="active" className="bg-slate-900 text-white">Active Only</option>
            <option value="inactive" className="bg-slate-900 text-white">Inactive Only</option>
          </select>

          <button
            onClick={fetchBranches}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
            title="Refresh"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm transition-all shadow-md shadow-indigo-600/20"
        >
          <Plus size={16} />
          <span>Add New Branch</span>
        </button>
      </div>

      {/* Branch Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : filteredBranches.length === 0 ? (
        <div className="bg-white/5 border border-white/5 rounded-2xl p-12 text-center">
          <Building2 size={42} className="mx-auto text-slate-600 mb-3" />
          <h3 className="text-white font-semibold text-base">No Branches Found</h3>
          <p className="text-slate-400 text-sm mt-1 max-w-md mx-auto">
            {search || statusFilter !== 'all'
              ? 'No branch locations match your filters.'
              : companyName
              ? `No branch locations added for ${companyName} yet. Add the head office or regional branches.`
              : 'Add your company head office and branch offices to manage regional staff and operations.'}
          </p>
          <button
            onClick={handleOpenAdd}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all"
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
              className={`relative bg-white/5 border rounded-2xl p-5 flex flex-col justify-between transition-all hover:border-indigo-500/40 ${
                branch.isHeadquarters ? 'border-amber-500/30 bg-amber-500/[0.02]' : 'border-white/5'
              }`}
            >
              <div>
                {/* Header: Title + Badges */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-white font-bold text-base">{branch.name}</h4>
                      {branch.code && (
                        <span className="px-2 py-0.5 rounded-md bg-white/10 text-slate-300 text-xs font-mono font-semibold">
                          {branch.code}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {branch.isHeadquarters && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                          <Star size={11} className="fill-amber-400 text-amber-400" />
                          Headquarters
                        </span>
                      )}
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                          branch.isActive
                            ? 'text-emerald-400 bg-emerald-400/10 border border-emerald-500/20'
                            : 'text-slate-400 bg-slate-500/10 border border-slate-500/20'
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
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all"
                      title="Edit Branch"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(branch._id)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-all"
                      title="Delete Branch"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Details Section */}
                <div className="mt-4 space-y-2.5 text-xs text-slate-300">
                  {/* Address */}
                  <div className="flex items-start gap-2">
                    <MapPin size={14} className="text-indigo-400 shrink-0 mt-0.5" />
                    <span className="text-slate-300 leading-relaxed">
                      {branch.address ? `${branch.address}, ` : ''}
                      <span className="font-semibold text-white">{branch.city}</span>
                      {branch.state ? `, ${branch.state}` : ''}
                      {branch.postalCode ? ` - ${branch.postalCode}` : ''}
                      {branch.country ? ` (${branch.country})` : ''}
                    </span>
                  </div>

                  {/* Manager in-charge */}
                  {branch.managerName && (
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-violet-400 shrink-0" />
                      <span>
                        Manager:{' '}
                        <span className="text-white font-medium">{branch.managerName}</span>
                        {branch.managerPhone ? ` • ${branch.managerPhone}` : ''}
                      </span>
                    </div>
                  )}

                  {/* Contact info */}
                  {(branch.phone || branch.email) && (
                    <div className="flex items-center gap-3 text-slate-400">
                      {branch.phone && (
                        <span className="flex items-center gap-1">
                          <Phone size={12} className="text-cyan-400" />
                          <span>{branch.phone}</span>
                        </span>
                      )}
                      {branch.email && (
                        <span className="flex items-center gap-1 truncate">
                          <Mail size={12} className="text-cyan-400" />
                          <span className="truncate">{branch.email}</span>
                        </span>
                      )}
                    </div>
                  )}

                  {/* Operating Hours */}
                  {branch.operatingHours && (
                    <div className="flex items-center gap-2 text-slate-400">
                      <Clock size={12} className="text-amber-400 shrink-0" />
                      <span>
                        {branch.operatingHours} ({branch.workingDays || 'Mon - Sat'})
                      </span>
                    </div>
                  )}

                  {/* Geofence Attendance Info */}
                  {branch.latitude != null && branch.longitude != null && (
                    <div className="flex items-center gap-1.5 pt-1">
                      <Navigation size={12} className="text-emerald-400 shrink-0" />
                      <span className="text-[11px] text-emerald-300/90 font-mono">
                        GPS Geofenced ({branch.radiusKm || 0.5}km radius)
                      </span>
                    </div>
                  )}

                  {/* Notes */}
                  {branch.notes && (
                    <p className="text-[11px] text-slate-400 italic pt-1 line-clamp-2">
                      "{branch.notes}"
                    </p>
                  )}
                </div>
              </div>

              {/* Card Footer: Staff count & toggle button */}
              <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Users2 size={13} className="text-indigo-400" />
                  <span>
                    <strong className="text-white">{branch.employeeCount || 0}</strong> staff assigned
                  </span>
                </span>

                <button
                  onClick={() => handleToggleStatus(branch)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                    branch.isActive
                      ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      : 'bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30'
                  }`}
                >
                  {branch.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </div>

              {/* Delete Confirmation Overlay */}
              {deleteConfirmId === branch._id && (
                <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-sm rounded-2xl p-5 flex flex-col justify-center items-center text-center z-10 space-y-3">
                  <AlertTriangle size={28} className="text-rose-400" />
                  <div>
                    <h5 className="text-white font-bold text-sm">Delete Branch?</h5>
                    <p className="text-slate-400 text-xs mt-1">
                      Employees assigned to "{branch.name}" will be unassigned.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setDeleteConfirmId(null)}
                      className="px-3 py-1.5 rounded-lg bg-white/10 text-slate-300 text-xs hover:bg-white/20 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleDelete(branch._id)}
                      className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md"
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

      {/* ── CREATE / EDIT BRANCH MODAL ── */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl text-white space-y-6 max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                    <Building2 size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {editingBranch ? `Edit Branch: ${editingBranch.name}` : 'Add New Branch Location'}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {companyName ? `Assigning to ${companyName}` : 'Configure company branch, manager, and location'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Basic Branch Info */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-semibold text-slate-300">
                      Branch Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Hosur Corporate Office, Bangalore Tech Hub"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Branch Code</label>
                    <input
                      type="text"
                      placeholder="e.g. HSR-HQ, BLR-01"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 uppercase"
                    />
                  </div>
                </div>

                {/* Headquarters Checkbox */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <input
                    type="checkbox"
                    id="isHeadquarters"
                    checked={formData.isHeadquarters}
                    onChange={(e) => setFormData({ ...formData, isHeadquarters: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-0 bg-white/10 border-white/20"
                  />
                  <label htmlFor="isHeadquarters" className="text-xs text-amber-200 cursor-pointer select-none">
                    <strong className="text-amber-300">Set as Company Headquarters (HQ)</strong> — marks this as the primary registered office for the company.
                  </label>
                </div>

                {/* Manager In-Charge Info */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                  <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                    <User size={13} />
                    <span>Branch Manager In-Charge</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400">Manager Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Rajesh Kumar"
                        value={formData.managerName}
                        onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400">Manager Phone</label>
                      <input
                        type="text"
                        placeholder="+91 98765 43210"
                        value={formData.managerPhone}
                        onChange={(e) => setFormData({ ...formData, managerPhone: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400">Manager Email</label>
                      <input
                        type="email"
                        placeholder="manager@company.com"
                        value={formData.managerEmail}
                        onChange={(e) => setFormData({ ...formData, managerEmail: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Address Details */}
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Street Address</label>
                    <input
                      type="text"
                      placeholder="Suite #, Building, Tech Park, Street address..."
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300">
                        City <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Hosur"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300">State</label>
                      <input
                        type="text"
                        placeholder="e.g. Tamil Nadu"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300">Country</label>
                      <input
                        type="text"
                        placeholder="India"
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300">Postal / PIN Code</label>
                      <input
                        type="text"
                        placeholder="e.g. 635109"
                        value={formData.postalCode}
                        onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact & Hours */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Branch Phone</label>
                    <input
                      type="text"
                      placeholder="e.g. 04344-123456"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Branch Email</label>
                    <input
                      type="email"
                      placeholder="branch@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Operating Hours</label>
                    <input
                      type="text"
                      placeholder="e.g. 9:00 AM - 6:30 PM"
                      value={formData.operatingHours}
                      onChange={(e) => setFormData({ ...formData, operatingHours: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* GPS Coordinates & Geofencing (Attendance) */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Navigation size={13} />
                      <span>GPS Geofencing for Attendance Check-in (Optional)</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleAutoGPS}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-semibold transition-all border border-emerald-500/20"
                    >
                      <Compass size={12} />
                      <span>Capture My GPS</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400">Latitude</label>
                      <input
                        type="number"
                        step="any"
                        placeholder="e.g. 12.7409"
                        value={formData.latitude}
                        onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400">Longitude</label>
                      <input
                        type="number"
                        step="any"
                        placeholder="e.g. 77.8253"
                        value={formData.longitude}
                        onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400">Radius (Kilometers)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        max="20"
                        placeholder="0.5"
                        value={formData.radiusKm}
                        onChange={(e) => setFormData({ ...formData, radiusKm: Number(e.target.value) })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Internal Notes</label>
                  <textarea
                    rows={2}
                    placeholder="Specific branch notes, floor details, key contacts..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 resize-none"
                  />
                </div>

                {/* Submit Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-sm font-semibold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm transition-all disabled:opacity-50 shadow-md shadow-indigo-600/30"
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
