// =============================================
// DATABASE SEED FILE
// Run: npm run seed
// =============================================

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

import User from '../models/user.model.js';
import Lead from '../models/lead.model.js';
import Client from '../models/client.model.js';
import Project from '../models/project.model.js';
import Task from '../models/task.model.js';
import Invoice from '../models/invoice.model.js';
import Attendance from '../models/attendance.model.js';

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB for seeding...');

    // Clear existing data
    await Promise.all([
      User.deleteMany(), Lead.deleteMany(), Client.deleteMany(),
      Project.deleteMany(), Task.deleteMany(), Invoice.deleteMany(),
      Attendance.deleteMany(),
    ]);
    console.log('🗑️  Cleared existing data');

    // ── USERS ──────────────────────────────────────────────────────────────
    const users = await User.create([
      { name: process.env.DEFAULT_ADMIN_NAME || 'DINESH M', email: 'admin@agencycrm.com', password: process.env.DEFAULT_ADMIN_PASSWORD || 'dinesh123', role: 'superAdmin', isActive: true },
      { name: 'Maria Manager', email: 'manager@agencycrm.com', password: 'password123', role: 'manager', department: 'Operations', isActive: true },
      { name: 'Emma Employee', email: 'employee@agencycrm.com', password: 'password123', role: 'employee', department: 'Design', position: 'UI Designer', isActive: true },
      { name: 'Sam Sales', email: 'sales@agencycrm.com', password: 'password123', role: 'employee', department: 'Sales', position: 'Sales Executive', isActive: true },
      { name: 'Client Co', email: 'client@agencycrm.com', password: 'password123', role: 'client', isActive: true },
      { name: 'Ralph Referral', email: 'referral@agencycrm.com', password: 'password123', role: 'referral', isActive: true },
    ]);
    console.log(`👥 Created ${users.length} users`);

    const [admin, manager, employee, sales, clientUser, referral] = users;

    // ── CLIENTS ────────────────────────────────────────────────────────────
    const clients = await Client.create([
      {
        name: 'TechVision Inc', email: 'contact@techvision.com', phone: '+1 555-0101',
        company: 'TechVision Inc', industry: 'Technology', status: 'active',
        assignedManager: manager._id, assignedTeam: [employee._id],
        contractValue: 5000, billingCycle: 'monthly', tier: 'growth',
        services: ['Social Media Management', 'SEO', 'Paid Ads'],
        portalEnabled: true, userId: clientUser._id,
        onboardingSteps: { welcomeEmailSent: true, projectCreated: true, teamAssigned: true, portalActivated: true, kickoffCallScheduled: true },
      },
      {
        name: 'GreenLeaf Organics', email: 'hello@greenleaf.com', phone: '+1 555-0202',
        company: 'GreenLeaf Organics', industry: 'E-Commerce', status: 'active',
        assignedManager: manager._id, contractValue: 3500, billingCycle: 'monthly', tier: 'starter',
        services: ['Content Marketing', 'Instagram Management'],
      },
      {
        name: 'UrbanStyle Boutique', email: 'info@urbanstyle.com', phone: '+1 555-0303',
        company: 'UrbanStyle Boutique', industry: 'Fashion', status: 'onboarding',
        assignedManager: manager._id, contractValue: 2000, billingCycle: 'monthly', tier: 'starter',
      },
    ]);
    console.log(`🏢 Created ${clients.length} clients`);

    // Update clientUser with clientId
    clientUser.clientId = clients[0]._id;
    await clientUser.save();

    // ── LEADS ──────────────────────────────────────────────────────────────
    const leads = await Lead.create([
      { name: 'James Wilson', email: 'james@startup.io', phone: '+1 555-1001', company: 'StartupIO', source: 'website', stage: 'new', priority: 'high', value: 4000, assignedTo: sales._id },
      { name: 'Priya Sharma', email: 'priya@brandco.in', phone: '+91 98765-00001', company: 'BrandCo', source: 'referral', stage: 'qualified', priority: 'medium', value: 2500, assignedTo: sales._id },
      { name: 'Carlos Rivera', email: 'carlos@digital.mx', phone: '+52 555-2002', company: 'Digital MX', source: 'social_media', stage: 'meeting_booked', priority: 'high', value: 6000, assignedTo: manager._id, meetingDate: new Date(Date.now() + 2 * 24 * 3600000) },
      { name: 'Sophie Laurent', email: 'sophie@agence.fr', phone: '+33 1 23 45 67', company: 'Agence FR', source: 'email_campaign', stage: 'proposal_sent', priority: 'urgent', value: 8000, assignedTo: manager._id },
      { name: 'David Kim', email: 'david@koreabrand.kr', phone: '+82 10-1234-5678', company: 'Korea Brand', source: 'cold_call', stage: 'negotiation', priority: 'high', value: 5500, assignedTo: sales._id },
      { name: 'TechVision (Won)', email: 'contact@techvision.com', stage: 'won', priority: 'high', value: 5000, assignedTo: manager._id, isConverted: true, convertedToClient: clients[0]._id },
    ]);
    console.log(`🎯 Created ${leads.length} leads`);

    // ── PROJECTS ───────────────────────────────────────────────────────────
    const projects = await Project.create([
      {
        name: 'TechVision Social Media Q2', description: 'Quarterly social media management campaign',
        client: clients[0]._id, manager: manager._id, team: [employee._id],
        status: 'active', priority: 'high', category: 'social_media',
        startDate: new Date(), dueDate: new Date(Date.now() + 90 * 24 * 3600000),
        budget: 5000, color: '#6366f1',
      },
      {
        name: 'GreenLeaf Content Strategy', description: 'Monthly content calendar and blog posts',
        client: clients[1]._id, manager: manager._id, team: [employee._id],
        status: 'active', priority: 'medium', category: 'content',
        startDate: new Date(), dueDate: new Date(Date.now() + 60 * 24 * 3600000),
        budget: 3500, color: '#10b981',
      },
      {
        name: 'UrbanStyle Brand Onboarding', description: 'Initial brand setup and strategy',
        client: clients[2]._id, manager: manager._id,
        status: 'planning', priority: 'medium', category: 'branding',
        dueDate: new Date(Date.now() + 30 * 24 * 3600000),
        budget: 2000, color: '#f59e0b',
      },
    ]);
    console.log(`📋 Created ${projects.length} projects`);

    // ── TASKS ──────────────────────────────────────────────────────────────
    const tasks = await Task.create([
      { title: 'Create content calendar for May', project: projects[0]._id, assignedTo: [employee._id], createdBy: manager._id, status: 'done', priority: 'high', dueDate: new Date(Date.now() + 3 * 24 * 3600000), completedAt: new Date() },
      { title: 'Design Instagram post templates', project: projects[0]._id, assignedTo: [employee._id], createdBy: manager._id, status: 'in_progress', priority: 'high', dueDate: new Date(Date.now() + 5 * 24 * 3600000) },
      { title: 'Schedule posts using Buffer', project: projects[0]._id, assignedTo: [employee._id], createdBy: manager._id, status: 'todo', priority: 'medium', dueDate: new Date(Date.now() + 7 * 24 * 3600000) },
      { title: 'Write 4 blog articles', project: projects[1]._id, assignedTo: [employee._id], createdBy: manager._id, status: 'in_progress', priority: 'high', dueDate: new Date(Date.now() + 10 * 24 * 3600000) },
      { title: 'SEO keyword research', project: projects[1]._id, assignedTo: [employee._id], createdBy: manager._id, status: 'review', priority: 'medium', dueDate: new Date(Date.now() + 4 * 24 * 3600000), approvalRequired: true },
      { title: 'Competitor analysis report', project: projects[2]._id, assignedTo: [employee._id], createdBy: manager._id, status: 'todo', priority: 'urgent', dueDate: new Date(Date.now() + 2 * 24 * 3600000) },
    ]);
    console.log(`✅ Created ${tasks.length} tasks`);

    // ── INVOICES ───────────────────────────────────────────────────────────
    const invoiceData = [
      {
        client: clients[0]._id, project: projects[0]._id, issuedBy: admin._id,
        status: 'paid', issueDate: new Date(Date.now() - 30 * 24 * 3600000),
        dueDate: new Date(Date.now() - 10 * 24 * 3600000), paidDate: new Date(Date.now() - 5 * 24 * 3600000),
        lineItems: [{ description: 'Social Media Management - April', quantity: 1, unitPrice: 5000, total: 5000 }],
        subtotal: 5000, total: 5000, paidAmount: 5000,
      },
      {
        client: clients[0]._id, project: projects[0]._id, issuedBy: admin._id,
        status: 'sent', issueDate: new Date(), dueDate: new Date(Date.now() + 30 * 24 * 3600000),
        lineItems: [{ description: 'Social Media Management - May', quantity: 1, unitPrice: 5000, total: 5000 }],
        subtotal: 5000, total: 5000,
      },
      {
        client: clients[1]._id, issuedBy: admin._id,
        status: 'overdue', issueDate: new Date(Date.now() - 45 * 24 * 3600000),
        dueDate: new Date(Date.now() - 15 * 24 * 3600000),
        lineItems: [{ description: 'Content Strategy - March', quantity: 1, unitPrice: 3500, total: 3500 }],
        subtotal: 3500, total: 3500,
      },
    ];

    for (const inv of invoiceData) {
      await Invoice.create(inv);
    }
    console.log(`💰 Created ${invoiceData.length} invoices`);

    // ── ATTENDANCE ─────────────────────────────────────────────────────────
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const attendanceData = [
      {
        user: employee._id,
        date: today,
        clockIn: new Date(today.getTime() + 9 * 3600000 + 59 * 60000), // 09:59
        clockOut: new Date(today.getTime() + 17 * 3600000 + 30 * 60000), // 17:30
        totalHours: 7.52,
        status: 'present',
        isApproved: true,
      },
      {
        user: sales._id,
        date: today,
        clockIn: new Date(today.getTime() + 11 * 3600000 + 2 * 60000), // 11:02
        clockOut: new Date(today.getTime() + 18 * 3600000 + 45 * 60000), // 18:45
        totalHours: 7.72,
        status: 'present',
        isApproved: true,
      },
      {
        user: manager._id,
        date: today,
        clockIn: new Date(today.getTime() + 15 * 3600000 + 49 * 60000), // 15:49
        clockOut: new Date(today.getTime() + 19 * 3600000 + 20 * 60000), // 19:20
        totalHours: 3.52,
        status: 'present',
        isApproved: true,
      },
    ];

    for (const att of attendanceData) {
      await Attendance.create(att);
    }
    console.log(`⏰ Created ${attendanceData.length} attendance records`);

    console.log('\n🎉 Seed completed successfully!\n');
    console.log('─────────────────────────────────────');
    console.log('Test Accounts:');
    console.log('  Super Admin:  admin@agencycrm.com     / password123');
    console.log('  Manager:      manager@agencycrm.com   / password123');
    console.log('  Employee:     employee@agencycrm.com  / password123');
    console.log('  Client:       client@agencycrm.com    / password123');
    console.log('  Referral:     referral@agencycrm.com  / password123');
    console.log('─────────────────────────────────────\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

seed();
