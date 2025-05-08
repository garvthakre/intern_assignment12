import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import { generateVerificationToken, sendVerificationEmail } from '../services/email.service.js';
import { logger } from '../services/logger.service.js';

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
    
    // Try to send verification email, but don't fail if it doesn't work
    try {
      await sendVerificationEmail(newAdmin);
      logger.info(`Verification email sent to new admin: ${email}`);
    } catch (emailError) {
      logger.error(`Failed to send verification email: ${emailError.message}`);
      // Continue anyway - don't block admin creation
    }
    
    // Don't return password in response
    const admin = newAdmin.toObject();
    delete admin.password;
    delete admin.emailVerificationToken;
    
    res.status(201).json({ 
      msg: 'Admin created successfully. Check logs for verification details.',
      admin 
    });
  } catch (error) {
    logger.error(`Admin creation error: ${error.message}`);
    res.status(500).json({ msg: 'Server error' });
  }
};