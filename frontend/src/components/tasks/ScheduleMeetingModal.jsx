import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import {
  CalendarDays,
  Check,
  Clock,
  ExternalLink,
  Link as LinkIcon,
  MapPin,
  Trash2,
  Users,
  Video,
  X,
} from '@/components/ui/muiIcons';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { SelectDropdown } from '../ui/SelectDropdown';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  useCreateMeeting,
  useDeleteMeeting,
  useUpdateMeeting,
} from '../../hooks/useMeetings';
import { cn } from '../../utils/cn';

const PLATFORM_OPTIONS = [
  'Google Meet',
  'Zoom',
  'Microsoft Teams',
  'In-Person',
  'Phone Call',
  'Other',
];

const MEETING_TYPE_OPTIONS = [
  { value: 'client_meeting', label: 'Client Meeting' },
  { value: 'project_sync', label: 'Project Sync' },
  { value: 'internal_team', label: 'Internal Team Sync' },
  { value: 'review', label: 'Content / Work Review' },
  { value: 'kickoff', label: 'Project Kickoff' },
  { value: 'other', label: 'Other' },
];

const STATUS_OPTIONS = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const toDateInput = (value) => {
  if (!value) return format(new Date(), 'yyyy-MM-dd');
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? format(new Date(), 'yyyy-MM-dd') : format(d, 'yyyy-MM-dd');
};

