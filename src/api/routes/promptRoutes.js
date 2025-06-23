const express = require('express');
const router = express.Router();
const Prompt = require('../../models/Prompt');

// Get all prompts
router.get('/', async (req, res) => {
  try {
    const prompts = await Prompt.find().sort({ createdAt: -1 });
    res.json(prompts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single prompt by ID
router.get('/:id', async (req, res) => {
  try {
    const prompt = await Prompt.findById(req.params.id);
    if (!prompt) {
      return res.status(404).json({ message: 'Prompt not found' });
    }
    res.json(prompt);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new prompt
router.post('/', async (req, res) => {
  const prompt = new Prompt({
    title: req.body.title,
    content: req.body.content,
    tags: req.body.tags || [],
    category: req.body.category || 'general',
    model: req.body.model || 'gpt-4',
    createdBy: req.body.createdBy || 'system',
    isPublic: req.body.isPublic || false,
    metadata: req.body.metadata || {}
  });

  try {
    const newPrompt = await prompt.save();
    res.status(201).json(newPrompt);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a prompt
router.put('/:id', async (req, res) => {
  try {
    const prompt = await Prompt.findById(req.params.id);
    if (!prompt) {
      return res.status(404).json({ message: 'Prompt not found' });
    }

    // Update fields
    if (req.body.title) prompt.title = req.body.title;
    if (req.body.content) prompt.content = req.body.content;
    if (req.body.tags) prompt.tags = req.body.tags;
    if (req.body.category) prompt.category = req.body.category;
    if (req.body.model) prompt.model = req.body.model;
    if (req.body.isPublic !== undefined) prompt.isPublic = req.body.isPublic;
    if (req.body.metadata) prompt.metadata = req.body.metadata;

    const updatedPrompt = await prompt.save();
    res.json(updatedPrompt);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a prompt
router.delete('/:id', async (req, res) => {
  try {
    const prompt = await Prompt.findById(req.params.id);
    if (!prompt) {
      return res.status(404).json({ message: 'Prompt not found' });
    }
    
    await prompt.deleteOne();
    res.json({ message: 'Prompt deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Search prompts
router.get('/search/text', async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const prompts = await Prompt.find(
      { $text: { $search: query } },
      { score: { $meta: 'textScore' } }
    )
    .sort({ score: { $meta: 'textScore' } });

    res.json(prompts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;