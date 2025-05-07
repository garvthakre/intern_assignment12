import express from 'express';
import { auth, admin } from '../middlewares/auth.middleware.js';
import User from '../models/user.model.js';
import { updateProfile, deleteProfile, changePassword, searchUsers } from '../controllers/user.controller.js';

const router = express.Router();

router.get('/', auth, admin, async (req, res) => {
  const users = await User.find();
  res.json(users);
});

router.get('/me', auth, async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json(user);
});

router.put('/me', auth, updateProfile);
router.delete('/me', auth, deleteProfile);
router.post('/me/change-password', auth, changePassword);
router.get('/search', auth, admin, searchUsers);

export default router;