import { useToastStore } from '../store/toastStore';

let currentModel = 'groq'; // 'groq' or 'gemini'

export const setAIModel = (model) => {
  currentModel = model;
  console.log(`EduMesh AI Switched to: ${model}`);
};

export const getAIModel = () => currentModel;

/**
 * Unified AI call router
 */
async function callAI(messages, temperature = 0.7, maxTokens = 2048) {
  const endpoint = currentModel === 'gemini' ? '/api/gemini' : '/api/chat';
  
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages,
        model: currentModel === 'groq' ? 'llama-3.1-8b-instant' : 'gemini-1.5-flash',
        temperature,
        max_tokens: maxTokens,
        stream: true, // Always stream to keep connection alive (prevent 504)
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error(`${currentModel} API Error:`, err);
      if (res.status === 429) {
        useToastStore.getState().addToast('API Rate limit reached.', 'warning');
      }
      return `❌ API error (${res.status}).`;
    }

    // Stream Aggregator: Buffers chunks into a single string
    // This 'heartbeat' mechanism prevents Vercel from killing the connection
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let accumulated = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (!line.trim() || !line.startsWith('data: ')) continue;
        const data = line.replace('data: ', '').trim();
        if (data === '[DONE]') break;
        try {
          const parsed = JSON.parse(data);
          // Handle both Groq and Gemini normalized formats
          const token = parsed.choices?.[0]?.delta?.content || parsed.choices?.[0]?.message?.content || "";
          accumulated += token;
        } catch (e) {
          // Skip partial/malformed JSON chunks
        }
      }
    }

    return accumulated.trim() || "No response generated.";
  } catch (error) {
    console.error(`${currentModel} Error:`, error);
    return "❌ Connection timeout. AI is thinking too hard—please try again!";
  }
}

/**
 * Send a chat message with conversation memory.
 */
export async function sendChatMessage(message, externalHistory = []) {
  const formattedHistory = externalHistory.map(msg => ({
    role: msg.role === 'ai' ? 'assistant' : 'user',
    content: msg.text
  }));

  const messages = [
    {
      role: 'system',
      content: 'You are EduMesh AI — a friendly, helpful study tutor. Answer clearly with markdown formatting.'
    },
    ...formattedHistory.slice(-10),
    { role: 'user', content: message }
  ];

  return await callAI(messages);
}

/**
 * Generate structural JSON map nodes for the Mind Tree.
 */
export async function generateMindTree(topic) {
  const messages = [
    {
      role: 'system',
      content: 'You are a graph node builder. You ONLY output valid JSON arrays. Do not return markdown, just raw JSON.'
    },
    {
      role: 'user',
      content: `Construct a Mind Map for the topic: "${topic}". 
Return exactly a valid JSON array of node objects. Each object MUST have:
- "id": unique string identifier (e.g. "root", "n1", "n2")
- "label": short, punchy title for the node concept
- "parentId": the id of the parent node (use null for the root node)

Include exactly 7-10 nodes branching logically from the root topic. Return ONLY the JSON.`
    }
  ];

  const reply = await callAI(messages, 0.4, 3000);

  try {
    const cleaned = reply.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('MindTree parse error:', error, 'Raw:', reply);
    return null;
  }
}

/**
 * Generate structured study notes for a topic.
 */
export async function generateStudyNotes(subject, topic) {
  const messages = [
    {
      role: 'system',
      content: 'You are an expert tutor who creates clear, well-structured study notes for college students. Use markdown formatting.'
    },
    {
      role: 'user',
      content: `Generate comprehensive study notes on:

Subject: ${subject}
Topic: ${topic}

Format with these sections (use markdown):

## 📌 Summary
A brief 2-3 sentence overview of the topic.

## 📖 Key Concepts
Explain the main concepts clearly with bullet points.

## 💡 Important Points to Remember
List the most critical things to remember.

## 📝 Examples
Provide 2-3 practical examples with explanations.

## 🔗 How It Connects
Briefly explain how this topic connects to other concepts in ${subject}.

Keep the language simple and clear. Use analogies where helpful.`
    }
  ];

  return await callAI(messages, 0.5, 3000);
}

/**
 * Generate MCQ quiz questions for a topic.
 * Accepts an optional difficulty hint based on adaptive logic.
 */
export async function generateQuiz(subject, topic, numQuestions = 5, difficultyHint = '') {
  const messages = [
    {
      role: 'system',
      content: 'You are a quiz generator. You ONLY return valid JSON arrays. No markdown, no explanations, just pure JSON.'
    },
    {
      role: 'user',
      content: `Generate exactly ${numQuestions} multiple-choice quiz questions for a college student on:

Subject: ${subject}
Topic: ${topic}
${difficultyHint ? `\nDifficulty instruction: ${difficultyHint}` : ''}

Return ONLY a valid JSON array. Each object must have:
- "question": the question text
- "options": array of exactly 4 option strings
- "correctIndex": index of the correct option (0-3)
- "explanation": brief explanation of why the answer is correct

Return ONLY the JSON array, nothing else.`
    }
  ];

  const reply = await callAI(messages, 0.3, 3000);

  try {
    const cleaned = reply.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('Quiz parse error:', error, 'Raw:', reply);
    return null;
  }
}

