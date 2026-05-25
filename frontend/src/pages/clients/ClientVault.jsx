import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  CalendarClock,
  Copy,
  Eye,
  EyeOff,
  KeyRound,
  Link as LinkIcon,
  LockKeyhole,
  Plus,
  ShieldCheck,
  Tags,
  UserRound,
} from 'lucide-react';
import { toast } from 'sonner';
import { useClients } from '../../hooks/useClients';
import {
  credentialTypes,
  useCreateCredential,
  useCredential,
  useCredentialsVault,
  useDeleteCredential,
  useUpdateCredential,
} from '../../hooks/useClientCredentials';
import { Button } from '../../components/ui/button';
import { DataTable } from '../../components/ui/DataTable';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { MetricCard, MetricGrid, PageHeader, PageToolbar, SearchField, SectionCard, StatusBadge } from '../../components/ui/page';

const emptyForm = {
  clientId: '',
  credentialName: '',
  credentialType: 'password',
  username: '',
  password: '',
  url: '',
  notes: '',
  information: '',
  expiryDate: '',
  tags: '',
};

const typeLabels = credentialTypes.reduce((labels, type) => {
  labels[type.value] = type.label;
  return labels;
}, {});

const getClientName = (credential) => {
  if (!credential?.clientId) return 'No client linked';
  return credential.clientId.company || credential.clientId.name || 'Unnamed client';
};

const formatDate = (value) => {
  if (!value) return 'No expiry';
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value));
};

const FormField = ({ label, children }) => (
  <label className="space-y-1.5 text-sm font-medium text-foreground">
    <span>{label}</span>
    {children}
  </label>
);

