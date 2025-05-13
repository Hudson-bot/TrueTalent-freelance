// backend/server.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import resumeRoutes from './routes/resume.js';
import userRoutes from './routes/userRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import scoring from './routes/scoring.js';
import authRoutes from './routes/authRoutes.js';
import errorHandler from './middleware/errorHandler.js';

// Initialize express
const app = express();
dotenv.config();

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/truetalent', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));


app.get('/test-email', async (req, res) => {
  const { sendEmail } = await import('./utils/emailSender.js');
  try {
    await sendEmail({
      email: 'your_real_email@example.com', // 👈 Test with your actual email
      subject: 'SMTP Test',
      message: 'This is a test email'
    });
    res.send('Email sent!');
  } catch (err) {
    console.error('SMTP Error:', err);
    res.status(500).send('Error: ' + err.message);
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', userRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api', scoring);
app.use("/api/projects", projectRoutes);
// Note: users.js routes have been consolidated into userRoutes.js

// Error handling middleware (must be after routes)
app.use(errorHandler);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;
