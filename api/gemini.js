import { GoogleGenerativeAI } from "@google/generative-ai";
import cookie from 'cookie';
import jwt from 'jsonwebtoken';
import getDb from './lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { messages, prompt } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
  }

  // Identify User & Enforce AI Limits
  const cookies = cookie.parse(req.headers.cookie || '');
  const token = cookies.auth_token;
  let userEmail = null;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'secret');
      userEmail = decoded.email;
    } catch(e) {}
  }

  if (userEmail) {
    try {
      const db = await getDb();
      const users = db.collection('users');
      const today = new Date().toISOString().split('T')[0];
      const user = await users.findOne({ email: userEmail });
      
      if (user) {
        if (user.usage_reset_date !== today) {
          await users.updateOne({ _id: user._id }, { $set: { usage_count: 0, usage_reset_date: today } });
          user.usage_count = 0;
        }
        if (user.usage_count >= 500) {
          return res.status(403).json({ error: 'Daily AI limit reached (500/500). Upgrade to Elite Plus.', limitReached: true });
        }
        await users.updateOne({ _id: user._id }, { $inc: { usage_count: 1 } });
      }
    } catch (e) { console.error('Usage enforcement error:', e); }
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  try {
    const { stream = false } = req.body;
    // Standard chat handling
    let history = [];
    let userMessage = prompt || "Hello!";

    if (messages && Array.isArray(messages)) {
      history = messages.slice(0, -1).map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));
      userMessage = messages[messages.length - 1].content;
    }

    if (stream) {
      const chat = model.startChat({ history });

      // Set headers for SSE
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no');

      const result = await chat.sendMessageStream(userMessage);

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        // Format as Groq-like SSE for frontend unity
        const data = {
          choices: [{
            delta: { content: chunkText }
          }]
        };
        res.write(`data: ${JSON.stringify(data)}\n\n`);
      }

      res.write('data: [DONE]\n\n');
      return res.end();
    } else {
      const chat = model.startChat({ history });
      const result = await chat.sendMessage(userMessage);
      const response = await result.response;
      const text = response.text();
      
      // Return standard JSON resembling Groq's structure for consistency
      return res.json({
        choices: [{
          message: { content: text }
        }]
      });
    }
  } catch (error) {
    console.error('Gemini API Error:', error);
    if (!res.writableEnded) {
       res.status(500).json({ error: error.message });
    }
  }
}
