import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateQuestionsFromSkills } from './services/openRouter';
import pdfParse from 'pdf-parse';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import scoringRouter from './routes/scoring.js';
import resumeRoutes from './routes/resume.js';
import userRoutes from './routes/userRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import authRoutes from './routes/authRoutes.js';
import conversationRoutes from './routes/conversationRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import userMessageRoutes from './routes/userMessageRoutes.js';
import errorHandler from './middleware/errorHandler.js';
import multer from 'multer';

// Load env vars - Move this to top
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

// Verify MongoDB URI
if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is not defined in environment variables');
    process.exit(1);
}

// Initialize express
const app = express();

// Multer configuration
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'), false);
        }
    }
}).fields([
    { name: 'resume', maxCount: 1 },
    { name: 'githubLink', maxCount: 1 }
]);

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
}));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    retryWrites: true,
    w: 'majority',
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000
})
.then(() => {
    console.log('Successfully connected to MongoDB Atlas');
})
.catch(err => {
    console.error('MongoDB connection error details:');
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    if (err.code) console.error('Error code:', err.code);
    process.exit(1);
});

// Skills database
const SKILLS_DATABASE = [
    'JavaScript', 'TypeScript', 'React', 'Node.js', 'Express',
    'Python', 'Java', 'SQL', 'MongoDB', 'Git', 'Docker',
    'AWS', 'REST API', 'GraphQL', 'Data Structures'
];

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api', scoringRouter);
app.use('/api/projects', projectRoutes);

// Messaging routes
app.use('/api/conversations', conversationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/chat-users', userMessageRoutes);

// Error handling middleware (must be after routes)
app.use(errorHandler);

// Debug route to verify router mounting
app.get('/api-test', (req, res) => {
    res.json({ message: 'API routes are working' });
});

// Routes
app.post('/api/resume/upload', upload, async (req, res) => {
    try {
        if (!req.files || !req.files.resume) {
            return res.status(400).json({ message: 'No resume file uploaded' });
            }

        const resumeBuffer = req.files.resume[0].buffer;
        
        // Extract text from PDF
        const pdfData = await pdfParse(resumeBuffer);
        const resumeText = pdfData.text;
        
        // Extract skills (simplified example)
        const skills = extractSkills(resumeText);
        
        // Generate questions based on skills
        const questions = await generateQuestionsFromSkills(skills);
        
        res.status(200).json({
            message: 'Resume processed successfully',
            skills,
            questions
        });
    } catch (error) {
        console.error('Error processing resume:', error);
        res.status(500).json({ message: 'Error processing resume', error: error.message });
    }
});

// Helper function to extract skills from resume text
function extractSkills(resumeText) {
    // This is a simplified example - in a real app you would use more sophisticated extraction
    const commonSkills = [
        'JavaScript', 'Python', 'Java', 'C++', 'Ruby', 'PHP', 'TypeScript',
        'React', 'Angular', 'Vue', 'Node.js', 'Express', 'Django', 'Flask',
        'MongoDB', 'PostgreSQL', 'MySQL', 'SQLite', 'Redis', 'Firebase',
        'AWS', 'REST API', 'GraphQL', 'Data Structures'
    ];
    
    // Just return some random skills for this example
    return commonSkills.filter(() => Math.random() > 0.7);
}

// Email testing endpoint
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

export default app;
