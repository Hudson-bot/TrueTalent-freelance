const jwt = require('jsonwebtoken');

// Mock auth middleware for testing
module.exports = (req, res, next) => {
  // Skip token verification for testing and just set a mock user
  req.user = {
    id: '6823703xxxxxxxxxxxxxxx', // The ID from the error message
    role: 'freelancer',
    email: 'testuser@example.com'
  };
  next();
}; 