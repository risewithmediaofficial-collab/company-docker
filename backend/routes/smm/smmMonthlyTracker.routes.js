import express from 'express';
import {
  getMonthlyTrackers,
  getTrackerByClient,
  upsertTracker,
  updateDayCell,
  updateTrackerMeta,
  deleteTracker,
  syncContentWithTracker,
} from '../../controllers/smm/smmMonthlyTracker.controller.js';
import { protect, authorize } from '../../middleware/auth.middleware.js';

const router = express.Router();
router.use(protect);
router.use(authorize('superAdmin', 'manager', 'employee'));

router.get('/',                          getMonthlyTrackers);
router.get('/client/:clientId',          getTrackerByClient);
router.post('/',                         upsertTracker);
router.post('/sync-content',             syncContentWithTracker);
router.patch('/:id/day/:day',            updateDayCell);
router.patch('/:id/meta',                updateTrackerMeta);
router.delete('/:id',                    deleteTracker);

export default router;
