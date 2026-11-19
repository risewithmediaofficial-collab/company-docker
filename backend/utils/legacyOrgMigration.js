import mongoose from 'mongoose';
import Organization from '../models/organization.model.js';

export const migrateLegacyOrganizationData = async () => {
  try {
    const primaryOrg = await Organization.findOne({}).sort({ createdAt: 1 });
    if (!primaryOrg) return;

    const db = mongoose.connection.db;
    if (!db) return;

    const collectionsToMigrate = [
      'projects',
      'tasks',
      'clients',
      'smmadspends',
      'smmactivitylogs',
      'projectmonthlydeliverables',
      'smmclients',
      'smmadsets',
      'salaryrecords',
      'expenses',
      'dev_tasks',
      'settings',
      'smmcampaigns',
      'attendances',
      'smmcontents',
      'smmads',
      'smmmonthlytrackers',
      'activitylogs',
      'financeauditlogs',
    ];

    for (const colName of collectionsToMigrate) {
      await db.collection(colName).updateMany(
        { $or: [{ organizationId: { $exists: false } }, { organizationId: null }] },
        { $set: { organizationId: primaryOrg._id } }
      );
    }
  } catch (err) {
    console.error('[Legacy Org Migration Error]', err.message);
  }
};
