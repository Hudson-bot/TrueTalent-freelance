import { Server } from 'socket.io';
import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import User from '../models/User.js';

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      allowedHeaders: ["Authorization"],
      credentials: true
    },
    path: '/socket.io/'
  });

  // Store active users with their socket IDs and conversation rooms
  const activeUsers = new Map();

  // Store conversation participants
  const conversationParticipants = new Map();

  io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;
    const userRole = socket.handshake.query.userRole;

    if (!userId) {
      console.log('Connection attempt without userId');
      socket.disconnect();
      return;
    }

    console.log(`User connected: ${userId} (${userRole}) [Socket: ${socket.id}]`);

    // Add user to active users
    activeUsers.set(userId, {
      socketId: socket.id,
      role: userRole,
      socket: socket
    });

    // Join user to their personal room for direct notifications
    socket.join(`user_${userId}`);

    // Broadcast user online status to all connected clients
    io.emit('userStatusChange', {
      userId,
      status: 'online'
    });

    // Send the current list of online users to the newly connected user
    const onlineUserIds = Array.from(activeUsers.keys());
    socket.emit('onlineUsers', onlineUserIds);

    // Handle joining conversation rooms
    socket.on('joinConversation', async (conversationId) => {
      if (!conversationId) return;

      try {
        // Verify the user is actually a participant in this conversation
        const conversation = await Conversation.findOne({
          _id: conversationId,
          participants: userId
        });

        if (!conversation) {
          socket.emit('error', {
            message: 'You are not authorized to join this conversation'
          });
          return;
        }

        socket.join(`conversation_${conversationId}`);
        console.log(`User ${userId} joined conversation ${conversationId}`);

        // Track conversation participants
        if (!conversationParticipants.has(conversationId)) {
          conversationParticipants.set(conversationId, new Set());
        }
        conversationParticipants.get(conversationId).add(userId);

        // Notify other participants that this user is online
        socket.to(`conversation_${conversationId}`).emit('userJoinedConversation', {
          userId,
          conversationId
        });
      } catch (error) {
        console.error('Error joining conversation:', error);
        socket.emit('error', {
          message: 'Failed to join conversation',
          details: error.message
        });
      }
    });

    // Handle leaving conversation rooms
    socket.on('leaveConversation', (conversationId) => {
      socket.leave(`conversation_${conversationId}`);
      if (conversationParticipants.has(conversationId)) {
        conversationParticipants.get(conversationId).delete(userId);
      }

      // Notify other participants
      socket.to(`conversation_${conversationId}`).emit('userLeftConversation', {
        userId,
        conversationId
      });
    });

    // Handle sending messages
    socket.on('sendMessage', async (messageData) => {
      try {
        if (!messageData.conversationId || !messageData.senderId || !messageData.content) {
          console.log('Invalid message data:', messageData);
          socket.emit('error', {
            message: 'Invalid message data'
          });
          return;
        }

        if (messageData.senderId !== userId) {
          socket.emit('error', {
            message: 'Sender ID does not match connected user'
          });
          return;
        }

        console.log('Received message:', {
          conversation: messageData.conversationId,
          from: messageData.senderId,
          content: messageData.content.substring(0, 50) + (messageData.content.length > 50 ? '...' : '')
        });

        // Verify the conversation exists and user is a participant
        const conversation = await Conversation.findOne({
          _id: messageData.conversationId,
          participants: userId
        });

        if (!conversation) {
          socket.emit('error', {
            message: 'Conversation not found or you are not a participant'
          });
          return;
        }

        // Create and save the message
        const newMessage = new Message({
          conversationId: messageData.conversationId,
          senderId: userId,
          content: messageData.content,
          status: 'sent'
        });

        await newMessage.save();

        // Update conversation's last message
        conversation.lastMessage = {
          content: messageData.content,
          senderId: userId,
          createdAt: new Date()
        };
        conversation.updatedAt = new Date();
        await conversation.save();

        // Broadcast to all participants in the conversation
        io.to(`conversation_${messageData.conversationId}`).emit('newMessage', {
          ...newMessage.toObject(),
          _id: newMessage._id.toString()
        });

        // Update conversation for all participants
        conversation.participants.forEach(participantId => {
          io.to(`user_${participantId}`).emit('conversationUpdate', conversation);
        });

        // Notify other participants about new message
        const otherParticipants = conversation.participants.filter(
          participantId => participantId.toString() !== userId
        );

        otherParticipants.forEach(participantId => {
          io.to(`user_${participantId}`).emit('messageNotification', {
            conversationId: messageData.conversationId,
            message: newMessage
          });
        });

      } catch (error) {
        console.error('Error handling message:', error);
        socket.emit('messageError', {
          error: 'Failed to send message',
          details: error.message
        });
      }
    });

    // Handle typing status
    socket.on('typing', (data) => {
      try {
        if (!data.conversationId) {
          console.log('Invalid typing data:', data);
          return;
        }

        // Get user details
        User.findById(userId)
          .select('name')
          .then(user => {
            const userName = user ? user.name : 'Someone';

            // Broadcast typing status to all conversation participants except sender
            socket.to(`conversation_${data.conversationId}`).emit('userTyping', {
              userId,
              userName,
              isTyping: data.isTyping,
              conversationId: data.conversationId
            });
          })
          .catch(err => {
            console.error('Error getting user details for typing status:', err);
          });

      } catch (error) {
        console.error('Error handling typing status:', error);
      }
    });

    // Handle message read receipts
    socket.on('markAsRead', async (data) => {
      try {
        if (!data.conversationId) return;

        // Update message status in database
        await Message.updateMany(
          {
            conversationId: data.conversationId,
            senderId: { $ne: userId },
            'readBy.userId': { $ne: userId },
            status: { $ne: 'read' }
          },
          {
            $set: { status: 'read' },
            $push: { readBy: { userId, readAt: new Date() } }
          }
        );

        // Notify other participants that messages were read
        socket.to(`conversation_${data.conversationId}`).emit('messagesRead', {
          userId,
          conversationId: data.conversationId,
          readAt: new Date()
        });
      } catch (error) {
        console.error('Error handling read receipt:', error);
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${userId} [Socket: ${socket.id}]`);
      activeUsers.delete(userId);

      // Broadcast user offline status
      io.emit('userStatusChange', {
        userId,
        status: 'offline'
      });

      // Clean up conversation participants
      conversationParticipants.forEach((participants, conversationId) => {
        if (participants.has(userId)) {
          participants.delete(userId);
          
          // Notify other participants that user left
          io.to(`conversation_${conversationId}`).emit('userLeftConversation', {
            userId,
            conversationId
          });
          
          if (participants.size === 0) {
            conversationParticipants.delete(conversationId);
          }
        }
      });
    });

    // Handle connection errors
    socket.on('error', (error) => {
      console.error(`Socket error for user ${userId}:`, error);
    });
  });

  // Helper function to get online status
  io.getUserStatus = (userId) => {
    return activeUsers.has(userId);
  };

  // Helper function to get user socket
  io.getUserSocket = (userId) => {
    return activeUsers.get(userId)?.socket;
  };

  // Helper function to get all online users
  io.getOnlineUsers = () => {
    return Array.from(activeUsers.keys());
  };

  return io;
};

export default initializeSocket; 