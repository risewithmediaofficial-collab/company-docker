import express from 'express';
import {
  createAutomation,
  deleteAutomation,
  getAutomation,
  getAutomations,
  toggleAutomation,
  updateAutomation,
} from '../controllers/automation.controller.js';
import { authorize, protect } from '../middleware/auth.middleware.js';

const router = express.Router();
router.use(protect);

router.get('/', authorize('superAdmin', 'manager'), getAutomations);
router.get('/:id', authorize('superAdmin', 'manager'), getAutomation);
router.post('/', authorize('superAdmin', 'manager'), createAutomation);
router.put('/:id', authorize('superAdmin', 'manager'), updateAutomation);
router.patch('/:id/toggle', authorize('superAdmin', 'manager'), toggleAutomation);
router.delete('/:id', authorize('superAdmin', 'manager'), deleteAutomation);

export default router;
