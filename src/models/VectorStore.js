const mongoose = require('mongoose');

// Schema for vector embeddings
const EmbeddingSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  vector: {
    type: [Number],
    required: true
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  }
});

// Schema for vector stores
const VectorStoreSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    namespace: {
      type: String,
      required: true,
      trim: true
    },
    vectorDimension: {
      type: Number,
      required: true
    },
    embeddings: {
      type: [EmbeddingSchema],
      default: []
    },
    model: {
      type: String,
      required: true
    },
    createdBy: {
      type: String,
      default: 'system'
    }
  },
  {
    timestamps: true
  }
);

// Add text index for search
VectorStoreSchema.index({
  name: 'text',
  description: 'text',
  namespace: 'text'
});

const VectorStore = mongoose.model('VectorStore', VectorStoreSchema);

module.exports = VectorStore;
