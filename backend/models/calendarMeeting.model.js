import mongoose from 'mongoose';

const calendarMeetingSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
    brandId: { type: mongoose.Schema.Types.ObjectId, ref: 'BrandWorkspace' },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    meetingType: {
      type: String,
      enum: ['client_meeting', 'project_sync', 'internal_team', 'review', 'kickoff', 'other'],
      default: 'client_meeting',
    },
    platform: {
      type: String,
      enum: ['Google Meet', 'Zoom', 'Microsoft Teams', 'In-Person', 'Phone Call', 'Other'],
      default: 'Google Meet',
    },
    meetingLink: { type: String, default: '', trim: true },
    location: { type: String, default: '', trim: true },
    meetingDate: { type: Date, required: true },
    startTime: { type: String, default: '10:00', trim: true },
    endTime: { type: String, default: '11:00', trim: true },
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    externalAttendees: [{ type: String, trim: true }],
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled'],
      default: 'scheduled',
    },
    color: { type: String, default: '#7c3aed' },
    notes: { type: String, default: '' },
    visibleToClient: { type: Boolean, default: true },
  },
  { timestamps: true }
);

calendarMeetingSchema.index({ organizationId: 1, meetingDate: 1 });
calendarMeetingSchema.index({ client: 1, meetingDate: 1 });
calendarMeetingSchema.index({ project: 1, meetingDate: 1 });
calendarMeetingSchema.index({ organizer: 1 });
calendarMeetingSchema.index({ attendees: 1 });

const CalendarMeeting = mongoose.model('CalendarMeeting', calendarMeetingSchema);
export default CalendarMeeting;
