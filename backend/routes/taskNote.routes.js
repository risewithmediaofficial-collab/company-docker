import express from 'express';
import {
  createNote,
  getMyNotes,
  updateNote,
  deleteNote,
  getAllNotes,
  assignNote,
  dismissNote,
} from '../controllers/taskNote.controller.js';
import { authorize, protect } from '../middleware/auth.middleware.js';

const router = express.Router();
router.use(protect);

// Employee routes
router.post('/', authorize('superAdmin', 'manager', 'employee'), createNote);
router.get('/mine', authorize('superAdmin', 'manager', 'employee'), getMyNotes);
router.put('/:id', authorize('superAdmin', 'manager', 'employee'), updateNote);
router.delete('/:id', authorize('superAdmin', 'manager', 'employee'), deleteNote);

// Manager / SuperAdmin routes
router.get('/', authorize('superAdmin', 'manager'), getAllNotes);
router.patch('/:id/assign', authorize('superAdmin', 'manager'), assignNote);
router.patch('/:id/dismiss', authorize('superAdmin', 'manager'), dismissNote);

export default router;
