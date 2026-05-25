import express from 'express';
import {
  createCredential,
  deleteCredential,
  getClientCredentials,
  getCredential,
  getCredentialLogs,
  getCredentialsVault,
  updateCredential,
} from '../controllers/credential.controller.js';
import { authorize, protect } from '../middleware/auth.middleware.js';

const router = express.Router();
router.use(protect);

router.get('/', authorize('superAdmin', 'manager', 'employee'), getCredentialsVault);
router.get('/clients/:clientId', authorize('superAdmin', 'manager', 'employee'), getClientCredentials);
router.post('/clients/:clientId', authorize('superAdmin', 'manager'), createCredential);
router.get('/:credentialId', authorize('superAdmin', 'manager', 'employee'), getCredential);
router.put('/:credentialId', authorize('superAdmin', 'manager'), updateCredential);
router.delete('/:credentialId', authorize('superAdmin', 'manager'), deleteCredential);
router.get('/:credentialId/logs', authorize('superAdmin', 'manager'), getCredentialLogs);

export default router;
