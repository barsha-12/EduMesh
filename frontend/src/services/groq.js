import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

/**
 * Generate AI explanation for a topic
 */
export const generateExplanation = async (topic, style = 'detailed', includeELI5 = false) => {
  try {
    let systemPrompt = `You are an expert tutor explaining concepts clearly and accurately.`;
    
    if (includeELI5) {
      systemPrompt += ` Explain everything using simple analogies and words a 10-year-old can understand. No jargon.`;
    } else if (style === 'concise') {
      systemPrompt += ` Provide a concise yet comprehensive explanation in 2-3 paragraphs max.`;
    } else if (style === 'eli5') {
      systemPrompt += ` Explain as if teaching a 10-year-old.`;
    }

    const message = await groq.messages.create({
      messages: [{ role: 'user', content: topic }],
      model: 'llama-3.3-70b-versatile',
      max_tokens: 1024,
      system: systemPrompt,
    });

    return message.content[0].text;
  } catch (error) {
    console.error('Groq explanation error:', error);
    throw new Error(`Failed to generate explanation: ${error.message}`);
  }
};

/**
 * Generate comprehensive study notes
 */
export const generateNotes = async (topic, subject) => {
  try {
    const prompt = `Generate comprehensive study notes for "${topic}" in ${subject}.

Structure your response exactly as follows with markdown headers:

## Overview
[Brief overview of the topic]

## Key Definitions
[List key terms and their definitions related to the topic]

## Core Concepts
[Explain the core concepts with worked examples]

## Common Mistakes to Avoid
[List common misconceptions, mistakes or pitfalls students often make]

## Memory Tricks
[Provide mnemonics, memory tricks, or study tips]

## Summary
[A concise summary of the entire topic]`;

    const message = await groq.messages.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      max_tokens: 2024,
      system: 'You are an expert study notes writer. Create detailed, well-organized, and easy-to-understand study materials.',
    });

    return message.content[0].text;
  } catch (error) {
    console.error('Groq notes generation error:', error);
    throw new Error(`Failed to generate notes: ${error.message}`);
  }
};

/**
 * Generate quiz questions from a topic or notes content
 */
export const generateQuiz = async (topic, subject, difficulty = 'medium') => {
  try {
    const difficultyGuide = {
      easy: 'basic concepts, straightforward answers',
      medium: 'application of concepts, some reasoning required',
      hard: 'complex scenarios, deep understanding needed',
    };

    const prompt = `Generate 5 multiple-choice quiz questions for "${topic}" in ${subject}. 
These questions should be ${difficultyGuide[difficulty]}.

Return ONLY a valid JSON array (no markdown, no extra text) with this exact structure:
[
  {
    "question": "What is...",
    "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
    "correct": "B",
    "explanation": "The correct answer is B because..."
  }
]

Make sure:
- Each question has exactly 4 options (A, B, C, D)
- The "correct" field contains exactly one letter (A, B, C, or D)
- Explanations are clear and educational`;

    const message = await groq.messages.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      max_tokens: 2048,
      system: 'You are an expert quiz creator. Generate high-quality multiple-choice questions that test understanding. ALWAYS respond with valid JSON only.',
    });

    const responseText = message.content[0].text;
    
    // Extract JSON from response (in case model includes extra text)
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Unable to parse quiz JSON from response');
    }

    const quiz = JSON.parse(jsonMatch[0]);
    return quiz;
  } catch (error) {
    console.error('Groq quiz generation error:', error);
    throw new Error(`Failed to generate quiz: ${error.message}`);
  }
};

/**
 * Generate  quiz questions from existing notes content
 */
export const generateQuizFromNotes = async (notesContent) => {
  try {
    const prompt = `Based on these study notes, generate 3 multiple-choice quiz questions to test understanding:

"${notesContent}"

Return ONLY a valid JSON array (no markdown, no extra text):
[
  {
    "question": "...",
    "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
    "correct": "A",
    "explanation": "..."
  }
]`;

    const message = await groq.messages.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      max_tokens: 1024,
      system: 'You are an expert quiz creator. Generate relevant questions from notes. Respond with ONLY valid JSON.',
    });

    const responseText = message.content[0].text;
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('Unable to parse quiz JSON');

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Error generating quiz from notes:', error);
    throw new Error(`Failed to generate quiz: ${error.message}`);
  }
};

/**
 * AI Chat with conversation history
 */
export const sendChatMessage = async (messages, systemPrompt = null) => {
  try {
    const defaultSystemPrompt = `You are EduMesh, an expert AI tutor helping students learn effectively. 
Be friendly, encouraging, and clear in your explanations. 
Adapt your teaching style to the student's level and needs.`;

    const message = await groq.messages.create({
      messages,
      model: 'llama-3.3-70b-versatile',
      max_tokens: 1024,
      system: systemPrompt || defaultSystemPrompt,
    });

    return message.content[0].text;
  } catch (error) {
    console.error('Groq chat error:', error);
    throw new Error(`Failed to send message: ${error.message}`);
  }
};

/**
 * Transform a Q&A chat exchange into a study note
 */
export const convertChatToNote = async (question, answer, subject = 'General') => {
  try {
    const prompt = `Convert this Q&A exchange into a well-structured study note:

Q: ${question}
A: ${answer}

Format as markdown with sections like: Overview, Key Points, Examples, Important Notes, Related Concepts.
Make it comprehensive and suitable for studying.`;

    const message = await groq.messages.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      max_tokens: 1024,
      system: 'You are an expert note formatter. Convert Q&A into well-structured, markdown-formatted study notes.',
    });

    return message.content[0].text;
  } catch (error) {
    console.error('Error converting chat to note:', error);
    throw new Error(`Failed to convert chat to note: ${error.message}`);
  }
};