const CredentialFormDialog = ({ open, onOpenChange, credential, clients, onSave, saving }) => {
  const [form, setForm] = useState(emptyForm);
  const isEditing = Boolean(credential?._id);

  useEffect(() => {
    if (!open) return;

    setForm({
      clientId: credential?.clientId?._id || credential?.clientId || '',
      credentialName: credential?.credentialName || '',
      credentialType: credential?.credentialType || 'password',
      username: credential?.username || '',
      password: '',
      url: credential?.url || '',
      notes: credential?.notes || '',
      information: credential?.data?.information || '',
      expiryDate: credential?.expiryDate ? credential.expiryDate.slice(0, 10) : '',
      tags: Array.isArray(credential?.tags) ? credential.tags.join(', ') : '',
    });
  }, [credential, open]);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.clientId) {
      toast.error('Choose a client first');
      return;
    }

    const payload = {
      credentialName: form.credentialName.trim(),
      credentialType: form.credentialType,
      username: form.username.trim(),
      url: form.url.trim(),
      notes: form.notes.trim(),
      expiryDate: form.expiryDate || null,
      tags: form.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      data: form.information.trim() ? { information: form.information.trim() } : undefined,
    };

    if (form.password) {
      payload.password = form.password;
    }

    await onSave({ id: credential?._id, clientId: form.clientId, data: payload });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Saved Credential' : 'Save Client Password'}</DialogTitle>
          <DialogDescription>
            Store login details and important client access notes for internal remembering.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <FormField label="Client">
            <select
              value={form.clientId}
              onChange={(event) => updateField('clientId', event.target.value)}
              className="app-input"
              required
              disabled={isEditing}
            >
              <option value="">Select client</option>
              {clients.map((client) => (
                <option key={client._id} value={client._id}>
                  {client.company || client.name}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Type">
            <select
              value={form.credentialType}
              onChange={(event) => updateField('credentialType', event.target.value)}
              className="app-input"
            >
              {credentialTypes.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Credential name">
            <Input
              value={form.credentialName}
              onChange={(event) => updateField('credentialName', event.target.value)}
              placeholder="Instagram login, Hosting panel, Google Ads..."
              required
            />
          </FormField>

          <FormField label="Username / Email">
            <Input
              value={form.username}
              onChange={(event) => updateField('username', event.target.value)}
              placeholder="name@example.com"
            />
          </FormField>

          <FormField label={isEditing ? 'New password' : 'Password'}>
            <Input
              type="password"
              value={form.password}
              onChange={(event) => updateField('password', event.target.value)}
              placeholder={isEditing ? 'Leave blank to keep current password' : 'Enter password'}
            />
          </FormField>

          <FormField label="Login URL">
            <Input
              value={form.url}
              onChange={(event) => updateField('url', event.target.value)}
              placeholder="https://..."
            />
          </FormField>

          <FormField label="Expiry date">
            <Input
              type="date"
              value={form.expiryDate}
              onChange={(event) => updateField('expiryDate', event.target.value)}
            />
          </FormField>

          <FormField label="Tags">
            <Input
              value={form.tags}
              onChange={(event) => updateField('tags', event.target.value)}
              placeholder="ads, hosting, urgent"
            />
          </FormField>

          <FormField label="Private information">
            <Textarea
              value={form.information}
              onChange={(event) => updateField('information', event.target.value)}
              placeholder="Recovery codes, account IDs, security answers, backup email..."
            />
          </FormField>

          <FormField label="Notes">
            <Textarea
              value={form.notes}
              onChange={(event) => updateField('notes', event.target.value)}
              placeholder="Internal reminder notes"
            />
          </FormField>

          <div className="flex justify-end gap-3 md:col-span-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              <ShieldCheck size={16} className="mr-2" />
              {saving ? 'Saving...' : 'Save Credential'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const CredentialDetailsDialog = ({ open, onOpenChange, credentialId }) => {
  const [showPassword, setShowPassword] = useState(false);
  const { data: credential, isLoading } = useCredential(open ? credentialId : null);

  useEffect(() => {
    if (open) setShowPassword(false);
  }, [open, credentialId]);

  const copyText = async (label, text) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    toast.success(`${label} copied`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Credential Details</DialogTitle>
          <DialogDescription>Reveal only when you need to use or copy the saved access details.</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-3">
            <div className="h-16 animate-pulse rounded-2xl bg-secondary" />
            <div className="h-32 animate-pulse rounded-2xl bg-secondary" />
          </div>
        ) : credential ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-secondary/30 p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{getClientName(credential)}</p>
                  <h3 className="mt-1 text-xl font-bold text-foreground">{credential.credentialName}</h3>
                </div>
                <StatusBadge tone="info">{typeLabels[credential.credentialType] || 'Other'}</StatusBadge>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <InfoRow icon={UserRound} label="Username" value={credential.username || 'Not added'} onCopy={() => copyText('Username', credential.username)} />
              <InfoRow icon={CalendarClock} label="Expiry" value={formatDate(credential.expiryDate)} />
              <InfoRow icon={LinkIcon} label="Login URL" value={credential.url || 'Not added'} onCopy={() => copyText('URL', credential.url)} />
              <div className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  <LockKeyhole size={14} />
                  Password
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <code className="min-w-0 truncate rounded-lg bg-secondary px-2 py-1 text-sm">
                    {showPassword ? credential.password || 'Not added' : credential.password ? '********' : 'Not added'}
                  </code>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                      title={showPassword ? 'Hide password' : 'Reveal password'}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <button
                      type="button"
                      onClick={() => copyText('Password', credential.password)}
                      className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                      title="Copy password"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {credential.data?.information ? (
              <DetailBlock title="Private information" value={credential.data.information} />
            ) : null}
            {credential.notes ? <DetailBlock title="Notes" value={credential.notes} /> : null}
            {credential.tags?.length ? (
              <div className="flex flex-wrap gap-2">
                {credential.tags.map((tag) => <span key={tag} className="app-pill">{tag}</span>)}
              </div>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Credential not found.</p>
        )}
      </DialogContent>
    </Dialog>
  );
};

const InfoRow = ({ icon: Icon, label, value, onCopy }) => (
  <div className="rounded-2xl border border-border bg-card p-4">
    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
      <Icon size={14} />
      {label}
    </div>
    <div className="mt-3 flex items-center justify-between gap-3">
      <span className="min-w-0 truncate text-sm font-medium text-foreground">{value}</span>
      {onCopy ? (
        <button
          type="button"
          onClick={onCopy}
          className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          title={`Copy ${label}`}
        >
          <Copy size={16} />
        </button>
      ) : null}
    </div>
  </div>
);

const DetailBlock = ({ title, value }) => (
  <div className="rounded-2xl border border-border bg-card p-4">
    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{title}</p>
    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-foreground">{value}</p>
  </div>
);

const ClientVault = () => {
  const { user } = useSelector((state) => state.auth);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [clientFilter, setClientFilter] = useState('all');
  const [formOpen, setFormOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedCredential, setSelectedCredential] = useState(null);

  const { data: clients = [] } = useClients();
  const { data: credentials = [], isLoading } = useCredentialsVault({
    search: searchTerm,
    credentialType: typeFilter,
    clientId: clientFilter,
  });
  const createCredential = useCreateCredential();
  const updateCredential = useUpdateCredential();
  const deleteCredential = useDeleteCredential();
  const canManageVault = ['superAdmin', 'manager'].includes(user?.role);

  const metrics = useMemo(() => {
    const expiringSoon = credentials.filter((credential) => {
      if (!credential.expiryDate) return false;
      const days = (new Date(credential.expiryDate) - new Date()) / (1000 * 60 * 60 * 24);
      return days >= 0 && days <= 30;
    }).length;

    return {
      total: credentials.length,
      clientsCovered: new Set(credentials.map((credential) => credential.clientId?._id || credential.clientId).filter(Boolean)).size,
      passwords: credentials.filter((credential) => credential.credentialType === 'password').length,
      expiringSoon,
    };
  }, [credentials]);

  const handleSave = async ({ id, clientId, data }) => {
    if (id) {
      await updateCredential.mutateAsync({ id, data });
    } else {
      await createCredential.mutateAsync({ clientId, data });
    }
  };

  const columns = [
    {
      key: 'credentialName',
      label: 'Credential',
      render: (row) => (
        <div className="min-w-0">
          <div className="font-semibold text-foreground">{row.credentialName}</div>
          <div className="mt-1 text-xs text-muted-foreground">{row.username || 'No username saved'}</div>
        </div>
      ),
    },
    {
      key: 'client',
      label: 'Client',
      render: (row) => getClientName(row),
    },
    {
      key: 'credentialType',
      label: 'Type',
      render: (row) => <StatusBadge tone="info">{typeLabels[row.credentialType] || 'Other'}</StatusBadge>,
    },
    {
      key: 'password',
      label: 'Password',
      render: (row) => <code className="rounded-lg bg-secondary px-2 py-1 text-xs">{row.passwordMask || 'Not added'}</code>,
    },
    {
      key: 'expiryDate',
      label: 'Expiry',
      render: (row) => formatDate(row.expiryDate),
    },
    {
      key: 'tags',
      label: 'Tags',
      render: (row) => (
        <div className="flex max-w-[220px] flex-wrap gap-1">
          {(row.tags || []).slice(0, 3).map((tag) => <span key={tag} className="app-pill">{tag}</span>)}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Client Vault"
        title="Remember client passwords and access information."
        description="A separate internal dashboard for client logins, account URLs, recovery notes, and other sensitive reminders."
        actions={canManageVault ? (
          <Button
            onClick={() => {
              setSelectedCredential(null);
              setFormOpen(true);
            }}
          >
            <Plus size={16} className="mr-2" />
            Save Password
          </Button>
        ) : null}
      >
        <MetricGrid>
          <MetricCard label="Saved Items" value={metrics.total} helper="Credentials visible in this view" icon={KeyRound} tone="primary" />
          <MetricCard label="Clients Covered" value={metrics.clientsCovered} helper="Clients with at least one saved item" icon={ShieldCheck} tone="success" />
          <MetricCard label="Passwords" value={metrics.passwords} helper="Login passwords stored in the vault" icon={LockKeyhole} tone="info" />
          <MetricCard label="Expiring Soon" value={metrics.expiringSoon} helper="Credentials expiring within 30 days" icon={CalendarClock} tone="warning" />
        </MetricGrid>
      </PageHeader>

      <PageToolbar>
        <SearchField
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search client, username, URL, tag, or credential name..."
        />
        <select value={clientFilter} onChange={(event) => setClientFilter(event.target.value)} className="app-input lg:w-56">
          <option value="all">All clients</option>
          {clients.map((client) => (
            <option key={client._id} value={client._id}>{client.company || client.name}</option>
          ))}
        </select>
        <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} className="app-input lg:w-52">
          <option value="all">All types</option>
          {credentialTypes.map((type) => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>
      </PageToolbar>

      <SectionCard
        title="Saved Client Access"
        description="Use view to reveal passwords only when needed. Add notes for anything the team needs to remember."
        action={<span className="app-pill"><Tags size={14} className="mr-1.5" />{credentials.length} records</span>}
      >
        <DataTable
          data={credentials}
          columns={columns}
          loading={isLoading}
          onView={(credential) => {
            setSelectedCredential(credential);
            setDetailsOpen(true);
          }}
          onDelete={canManageVault ? (id) => {
            if (window.confirm('Remove this saved credential from the vault?')) {
              deleteCredential.mutate(id);
            }
          } : null}
          onEdit={canManageVault ? (credential) => {
            setSelectedCredential(credential);
            setFormOpen(true);
          } : null}
          emptyTitle="No saved passwords yet"
          emptyDescription="Save client logins, recovery information, URLs, and notes here so the team can find them later."
          emptyAction={canManageVault ? (
            <Button onClick={() => setFormOpen(true)}>
              <Plus size={16} className="mr-2" />
              Save First Password
            </Button>
          ) : null}
        />
      </SectionCard>

      <CredentialFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        credential={selectedCredential}
        clients={clients}
        onSave={handleSave}
        saving={createCredential.isPending || updateCredential.isPending}
      />

      <CredentialDetailsDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        credentialId={selectedCredential?._id}
      />
    </div>
  );
};

export default ClientVault;