/**
 * Generate flashcards from study notes content.
 */
export async function generateFlashcards(content, subject, topic) {
  const messages = [
    {
      role: 'system',
      content: 'You are a flashcard generator. You ONLY return valid JSON arrays. No markdown wrapping.'
    },
    {
      role: 'user',
      content: `From the following study notes, extract 8-12 key term/concept flashcards.

Subject: ${subject}
Topic: ${topic}
Notes content:
${content.slice(0, 3000)}

Return ONLY a valid JSON array where each object has:
- "front": the term, concept, or question (short)
- "back": the definition, explanation, or answer (1-3 sentences)

Return ONLY the JSON array.`
    }
  ];

  const reply = await callAI(messages, 0.3, 2000);

  try {
    const cleaned = reply.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('Flashcard parse error:', error, 'Raw:', reply);
    return null;
  }
}

/**
 * Feynman mode — AI acts as a confused student.
 */
export async function sendFeynmanMessage(topic, conversationHistory = []) {
  const messages = [
    {
      role: 'system',
      content: `You are a confused student who is trying to understand "${topic}". You ask probing, thoughtful questions that test the teacher's understanding. You identify gaps in their explanation. Be curious but also challenge vague explanations. Ask "why does that happen?", "can you give an example?", "I don't get the connection between X and Y". Keep responses to 2-3 sentences max. Never break character.`
    },
    ...conversationHistory.map(msg => ({
      role: msg.role === 'ai' ? 'assistant' : 'user',
      content: msg.text
    }))
  ];

  return await callAI(messages, 0.7, 512);
}

/**
 * Score a Feynman teaching session.
 */
export async function scoreFeynmanSession(topic, exchanges) {
  const transcript = exchanges.map(e => `${e.role === 'user' ? 'Teacher' : 'Student'}: ${e.text}`).join('\n');

  const messages = [
    {
      role: 'system',
      content: 'You are an education assessment expert. Analyze the teaching session and return ONLY valid JSON.'
    },
    {
      role: 'user',
      content: `Assess this teaching session where someone tried to explain "${topic}" to a confused student.

Transcript:
${transcript}

Return ONLY a valid JSON object (no markdown) with:
{
  "feynman_score": <0-100>,
  "strong_concepts": ["concept1", "concept2"],
  "weak_concepts": ["concept1", "concept2"],
  "feedback": "2-3 sentences of constructive feedback"
}`
    }
  ];

  const reply = await callAI(messages, 0.3, 1024);

  try {
    const cleaned = reply.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('Feynman score parse error:', error);
    return { feynman_score: 50, strong_concepts: [], weak_concepts: [], feedback: 'Could not parse assessment.' };
  }
}

/**
 * Generate a cram plan for panic mode.
 */
export async function generateCramPlan(subject, weakTopics) {
  const messages = [
    {
      role: 'system',
      content: 'You are an exam preparation expert. Create a focused, actionable cram plan.'
    },
    {
      role: 'user',
      content: `Create a cram plan for ${subject}. The student's 5 weakest topics are:
${weakTopics.map((t, i) => `${i + 1}. ${t}`).join('\n')}

Provide a markdown-formatted plan with:
- Priority order to study
- Key formula/concept to memorize for each
- Time allocation suggestion (assuming 6 hours total)
- Quick tips for each topic`
    }
  ];

  return await callAI(messages, 0.5, 2000);
}

/**
 * Generate a 1-page cheat sheet.
 */
export async function generateCheatSheet(subject, notesContent) {
  const messages = [
    {
      role: 'system',
      content: 'You are a study material compressor. Create ultra-concise cheat sheets.'
    },
    {
      role: 'user',
      content: `Compress all of the following ${subject} notes into a single-page cheat sheet. Use bullets, abbreviations, and formulas. Maximum 500 words.

Notes:
${notesContent.slice(0, 6000)}`
    }
  ];

  return await callAI(messages, 0.3, 1500);
}

/**
 * Chat with document context.
 */
export async function sendChatWithDocument(message, documentText, externalHistory = []) {
  const formattedHistory = externalHistory.map(msg => ({
    role: msg.role === 'ai' ? 'assistant' : 'user',
    content: msg.text
  }));

  const messages = [
    {
      role: 'system',
      content: `You are EduMesh AI — a study tutor. The student has uploaded a document. Use it as context for your answers. Here is the document content:

--- DOCUMENT START ---
${documentText.slice(0, 8000)}
--- DOCUMENT END ---

Answer questions based on this document. Use markdown formatting. Be concise but thorough.`
    },
    ...formattedHistory.slice(-16),
    { role: 'user', content: message }
  ];

  return await callAI(messages);
}
