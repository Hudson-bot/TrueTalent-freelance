import express from "express";
import Project from "../models/Project.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { getProjectsByUser } from "../controllers/projectController.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "../../uploads/");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif|pdf|doc|docx|mp4|webm|mov/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(
      new Error(
        "Error: File upload only supports the following filetypes - " +
          filetypes
      )
    );
  },
});

// Create a new project
router.post('/', upload.single('attachment'), async (req, res) => {
  try {
    // Validate required fields
    if (!req.body.title || !req.body.description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    const projectData = {
      userId: req.body.userId,
      title: req.body.title,
      description: req.body.description,
      contentFocus: req.body.contentFocus || '',
      targetAudience: req.body.targetAudience || '',
      requiredSkills: Array.isArray(req.body.requiredSkills) 
        ? req.body.requiredSkills 
        : JSON.parse(req.body.requiredSkills || '[]'),
      currency: req.body.currency || 'USD',
      minBudget: parseFloat(req.body.minBudget) || 0,
      maxBudget: parseFloat(req.body.maxBudget) || 0
    };

    // Handle file upload
    if (req.file) {
      projectData.attachmentUrl = `/uploads/${req.file.filename}`;
      projectData.attachmentType = req.file.mimetype;
    }

    const newProject = await Project.create(projectData);
    res.status(201).json(newProject);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ 
      message: 'Error creating project',
      error: error.message
    });
  }
});

// Get all projects
router.get("/", async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a project by ID
router.get("/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get projects by user ID
router.get("/user/:userId", getProjectsByUser);

// Update a project
router.put("/:id", upload.single("attachment"), async (req, res) => {
  try {
    const projectData = {
      title: req.body.title,
      description: req.body.description,
      contentFocus: req.body.contentFocus,
      targetAudience: req.body.targetAudience,
      requiredSkills: JSON.parse(req.body.requiredSkills || "[]"),
      currency: req.body.currency,
      minBudget: req.body.minBudget,
      maxBudget: req.body.maxBudget,
      status: req.body.status,
    };

    // Add attachment info if a file was uploaded
    if (req.file) {
      projectData.attachmentUrl = `/uploads/${req.file.filename}`;
      projectData.attachmentType = req.file.mimetype;
    }

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      projectData,
      { new: true }
    );

    if (!updatedProject) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(updatedProject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a project
router.delete("/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Delete the attachment file if it exists
    if (project.attachmentUrl) {
      const filePath = path.join(process.cwd(), project.attachmentUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
