import express from 'express';
import { getSettings, updateCompanySettings, updatePreferences, updateProfileSettings } from '../controllers/settings.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();
router.use(protect);

router.get('/', getSettings);
router.put('/profile', updateProfileSettings);
router.put('/company', authorize('superAdmin', 'organizationOwner', 'manager'), updateCompanySettings);
router.put('/preferences', updatePreferences);

export default router;
