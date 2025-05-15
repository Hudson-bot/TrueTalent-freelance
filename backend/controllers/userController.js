// backend/controllers/userController.js
import User from '../models/User.js';

// Create a new user
export const createUser = async (req, res) => {
  try {
    // Validate request body
    if (!req.body) {
      return res.status(400).json({ message: "User data cannot be empty" });
    }

    const user = new User(req.body);
    const saved = await user.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ 
      message: "Internal server error while creating user",
      error: err.message 
    });
  }
};

// Get all users except the current user
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select('name email profilePic role');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// Get all users for messaging
export const getUsersForMessaging = async (req, res) => {
  try {
    // Get all users except the current user
    const users = await User.find({ _id: { $ne: req.user.id } })
      .select('name email profilePic role');
    
    // Additional online status can be added from socket service
    const io = req.app.get('io');
    const usersWithStatus = users.map(user => ({
      ...user.toObject(),
      isOnline: io?.getUserStatus?.(user._id.toString()) || false
    }));
    
    res.json(usersWithStatus);
  } catch (err) {
    console.error('Error fetching users for messaging:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get the most recent user
export const getLatestUser = async (req, res) => {
  try {
    const latestUser = await User.findOne().select('-__v').sort({ createdAt: -1 });
    if (!latestUser) {
      return res.status(404).json({ message: "No user found" });
    }
    res.json(latestUser);
  } catch (err) {
    console.error('Error fetching latest user:', err);
    res.status(500).json({ 
      message: "Internal server error while fetching latest user",
      error: err.message 
    });
  }
};

// Get online users
export const getOnlineUsers = async (req, res) => {
  try {
    const io = req.app.get('io');
    
    if (!io || !io.getOnlineUsers) {
      return res.status(500).json({ message: 'Socket service not available' });
    }
    
    const onlineUserIds = io.getOnlineUsers();
    
    res.json(onlineUserIds);
  } catch (err) {
    console.error('Error fetching online users:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
