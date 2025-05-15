import express from 'express';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get all users
router.get('/all', auth, async (req, res) => {
  try {
    console.log('Fetching all users');
    // Return mock users
    const users = [
      { _id: '6820dc9c0009e7ccecc8e837', name: 'John Doe', email: 'john@example.com', role: 'client', profilePic: 'https://via.placeholder.com/150' },
      { _id: '6820dc9c0009e7ccecc8e838', name: 'Jane Smith', email: 'jane@example.com', role: 'freelancer', profilePic: 'https://via.placeholder.com/150' },
      { _id: '6820dc9c0009e7ccecc8e839', name: 'Alice Brown', email: 'alice@example.com', role: 'freelancer', profilePic: 'https://via.placeholder.com/150' },
      { _id: '6820dc9c0009e7ccecc8e840', name: 'Bob Johnson', email: 'bob@example.com', role: 'client', profilePic: 'https://via.placeholder.com/150' }
    ];
    
    console.log('Returning users:', JSON.stringify(users));
    res.json(users); // Explicitly returning an array
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get user by ID
router.get('/:userId', auth, async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Return a mock user
    const mockUser = {
      _id: userId, 
      name: userId === '6820dc9c0009e7ccecc8e837' ? 'John Doe' : 'Test User',
      email: userId === '6820dc9c0009e7ccecc8e837' ? 'john@example.com' : 'test@example.com',
      role: userId === '6820dc9c0009e7ccecc8e837' ? 'client' : 'freelancer',
      profilePic: 'https://via.placeholder.com/150'
    };
    
    res.json(mockUser);
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

export default router; 