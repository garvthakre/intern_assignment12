import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { generateVerificationToken, sendVerificationEmail } from '../services/email.service.js';

export const register = async (req, res) => {
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
    
    const newUser = await User.create({ 
      name, 
      firstName,
      email, 
      country,
      password: hashedPassword,
      emailVerificationToken,
      verificationTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    });
    
    // Send verification email
    await sendVerificationEmail(newUser);
    
    // Don't return password in response
    const user = newUser.toObject();
    delete user.password;
    delete user.emailVerificationToken;
    
    res.status(201).json({ 
      msg: 'Registered successfully. Please check your email to verify your account.', 
      user 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};


export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ msg: 'Please provide email and password' });
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ msg: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' }
    );
    
    res.json({ 
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      message: "Use this token in the Authorization header for authenticated requests"
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    
    const user = await User.findOne({ 
      emailVerificationToken: token,
      verificationTokenExpiry: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ msg: 'Invalid or expired verification token' });
    }
    
    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    await user.save();
    
    res.json({ msg: 'Email verified successfully' });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};