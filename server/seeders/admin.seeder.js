import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';

export const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ email: process.env.ADMIN_EMAIL });
    
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
      
      await User.create({
        name: 'Admin',
        firstName: 'System',
        email: process.env.ADMIN_EMAIL,
        country: 'Admin Country',
        password: hashedPassword,
        role: 'admin',
        emailVerified: true
      });
      
      console.log('Default admin user created');
    }
  } catch (error) {
    console.error('Admin seeder error:', error);
  }
};