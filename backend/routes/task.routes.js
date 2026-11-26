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

const TEAM_READ_ROLES = ['superAdmin', 'admin', 'organizationOwner', 'manager', 'employee', 'intern', 'editor', 'designer', 'adsManager', 'accountManager', 'financeManager', 'vendor'];
const INTERNAL_STAFF_ROLES = ['superAdmin', 'admin', 'organizationOwner', 'manager', 'employee', 'intern', 'editor', 'designer', 'adsManager', 'accountManager', 'financeManager'];
const CLIENT_ROLES = ['client', 'clientAdmin', 'clientMember'];

router.get('/', authorize(...TEAM_READ_ROLES, ...CLIENT_ROLES), getTasks);
router.get('/calendar', authorize(...TEAM_READ_ROLES, ...CLIENT_ROLES, 'referral'), getCalendarTasks);
router.get('/weekly-report', authorize(...INTERNAL_STAFF_ROLES), getWeeklyTaskReport);
router.post('/daily', authorize(...INTERNAL_STAFF_ROLES), createDailyTask);
router.get('/:id', authorize(...TEAM_READ_ROLES, ...CLIENT_ROLES), getTask);
router.post('/', authorize('superAdmin', 'admin', 'manager', 'organizationOwner'), createTask);
router.put('/:id', authorize('superAdmin', 'admin', 'manager', 'organizationOwner'), updateTask);
router.patch('/:id/status', authorize(...TEAM_READ_ROLES), updateTaskStatus);
router.patch('/:id/checklist', authorize(...TEAM_READ_ROLES, ...CLIENT_ROLES), updateTaskChecklist);
router.post('/:id/notes', authorize(...TEAM_READ_ROLES, ...CLIENT_ROLES), addTaskNote);
router.post('/:id/accept', authorize(...TEAM_READ_ROLES), acceptTask);
router.post('/:id/submit', authorize(...TEAM_READ_ROLES), submitTaskWithReason);
router.post('/:id/check-overdue', authorize(...TEAM_READ_ROLES), checkTaskOverdue);
router.post('/:id/comment', authorize(...TEAM_READ_ROLES, ...CLIENT_ROLES), addComment);
router.post('/:id/progress', authorize(...TEAM_READ_ROLES), addProgressUpdate);
router.post('/:id/attachments', authorize(...TEAM_READ_ROLES), addTaskAttachments);
router.post('/:id/completed-files', authorize(...TEAM_READ_ROLES), addCompletedFiles);
router.post('/:id/approve', authorize('superAdmin', 'admin', 'manager', 'organizationOwner', ...CLIENT_ROLES), approveTask);
router.get('/:id/response', authorize(...TEAM_READ_ROLES, ...CLIENT_ROLES), getTaskResponseDetails);
router.post('/:id/client-response', authorize(...CLIENT_ROLES), submitClientTaskResponse);
router.post('/:id/log-time', authorize(...TEAM_READ_ROLES), logTime);
router.delete('/:id', authorize('superAdmin', 'admin', 'manager', 'organizationOwner'), deleteTask);

export default router;
