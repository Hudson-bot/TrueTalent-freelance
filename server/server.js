const express = require('express');
const http = require('http');
const cors = require('cors');
// Import our mock database instead of real mongoose
const { mongoose } = require('./mockDb');
const initializeSocket = require('./socketServer');
const conversationRoutes = require('./routes/conversations');
const messageRoutes = require('./routes/messages');
const userRoutes = require('./routes/users');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors({
  origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

// Debug middleware - log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Request body:', req.body);
  }
  if (req.headers.authorization) {
    console.log('Auth header present');
  }
  next();
});

// Mock JWT auth middleware for testing
app.use((req, res, next) => {
  // Add a mock user to every request
  req.user = {
    id: '6823703xxxxxxxxxxxxxxx', // The ID from the error message
    role: 'freelancer',
    email: 'testuser@example.com'
  };
  next();
});

// Connect to mock database
console.log('Using mock database instead of MongoDB');

// Initialize Socket.io
const io = initializeSocket(server);

// Make io accessible to our router
app.set('io', io);

// Test route to check if server is running
app.get('/', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// Routes - define routes before any custom endpoint handlers
app.use('/api/conversations', conversationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/users', userRoutes);

// Special route for socket.io test
app.get('/socket.io', (req, res) => {
  res.json({ status: 'Socket.io endpoint is working' });
});

// Handle OPTIONS pre-flight requests
app.options('*', cors());

// Route not found middleware
app.use((req, res, next) => {
  console.log(`Route not found: ${req.method} ${req.url}`);
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

const PORT = process.env.PORT || 5173;

// Start server with error handling
server.listen(PORT, '0.0.0.0', (err) => {
  if (err) {
    console.error('Error starting server:', err);
    return;
  }
  console.log(`Server running on port ${PORT}`);
}); 