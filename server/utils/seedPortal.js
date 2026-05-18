// =============================================
// PORTAL SEEDER - Demo content & reporting data
// Usage: node utils/seedPortal.js
// =============================================

import mongoose from 'mongoose';
import { loadEnv, getEnv } from '../config/env.js';
import ContentItem from '../models/contentItem.model.js';
import ReportingEntry from '../models/reportingEntry.model.js';
import Client from '../models/client.model.js';
import User from '../models/user.model.js';

loadEnv();
const env = getEnv();

const STATUSES = ['Draft', 'Editing', 'Send to Client', 'Revision Requested', 'Approved', 'Scheduled', 'Posted', 'Done'];
const PLATFORMS = ['Instagram', 'Facebook', 'LinkedIn', 'TikTok', 'YouTube'];
const CONTENT_TYPES = ['Reel', 'Post', 'Story', 'Carousel', 'Video', 'Email'];
const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

const CONTENT_NAMES = [
  'Q2 Brand Campaign - Hero Reel',
  'Product Launch Announcement',
  'Customer Testimonial Video',
  'Instagram Carousel - Top 5 Tips',
  'Facebook Ad - Summer Sale',
  'LinkedIn Thought Leadership Post',
  'TikTok Behind The Scenes',
  'Monthly Newsletter Email',
  'Story Series - Brand Story Ep.1',
  'Promotional Reel - Offer Ends Soon',
  'User-Generated Content Compilation',
  'Case Study Infographic',
  'Event Announcement Post',
  'Before & After Transformation Reel',
  'Weekly Motivational Quote Post',
  'Product Demo Video',
  'Seasonal Campaign - Summer Vibes',
  'Engagement Post - Poll',
  'Educational Carousel - How It Works',
  'Flash Sale Story',
];

const seed = async () => {
  await mongoose.connect(env.mongoUri);
  console.log('Connected to MongoDB');

  // Find first client
  const client = await Client.findOne();
  if (!client) {
    console.error('No client found. Please create a client first.');
    process.exit(1);
  }

  // Find first editor/manager
  const editor = await User.findOne({ role: { $in: ['manager', 'employee', 'superAdmin'] } });

  console.log(`Seeding portal data for client: ${client.name}`);

  // ─── Content Items ─────────────────────────────────
  await ContentItem.deleteMany({ client: client._id });

  const contentItems = CONTENT_NAMES.map((name, i) => {
    const status = STATUSES[i % STATUSES.length];
    return {
      taskName: name,
      status,
      approved: status === 'Approved' || status === 'Posted' || status === 'Done',
      platform: PLATFORMS[i % PLATFORMS.length],
      contentType: CONTENT_TYPES[i % CONTENT_TYPES.length],
      priority: PRIORITIES[i % PRIORITIES.length],
      notes: `Review and approve before ${new Date(Date.now() + i * 86400000).toLocaleDateString()}`,
      contentUrl: `https://drive.google.com/example-${i + 1}`,
      clientFeedback: status === 'Revision Requested' ? 'Please adjust the colour scheme and update the CTA.' : '',
      client: client._id,
      assignedEditor: editor?._id,
      datePosted: status === 'Posted' || status === 'Done'
        ? new Date(Date.now() - i * 86400000)
        : null,
      scheduledFor: status === 'Scheduled'
        ? new Date(Date.now() + i * 86400000)
        : null,
      revisionCount: status === 'Revision Requested' ? 1 : 0,
    };
  });

  await ContentItem.insertMany(contentItems);
  console.log(`✅ Created ${contentItems.length} content items`);

  // ─── Reporting Entries ─────────────────────────────
  await ReportingEntry.deleteMany({ client: client._id });

  const currentYear = new Date().getFullYear();
  const reportingData = [
    { month: `${currentYear}-01`, adSpend: 3200,  optIns: 142, callsBooked: 24, newClients: 3, cashCollected: 8500,  totalRevenue: 11200 },
    { month: `${currentYear}-02`, adSpend: 3800,  optIns: 168, callsBooked: 31, newClients: 4, cashCollected: 12000, totalRevenue: 15000 },
    { month: `${currentYear}-03`, adSpend: 4100,  optIns: 195, callsBooked: 38, newClients: 5, cashCollected: 14500, totalRevenue: 18000 },
    { month: `${currentYear}-04`, adSpend: 3900,  optIns: 187, callsBooked: 35, newClients: 4, cashCollected: 13200, totalRevenue: 16500 },
    { month: `${currentYear}-05`, adSpend: 5200,  optIns: 241, callsBooked: 47, newClients: 7, cashCollected: 19800, totalRevenue: 24000 },
    { month: `${currentYear}-06`, adSpend: 5800,  optIns: 276, callsBooked: 52, newClients: 8, cashCollected: 22500, totalRevenue: 27500 },
  ];

  const entries = reportingData.map(d => ({
    ...d,
    client: client._id,
    date: new Date(`${d.month}-01`),
    createdBy: editor?._id,
  }));

  await ReportingEntry.insertMany(entries);
  console.log(`✅ Created ${entries.length} reporting entries`);

  console.log('\n🎉 Portal seeding complete!');
  console.log(`   Client: ${client.name} (${client._id})`);
  console.log(`   Login as a user with role "client" and clientId linked to this client.`);
  process.exit(0);
};

seed().catch(err => {
  console.error('Seeding failed:', err.message);
  process.exit(1);
});
