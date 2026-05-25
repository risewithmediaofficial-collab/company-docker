import express from 'express';
import {
  createCommunication,
  deleteCommunication,
  getCommunication,
  getCommunications,
  replyCommunication,
  updateCommunication,
} from '../controllers/communication.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();
router.use(protect);

router.get('/', getCommunications);
router.get('/:id', getCommunication);
router.post('/', createCommunication);
router.put('/:id', updateCommunication);
router.post('/:id/reply', replyCommunication);
router.delete('/:id', deleteCommunication);

export default router;
