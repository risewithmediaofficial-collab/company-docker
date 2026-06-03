import express from 'express';
import {
  addCompletedFiles,
  addComment,
  addTaskAttachments,
  addProgressUpdate,
  approveTask,
  createTask,
  deleteTask,
  getCalendarTasks,
  getTask,
  getTaskResponseDetails,
  getTasks,
  logTime,
  submitClientTaskResponse,
  updateTask,
  updateTaskStatus,
} from '../controllers/task.controller.js';
import { authorize, protect } from '../middleware/auth.middleware.js';

const router = express.Router();
router.use(protect);

router.get('/', authorize('superAdmin', 'manager', 'employee', 'client'), getTasks);
router.get('/calendar', authorize('superAdmin', 'manager', 'employee', 'client'), getCalendarTasks);
router.get('/:id', authorize('superAdmin', 'manager', 'employee', 'client'), getTask);
router.post('/', authorize('superAdmin', 'manager', 'employee'), createTask);
router.put('/:id', authorize('superAdmin', 'manager', 'employee'), updateTask);
router.patch('/:id/status', authorize('superAdmin', 'manager', 'employee'), updateTaskStatus);
router.post('/:id/comment', authorize('superAdmin', 'manager', 'employee', 'client'), addComment);
router.post('/:id/progress', authorize('superAdmin', 'manager', 'employee'), addProgressUpdate);
router.post('/:id/attachments', authorize('superAdmin', 'manager', 'employee'), addTaskAttachments);
router.post('/:id/completed-files', authorize('superAdmin', 'manager', 'employee'), addCompletedFiles);
router.post('/:id/approve', authorize('superAdmin', 'manager', 'client'), approveTask);
router.get('/:id/response', authorize('superAdmin', 'manager', 'employee', 'client'), getTaskResponseDetails);
router.post('/:id/client-response', authorize('client'), submitClientTaskResponse);
router.post('/:id/log-time', authorize('superAdmin', 'manager', 'employee'), logTime);
router.delete('/:id', authorize('superAdmin', 'manager'), deleteTask);

export default router;
