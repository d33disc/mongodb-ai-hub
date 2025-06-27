/**
 * Vector search utilities for MongoDB Atlas Vector Search
 *
 * This module provides functions for performing vector similarity search
 * using MongoDB Atlas Vector Search capabilities.
 */

const VectorStore = require('../models/VectorStore');

/**
 * Performs cosine similarity search in a vector store
 *
 * @param {string} vectorStoreId - The ID of the vector store to search in
 * @param {Array<number>} queryVector - The query vector to search with
 * @param {number} limit - Maximum number of results to return
 * @param {Object} filters - Optional metadata filters
 * @returns {Promise<Array>} - Array of matching embeddings with similarity scores
 */
async function similaritySearch(vectorStoreId, queryVector, limit = 5, filters = {}) {
  try {
    // For MVP, we'll use in-memory similarity search
    // Later, this will be replaced with MongoDB Atlas Vector Search

    // Get the vector store
    const vectorStore = await VectorStore.findById(vectorStoreId);
    if (!vectorStore) {
      throw new Error('Vector store not found');
    }

    // Calculate cosine similarity for each embedding
    const results = vectorStore.embeddings.map(embedding => {
      const similarity = cosineSimilarity(queryVector, embedding.vector);
      return {
        id: embedding.id,
        text: embedding.text,
        similarity,
        metadata: embedding.metadata
      };
    });

    // Apply metadata filters if provided
    let filteredResults = results;
    if (Object.keys(filters).length > 0) {
      filteredResults = results.filter(result => {
        for (const [key, value] of Object.entries(filters)) {
          if (result.metadata.get(key) !== value) {
            return false;
          }
        }
        return true;
      });
    }

    // Sort by similarity (highest first) and limit results
    return filteredResults.sort((a, b) => b.similarity - a.similarity).slice(0, limit);
  } catch (error) {
    console.error('Similarity search error:', error);
    throw error;
  }
}

/**
 * Calculate cosine similarity between two vectors
 *
 * @param {Array<number>} vectorA - First vector
 * @param {Array<number>} vectorB - Second vector
 * @returns {number} - Cosine similarity (between -1 and 1)
 */
function cosineSimilarity(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vector dimensions do not match');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vectorA.length; i++) {
    dotProduct += vectorA[i] * vectorB[i];
    normA += vectorA[i] * vectorA[i];
    normB += vectorB[i] * vectorB[i];
  }

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

module.exports = {
  similaritySearch,
  cosineSimilarity
};
