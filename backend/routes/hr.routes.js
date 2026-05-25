import express from 'express';
import {
  addApplicant,
  createEmployee,
  createJob,
  deleteEmployee,
  deleteJob,
  getEmployee,
  getJobs,
  getJob,
  getTeamMembers,
  updateApplicantStage,
  updateJob,
  updateTeamMember,
} from '../controllers/hr.controller.js';
import { authorize, protect } from '../middleware/auth.middleware.js';

const router = express.Router();
router.use(protect);

router.get('/team', authorize('superAdmin', 'manager', 'employee'), getTeamMembers);
router.put('/team/:id', authorize('superAdmin', 'manager'), updateTeamMember);
router.get('/employees', authorize('superAdmin', 'manager', 'employee'), getTeamMembers);
router.get('/employees/:id', authorize('superAdmin', 'manager', 'employee'), getEmployee);
router.post('/employees', authorize('superAdmin', 'manager'), createEmployee);
router.put('/employees/:id', authorize('superAdmin', 'manager'), updateTeamMember);
router.delete('/employees/:id', authorize('superAdmin', 'manager'), deleteEmployee);
router.get('/jobs', authorize('superAdmin', 'manager', 'employee'), getJobs);
router.get('/jobs/:id', authorize('superAdmin', 'manager', 'employee'), getJob);
router.post('/jobs', authorize('superAdmin', 'manager'), createJob);
router.put('/jobs/:id', authorize('superAdmin', 'manager'), updateJob);
router.delete('/jobs/:id', authorize('superAdmin'), deleteJob);
router.post('/jobs/:id/applicants', authorize('superAdmin', 'manager', 'employee'), addApplicant);
router.put('/jobs/:jobId/applicants/:applicantId', authorize('superAdmin', 'manager'), updateApplicantStage);

export default router;
