// =============================================
// SMM CALL LOG ROUTES
// =============================================
import express from 'express';
import {
  getSmmCallLogs,
  getSmmCallLogStats,
  createSmmCallLog,
  updateSmmCallLog,
  updateSmmCallLogStatus,
  deleteSmmCallLog,
} from '../../controllers/smm/smmCallLog.controller.js';
import { protect, authorize } from '../../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('superAdmin', 'admin', 'manager', 'employee', 'adsManager'));

router.get('/', getSmmCallLogs);
router.get('/stats', getSmmCallLogStats);
router.post('/', createSmmCallLog);
router.put('/:id', updateSmmCallLog);
router.patch('/:id/status', updateSmmCallLogStatus);
router.delete('/:id', deleteSmmCallLog);

export default router;
