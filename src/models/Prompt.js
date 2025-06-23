const mongoose = require('mongoose');

// Schema for storing AI prompts
const PromptSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  tags: {
    type: [String],
    default: []
  },
  category: {
    type: String,
    default: 'general'
  },
  model: {
    type: String,
    default: 'gpt-4'
  },
  createdBy: {
    type: String,
    default: 'system'
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Add text index for search
PromptSchema.index({ 
  title: 'text', 
  content: 'text', 
  tags: 'text' 
});

const Prompt = mongoose.model('Prompt', PromptSchema);

module.exports = Prompt;