import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

// Get all conversations for the current user
export const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find all conversations where the current user is a participant
    const conversations = await Conversation.find({
      participants: userId
    })
    .populate({
      path: 'participants',
      select: 'name email profilePic role'
    })
    .sort({ updatedAt: -1 });

    // Process conversations to include the other user info
    const processedConversations = conversations.map(conv => {
      const otherUser = conv.participants.find(p => p._id.toString() !== userId);
      return {
        ...conv.toObject(),
        otherUser
      };
    });

    res.json(processedConversations);
  } catch (err) {
    console.error('Error fetching conversations:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get a specific conversation by ID
export const getConversationById = async (req, res) => {
  try {
    const conversationId = req.params.id;
    const userId = req.user.id;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId
    })
    .populate({
      path: 'participants',
      select: 'name email profilePic role'
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Add the otherUser property
    const otherUser = conversation.participants.find(p => p._id.toString() !== userId);
    const result = {
      ...conversation.toObject(),
      otherUser
    };

    res.json(result);
  } catch (err) {
    console.error('Error fetching conversation:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Create a new conversation
export const createConversation = async (req, res) => {
  try {
    const { participantId } = req.body;
    const userId = req.user.id;

    if (!participantId) {
      return res.status(400).json({ message: 'Participant ID is required' });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(participantId)) {
      return res.status(400).json({ message: 'Invalid participant ID format' });
    }

    // Check if the participant exists
    const participant = await User.findById(participantId);
    if (!participant) {
      return res.status(404).json({ message: 'Participant not found' });
    }

    // Check if a conversation already exists between these users
    const existingConversation = await Conversation.findOne({
      participants: { $all: [userId, participantId] }
    })
    .populate({
      path: 'participants',
      select: 'name email profilePic role'
    });

    if (existingConversation) {
      // Add the otherUser property
      const otherUser = existingConversation.participants.find(p => p._id.toString() !== userId);
      const result = {
        ...existingConversation.toObject(),
        otherUser
      };

      return res.json(result);
    }

    // Create a new conversation
    const newConversation = new Conversation({
      participants: [userId, participantId],
      lastMessage: {
        content: '',
        senderId: null,
        createdAt: new Date()
      }
    });

    await newConversation.save();

    // Populate the participants
    await newConversation.populate({
      path: 'participants',
      select: 'name email profilePic role'
    });

    // Add the otherUser property
    const otherUser = newConversation.participants.find(p => p._id.toString() !== userId);
    const result = {
      ...newConversation.toObject(),
      otherUser
    };

    // Notify via socket if available
    const io = req.app.get('io');
    if (io) {
      // Notify both participants
      io.to(`user_${userId}`).emit('conversationUpdate', result);
      io.to(`user_${participantId}`).emit('conversationUpdate', result);
    }

    res.status(201).json(result);
  } catch (err) {
    console.error('Error creating conversation:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update conversation (mark as archived, etc.)
export const updateConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { isActive } = req.body;
    const userId = req.user.id;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Update the conversation
    if (typeof isActive === 'boolean') {
      conversation.isActive = isActive;
    }

    await conversation.save();
    
    // Populate the participants
    await conversation.populate({
      path: 'participants',
      select: 'name email profilePic role'
    });

    // Add the otherUser property
    const otherUser = conversation.participants.find(p => p._id.toString() !== userId);
    const result = {
      ...conversation.toObject(),
      otherUser
    };

    // Notify via socket if available
    const io = req.app.get('io');
    if (io) {
      conversation.participants.forEach(participant => {
        io.to(`user_${participant._id}`).emit('conversationUpdate', result);
      });
    }

    res.json(result);
  } catch (err) {
    console.error('Error updating conversation:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete a conversation (soft delete by marking as inactive)
export const deleteConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Soft delete by marking as inactive
    conversation.isActive = false;
    await conversation.save();

    res.json({ message: 'Conversation deleted' });
  } catch (err) {
    console.error('Error deleting conversation:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get messages for a conversation
export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    // Verify user is a participant in this conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Get messages
    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 