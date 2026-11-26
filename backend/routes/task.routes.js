import express from 'express';
import {
  addCompletedFiles,
  addComment,
  addTaskAttachments,
  addProgressUpdate,
  approveTask,
  createDailyTask,
  createTask,
  deleteTask,
  getCalendarTasks,
  getTask,
  getTaskResponseDetails,
  getTasks,
  getWeeklyTaskReport,
  logTime,
  submitClientTaskResponse,
  updateTask,
  updateTaskStatus,
  updateTaskChecklist,
  addTaskNote,
  acceptTask,
  submitTaskWithReason,
  checkTaskOverdue,
} from '../controllers/task.controller.js';
import { authorize, protect } from '../middleware/auth.middleware.js';

const router = express.Router();
router.use(protect);

router.get('/', authorize('superAdmin', 'admin', 'manager', 'employee', 'vendor', 'client'), getTasks);
router.get('/calendar', authorize('superAdmin', 'admin', 'manager', 'employee', 'vendor', 'client', 'referral'), getCalendarTasks);
router.get('/weekly-report', authorize('superAdmin', 'admin', 'manager', 'employee'), getWeeklyTaskReport);
router.post('/daily', authorize('superAdmin', 'admin', 'manager', 'employee'), createDailyTask);
router.get('/:id', authorize('superAdmin', 'admin', 'manager', 'employee', 'vendor', 'client'), getTask);
router.post('/', authorize('superAdmin', 'admin', 'manager', 'organizationOwner'), createTask);
router.put('/:id', authorize('superAdmin', 'admin', 'manager', 'organizationOwner'), updateTask);
router.patch('/:id/status', authorize('superAdmin', 'admin', 'manager', 'employee', 'vendor', 'organizationOwner'), updateTaskStatus);
router.patch('/:id/checklist', authorize('superAdmin', 'admin', 'manager', 'employee', 'vendor', 'client'), updateTaskChecklist);
router.post('/:id/notes', authorize('superAdmin', 'admin', 'manager', 'employee', 'vendor', 'client'), addTaskNote);
router.post('/:id/accept', authorize('superAdmin', 'admin', 'manager', 'employee', 'vendor', 'organizationOwner'), acceptTask);
router.post('/:id/submit', authorize('superAdmin', 'admin', 'manager', 'employee', 'vendor', 'organizationOwner'), submitTaskWithReason);
router.post('/:id/check-overdue', authorize('superAdmin', 'admin', 'manager', 'employee', 'vendor', 'organizationOwner'), checkTaskOverdue);
router.post('/:id/comment', authorize('superAdmin', 'admin', 'manager', 'employee', 'vendor', 'client'), addComment);
router.post('/:id/progress', authorize('superAdmin', 'admin', 'manager', 'employee', 'vendor'), addProgressUpdate);
router.post('/:id/attachments', authorize('superAdmin', 'admin', 'manager', 'employee', 'vendor'), addTaskAttachments);
router.post('/:id/completed-files', authorize('superAdmin', 'admin', 'manager', 'employee', 'vendor'), addCompletedFiles);
router.post('/:id/approve', authorize('superAdmin', 'admin', 'manager', 'client'), approveTask);
router.get('/:id/response', authorize('superAdmin', 'admin', 'manager', 'employee', 'vendor', 'client'), getTaskResponseDetails);
router.post('/:id/client-response', authorize('client'), submitClientTaskResponse);
router.post('/:id/log-time', authorize('superAdmin', 'admin', 'manager', 'employee', 'vendor'), logTime);
router.delete('/:id', authorize('superAdmin', 'admin', 'manager', 'organizationOwner'), deleteTask);

export default router;
