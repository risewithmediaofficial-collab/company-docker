import express from 'express';
import { getSettings, updatePreferences, updateProfileSettings } from '../controllers/settings.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();
router.use(protect);

router.get('/', getSettings);
router.put('/profile', updateProfileSettings);
router.put('/preferences', updatePreferences);

export default router;
