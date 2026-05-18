import cron from 'node-cron';
import Lead from '../models/lead.model.js';
import Task from '../models/task.model.js';
import Invoice from '../models/invoice.model.js';
import { createNotification } from '../utils/notification.js';
import { sendWhatsAppMessage } from './whatsapp.service.js';

/**
 * Initializes all cron jobs for the application.
 * Note: Provide an io instance to emit real-time socket events if needed.
 */
export const initCronJobs = (io) => {
  console.log('⏳ Initializing cron jobs...');

  // 1. Follow-up reminders (Runs daily at 9:00 AM)
  cron.schedule('0 9 * * *', async () => {
    try {
      console.log('CRON: Checking for leads needing follow-up today...');
      
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const leadsToFollowUp = await Lead.find({
        followUpDate: { $gte: startOfDay, $lte: endOfDay },
        isConverted: false,
      }).populate('assignedTo', 'name email phone');

      for (const lead of leadsToFollowUp) {
        if (lead.assignedTo) {
          // Send internal notification
          await createNotification({
            recipient: lead.assignedTo._id,
            type: 'lead_assigned', // or 'follow_up'
            title: 'Follow-up Reminder',
            message: `You have a scheduled follow-up with lead: ${lead.name} today.`,
            link: `/crm/leads/${lead._id}`,
          }, io);

          // WhatsApp alert (If we have user's phone, we can notify the assigned employee)
          if (lead.assignedTo.phone) {
             await sendWhatsAppMessage(
               lead.assignedTo.phone, 
               `Hello ${lead.assignedTo.name}, reminder to follow up with Lead: *${lead.name}* today.`
             );
          }
        }
      }
    } catch (error) {
      console.error('CRON Error (Follow-ups):', error);
    }
  });

  // 2. Task Deadlines (Runs daily at 8:00 AM)
  cron.schedule('0 8 * * *', async () => {
    try {
      console.log('CRON: Checking for tasks due today...');
      
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const tasksDueToday = await Task.find({
        dueDate: { $gte: startOfDay, $lte: endOfDay },
        status: { $ne: 'done' },
      }).populate('assignedTo', 'name phone');

      for (const task of tasksDueToday) {
        for (const user of task.assignedTo) {
           await createNotification({
             recipient: user._id,
             type: 'task_assigned',
             title: 'Task Deadline Today',
             message: `The task "${task.title}" is due today.`,
             link: `/tasks`,
           }, io);

           if (user.phone) {
             await sendWhatsAppMessage(
               user.phone, 
               `Reminder: Task *${task.title}* is due today.`
             );
           }
        }
      }
    } catch (error) {
      console.error('CRON Error (Task Deadlines):', error);
    }
  });

  // 3. Payment Reminders (Overdue Invoices) (Runs daily at 10:00 AM)
  cron.schedule('0 10 * * *', async () => {
    try {
      console.log('CRON: Checking for overdue invoices...');
      const today = new Date();

      const overdueInvoices = await Invoice.find({
        dueDate: { $lt: today },
        status: { $nin: ['paid', 'cancelled'] },
      }).populate('client', 'name phone email');

      for (const invoice of overdueInvoices) {
        if (invoice.status !== 'overdue') {
            invoice.status = 'overdue';
            await invoice.save();
        }

        // WhatsApp to Client if phone exists
        if (invoice.client && invoice.client.phone) {
           await sendWhatsAppMessage(
             invoice.client.phone, 
`Dear ${invoice.client.name}, this is a gentle reminder that Invoice *${invoice.invoiceNumber}* for ₹${invoice.total} is currently overdue. Please arrange payment at your earliest convenience.`
           );
        }
      }
    } catch (error) {
      console.error('CRON Error (Overdue Invoices):', error);
    }
  });

  console.log('✅ Cron jobs initialized.');
};
