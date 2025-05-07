import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import { generateVerificationToken, sendVerificationEmail } from '../services/email.service.js';

export const createAdmin = async (req, res) => {
  try {
    const { name, firstName, email, country, password } = req.body;
    
    // Basic validation
    if (!name || !firstName || !email || !country || !password) {
      return res.status(400).json({ msg: 'Please provide all required fields' });
    }
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const emailVerificationToken = generateVerificationToken();
    
    const newAdmin = await User.create({ 
      name, 
      firstName,
      email, 
      country,
      password: hashedPassword,
      role: 'admin',
      emailVerificationToken,
      verificationTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    });
    
    // Send verification email
    await sendVerificationEmail(newAdmin);
    
    // Don't return password in response
    const admin = newAdmin.toObject();
    delete admin.password;
    delete admin.emailVerificationToken;
    
    res.status(201).json({ 
      msg: 'Admin created successfully. Verification email has been sent.', 
      admin 
    });
  } catch (error) {
    console.error('Admin creation error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};