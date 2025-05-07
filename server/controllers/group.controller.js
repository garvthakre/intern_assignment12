import Group from '../models/group.model.js';

export const createGroup = async (req, res) => {
  const { name } = req.body;
  const group = await Group.create({ name, members: [req.user._id], createdBy: req.user._id });
  res.status(201).json(group);
};

export const joinGroup = async (req, res) => {
  const group = await Group.findById(req.params.groupId);
  if (!group) return res.status(404).json({ message: 'Group not found' });
  if (!group.members.includes(req.user._id)) {
    group.members.push(req.user._id);
    await group.save();
  }
  res.json({ message: 'Joined group' });
};

export const leaveGroup = async (req, res) => {
  const group = await Group.findById(req.params.groupId);
  if (!group) return res.status(404).json({ message: 'Group not found' });
  group.members = group.members.filter(m => m.toString() !== req.user._id.toString());
  await group.save();
  res.json({ message: 'Left group' });
};

export const getMembers = async (req, res) => {
  const group = await Group.findById(req.params.groupId).populate('members', 'name email');
  if (!group) return res.status(404).json({ message: 'Group not found' });
  res.json(group.members);
};