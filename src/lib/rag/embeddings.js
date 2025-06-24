import { OpenAI } from 'openai';

// In-memory cache for embeddings
let embeddingsCache = null;

/**
 * Generate embeddings for the knowledge base
 * @param {Array} knowledgeBase - Array of knowledge base items
 * @param {string} apiKey - OpenAI API key
 * @returns {Promise<Array>} - Array of items with embeddings
 */
export async function generateEmbeddings(knowledgeBase, apiKey) {
  const openai = new OpenAI({
    apiKey: apiKey,
  });

  // Generate embeddings for each item in the knowledge base
  const itemsWithEmbeddings = [];
  
  for (const item of knowledgeBase) {
    try {
      const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: `${item.title}: ${item.content}`,
        encoding_format: 'float'
      });

      itemsWithEmbeddings.push({
        ...item,
        embedding: response.data[0].embedding
      });
    } catch (error) {
      console.error(`Error generating embedding for item ${item.id}:`, error);
      // Skip this item if embedding fails
      continue;
    }
  }

  return itemsWithEmbeddings;
}

/**
 * Calculate cosine similarity between two vectors
 * @param {Array} vecA - First vector
 * @param {Array} vecB - Second vector
 * @returns {number} - Cosine similarity score
 */
function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  
  const dotProduct = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0));
  
  if (magnitudeA === 0 || magnitudeB === 0) return 0;
  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Find similar items in the knowledge base
 * @param {string} query - The search query
 * @param {Array} items - Items with embeddings
 * @param {string} apiKey - OpenAI API key
 * @param {number} limit - Maximum number of results to return
 * @returns {Promise<Array>} - Array of similar items with similarity scores
 */
export async function findSimilarItems(query, items, apiKey, limit = 3) {
  if (!query || !items || items.length === 0) return [];
  
  const openai = new OpenAI({
    apiKey: apiKey,
  });

  try {
    // Generate embedding for the query
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query,
      encoding_format: 'float'
    });
    
    const queryEmbedding = response.data[0].embedding;
    
    // Calculate similarity scores for all items
    const itemsWithScores = items
      .filter(item => item.embedding) // Only include items with embeddings
      .map(item => ({
        ...item,
        // Create a new object without the embedding to reduce payload size
        // The embedding is large and not needed in the response
        _score: cosineSimilarity(queryEmbedding, item.embedding)
      }))
      .filter(item => item._score > 0.5) // Filter out low similarity scores
      .sort((a, b) => b._score - a._score) // Sort by score descending
      .slice(0, limit); // Limit results
    
    return itemsWithScores;
  } catch (error) {
    console.error('Error finding similar items:', error);
    return [];
  }
}

/**
 * Get or generate embeddings for the knowledge base
 * @param {string} apiKey - OpenAI API key
 * @returns {Promise<Array>} - Array of items with embeddings
 */
export async function getOrCreateEmbeddings(apiKey) {
  // If we already have cached embeddings, return them
  if (embeddingsCache) {
    return embeddingsCache;
  }

  // In a production app, you would load embeddings from a database or file
  // For this example, we'll generate them on the fly
  const knowledgeBase = (await import('./knowledgeBase.js')).default;
  const itemsWithEmbeddings = await generateEmbeddings(knowledgeBase, apiKey);
  
  // Cache the embeddings for future use
  embeddingsCache = itemsWithEmbeddings;
  
  return itemsWithEmbeddings;
}
