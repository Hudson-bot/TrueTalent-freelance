// backend/routes/userRoutes.js
import express from 'express';
import User from '../models/User.js';
import axios from 'axios';
import crypto from 'crypto';
import mongoose from 'mongoose';
import { getUsers } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

// Disable Mongoose validation globally
mongoose.set('runValidators', false);

const router = express.Router();

// IMPORTANT: Define the skills route first to ensure it's matched before other routes
// This route must be at the top to avoid being overshadowed by other routes
router.get('/skills/:userId', async (req, res) => {
  try {
    console.log('SKILLS ROUTE: Fetching skills by userId:', req.params.userId);
    
    // Try to find the user by userId
    let user = await User.findOne({ userId: req.params.userId });
    
    // If not found, try by MongoDB ObjectId
    if (!user) {
      try {
        console.log('SKILLS ROUTE: User not found by userId, trying as ObjectId');
        user = await User.findById(req.params.userId);
      } catch (error) {
        console.log('SKILLS ROUTE: Not a valid ObjectId either');
      }
    }
    
    if (!user) {
      console.log('SKILLS ROUTE: User not found by any method');
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log('SKILLS ROUTE: Found user:', user._id, user.userId);
    res.json(user);
  } catch (err) {
    console.error('SKILLS ROUTE: Error fetching skills by userId:', err);
    res.status(500).json({ message: err.message });
  }
});

// Route for CommunityPage.jsx
router.get('/users', getUsers);

// Route from users.js - consolidated here to avoid redundancy
router.get('/users/all', async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Base user routes
router.post('/', async (req, res) => {
  try {
    const newUser = await User.create(req.body);
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get latest user (for ProfileSection)
router.get('/personal-info', async (req, res) => {
  try {
    const latestUser = await User.findOne().sort({ createdAt: -1 });
    if (!latestUser) {
      return res.status(404).json({ message: 'No user found' });
    }
    res.json(latestUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Personal info routes
router.post('/personal-info', async (req, res) => {
  console.log('PERSONAL INFO ROUTE: Received request with body:', req.body);
  
  try {
    const { userId, name, title, email, bio, github, linkedin, resume } = req.body;
    
    console.log('PERSONAL INFO ROUTE: Processing request with email:', email);
    
    // First check if this is an existing user
    let existingUser = null;
    
    if (userId) {
      console.log('PERSONAL INFO ROUTE: Looking for user by userId:', userId);
      existingUser = await User.findOne({ userId });
    }
    
    if (!existingUser && email) {
      console.log('PERSONAL INFO ROUTE: Looking for user by email:', email);
      existingUser = await User.findOne({ email });
    }
    
    if (existingUser) {
      console.log('PERSONAL INFO ROUTE: Found existing user:', existingUser._id, 'with email:', existingUser.email);
      
      // Update existing user with raw MongoDB operations to bypass validation
      const updateData = {};
      if (name) updateData.name = name;
      if (title) updateData.title = title;
      // Only update email if it's provided and different from the existing one
      if (email && email !== existingUser.email) {
        console.log('PERSONAL INFO ROUTE: Updating email from', existingUser.email, 'to', email);
        updateData.email = email;
      }
      if (bio) updateData.bio = bio;
      if (github) updateData.github = github;
      if (linkedin) updateData.linkedin = linkedin;
      if (resume) updateData.resume = resume;
      if (userId && !existingUser.userId) updateData.userId = userId;
      
      console.log('PERSONAL INFO ROUTE: Updating user with data:', updateData);
      
      // Use updateOne directly on the collection to bypass all validation
      await mongoose.connection.collection('users').updateOne(
        { _id: existingUser._id },
        { $set: updateData }
      );
      
      // Fetch the updated user
      const updatedUser = await User.findById(existingUser._id);
      console.log('PERSONAL INFO ROUTE: Successfully updated user with email:', updatedUser.email);
      return res.json(updatedUser);
    }
    
    // If no existing user, create a new one
    console.log('PERSONAL INFO ROUTE: Creating new user with email:', email);
    
    // Ensure we have an email - this is required
    if (!email) {
      console.error('PERSONAL INFO ROUTE: Email is required for new users');
      return res.status(400).json({ 
        message: 'Email is required for new users'
      });
    }
    
    // Create a document directly in the collection to bypass validation
    const newUserData = {
      userId: userId || `user_${Date.now()}`,
      name: name || 'New User',
      email: email, 
      password: crypto.randomBytes(16).toString('hex'),
      title: title || '',
      bio: bio || '',
      github: github || '',
      linkedin: linkedin || '',
      resume: resume || '',
      role: 'freelancer',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('PERSONAL INFO ROUTE: New user data:', newUserData);
    
    // Insert directly into the collection
    const result = await mongoose.connection.collection('users').insertOne(newUserData);
    
    // Fetch the created user
    const newUser = await User.findById(result.insertedId);
    console.log('PERSONAL INFO ROUTE: Successfully created new user with ID:', newUser._id, 'and email:', newUser.email);
    
    return res.json(newUser);
  } catch (error) {
    console.error('PERSONAL INFO ROUTE: Error:', error);
    return res.status(400).json({ 
      message: error.message || 'Failed to save personal info',
      error: error
    });
  }
});

// Get personal info by userId
router.get('/personal-info/:userId', async (req, res) => {
  try {
    console.log('GET PERSONAL INFO ROUTE: Looking for user by userId:', req.params.userId);
    
    // Try to find the user by userId
    let user = await User.findOne({ userId: req.params.userId });
    
    // If not found, try by MongoDB ObjectId
    if (!user) {
      try {
        console.log('GET PERSONAL INFO ROUTE: User not found by userId, trying as ObjectId');
        user = await User.findById(req.params.userId);
      } catch (error) {
        console.log('GET PERSONAL INFO ROUTE: Not a valid ObjectId either');
      }
    }
    
    if (!user) {
      console.log('GET PERSONAL INFO ROUTE: User not found by any method');
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log('GET PERSONAL INFO ROUTE: Found user with email:', user.email);
    res.json(user);
  } catch (error) {
    console.error('GET PERSONAL INFO ROUTE: Error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Client info routes - for client profiles
router.post('/client-info', protect, async (req, res) => {
  try {
    const { name, email, phone, location, company, industry } = req.body;
    
    // Use the authenticated user from the middleware
    const existingUser = req.user;
    
    // Update the existing user with client profile information
    existingUser.name = name;
    // Don't update email as it's disabled in the frontend and could cause duplicate key errors
    existingUser.phone = phone;
    existingUser.location = location;
    existingUser.company = company;
    existingUser.industry = industry;
    existingUser.role = 'client'; // Ensure the role is set to client
    
    await existingUser.save();
    
    res.json(existingUser);
  } catch (error) {
    console.error('Error saving client info:', error);
    res.status(400).json({ message: error.message });
  }
});

// Get client info by userId
router.get('/client-info', protect, async (req, res) => {
  try {
    // Use the authenticated user from the middleware
    const user = req.user;
    
    // Check if the user has the client role
    if (user.role !== 'client') {
      return res.status(404).json({ message: 'Client profile not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET route for social links
router.get('/users/social/:userId', async (req, res) => {
  try {
    console.log('SOCIAL LINKS ROUTE: Looking for user by userId:', req.params.userId);
    
    // Try to find the user by userId first
    let user = await User.findOne({ userId: req.params.userId });
    
    // If not found, try by MongoDB ObjectId
    if (!user) {
      try {
        console.log('SOCIAL LINKS ROUTE: User not found by userId, trying as ObjectId');
        user = await User.findById(req.params.userId);
      } catch (error) {
        console.log('SOCIAL LINKS ROUTE: Not a valid ObjectId either');
      }
    }
    
    if (!user) {
      console.log('SOCIAL LINKS ROUTE: User not found by any method');
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log('SOCIAL LINKS ROUTE: Found user with email:', user.email);
    res.json({
      github: user.github || '',
      linkedin: user.linkedin || '',
      resume: user.resume || ''
    });
  } catch (error) {
    console.error('SOCIAL LINKS ROUTE: Error:', error);
    res.status(500).json({ message: error.message });
  }
});

// PUT route to update links
router.put('/users/:userId/links', async (req, res) => {
  try {
    console.log('UPDATE LINKS ROUTE: Looking for user by userId:', req.params.userId);
    
    // Try to find the user by userId first
    let updatedUser = await User.findOneAndUpdate(
      { userId: req.params.userId },
      { 
        github: req.body.github,
        linkedin: req.body.linkedin,
        resume: req.body.resume
      },
      { new: true }
    );

    // If not found, try by MongoDB ObjectId
    if (!updatedUser) {
      try {
        console.log('UPDATE LINKS ROUTE: User not found by userId, trying as ObjectId');
        updatedUser = await User.findByIdAndUpdate(
          req.params.userId,
          { 
            github: req.body.github,
            linkedin: req.body.linkedin,
            resume: req.body.resume
          },
          { new: true }
        );
      } catch (error) {
        console.log('UPDATE LINKS ROUTE: Not a valid ObjectId either');
      }
    }

    if (!updatedUser) {
      console.log('UPDATE LINKS ROUTE: User not found by any method');
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log('UPDATE LINKS ROUTE: Successfully updated links for user with email:', updatedUser.email);
    res.json(updatedUser);
  } catch (error) {
    console.error('UPDATE LINKS ROUTE: Error:', error);
    res.status(400).json({ message: error.message });
  }
});

// PUT route to update personal info by userId
router.put('/personal-info/:userId', async (req, res) => {
  try {
    console.log('UPDATE PERSONAL INFO ROUTE: Looking for user by userId:', req.params.userId);
    const { github, linkedin, resume } = req.body;
    
    // Try to find the user by userId first
    let updatedUser = await User.findOneAndUpdate(
      { userId: req.params.userId },
      { github, linkedin, resume },
      { new: true }
    );

    // If not found, try by MongoDB ObjectId
    if (!updatedUser) {
      try {
        console.log('UPDATE PERSONAL INFO ROUTE: User not found by userId, trying as ObjectId');
        updatedUser = await User.findByIdAndUpdate(
          req.params.userId,
          { github, linkedin, resume },
          { new: true }
        );
      } catch (error) {
        console.log('UPDATE PERSONAL INFO ROUTE: Not a valid ObjectId either');
      }
    }

    if (!updatedUser) {
      console.log('UPDATE PERSONAL INFO ROUTE: User not found by any method');
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log('UPDATE PERSONAL INFO ROUTE: Successfully updated personal info for user with email:', updatedUser.email);
    res.json(updatedUser);
  } catch (error) {
    console.error('UPDATE PERSONAL INFO ROUTE: Error:', error);
    res.status(400).json({ message: error.message });
  }
});


// Get user skills by userId
router.get('/users/:userId/skills', async (req, res) => {
  try {
    console.log('GET USER SKILLS ROUTE: Looking for user by userId:', req.params.userId);
    
    // Try to find the user by userId first
    let user = await User.findOne({ userId: req.params.userId });
    
    // If not found, try by MongoDB ObjectId
    if (!user) {
      try {
        console.log('GET USER SKILLS ROUTE: User not found by userId, trying as ObjectId');
        user = await User.findById(req.params.userId);
      } catch (error) {
        console.log('GET USER SKILLS ROUTE: Not a valid ObjectId either');
      }
    }
    
    if (!user) {
      console.log('GET USER SKILLS ROUTE: User not found by any method');
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log('GET USER SKILLS ROUTE: Found user with email:', user.email);
    res.json(user);
  } catch (err) {
    console.error('GET USER SKILLS ROUTE: Error:', err);
    res.status(500).json({ message: err.message });
  }
});

// For backward compatibility with SkillsSection.jsx
router.get('/:userId/skills', async (req, res) => {
  try {
    console.log('BACKWARD COMPAT SKILLS ROUTE: Looking for user by userId:', req.params.userId);
    
    // Try to find the user by userId first
    let user = await User.findOne({ userId: req.params.userId });
    
    // If not found, try by MongoDB ObjectId
    if (!user) {
      try {
        console.log('BACKWARD COMPAT SKILLS ROUTE: User not found by userId, trying as ObjectId');
        user = await User.findById(req.params.userId);
      } catch (error) {
        console.log('BACKWARD COMPAT SKILLS ROUTE: Not a valid ObjectId either');
      }
    }
    
    if (!user) {
      console.log('BACKWARD COMPAT SKILLS ROUTE: User not found by any method');
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log('BACKWARD COMPAT SKILLS ROUTE: Found user with email:', user.email);
    res.json(user);
  } catch (err) {
    console.error('BACKWARD COMPAT SKILLS ROUTE: Error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Update user skills by userId
router.patch('/users/:userId/skills', async (req, res) => {
  try {
    console.log('UPDATE USER SKILLS ROUTE: Looking for user by userId:', req.params.userId);
    const { skills } = req.body;
    
    // Try to find the user by userId first
    let user = await User.findOneAndUpdate(
      { userId: req.params.userId },
      { $set: { skills } },
      { new: true }
    );
    
    // If not found, try by MongoDB ObjectId
    if (!user) {
      try {
        console.log('UPDATE USER SKILLS ROUTE: User not found by userId, trying as ObjectId');
        user = await User.findByIdAndUpdate(
          req.params.userId,
          { $set: { skills } },
          { new: true }
        );
      } catch (error) {
        console.log('UPDATE USER SKILLS ROUTE: Not a valid ObjectId either');
      }
    }
    
    if (!user) {
      console.log('UPDATE USER SKILLS ROUTE: User not found by any method');
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log('UPDATE USER SKILLS ROUTE: Successfully updated skills for user with email:', user.email);
    res.json(user);
  } catch (err) {
    console.error('UPDATE USER SKILLS ROUTE: Error:', err);
    res.status(500).json({ message: err.message });
  }
});

// POST route for skills
router.post('/skills', async (req, res) => {
  try {
    console.log('POST SKILLS ROUTE: Looking for user by userId:', req.body.userId);
    const { userId, skills } = req.body;
    
    // Try to find the user by userId first
    let user = await User.findOneAndUpdate(
      { userId },
      { $set: { skills } },
      { new: true }
    );
    
    // If not found, try by MongoDB ObjectId
    if (!user) {
      try {
        console.log('POST SKILLS ROUTE: User not found by userId, trying as ObjectId');
        user = await User.findByIdAndUpdate(
          userId,
          { $set: { skills } },
          { new: true }
        );
      } catch (error) {
        console.log('POST SKILLS ROUTE: Not a valid ObjectId either');
      }
    }
    
    if (!user) {
      console.log('POST SKILLS ROUTE: User not found by any method');
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log('POST SKILLS ROUTE: Successfully updated skills for user with email:', user.email);
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Keep the original routes for backward compatibility
router.get('/:id/skills', async (req, res) => {
  try {
    console.log('Fetching skills by id:', req.params.id);
    
    // First try to interpret the id as a MongoDB ObjectId
    let user;
    try {
      user = await User.findById(req.params.id);
    } catch (error) {
      console.log('Not a valid ObjectId, trying as userId');
    }
    
    // If not found or error, try as userId
    if (!user) {
      user = await User.findOne({ userId: req.params.id });
    }
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log('Found user:', user._id, user.userId);
    res.json(user);
  } catch (err) {
    console.error('Error fetching skills:', err);
    res.status(500).json({ message: err.message });
  }
});

router.patch('/:id/skills', async (req, res) => {
  try {
    console.log('Updating skills by id:', req.params.id);
    const { skills } = req.body;
    
    // First try to interpret the id as a MongoDB ObjectId
    let user;
    try {
      user = await User.findByIdAndUpdate(
        req.params.id,
        { $set: { skills } },
        { new: true }
      );
    } catch (error) {
      console.log('Not a valid ObjectId, trying as userId');
    }
    
    // If not found or error, try as userId
    if (!user) {
      user = await User.findOneAndUpdate(
        { userId: req.params.id },
        { $set: { skills } },
        { new: true }
      );
    }
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log('Updated skills for user:', user._id, user.userId);
    res.json(user);
  } catch (err) {
    console.error('Error updating skills:', err);
    res.status(500).json({ message: err.message });
  }
});


// Get user data for TestModal
function extractGitHubUsername(url) {
  const match = url.match(/^https?:\/\/(www\.)?github\.com\/([a-zA-Z0-9-]+)(\/)?$/);
  return match ? match[2] : null;
}

async function fetchGitHubRepos(githubUrl) {
  const username = extractGitHubUsername(githubUrl);
  if (!username) throw new Error("Invalid GitHub URL");

  const response = await axios.get(`https://api.github.com/users/${username}/repos`);
  return response.data.map(repo => ({
    name: repo.name,
    description: repo.description,
    language: repo.language
  }));
}

router.get('/user-test-data/:userId', async (req, res) => {
  try {
    console.log('USER TEST DATA ROUTE: Looking for user by userId:', req.params.userId);
    
    // Try to find the user by userId first
    let user = await User.findOne({ userId: req.params.userId });
    
    // If not found, try by MongoDB ObjectId
    if (!user) {
      try {
        console.log('USER TEST DATA ROUTE: User not found by userId, trying as ObjectId');
        user = await User.findById(req.params.userId);
      } catch (error) {
        console.log('USER TEST DATA ROUTE: Not a valid ObjectId either');
      }
    }
    
    if (!user) {
      console.log('USER TEST DATA ROUTE: User not found by any method');
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log('USER TEST DATA ROUTE: Found user with email:', user.email);

    let repos = [];
    try {
      repos = await fetchGitHubRepos(user.github);
    } catch (err) {
      console.warn('Failed to fetch GitHub repos:', err.message);
    }

    res.json({
      github: user.github || '',
      resume: user.resume || '',
      skills: user.skills || [],
      repos
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


export default router;
