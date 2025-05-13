const socketIo = require('socket.io');

const initializeSocket = (server) => {
  const io = socketIo(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
      allowedHeaders: ["Authorization"],
      credentials: true
    },
    path: '/socket.io/'
  });

  // Store active users
  const activeUsers = new Map();
  
  // Store messages in memory for testing
  const messages = [];

  io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;
    const userRole = socket.handshake.query.userRole;
    
    console.log(`User connected: ${userId} with role: ${userRole}`);
    
    // Add user to active users
    activeUsers.set(userId, {
      socketId: socket.id,
      role: userRole
    });

    // Handle sending messages
    socket.on('sendMessage', async (messageData) => {
      try {
        console.log('Received message:', messageData);
        
        // Create message in memory
        const newMessage = {
          _id: Math.random().toString(36).substring(2, 15),
          conversationId: messageData.conversationId,
          senderId: messageData.senderId,
          content: messageData.content,
          senderRole: messageData.senderRole,
          createdAt: new Date()
        };
        
        messages.push(newMessage);
        
        // Emit to sender
        io.to(socket.id).emit('newMessage', newMessage);
        
        // Emit to receiver if online
        const receiverSocket = activeUsers.get(messageData.receiverId);
        if (receiverSocket) {
          io.to(receiverSocket.socketId).emit('newMessage', newMessage);
        }
      } catch (error) {
        console.error('Error handling message:', error);
      }
    });

    // Handle typing status
    socket.on('typing', async (data) => {
      try {
        const receiverSocket = activeUsers.get(data.receiverId);
        if (receiverSocket) {
          io.to(receiverSocket.socketId).emit('userTyping', {
            userId: data.userId,
            isTyping: data.isTyping
          });
        }
      } catch (error) {
        console.error('Error handling typing status:', error);
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${userId}`);
      activeUsers.delete(userId);
    });
  });

  return io;
};

module.exports = initializeSocket; 