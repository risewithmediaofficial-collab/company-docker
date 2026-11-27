import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    companyProfile: {
      name: { type: String, default: '' },
      slug: { type: String, default: '' },
      industry: { type: String, default: '' },
      website: { type: String, default: '' },
      address: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      country: { type: String, default: 'India' },
      postalCode: { type: String, default: '' },
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
      gstNumber: { type: String, default: '' },
      services: { type: String, default: '' },
      logoUrl: { type: String, default: '' },
      logoSize: { type: Number, default: 44, min: 24, max: 72 },
      openingTime: { type: String, default: '09:30' },
      closingTime: { type: String, default: '18:30' },
      operatingHours: { type: String, default: '9:30 AM - 6:30 PM' },
      workingDays: { type: String, default: 'Monday - Saturday' },
      lateGraceMinutes: { type: Number, default: 15 },
      latitude: { type: String, default: '' },
      longitude: { type: String, default: '' },
      radiusKm: { type: Number, default: 0.5 },
    },
    notifications: {
      email: { type: Boolean, default: true },
      inApp: { type: Boolean, default: true },
      taskUpdates: { type: Boolean, default: true },
      leadUpdates: { type: Boolean, default: true },
      financeAlerts: { type: Boolean, default: true },
      dailyDigest: { type: Boolean, default: false },
    },
    appearance: {
      theme: { type: String, enum: ['light', 'dark', 'system'], default: 'light' },
      density: { type: String, enum: ['comfortable', 'compact'], default: 'comfortable' },
    },
    regional: {
      language: { type: String, default: 'en-US' },
      timezone: { type: String, default: 'Asia/Calcutta' },
      currency: { type: String, default: 'INR' },
    },
  },
  { timestamps: true }
);

const Settings = mongoose.model('Settings', settingsSchema);
export default Settings;
