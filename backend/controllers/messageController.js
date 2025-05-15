import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import User from '../models/User.js';

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
      return res.status(404).json({ message: 'Conversation not found or you do not have access' });
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

// Send a new message
export const sendMessage = async (req, res) => {
  try {
    const { conversationId, content } = req.body;
    const userId = req.user.id;

    if (!conversationId || !content) {
      return res.status(400).json({ message: 'Conversation ID and content are required' });
    }

    // Verify user is a participant in this conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found or you do not have access' });
    }

    // Create new message
    const newMessage = new Message({
      conversationId,
      senderId: userId,
      content,
      status: 'sent'
    });

    await newMessage.save();
    
    // Update conversation's last message
    conversation.lastMessage = {
      content,
      senderId: userId,
      createdAt: new Date()
    };
    
    conversation.updatedAt = new Date();
    await conversation.save();

    // Notify via socket if available
    const io = req.app.get('io');
    if (io) {
      // Get the other participants
      const otherParticipants = conversation.participants.filter(
        participantId => participantId.toString() !== userId
      );

      // Send message to conversation room
      io.to(`conversation_${conversationId}`).emit('newMessage', {
        ...newMessage.toObject(),
        _id: newMessage._id.toString()
      });

      // Update conversation for all participants
      conversation.participants.forEach(participantId => {
        io.to(`user_${participantId}`).emit('conversationUpdate', conversation);
      });

      // Notify other participants about new message
      otherParticipants.forEach(participantId => {
        io.to(`user_${participantId}`).emit('messageNotification', {
          conversationId,
          message: newMessage
        });
      });
    }

    res.status(201).json(newMessage);
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Mark messages as read
export const markMessagesAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    // Verify user is a participant in this conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found or you do not have access' });
    }

    // Mark all unread messages in this conversation as read
    const result = await Message.updateMany(
      {
        conversationId,
        senderId: { $ne: userId },
        'readBy.userId': { $ne: userId },
        status: { $ne: 'read' }
      },
      {
        $set: { status: 'read' },
        $push: { readBy: { userId, readAt: new Date() } }
      }
    );

    // Notify via socket if available
    const io = req.app.get('io');
    if (io) {
      io.to(`conversation_${conversationId}`).emit('messagesRead', {
        conversationId,
        userId,
        readAt: new Date()
      });
    }

    res.json({ 
      message: 'Messages marked as read',
      count: result.modifiedCount
    });
  } catch (err) {
    console.error('Error marking messages as read:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete a message
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    // Find the message
    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Verify user is the sender
    if (message.senderId.toString() !== userId) {
      return res.status(403).json({ message: 'You are not authorized to delete this message' });
    }

    // Soft delete by marking content as deleted
    message.content = 'This message has been deleted';
    message.isDeleted = true;
    await message.save();

    // Notify via socket if available
    const io = req.app.get('io');
    if (io) {
      io.to(`conversation_${message.conversationId}`).emit('messageDeleted', {
        messageId,
        conversationId: message.conversationId
      });
    }

    res.json({ message: 'Message deleted' });
  } catch (err) {
    console.error('Error deleting message:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 