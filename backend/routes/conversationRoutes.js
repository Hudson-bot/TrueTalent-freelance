import express from 'express';
import auth from '../middleware/auth.js';
import {
  getConversations,
  getConversationById,
  createConversation,
  updateConversation,
  deleteConversation,
  getMessages
} from '../controllers/conversationController.js';

const router = express.Router();

// Get all conversations for the logged-in user
router.get('/', auth, getConversations);

// Get a single conversation by ID
router.get('/:id', auth, getConversationById);

// Create a new conversation
router.post('/', auth, createConversation);

// Update a conversation (archiving, etc.)
router.put('/:conversationId', auth, updateConversation);

// Delete a conversation (soft delete)
router.delete('/:conversationId', auth, deleteConversation);

// Get messages for a conversation
router.get('/:conversationId/messages', auth, getMessages);

export default router; 