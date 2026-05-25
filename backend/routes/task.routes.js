import express from 'express';
import {
  addComment,
  addProgressUpdate,
  approveTask,
  createTask,
  deleteTask,
  getTask,
  getTasks,
  logTime,
  updateTask,
  updateTaskStatus,
} from '../controllers/task.controller.js';
import { authorize, protect } from '../middleware/auth.middleware.js';

const router = express.Router();
router.use(protect);

router.get('/', authorize('superAdmin', 'manager', 'employee', 'client'), getTasks);
router.get('/:id', authorize('superAdmin', 'manager', 'employee', 'client'), getTask);
router.post('/', authorize('superAdmin', 'manager', 'employee'), createTask);
router.put('/:id', authorize('superAdmin', 'manager', 'employee'), updateTask);
router.patch('/:id/status', authorize('superAdmin', 'manager', 'employee'), updateTaskStatus);
router.post('/:id/comment', authorize('superAdmin', 'manager', 'employee', 'client'), addComment);
router.post('/:id/progress', authorize('superAdmin', 'manager', 'employee'), addProgressUpdate);
router.post('/:id/approve', authorize('superAdmin', 'manager', 'client'), approveTask);
router.post('/:id/log-time', authorize('superAdmin', 'manager', 'employee'), logTime);
router.delete('/:id', authorize('superAdmin', 'manager'), deleteTask);

export default router;
