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

// Get all users with specific fields
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select('name email skills github linkedin resume createdAt')
      .sort({ createdAt: -1 })
      .lean();

    if (!users || users.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: "No users found" 
      });
    }

    console.log(`Found ${users.length} users`); // Debug log

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (err) {
    console.error('Error in getUsers:', err);
    res.status(500).json({
      success: false,
      message: "Error fetching users",
      error: err.message
    });
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
