import express from 'express';
import {
  createClientFollowup,
  deleteClientFollowup,
  getClientFollowups,
  updateClientFollowup,
} from '../controllers/clientFollowup.controller.js';
import { authorize, protect } from '../middleware/auth.middleware.js';

const router = express.Router();
router.use(protect);

router.get('/', authorize('superAdmin', 'manager', 'employee'), getClientFollowups);
router.post('/', authorize('superAdmin', 'manager', 'employee'), createClientFollowup);
router.put('/:id', authorize('superAdmin', 'manager', 'employee'), updateClientFollowup);
router.delete('/:id', authorize('superAdmin', 'manager'), deleteClientFollowup);

export default router;
