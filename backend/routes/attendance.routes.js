import express from 'express';
import { authorize, protect } from '../middleware/auth.middleware.js';
import {
  clockIn,
  clockOut,
  getAttendance,
  getTeamAttendance,
  submitEOD,
} from '../controllers/attendance.controller.js';

const router = express.Router();
router.use(protect);

router.get('/team/today', authorize('superAdmin', 'manager'), getTeamAttendance);
router.get('/', authorize('superAdmin', 'manager', 'employee'), getAttendance);
router.post('/clock-in', authorize('superAdmin', 'manager', 'employee'), clockIn);
router.post('/clock-out', authorize('superAdmin', 'manager', 'employee'), clockOut);
router.post('/eod', authorize('superAdmin', 'manager', 'employee'), submitEOD);

export default router;
