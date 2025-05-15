import express from 'express';
import auth from '../middleware/auth.js';
import {
  getMessages,
  sendMessage,
  markMessagesAsRead,
  deleteMessage
} from '../controllers/messageController.js';

const router = express.Router();

// Get messages for a conversation
router.get('/:conversationId', auth, getMessages);

// Send a new message
router.post('/', auth, sendMessage);

// Mark messages as read
router.put('/:conversationId/read', auth, markMessagesAsRead);

// Delete a message
router.delete('/:messageId', auth, deleteMessage);

export default router; 