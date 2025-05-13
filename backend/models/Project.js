// backend/models/Project.js
import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  contentFocus: {
    type: String,
    default: ''
  },
  targetAudience: {
    type: String,
    default: ''
  },
  attachmentUrl: {
    type: String,
    default: ''
  },
  attachmentType: {
    type: String,
    default: ''
  },
  requiredSkills: {
    type: [String],
    required: true,
    validate: {
      validator: function(skills) {
        return skills.length >= 1 && skills.length <= 5;
      },
      message: 'Projects must have between 1 and 5 skills'
    }
  },
  currency: {
    type: String,
    required: true,
    default: 'USD'
  },
  minBudget: {
    type: Number,
    required: true,
    min: 0
  },
  maxBudget: {
    type: Number,
    required: true,
    validate: {
      validator: function(value) {
        return value >= this.minBudget;
      },
      message: 'Maximum budget must be greater than or equal to minimum budget'
    }
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'completed', 'cancelled'],
    default: 'open'
  }
}, { timestamps: true });

export default mongoose.model('Project', projectSchema);