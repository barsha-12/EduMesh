const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Removed volatile global chatHistory array

/**
 * Send a message to Groq AI and get a response.
 */
async function callGroq(messages, temperature = 0.7, maxTokens = 2048) {
  if (!GROQ_API_KEY) {
    return "⚠️ Please add your Groq API key in the .env file (VITE_GROQ_API_KEY).";
  }

  try {
    const res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages,
        temperature,
        max_tokens: maxTokens,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error('Groq API Error:', err);
      if (res.status === 429) {
        return "⏳ Rate limit reached. Please wait a moment and try again.";
      }
      return `❌ API error (${res.status}). Please check your API key.`;
    }

    const data = await res.json();
    return data.choices[0]?.message?.content || "No response generated.";
  } catch (error) {
    console.error('Groq Error:', error);
    return "❌ Network error. Please check your connection and try again.";
  }
}

/**
 * Send a chat message with conversation memory provided externally.
 */
export async function sendChatMessage(message, externalHistory = []) {
  // Format the external history for Groq ({role: 'user'|'assistant', content: string})
  // Usually externalHistory from our store is {role: 'user'|'ai', text: string}
  const formattedHistory = externalHistory.map(msg => ({
    role: msg.role === 'ai' ? 'assistant' : 'user',
    content: msg.text
  }));

  // Keep system prompt + last 20 messages to avoid token limits
  const messages = [
    {
      role: 'system',
      content: 'You are EduMesh AI — a friendly, helpful study tutor for college students. Answer clearly with examples. Use markdown formatting for structure (headers, bold, bullet points, code blocks). Keep responses concise but thorough. Use simple language and analogies to explain complex topics.'
    },
    ...formattedHistory.slice(-20),
    { role: 'user', content: message } // Push the newest message
  ];

  return await callGroq(messages);
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

  const reply = await callGroq(messages, 0.4, 3000);

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

  return await callGroq(messages, 0.5, 3000);
}

/**
 * Generate MCQ quiz questions for a topic.
 * Returns parsed JSON array of questions.
 */
export async function generateQuiz(subject, topic, numQuestions = 5) {
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

Return ONLY a valid JSON array. Each object must have:
- "question": the question text
- "options": array of exactly 4 option strings
- "correctIndex": index of the correct option (0-3)
- "explanation": brief explanation of why the answer is correct

Return ONLY the JSON array, nothing else.`
    }
  ];

  const reply = await callGroq(messages, 0.3, 3000);

  try {
    // Clean response - remove any markdown code blocks
    const cleaned = reply.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('Quiz parse error:', error, 'Raw:', reply);
    return null;
  }
}
