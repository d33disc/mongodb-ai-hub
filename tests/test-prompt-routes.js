/**
 * Test Prompt Routes - Standardized Response Format
 */

const express = require('express');
const router = express.Router();
const Prompt = require('../src/models/Prompt');
const { authenticate, optionalAuth } = require('../src/middleware/auth');

// Get all prompts
router.get('/', optionalAuth, async (req, res) => {
  try {
    const prompts = await Prompt.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      message: 'Prompts retrieved successfully',
      data: {
        prompts,
        count: prompts.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve prompts',
      error: 'INTERNAL_ERROR'
    });
  }
});

// Get a single prompt by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const prompt = await Prompt.findById(req.params.id);
    if (!prompt) {
      return res.status(404).json({
        success: false,
        message: 'Prompt not found',
        error: 'PROMPT_NOT_FOUND'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Prompt retrieved successfully',
      data: {
        prompt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve prompt',
      error: 'INTERNAL_ERROR'
    });
  }
});

// Create a new prompt
router.post('/', authenticate, async (req, res) => {
  try {
    const prompt = new Prompt({
      title: req.body.title,
      content: req.body.content,
      tags: req.body.tags || [],
      category: req.body.category || 'general',
      model: req.body.model || 'gpt-4',
      createdBy: req.user.id,
      isPublic: req.body.isPublic || false,
      metadata: req.body.metadata || {}
    });

    const newPrompt = await prompt.save();
    
    res.status(201).json({
      success: true,
      message: 'Prompt created successfully',
      data: newPrompt
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        error: 'VALIDATION_ERROR',
        errors: validationErrors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create prompt',
      error: 'INTERNAL_ERROR'
    });
  }
});

// Update a prompt
router.put('/:id', authenticate, async (req, res) => {
  try {
    const prompt = await Prompt.findById(req.params.id);
    
    if (!prompt) {
      return res.status(404).json({
        success: false,
        message: 'Prompt not found',
        error: 'PROMPT_NOT_FOUND'
      });
    }

    // Check if user owns the prompt
    if (prompt.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this prompt',
        error: 'UNAUTHORIZED'
      });
    }

    // Update fields
    const allowedUpdates = ['title', 'content', 'tags', 'category', 'model', 'isPublic', 'metadata'];
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        prompt[field] = req.body[field];
      }
    });

    const updatedPrompt = await prompt.save();
    
    res.status(200).json({
      success: true,
      message: 'Prompt updated successfully',
      data: updatedPrompt
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update prompt',
      error: 'INTERNAL_ERROR'
    });
  }
});

// Delete a prompt
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const prompt = await Prompt.findById(req.params.id);
    
    if (!prompt) {
      return res.status(404).json({
        success: false,
        message: 'Prompt not found',
        error: 'PROMPT_NOT_FOUND'
      });
    }

    // Check if user owns the prompt
    if (prompt.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this prompt',
        error: 'UNAUTHORIZED'
      });
    }

    await Prompt.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Prompt deleted successfully',
      data: {
        deletedId: req.params.id
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete prompt',
      error: 'INTERNAL_ERROR'
    });
  }
});

// Search prompts
router.get('/search/text', optionalAuth, async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
        error: 'MISSING_QUERY'
      });
    }

    // Simple text search using regex for testing
    const prompts = await Prompt.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { content: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } }
      ]
    }).sort({ createdAt: -1 });

    // Return array format as expected by test
    res.status(200).json(prompts);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Search failed',
      error: 'INTERNAL_ERROR'
    });
  }
});

module.exports = router;