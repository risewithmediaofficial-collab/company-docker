import express from 'express';
import {
  createProject,
  deleteProject,
  getProject,
  getProjectKanban,
  getProjects,
  updateProject,
} from '../controllers/project.controller.js';
import { authorize, protect } from '../middleware/auth.middleware.js';

const router = express.Router();
router.use(protect);

router.get('/', authorize('superAdmin', 'manager', 'employee', 'client'), getProjects);
router.get('/:id', authorize('superAdmin', 'manager', 'employee', 'client'), getProject);
router.get('/:id/kanban', authorize('superAdmin', 'manager', 'employee', 'client'), getProjectKanban);
router.post('/', authorize('superAdmin', 'manager'), createProject);
router.put('/:id', authorize('superAdmin', 'manager'), updateProject);
router.delete('/:id', authorize('superAdmin'), deleteProject);

export default router;
