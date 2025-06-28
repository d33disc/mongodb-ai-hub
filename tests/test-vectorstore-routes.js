/**
 * Test Vector Store Routes - Standardized Response Format
 */

const express = require('express');
const router = express.Router();
const VectorStore = require('../src/models/VectorStore');
const { authenticate, optionalAuth } = require('../src/middleware/auth');

// Get all vector stores
router.get('/', optionalAuth, async (req, res) => {
  try {
    const vectorStores = await VectorStore.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      message: 'Vector stores retrieved successfully',
      data: {
        vectorStores,
        count: vectorStores.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve vector stores',
      error: 'INTERNAL_ERROR'
    });
  }
});

// Get a single vector store by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const vectorStore = await VectorStore.findById(req.params.id);
    if (!vectorStore) {
      return res.status(404).json({
        success: false,
        message: 'Vector store not found',
        error: 'VECTORSTORE_NOT_FOUND'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Vector store retrieved successfully',
      data: {
        vectorStore
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve vector store',
      error: 'INTERNAL_ERROR'
    });
  }
});

// Create a new vector store
router.post('/', authenticate, async (req, res) => {
  try {
    const vectorStore = new VectorStore({
      name: req.body.name,
      namespace: req.body.namespace || 'default',
      vectorDimension: req.body.vectorDimension || 1536,
      model: req.body.model || 'text-embedding-ada-002',
      description: req.body.description || '',
      createdBy: req.user.id,
      isPublic: req.body.isPublic || false,
      metadata: req.body.metadata || {},
      embeddings: []
    });

    const newVectorStore = await vectorStore.save();
    
    res.status(201).json({
      success: true,
      message: 'Vector store created successfully',
      data: newVectorStore
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
      message: 'Failed to create vector store',
      error: 'INTERNAL_ERROR'
    });
  }
});

// Update a vector store
router.put('/:id', authenticate, async (req, res) => {
  try {
    const vectorStore = await VectorStore.findById(req.params.id);
    
    if (!vectorStore) {
      return res.status(404).json({
        success: false,
        message: 'Vector store not found',
        error: 'VECTORSTORE_NOT_FOUND'
      });
    }

    // Check if user owns the vector store
    if (vectorStore.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this vector store',
        error: 'UNAUTHORIZED'
      });
    }

    // Update fields
    const allowedUpdates = ['name', 'namespace', 'description', 'isPublic', 'metadata'];
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        vectorStore[field] = req.body[field];
      }
    });

    const updatedVectorStore = await vectorStore.save();
    
    res.status(200).json({
      success: true,
      message: 'Vector store updated successfully',
      data: updatedVectorStore
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update vector store',
      error: 'INTERNAL_ERROR'
    });
  }
});

// Delete a vector store
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const vectorStore = await VectorStore.findById(req.params.id);
    
    if (!vectorStore) {
      return res.status(404).json({
        success: false,
        message: 'Vector store not found',
        error: 'VECTORSTORE_NOT_FOUND'
      });
    }

    // Check if user owns the vector store
    if (vectorStore.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this vector store',
        error: 'UNAUTHORIZED'
      });
    }

    await VectorStore.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Vector store deleted successfully',
      data: {
        deletedId: req.params.id
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete vector store',
      error: 'INTERNAL_ERROR'
    });
  }
});

// Add embeddings to a vector store
router.post('/:id/embeddings', authenticate, async (req, res) => {
  try {
    const vectorStore = await VectorStore.findById(req.params.id);
    
    if (!vectorStore) {
      return res.status(404).json({
        success: false,
        message: 'Vector store not found',
        error: 'VECTORSTORE_NOT_FOUND'
      });
    }

    // Check if user owns the vector store
    if (vectorStore.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this vector store',
        error: 'UNAUTHORIZED'
      });
    }

    const { vector, text, metadata } = req.body;

    if (!vector || !Array.isArray(vector)) {
      return res.status(400).json({
        success: false,
        message: 'Vector array is required',
        error: 'INVALID_VECTOR'
      });
    }

    if (vector.length !== vectorStore.vectorDimension) {
      return res.status(400).json({
        success: false,
        message: `Vector dimension must be ${vectorStore.vectorDimension}`,
        error: 'DIMENSION_MISMATCH'
      });
    }

    const embedding = {
      vector,
      text: text || '',
      metadata: metadata || {},
      timestamp: new Date()
    };

    vectorStore.embeddings.push(embedding);
    await vectorStore.save();
    
    res.status(200).json({
      success: true,
      message: 'Embedding added successfully',
      data: vectorStore
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to add embedding',
      error: 'INTERNAL_ERROR'
    });
  }
});

// Remove embedding from vector store
router.delete('/:id/embeddings/:embeddingId', authenticate, async (req, res) => {
  try {
    const vectorStore = await VectorStore.findById(req.params.id);
    
    if (!vectorStore) {
      return res.status(404).json({
        success: false,
        message: 'Vector store not found',
        error: 'VECTORSTORE_NOT_FOUND'
      });
    }

    // Check if user owns the vector store
    if (vectorStore.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this vector store',
        error: 'UNAUTHORIZED'
      });
    }

    // Remove the embedding
    vectorStore.embeddings.id(req.params.embeddingId).remove();
    await vectorStore.save();
    
    res.status(200).json({
      success: true,
      message: 'Embedding removed successfully',
      data: {
        deletedEmbeddingId: req.params.embeddingId,
        totalEmbeddings: vectorStore.embeddings.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to remove embedding',
      error: 'INTERNAL_ERROR'
    });
  }
});

module.exports = router;