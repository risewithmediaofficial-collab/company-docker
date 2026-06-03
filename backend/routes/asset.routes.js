import express from 'express';
import { authorize, protect } from '../middleware/auth.middleware.js';
import {
  createAsset,
  deleteAsset,
  getAsset,
  getAssets,
  updateAsset,
} from '../controllers/asset.controller.js';

const router = express.Router();

router.use(protect);

router.get('/', authorize('superAdmin', 'manager', 'client'), getAssets);
router.get('/:id', authorize('superAdmin', 'manager', 'client'), getAsset);
router.post('/', authorize('superAdmin', 'manager'), createAsset);
router.put('/:id', authorize('superAdmin', 'manager'), updateAsset);
router.delete('/:id', authorize('superAdmin', 'manager'), deleteAsset);

export default router;
