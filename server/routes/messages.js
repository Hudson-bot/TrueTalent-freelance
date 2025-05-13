const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Get messages for a conversation
router.get('/:conversationId', auth, async (req, res) => {
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

// Send a new message
router.post('/', auth, async (req, res) => {
  try {
    const { conversationId, content } = req.body;
    console.log('Creating new message in conversation:', conversationId);

    // Create mock message
    const newMessage = {
      _id: 'msg_' + Math.random().toString(36).substring(2, 9),
      conversationId,
      senderId: {
        _id: req.user.id,
        name: 'Current User',
        profilePic: 'https://via.placeholder.com/150'
      },
      content,
      senderRole: req.user.role,
      createdAt: new Date()
    };

    console.log('Created message:', newMessage);

    // Notify the socket server about the new message
    const io = req.app.get('io');
    if (io) {
      io.emit('newMessage', newMessage);
    }

    res.status(201).json(newMessage);
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router; 