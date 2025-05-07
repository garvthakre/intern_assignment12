import express from 'express';
import { auth } from '../middlewares/auth.middleware.js';
import * as groupController from '../controllers/group.controller.js';

const router = express.Router();

router.post('/', auth, groupController.createGroup);
router.post('/:groupId/join', auth, groupController.joinGroup);
router.post('/:groupId/leave', auth, groupController.leaveGroup);
router.get('/:groupId/members', auth, groupController.getMembers);

export default router;