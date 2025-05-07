import express from 'express';
import { auth, admin } from '../middlewares/auth.middleware.js';
import { createAdmin } from '../controllers/admin.controller.js';
import { searchUsers } from '../controllers/user.controller.js';

const router = express.Router();

router.post('/create', auth, admin, createAdmin);
router.get('/users', auth, admin, searchUsers);

export default router;