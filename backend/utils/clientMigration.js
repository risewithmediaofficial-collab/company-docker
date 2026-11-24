// =============================================
// CLIENT ID BACKFILL MIGRATION
// Assigns unique sequential clientId (CLT-0001, CLT-0002...)
// to all existing clients in MongoDB and syncs with SMM clients
// =============================================

import Client from '../models/client.model.js';
import SmmClient from '../models/smm/smmClient.model.js';
import Counter, { getNextSequence } from '../models/counter.model.js';
import Organization from '../models/organization.model.js';

export const backfillClientIds = async () => {
  try {
    // 1. Check existing max sequence from existing clientId values
    const clientsWithId = await Client.find({ clientId: { $exists: true, $ne: null, $ne: '' } })
      .select('clientId')
      .lean();

    let maxExistingSeq = 0;
    clientsWithId.forEach((c) => {
      const match = (c.clientId || '').match(/CLT-(\d+)/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxExistingSeq) {
          maxExistingSeq = num;
        }
      }
    });

    const counterDoc = await Counter.findOne({ name: 'clientId' });
    let currentSeq = Math.max(maxExistingSeq, counterDoc?.seq || 0);

    // 2. Find clients lacking clientId
    const clientsWithoutId = await Client.find({
      $or: [{ clientId: { $exists: false } }, { clientId: null }, { clientId: '' }],
    })
      .sort({ createdAt: 1 })
      .select('_id name company email')
      .lean();

    if (clientsWithoutId.length > 0) {
      console.log(`[ClientMigration] Found ${clientsWithoutId.length} clients without clientId. Backfilling...`);

      for (const client of clientsWithoutId) {
        currentSeq += 1;
        const newClientId = `CLT-${String(currentSeq).padStart(4, '0')}`;

        await Client.updateOne({ _id: client._id }, { $set: { clientId: newClientId } });

        // Sync with matching SmmClient by ID, email, or company
        const smmOr = [{ _id: client._id }];
        if (client.email) smmOr.push({ email: client.email.toLowerCase().trim() });
        if (client.company) {
          smmOr.push({
            companyName: { $regex: new RegExp(`^${client.company.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
          });
        }
        await SmmClient.updateMany({ $or: smmOr }, { $set: { clientId: newClientId } });
      }

      await Counter.findOneAndUpdate(
        { name: 'clientId' },
        { $set: { seq: currentSeq } },
        { upsert: true, new: true }
      );

      console.log(`[ClientMigration] Backfill complete. Counter updated to ${currentSeq}.`);
    }

    // 3. Ensure any standalone SMM clients without clientId also receive one
    const smmWithoutId = await SmmClient.find({
      $or: [{ clientId: { $exists: false } }, { clientId: null }, { clientId: '' }],
    })
      .sort({ createdAt: 1 })
      .select('_id companyName email')
      .lean();

    if (smmWithoutId.length > 0) {
      for (const smm of smmWithoutId) {
        // Check if there is now a CRM client matching
        const matchingCrm = smm.email
          ? await Client.findOne({ email: smm.email.toLowerCase().trim() }).select('clientId').lean()
          : (smm.companyName
              ? await Client.findOne({
                  company: { $regex: new RegExp(`^${smm.companyName.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
                }).select('clientId').lean()
              : null);

        if (matchingCrm?.clientId) {
          await SmmClient.updateOne({ _id: smm._id }, { $set: { clientId: matchingCrm.clientId } });
        } else {
          currentSeq += 1;
          const newClientId = `CLT-${String(currentSeq).padStart(4, '0')}`;
          await SmmClient.updateOne({ _id: smm._id }, { $set: { clientId: newClientId } });
          await Counter.findOneAndUpdate(
            { name: 'clientId' },
            { $set: { seq: currentSeq } },
            { upsert: true, new: true }
          );
        }
      }
    }

    // 4. Two-way sync: Ensure every SmmClient also exists in CRM Client
    const defaultOrg = await Organization.findOne().sort({ createdAt: 1 }).select('_id').lean();
    const allSmmClients = await SmmClient.find({}).lean();
    for (const smm of allSmmClients) {
      const crmExists = await Client.findOne({
        $or: [
          { _id: smm._id },
          ...(smm.clientId ? [{ clientId: smm.clientId }] : []),
          ...(smm.email ? [{ email: smm.email.toLowerCase().trim() }] : []),
          ...(smm.companyName ? [{ company: smm.companyName.trim() }] : []),
        ],
      });

      if (!crmExists && smm.companyName) {
        try {
          await Client.create({
            _id: smm._id,
            clientId: smm.clientId || undefined,
            name: smm.companyName,
            company: smm.companyName,
            email: smm.email || '',
            phone: smm.phone || '',
            website: smm.website || '',
            logo: smm.brandLogo || '',
            status: smm.status?.toLowerCase() === 'active' ? 'active' : 'inactive',
            organizationId: smm.organizationId || defaultOrg?._id || undefined,
          });
          console.log(`[ClientMigration] Synced SMM client '${smm.companyName}' into CRM Client collection.`);
        } catch (syncErr) {
          // Ignore duplicate key errors if already created concurrently
        }
      } else if (crmExists && !crmExists.organizationId && (smm.organizationId || defaultOrg?._id)) {
        await Client.updateOne(
          { _id: crmExists._id },
          { $set: { organizationId: smm.organizationId || defaultOrg?._id } }
        );
      }
    }

    // 5. Backfill missing organizationId on any remaining CRM clients
    if (defaultOrg?._id) {
      await Client.updateMany(
        { $or: [{ organizationId: { $exists: false } }, { organizationId: null }] },
        { $set: { organizationId: defaultOrg._id } }
      );
      await SmmClient.updateMany(
        { $or: [{ organizationId: { $exists: false } }, { organizationId: null }] },
        { $set: { organizationId: defaultOrg._id } }
      );
    }
  } catch (err) {
    console.error('[ClientMigration] Error during clientId backfill:', err.message);
  }
};
