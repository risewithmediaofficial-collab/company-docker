import ActivityLog from '../models/activityLog.model.js';

export const createActivityLog = async ({
  actor,
  action,
  entityType,
  entityId,
  title,
  description = '',
  relatedClient,
  relatedProject,
  relatedTask,
  relatedInvoice,
  relatedUser,
  metadata = {},
}) => {
  try {
    return await ActivityLog.create({
      actor: actor?._id || actor || undefined,
      actorRole: actor?.role || '',
      action,
      entityType,
      entityId,
      title,
      description,
      relatedClient,
      relatedProject,
      relatedTask,
      relatedInvoice,
      relatedUser,
      metadata,
    });
  } catch (error) {
    console.error('Activity log failed:', error.message);
    return null;
  }
};
