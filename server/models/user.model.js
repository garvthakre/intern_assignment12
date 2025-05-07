import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: String,
  firstName: String,
  email: { type: String, unique: true },
  country: String,
  password: String,
  role: { type: String, default: 'user' },
  emailVerificationToken: String,
  emailVerified: { type: Boolean, default: false },
  verificationTokenExpiry: Date
});

export default mongoose.model('User', userSchema);