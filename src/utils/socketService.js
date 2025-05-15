import io from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.callbacks = {
      newMessage: [],
      userTyping: [],
      conversationUpdate: [],
      userStatusChange: [],
      markAsRead: [],
      onlineUsers: []
    };
  }

  connect(userId, userRole) {
    if (this.socket) return; // Prevent multiple connections

    try {
      this.socket = io('http://localhost:5000', {
        reconnection: true,
        query: {
          userId,
          userRole: userRole || 'user'
        }
      });

      this.socket.on('connect', () => {
        console.log('Socket connected successfully');
        this.isConnected = true;
        
        // Add current user to online users
        this.triggerCallbacks('userStatusChange', {
          userId: userId,
          status: 'online'
        });
      });

      this.socket.on('disconnect', () => {
        console.log('Socket disconnected');
        this.isConnected = false;
      });

      // Register listeners for all events
      this.socket.on('newMessage', (message) => {
        this.triggerCallbacks('newMessage', message);
      });

      this.socket.on('userTyping', (data) => {
        this.triggerCallbacks('userTyping', data);
      });

      this.socket.on('conversationUpdate', (conversation) => {
        this.triggerCallbacks('conversationUpdate', conversation);
      });

      this.socket.on('userStatusChange', (data) => {
        this.triggerCallbacks('userStatusChange', data);
      });

      this.socket.on('markAsRead', (data) => {
        this.triggerCallbacks('markAsRead', data);
      });
      
      // Handle initial list of online users
      this.socket.on('onlineUsers', (onlineUserIds) => {
        this.triggerCallbacks('onlineUsers', onlineUserIds);
      });
    } catch (err) {
      console.error('Socket connection error:', err);
      this.isConnected = false;
    }
  }

  // Register a callback for a specific event
  on(event, callback) {
    if (!this.callbacks[event]) {
      this.callbacks[event] = [];
    }
    this.callbacks[event].push(callback);
  }

  // Remove a callback
  off(event, callback) {
    if (!this.callbacks[event]) return;
    this.callbacks[event] = this.callbacks[event].filter(cb => cb !== callback);
  }

  // Trigger all callbacks for an event
  triggerCallbacks(event, data) {
    if (!this.callbacks[event]) return;
    this.callbacks[event].forEach(callback => {
      try {
        callback(data);
      } catch (err) {
        console.error(`Error executing callback for ${event}:`, err);
      }
    });
  }

  // Join a conversation room
  joinConversation(conversationId) {
    if (!this.isConnected || !this.socket) return;
    this.socket.emit('joinConversation', conversationId);
  }

  // Send a message
  sendMessage(messageData) {
    if (!this.isConnected || !this.socket) return;
    this.socket.emit('sendMessage', messageData);
  }

  // Mark messages as read
  markAsRead(conversationId) {
    if (!this.isConnected || !this.socket) return;
    this.socket.emit('markAsRead', { conversationId });
  }

  // Send typing indicator
  typing(data) {
    if (!this.isConnected || !this.socket) return;
    this.socket.emit('typing', data);
  }

  // Disconnect
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Check if connected
  isSocketConnected() {
    return this.isConnected;
  }
}

// Create a singleton instance
const socketService = new SocketService();

export default socketService; 