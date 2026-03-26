import axios from 'axios';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

/**
 * Call AI service to get personalized content feed.
 * @param {object} params - Feed parameters
 * @returns {Promise<object>} Personalized feed data
 */
export async function getPersonalizedFeed(params) {
  try {
    const response = await axios.post(`${AI_SERVICE_URL}/personalize/feed`, params, { timeout: 15000 });
    return response.data;
  } catch (error) {
    console.error('AI feed service error:', error.message);
    throw new Error('AI service unavailable');
  }
}

/**
 * Call AI service to generate an explanation.
 * @param {object} params - { topic, gradeLevel, language, learningStyle }
 * @returns {Promise<object>} Generated explanation
 */
export async function generateExplanation(params) {
  try {
    const response = await axios.post(`${AI_SERVICE_URL}/generate/explanation`, params, { timeout: 30000 });
    return response.data;
  } catch (error) {
    console.error('AI explanation service error:', error.message);
    throw new Error('AI service unavailable');
  }
}

/**
 * Call AI service to translate content.
 * @param {object} params - { text, targetLanguage, contentType }
 * @returns {Promise<object>} Translation result
 */
export async function translateContent(params) {
  try {
    const response = await axios.post(`${AI_SERVICE_URL}/translate`, params, { timeout: 15000 });
    return response.data;
  } catch (error) {
    console.error('AI translation service error:', error.message);
    throw new Error('Translation service unavailable');
  }
}

/**
 * Call AI service to classify content.
 * @param {object} params - { title, body, tags }
 * @returns {Promise<object>} Classification result
 */
export async function classifyContent(params) {
  try {
    const response = await axios.post(`${AI_SERVICE_URL}/classify/content`, params, { timeout: 15000 });
    return response.data;
  } catch (error) {
    console.error('AI classification service error:', error.message);
    throw new Error('Classification service unavailable');
  }
}

/**
 * Call AI service to assess mastery.
 * @param {object} params - { userId, topic, responses[] }
 * @returns {Promise<object>} Mastery assessment
 */
export async function assessMastery(params) {
  try {
    const response = await axios.post(`${AI_SERVICE_URL}/assess/mastery`, params, { timeout: 15000 });
    return response.data;
  } catch (error) {
    console.error('AI mastery service error:', error.message);
    throw new Error('Mastery assessment service unavailable');
  }
}
