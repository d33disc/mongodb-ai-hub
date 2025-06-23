const express = require('express');
const router = express.Router();
const VectorStore = require('../../models/VectorStore');

// Get all vector stores
router.get('/', async (req, res) => {
  try {
    const vectorStores = await VectorStore.find().sort({ createdAt: -1 });
    res.json(vectorStores);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single vector store by ID
router.get('/:id', async (req, res) => {
  try {
    const vectorStore = await VectorStore.findById(req.params.id);
    if (!vectorStore) {
      return res.status(404).json({ message: 'Vector store not found' });
    }
    res.json(vectorStore);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new vector store
router.post('/', async (req, res) => {
  const vectorStore = new VectorStore({
    name: req.body.name,
    description: req.body.description || '',
    namespace: req.body.namespace,
    vectorDimension: req.body.vectorDimension,
    model: req.body.model,
    createdBy: req.body.createdBy || 'system',
    embeddings: req.body.embeddings || []
  });

  try {
    const newVectorStore = await vectorStore.save();
    res.status(201).json(newVectorStore);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a vector store
router.put('/:id', async (req, res) => {
  try {
    const vectorStore = await VectorStore.findById(req.params.id);
    if (!vectorStore) {
      return res.status(404).json({ message: 'Vector store not found' });
    }

    // Update fields
    if (req.body.name) vectorStore.name = req.body.name;
    if (req.body.description !== undefined) vectorStore.description = req.body.description;
    if (req.body.namespace) vectorStore.namespace = req.body.namespace;
    if (req.body.vectorDimension) vectorStore.vectorDimension = req.body.vectorDimension;
    if (req.body.model) vectorStore.model = req.body.model;

    const updatedVectorStore = await vectorStore.save();
    res.json(updatedVectorStore);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a vector store
router.delete('/:id', async (req, res) => {
  try {
    const vectorStore = await VectorStore.findById(req.params.id);
    if (!vectorStore) {
      return res.status(404).json({ message: 'Vector store not found' });
    }
    
    await vectorStore.deleteOne();
    res.json({ message: 'Vector store deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add embedding to vector store
router.post('/:id/embeddings', async (req, res) => {
  try {
    const vectorStore = await VectorStore.findById(req.params.id);
    if (!vectorStore) {
      return res.status(404).json({ message: 'Vector store not found' });
    }

    const newEmbedding = {
      id: req.body.id,
      text: req.body.text,
      vector: req.body.vector,
      metadata: req.body.metadata || {}
    };

    vectorStore.embeddings.push(newEmbedding);
    const updatedVectorStore = await vectorStore.save();
    
    res.status(201).json(updatedVectorStore);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete embedding from vector store
router.delete('/:id/embeddings/:embeddingId', async (req, res) => {
  try {
    const vectorStore = await VectorStore.findById(req.params.id);
    if (!vectorStore) {
      return res.status(404).json({ message: 'Vector store not found' });
    }

    // Find the embedding index
    const embeddingIndex = vectorStore.embeddings.findIndex(
      embedding => embedding.id === req.params.embeddingId
    );
    
    if (embeddingIndex === -1) {
      return res.status(404).json({ message: 'Embedding not found' });
    }

    // Remove the embedding
    vectorStore.embeddings.splice(embeddingIndex, 1);
    await vectorStore.save();
    
    res.json({ message: 'Embedding deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;