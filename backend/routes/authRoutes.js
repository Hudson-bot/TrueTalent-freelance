import express from 'express';
import { signup, login, getMe, forgotPassword, resetPassword, updateRole } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Register a new user
router.post('/signup', signup);
router.post('/register', signup); // Alias for signup

// Login user
router.post('/login', login);

// Get current user
router.get('/me', protect, getMe);

// Update user role
router.put('/role', protect, updateRole);

// Password reset
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

export default router;