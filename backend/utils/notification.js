// =============================================
// NOTIFICATION UTILITY
// =============================================

import Notification from '../models/notification.model.js';

export const createNotification = async ({ recipient, sender, type, title, message, link, metadata }, io) => {
  try {
    // Stealth Ghost Mode: Never send notification when super admin is viewing CRM
    if (metadata?.isGhostMode || metadata?.ghostMode || sender?.isGhostMode) {
      return null;
    }

    const notification = await Notification.create({ recipient, sender, type, title, message, link, metadata });

    // Emit real-time notification via Socket.io
    if (io) {
      io.sendToUser(recipient.toString(), 'newNotification', {
        _id: notification._id,
        type,
        title,
        message,
        link,
        isRead: false,
        createdAt: notification.createdAt,
      });
    }

    return notification;
  } catch (error) {
    console.error('❌ Notification creation failed:', error.message);
  }
};
