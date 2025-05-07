import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';

export const updateProfile = async (req, res) => {
  const { name } = req.body;
  const user = await User.findByIdAndUpdate(req.user.id, { name }, { new: true });
  res.json(user);
};

export const deleteProfile = async (req, res) => {
  await User.findByIdAndDelete(req.user.id);
  res.json({ msg: 'User deleted' });
};

export const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id);
  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) return res.status(401).json({ msg: 'Incorrect password' });
  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
  res.json({ msg: 'Password changed' });
};

export const searchUsers = async (req, res) => {
  const { query } = req.query;
  const users = await User.find({ name: { $regex: query, $options: 'i' } });
  res.json(users);
};