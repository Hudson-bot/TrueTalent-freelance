import crypto from 'crypto';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendEmail } from '../utils/emailSender.js';
import User from '../models/User.js';

// Helper function to generate a unique userId
const generateUniqueId = () => {
  return crypto.randomBytes(16).toString('hex');
};

// Helper function at the top
const sendTokenResponse = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn: '24h' }
  );
};

// @desc    Register user
export const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Role is now optional - will be selected on landing page
    // Validate role if provided
    if (role && !['client', 'freelancer'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. If provided, must be client or freelancer'
      });
    }
    
    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Use the model's pre-save hook for password hashing
    const userData = {
      name,
      email: email.toLowerCase(),
      password,
      userId: generateUniqueId() // Generate a unique userId for each new user
    };
    
    // Only add role if it's provided and valid
    if (role && ['client', 'freelancer'].includes(role)) {
      userData.role = role;
    }
    
    const user = new User(userData);

    await user.save();
    
    // Generate token for immediate login
    const token = sendTokenResponse(user);
    
    res.status(201).json({ 
      success: true, 
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    console.error('Error details:', error.message);
    if (error.name === 'ValidationError') {
      // Mongoose validation error
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        success: false,
        message: 'Validation failed',
        errors: messages
      });
    }
    res.status(500).json({ 
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};

// @desc    Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user || !(await bcryptjs.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = sendTokenResponse(user);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
};

// @desc    Get current logged-in user
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Forgot Password
export const forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If the email exists, a reset link has been sent'
      });
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
    await sendEmail({
      email: user.email,
      subject: 'Password Reset',
      message: `Click to reset your password: ${resetUrl}`
    });

    res.status(200).json({
      success: true,
      message: 'Email sent successfully'
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({
      success: false,
      message: err.message || 'Email failed to send'
    });
  }
};

// @desc    Reset password
export const resetPassword = async (req, res, next) => {
  try {
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    const token = sendTokenResponse(user);
    
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

// @desc    Update user role
export const updateRole = async (req, res) => {
  try {
    const { role } = req.body;
    
    // Validate role
    if (!role || !['client', 'freelancer'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Please select a valid role (client or freelancer)'
      });
    }
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if user is trying to become a freelancer after being a client
    if (role === 'freelancer' && user.hasBeenClient) {
      return res.status(403).json({
        success: false,
        message: 'Users who have previously selected "Hire a Freelancer" cannot switch to "Get Hired"'
      });
    }
    
    // If user is becoming a client, mark them as having been a client
    if (role === 'client') {
      user.hasBeenClient = true;
    }
    
    // Update user role
    user.role = role;
    await user.save();
    
    // Generate new token with updated role
    const token = sendTokenResponse(user);
    
    res.status(200).json({
      success: true,
      message: 'Role updated successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        hasBeenClient: user.hasBeenClient
      }
    });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update role' 
    });
  }
};