export const ScheduleMeetingModal = ({
  open,
  onOpenChange,
  initialDate = '',
  initialTime = '',
  initialClientId = '',
  initialProjectId = '',
  initialAssigneeId = '',
  meeting = null,
  clients = [],
  projects = [],
  users = [],
  readOnly = false,
  canDelete = false,
}) => {
  const createMeeting = useCreateMeeting();
  const updateMeeting = useUpdateMeeting();
  const deleteMeeting = useDeleteMeeting();

  const isEditing = Boolean(meeting?._id);

  const [title, setTitle] = useState('');
  const [meetingType, setMeetingType] = useState('client_meeting');
  const [platform, setPlatform] = useState('Google Meet');
  const [meetingDate, setMeetingDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:00');
  const [clientId, setClientId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [attendeeIds, setAttendeeIds] = useState([]);
  const [attendeeSearch, setAttendeeSearch] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('scheduled');
  const [visibleToClient, setVisibleToClient] = useState(true);

  useEffect(() => {
    if (!open) return;
    setAttendeeSearch('');
    if (meeting?._id) {
      setTitle(meeting.title || '');
      setMeetingType(meeting.meetingType || 'client_meeting');
      setPlatform(meeting.platform || 'Google Meet');
      setMeetingDate(toDateInput(meeting.meetingDate));
      setStartTime(meeting.startTime || '10:00');
      setEndTime(meeting.endTime || '11:00');
      setClientId(meeting.client?._id || meeting.client || '');
      setProjectId(meeting.project?._id || meeting.project || '');
      setAttendeeIds(
        (meeting.attendees || []).map((a) => (typeof a === 'object' ? a._id : a)).filter(Boolean)
      );
      setMeetingLink(meeting.meetingLink || '');
      setLocation(meeting.location || '');
      setNotes(meeting.notes || meeting.description || '');
      setStatus(meeting.status || 'scheduled');
      setVisibleToClient(meeting.visibleToClient !== false);
    } else {
      const start = initialTime || '10:00';
      const [hStr, mStr] = start.split(':');
      const endHour = Math.min(23, (Number(hStr) || 10) + 1);
      const computedEnd = `${String(endHour).padStart(2, '0')}:${mStr || '00'}`;

      setTitle('');
      setMeetingType(initialProjectId ? 'project_sync' : initialClientId ? 'client_meeting' : 'client_meeting');
      setPlatform('Google Meet');
      setMeetingDate(initialDate ? toDateInput(initialDate) : format(new Date(), 'yyyy-MM-dd'));
      setStartTime(start);
      setEndTime(computedEnd);
      setClientId(initialClientId || '');
      setProjectId(initialProjectId || '');
      setAttendeeIds(initialAssigneeId ? [initialAssigneeId] : []);
      setMeetingLink('');
      setLocation('');
      setNotes('');
      setStatus('scheduled');
      setVisibleToClient(true);
    }
  }, [open, meeting, initialDate, initialTime, initialClientId, initialProjectId, initialAssigneeId]);

  const filteredProjects = useMemo(() => {
    if (!clientId) return projects;
    return projects.filter((p) => {
      const pClientId = p.client?._id || p.client || '';
      return String(pClientId) === String(clientId);
    });
  }, [projects, clientId]);

  const teamUsers = useMemo(
    () => (users || []).filter((u) => u.role !== 'client'),
    [users]
  );

  const visibleUsers = useMemo(() => {
    const q = attendeeSearch.trim().toLowerCase();
    if (!q) return teamUsers;
    return teamUsers.filter(
      (u) =>
        (u.name || '').toLowerCase().includes(q) ||
        (u.role || '').toLowerCase().includes(q) ||
        (u.department || '').toLowerCase().includes(q)
    );
  }, [teamUsers, attendeeSearch]);

  const handleClientChange = (nextClientId) => {
    setClientId(nextClientId || '');
    if (nextClientId && projectId) {
      const currentProj = projects.find((p) => String(p._id) === String(projectId));
      const pClient = currentProj?.client?._id || currentProj?.client || '';
      if (currentProj && String(pClient) !== String(nextClientId)) {
        setProjectId('');
      }
    }
  };

  const handleProjectChange = (nextProjectId) => {
    setProjectId(nextProjectId || '');
    if (nextProjectId && !clientId) {
      const proj = projects.find((p) => String(p._id) === String(nextProjectId));
      const pClient = proj?.client?._id || proj?.client || '';
      if (pClient) setClientId(pClient);
    }
  };

  const toggleAttendee = (userId) => {
    if (readOnly) return;
    setAttendeeIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (readOnly || !title.trim() || !meetingDate) return;

    const payload = {
      title: title.trim(),
      meetingType,
      platform,
      meetingDate,
      startTime: startTime || '10:00',
      endTime: endTime || '11:00',
      client: clientId || undefined,
      project: projectId || undefined,
      attendees: attendeeIds,
      meetingLink: meetingLink.trim(),
      location: location.trim(),
      notes: notes.trim(),
      status,
      visibleToClient,
    };

    if (isEditing) {
      await updateMeeting.mutateAsync({ id: meeting._id, data: payload });
    } else {
      await createMeeting.mutateAsync(payload);
    }
    onOpenChange(false);
  };

  const handleDelete = async () => {
    if (!isEditing || readOnly) return;
    await deleteMeeting.mutateAsync(meeting._id);
    onOpenChange(false);
  };

  const isSaving = createMeeting.isPending || updateMeeting.isPending || deleteMeeting.isPending;

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
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 shrink-0">
              <Video size={20} />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-base sm:text-lg font-bold text-foreground truncate">
                {readOnly
                  ? 'Meeting Details'
                  : isEditing
                  ? 'Edit Scheduled Meeting'
                  : 'Schedule Meeting'}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5 truncate">
                {readOnly
                  ? 'Scheduled event details and meeting link'
                  : 'Add client, project, or internal team meetings to the calendar'}
              </DialogDescription>
            </div>
          </div>

          <DialogClose className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary/70 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer">
            <X size={17} />
          </DialogClose>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 min-h-0 flex flex-col">
          <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5 space-y-4 custom-scrollbar">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Meeting Title *
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Monthly Content Review with Client"
                disabled={readOnly}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Meeting Category
                </label>
                <SelectDropdown
                  value={meetingType}
                  onChange={readOnly ? () => {} : setMeetingType}
                  options={MEETING_TYPE_OPTIONS}
                  allowCustom={false}
                  allowDeselect={false}
                  placeholder="Select category"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Platform / Channel
                </label>
                <SelectDropdown
                  value={platform}
                  onChange={readOnly ? () => {} : setPlatform}
                  options={PLATFORM_OPTIONS}
                  allowCustom={false}
                  allowDeselect={false}
                  placeholder="Google Meet"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground mb-1.5">
                  <CalendarDays size={13} className="text-muted-foreground" /> Date *
                </label>
                <Input
                  type="date"
                  value={meetingDate}
                  onChange={(e) => setMeetingDate(e.target.value)}
                  disabled={readOnly}
                  required
                />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground mb-1.5">
                  <Clock size={13} className="text-muted-foreground" /> Start Time
                </label>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  disabled={readOnly}
                />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground mb-1.5">
                  <Clock size={13} className="text-muted-foreground" /> End Time
                </label>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  disabled={readOnly}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Client (Optional)
                </label>
                <SelectDropdown
                  value={clientId}
                  onChange={readOnly ? () => {} : handleClientChange}
                  allOptionLabel="Internal / No Client"
                  options={(clients || []).map((c) => ({
                    value: c._id,
                    label: c.name || c.company || 'Unnamed Client',
                    subLabel: c.company && c.company !== c.name ? c.company : undefined,
                  }))}
                  allowCustom={false}
                  placeholder="Choose client..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Project (Optional)
                </label>
                <SelectDropdown
                  value={projectId}
                  onChange={readOnly ? () => {} : handleProjectChange}
                  allOptionLabel="No Linked Project"
                  options={filteredProjects.map((p) => ({
                    value: p._id,
                    label: p.name,
                    subLabel: p.client?.name || p.status,
                  }))}
                  allowCustom={false}
                  placeholder="Choose project..."
                />
              </div>
            </div>

            {platform === 'In-Person' ? (
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground mb-1.5">
                  <MapPin size={13} className="text-muted-foreground" /> Location / Office
                </label>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Conference Room / Client Office address"
                  disabled={readOnly}
                />
              </div>
            ) : (
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground mb-1.5">
                  <LinkIcon size={13} className="text-muted-foreground" /> Meeting Link
                </label>
                <div className="flex gap-2">
                  <Input
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                    placeholder="https://meet.google.com/..."
                    disabled={readOnly}
                    className="flex-1"
                  />
                  {meetingLink && (
                    <a
                      href={meetingLink.startsWith('http') ? meetingLink : `https://${meetingLink}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 rounded-lg border border-border bg-secondary/70 text-xs font-semibold text-foreground hover:bg-secondary shrink-0"
                    >
                      Join <ExternalLink size={13} />
                    </a>
                  )}
                </div>
              </div>
            )}

            {teamUsers.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                    <Users size={13} className="text-muted-foreground" /> Employees / Attendees (
                    {attendeeIds.length})
                  </label>
                  {!readOnly && attendeeIds.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setAttendeeIds([])}
                      className="text-[11px] font-medium text-muted-foreground hover:text-foreground"
                    >
                      Clear
                    </button>
                  )}
                </div>
                {!readOnly && (
                  <Input
                    value={attendeeSearch}
                    onChange={(e) => setAttendeeSearch(e.target.value)}
                    placeholder="Search team member..."
                    className="mb-2 h-8 text-xs"
                  />
                )}
                <div className="max-h-36 overflow-y-auto rounded-xl border border-border bg-secondary/20 p-2 grid grid-cols-1 sm:grid-cols-2 gap-1.5 custom-scrollbar">
                  {visibleUsers.map((member) => {
                    const selected = attendeeIds.includes(member._id);
                    return (
                      <button
                        key={member._id}
                        type="button"
                        disabled={readOnly}
                        onClick={() => toggleAttendee(member._id)}
                        className={cn(
                          'flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-left text-xs transition-colors border',
                          selected
                            ? 'bg-violet-500/12 border-violet-500/40 text-foreground font-semibold'
                            : 'bg-background/80 border-transparent hover:bg-secondary/70 text-muted-foreground'
                        )}
                      >
                        <span className="truncate">{member.name}</span>
                        {selected && <Check size={13} className="text-violet-600 shrink-0" />}
                      </button>
                    );
                  })}
                  {visibleUsers.length === 0 && (
                    <p className="text-xs text-muted-foreground col-span-full py-2 text-center">
                      No matching team members
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Status
                </label>
                <SelectDropdown
                  value={status}
                  onChange={readOnly ? () => {} : setStatus}
                  options={STATUS_OPTIONS}
                  allowCustom={false}
                  allowDeselect={false}
                />
              </div>

              {!readOnly && (
                <label className="flex items-center gap-2.5 pt-5 cursor-pointer select-none text-xs font-medium text-foreground">
                  <input
                    type="checkbox"
                    checked={visibleToClient}
                    onChange={(e) => setVisibleToClient(e.target.checked)}
                    className="h-4 w-4 rounded border-border accent-primary"
                  />
                  Visible to client on calendar
                </label>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Agenda / Notes
              </label>
              <Textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Key talking points, deliverables to review, or action items..."
                disabled={readOnly}
              />
            </div>
          </div>

          <div className="px-6 py-3.5 border-t border-border bg-card/60 shrink-0 flex items-center justify-between gap-2">
            <div>
              {isEditing && !readOnly && canDelete && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={isSaving}
                  onClick={handleDelete}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 size={14} className="mr-1.5" />
                  Delete
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                {readOnly ? 'Close' : 'Cancel'}
              </Button>
              {!readOnly && (
                <Button type="submit" size="sm" disabled={isSaving || !title.trim()}>
                  {isSaving ? 'Saving...' : isEditing ? 'Save Changes' : 'Schedule Meeting'}
                </Button>
              )}
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
