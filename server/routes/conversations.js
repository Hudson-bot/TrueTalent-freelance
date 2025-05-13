const express = require('express');
const router = express.Router();
const { Conversation, Message } = require('../mockDb');
const auth = require('../middleware/auth');

// Get all conversations for a user
router.get('/', auth, async (req, res) => {
  try {
    console.log('Fetching conversations for user:', req.user.id);
    
    // Return mock conversations for testing
    const mockConversations = [
      {
        _id: 'conv1',
        participants: [
          { _id: req.user.id, name: 'Current User', email: 'current@example.com', profilePic: 'https://via.placeholder.com/150', role: 'freelancer' },
          { _id: '6820dc9c0009e7ccecc8e837', name: 'John Doe', email: 'john@example.com', profilePic: 'https://via.placeholder.com/150', role: 'client' }
        ],
        lastMessage: {
          content: 'Hello there!',
          createdAt: new Date()
        },
        updatedAt: new Date()
      }
    ];
    
    console.log('Found conversations:', mockConversations.length);
    res.json(mockConversations);
  } catch (err) {
    console.error('Error fetching conversations:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Handle userId confusion - respond to both /:conversationId and /:userId
router.get('/:id', auth, async (req, res) => {
  try {
    const id = req.params.id;
    console.log('Fetching conversation or user conversations:', id);

    // Return mock conversations for any ID
    const mockConversations = [
      {
        _id: 'conv1',
        participants: [
          { _id: req.user.id, name: 'Current User', email: 'current@example.com', profilePic: 'https://via.placeholder.com/150', role: 'freelancer' },
          { _id: '6820dc9c0009e7ccecc8e837', name: 'John Doe', email: 'john@example.com', profilePic: 'https://via.placeholder.com/150', role: 'client' }
        ],
        lastMessage: {
          content: 'Hello there!',
          createdAt: new Date()
        },
        updatedAt: new Date()
      }
    ];

    console.log('Returning mock conversations:', JSON.stringify(mockConversations));
    res.json(mockConversations); // Explicitly returning an array
  } catch (err) {
    console.error('Error fetching conversation/user conversations:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Start a new conversation
router.post('/', auth, async (req, res) => {
  try {
    const { participantId } = req.body;
    console.log('Starting new conversation between', req.user.id, 'and', participantId);

    if (!participantId) {
      return res.status(400).json({ message: 'Participant ID is required' });
    }

    // Create a mock conversation response
    const mockConversation = {
      _id: 'new_conv_' + Math.random().toString(36).substring(2, 9),
      participants: [
        { _id: req.user.id, name: 'Current User', email: 'current@example.com', profilePic: 'https://via.placeholder.com/150', role: 'freelancer' },
        { _id: participantId, name: 'Test User', email: 'test@example.com', profilePic: 'https://via.placeholder.com/150', role: 'client' }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log('Created new conversation:', mockConversation._id);

    // Notify the socket server about the new conversation
    const io = req.app.get('io');
    if (io) {
      io.emit('newConversation', mockConversation);
    }

    res.status(201).json(mockConversation);
  } catch (err) {
    console.error('Error creating conversation:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get messages for a conversation
router.get('/:conversationId/messages', auth, async (req, res) => {
  try {
    console.log('Fetching messages for conversation:', req.params.conversationId);
    
    // Return mock messages
    const mockMessages = [
      {
        _id: 'msg1',
        conversationId: req.params.conversationId,
        senderId: { _id: req.user.id, name: 'Current User', profilePic: 'https://via.placeholder.com/150' },
        content: 'Hello!',
        createdAt: new Date(Date.now() - 3600000)
      },
      {
        _id: 'msg2',
        conversationId: req.params.conversationId,
        senderId: { _id: '6820dc9c0009e7ccecc8e837', name: 'John Doe', profilePic: 'https://via.placeholder.com/150' },
        content: 'Hi there! How are you?',
        createdAt: new Date(Date.now() - 1800000)
      }
    ];
    
    console.log('Found messages:', mockMessages.length);
    res.json(mockMessages);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router; 