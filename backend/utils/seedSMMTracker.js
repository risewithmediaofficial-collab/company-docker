// =============================================
// SEED SCRIPT: Fake SMM Clients + Monthly Tracker Data
// Run: node utils/seedSMMTracker.js
// =============================================
import mongoose from 'mongoose';
import { loadEnv, getEnv } from '../config/env.js';
import SmmClient from '../models/smm/smmClient.model.js';
import SmmMonthlyTracker from '../models/smm/smmMonthlyTracker.model.js';

loadEnv();
const env = getEnv();

await mongoose.connect(env.mongoUri);
console.log('✅ Connected to MongoDB');

// ── Fake Clients (matching the Excel) ─────────────────────────────────────
const CLIENTS = [
  { companyName: 'ARUNAM CATERING',  industry: 'Food & Beverage',    status: 'Active' },
  { companyName: 'CILO',             industry: 'Retail',              status: 'Active' },
  { companyName: 'FUTURE KID',       industry: 'Education',           status: 'Active' },
  { companyName: 'FUTURE SCHOOL',    industry: 'Education',           status: 'Active' },
  { companyName: 'RWM',              industry: 'Marketing Agency',    status: 'Active' },
  { companyName: 'VALSII',           industry: 'E-Commerce',          status: 'Active' },
  { companyName: 'GREEN VALSII',     industry: 'Organic Products',    status: 'Active' },
  { companyName: 'MK CORPORATES',    industry: 'Corporate Services',  status: 'Active' },
  { companyName: 'SARAN TILES',      industry: 'Construction',        status: 'Active' },
];

// ── Plans per client ────────────────────────────────────────────────────────
const PLANS = {
  'ARUNAM CATERING': { plan: '8R + 4P',  storyPlan: '30 STORIES' },
  'CILO':            { plan: '15R + 2P', storyPlan: '30 STORIES' },
  'FUTURE KID':      { plan: '4R + 4P',  storyPlan: '30 STORIES' },
  'FUTURE SCHOOL':   { plan: '8R + 4P',  storyPlan: '30 STORIES' },
  'RWM':             { plan: '15R + 6P', storyPlan: '30 STORIES' },
  'VALSII':          { plan: '15R + 4P', storyPlan: '30 STORIES' },
  'GREEN VALSII':    { plan: '15R + 4P', storyPlan: '30 STORIES' },
  'MK CORPORATES':   { plan: '8R + 6P',  storyPlan: '30 STORIES' },
  'SARAN TILES':     { plan: '8R + 4P',  storyPlan: '30 STORIES' },
};

// ── Helper: pick random status (weighted toward pending) ───────────────────
const randStatus = (dayNum) => {
  // Past days mostly done, future days pending
  const today = 12; // Sept 12
  if (dayNum < today - 2) return Math.random() > 0.15 ? 'done' : 'pending';
  if (dayNum <= today)    return Math.random() > 0.5  ? 'done' : 'pending';
  return 'pending'; // future days always pending
};

// ── Helper: build reel/post schedule for a client plan ─────────────────────
const buildDays = (clientName, year, month) => {
  const daysInMonth = new Date(year, month, 0).getDate();
  const p = PLANS[clientName] || { plan: '8R + 4P' };

  // Parse plan: "15R + 2P" → reels=15, posts=2
  const reelMatch = p.plan.match(/(\d+)R/);
  const postMatch = p.plan.match(/(\d+)P/);
  const totalReels = reelMatch ? parseInt(reelMatch[1]) : 8;
  const totalPosts = postMatch ? parseInt(postMatch[1]) : 4;

  // Schedule reels evenly across month
  const reelDays = new Set();
  while (reelDays.size < Math.min(totalReels, daysInMonth)) {
    reelDays.add(Math.ceil(Math.random() * daysInMonth));
  }
  const postDays = new Set();
  while (postDays.size < Math.min(totalPosts, daysInMonth)) {
    const d = Math.ceil(Math.random() * daysInMonth);
    if (!reelDays.has(d)) postDays.add(d);
  }

  // Times
  const times = ['6:30P', '7:30P', '8:30P', '9A', '9P', '12P', '1P', '8P', '10A'];
  const randTime = () => times[Math.floor(Math.random() * times.length)];

  let reelIdx = 1, postIdx = 1;

  return Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    let postLabel = '';
    if (reelDays.has(day)) postLabel = `R${reelIdx++} ${randTime()}`;
    else if (postDays.has(day)) postLabel = `P${postIdx++} ${randTime()}`;

    const storyIdx = day;
    const storyLabel = `S${storyIdx} 9A/7P`;

    const ps = postLabel ? randStatus(day) : 'pending';
    const ss = randStatus(day);

    return {
      day,
      postLabel,
      postStatus: ps,
      storyLabel,
      storyStatus: ss,
      note: '',
    };
  });
};

// ── Step 1: Upsert clients ──────────────────────────────────────────────────
console.log('\n📦 Seeding SMM Clients…');
const clientDocs = [];

for (const c of CLIENTS) {
  const existing = await SmmClient.findOne({ companyName: c.companyName });
  if (existing) {
    clientDocs.push(existing);
    console.log(`  ↩  Already exists: ${c.companyName}`);
  } else {
    const doc = await SmmClient.create({
      companyName: c.companyName,
      industry: c.industry,
      primaryContact: 'RWM Team',
      phone: '+91 99999 00000',
      email: `${c.companyName.toLowerCase().replace(/\s+/g, '')}@example.com`,
      timezone: 'Asia/Kolkata',
      status: 'Active',
    });
    clientDocs.push(doc);
    console.log(`  ✅ Created: ${c.companyName}`);
  }
}

// ── Step 2: Create tracker rows for September 2026 ─────────────────────────
const MONTH = 9, YEAR = 2026;
console.log(`\n📅 Seeding Monthly Tracker for ${MONTH}/${YEAR}…`);

for (const client of clientDocs) {
  const days = buildDays(client.companyName, YEAR, MONTH);
  const p = PLANS[client.companyName] || { plan: '8R + 4P', storyPlan: '30 STORIES' };

  await SmmMonthlyTracker.findOneAndUpdate(
    { client: client._id, month: MONTH, year: YEAR },
    {
      $set: {
        team: 'RWM',
        plan: p.plan,
        storyPlan: p.storyPlan,
        days,
        updatedBy: null,
      },
      $setOnInsert: {
        client: client._id,
        month: MONTH,
        year: YEAR,
        createdBy: null,
      },
    },
    { upsert: true, new: true }
  );
  console.log(`  ✅ Tracker row: ${client.companyName} | Plan: ${p.plan}`);
}

console.log('\n🎉 Seed complete! Refresh /smm/tracker to see the data.\n');
await mongoose.disconnect();
process.exit(0);
