// =============================================
// AUTOMATION SERVICE
// Trigger-based workflow automations
// =============================================

import Client from '../models/client.model.js';
import Project from '../models/project.model.js';
import Task from '../models/task.model.js';
import User from '../models/user.model.js';
import Referral from '../models/referral.model.js';
import { createNotification } from '../utils/notification.js';
import { sendEmail } from '../utils/email.js';

/**
 * Run automation based on trigger type
 * @param {string} trigger - e.g. 'lead_created', 'deal_won', 'task_completed'
 * @param {object} payload - { lead, client, task, project, user, io }
 */
export const runAutomation = async (trigger, payload) => {
  const { lead, task, project, user, io } = payload;

  try {
    switch (trigger) {

      // ── LEAD CAPTURED ────────────────────────────────────────────────────
      case 'lead_created': {
        if (!lead) break;
        console.log(`⚡ Automation: lead_created for ${lead.name}`);

        // Auto-assign to available salesperson if not assigned
        if (!lead.assignedTo) {
          const salesperson = await User.findOne({ role: 'employee', isActive: true });
          if (salesperson) {
            lead.assignedTo = salesperson._id;
            await lead.save();
            await createNotification({
              recipient: salesperson._id,
              type: 'lead_assigned',
              title: 'New Lead Auto-Assigned',
              message: `New lead ${lead.name} has been auto-assigned to you`,
              link: `/crm/leads/${lead._id}`,
            }, io);
          }
        }
        break;
      }

      // ── DEAL WON ─────────────────────────────────────────────────────────
      case 'deal_won': {
        if (!lead) break;
        console.log(`⚡ Automation: deal_won for ${lead.name}`);

        // Create client from lead
        let client = await Client.findOne({ email: lead.email });
        if (!client) {
          client = await Client.create({
            name: lead.name,
            email: lead.email,
            phone: lead.phone,
            company: lead.company,
            website: lead.website,
            convertedFromLead: lead._id,
            assignedManager: lead.assignedTo,
            status: 'onboarding',
            contractValue: lead.value,
            referredBy: lead.referredBy
          });
        }

        // Update Referral if it exists
        const referral = await Referral.findOne({ lead: lead._id });
        if (referral) {
            referral.status = 'converted';
            referral.client = client._id;
            referral.dealValue = lead.value;
            if (referral.commissionType === 'percentage') {
                referral.commissionAmount = lead.value * (referral.commissionRate / 100);
            }
            await referral.save();
        }

        // Mark lead as converted
        lead.isConverted = true;
        lead.convertedToClient = client._id;
        await lead.save();

        // Create default onboarding project
        const project = await Project.create({
          name: `${client.name} - Onboarding`,
          description: 'Auto-created onboarding project',
          client: client._id,
          manager: lead.assignedTo,
          status: 'active',
          category: 'other',
        });

        // Create default onboarding tasks
        const onboardingTasks = [
          'Kickoff call scheduled',
          'Access credentials shared',
          'Social media accounts connected',
          'Content strategy approved',
          'First deliverables planned',
        ];

        await Promise.all(onboardingTasks.map((title, i) =>
          Task.create({ title, project: project._id, status: 'todo', priority: 'high', orderIndex: i, createdBy: user?._id })
        ));

        // Send welcome email
        try {
          await sendEmail({
            to: client.email,
            subject: 'Welcome to the Team! 🎉',
            html: `<h2>Welcome ${client.name}!</h2><p>We're thrilled to have you on board. Your project has been set up and your dedicated manager will be in touch shortly.</p>`,
          });
          client.onboardingSteps.welcomeEmailSent = true;
          client.onboardingSteps.projectCreated = true;
          await client.save();
        } catch (emailErr) {
          console.warn('Welcome email failed:', emailErr.message);
        }

        // Notify manager
        if (lead.assignedTo) {
          await createNotification({
            recipient: lead.assignedTo,
            type: 'deal_won',
            title: '🎉 Deal Won!',
            message: `${lead.name} has been converted to a client. Onboarding project created.`,
            link: `/clients/${client._id}`,
          }, io);
        }

        break;
      }

      // ── TASK COMPLETED ───────────────────────────────────────────────────
      case 'task_completed': {
        if (!task) break;
        console.log(`⚡ Automation: task_completed for "${task.title}"`);

        // Notify project manager
        if (project?.manager) {
          await createNotification({
            recipient: project.manager,
            type: 'task_completed',
            title: 'Task Completed',
            message: `"${task.title}" has been marked as done`,
            link: `/projects/${task.project}/tasks/${task._id}`,
          }, io);
        }
        break;
      }

      // ── INVOICE PAID ─────────────────────────────────────────────────────
      case 'invoice_paid': {
        const { invoice } = payload;
        if (!invoice) break;
        console.log(`⚡ Automation: invoice_paid ${invoice.invoiceNumber}`);
        // Add referral commission logic here if referredBy exists on client
        break;
      }

      default:
        console.log(`⚡ Unknown automation trigger: ${trigger}`);
    }
  } catch (error) {
    console.error(`❌ Automation error [${trigger}]:`, error.message);
  }
};
