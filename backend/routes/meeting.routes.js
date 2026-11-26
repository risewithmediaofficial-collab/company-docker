import express from 'express';
import {
  createMeeting,
  deleteMeeting,
  getMeetings,
  updateMeeting,
} from '../controllers/meeting.controller.js';
import { authorize, protect } from '../middleware/auth.middleware.js';

const router = express.Router();
router.use(protect);

router.get('/', authorize('superAdmin', 'admin', 'organizationOwner', 'manager', 'employee', 'intern', 'editor', 'designer', 'adsManager', 'client'), getMeetings);
router.post('/', authorize('superAdmin', 'admin', 'organizationOwner', 'manager', 'employee', 'intern', 'editor', 'designer', 'adsManager'), createMeeting);
router.put('/:id', authorize('superAdmin', 'admin', 'organizationOwner', 'manager', 'employee', 'intern', 'editor', 'designer', 'adsManager'), updateMeeting);
router.delete('/:id', authorize('superAdmin', 'admin', 'organizationOwner', 'manager', 'employee', 'intern', 'editor', 'designer', 'adsManager'), deleteMeeting);

export default router;
