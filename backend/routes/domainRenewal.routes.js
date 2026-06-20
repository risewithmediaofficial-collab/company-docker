import express from 'express';
import {
  addDomainRenewalProgress,
  createDomainRenewal,
  deleteDomainRenewal,
  getDomainRenewals,
  updateDomainRenewal,
} from '../controllers/domainRenewal.controller.js';
import { authorize, protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('superAdmin', 'manager'));

router.get('/', getDomainRenewals);
router.post('/', createDomainRenewal);
router.put('/:id', updateDomainRenewal);
router.post('/:id/progress', addDomainRenewalProgress);
router.delete('/:id', deleteDomainRenewal);

export default router;
