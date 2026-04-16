import Redis from 'ioredis';
import cookie from 'cookie';
import jwt from 'jsonwebtoken';
import getDb from './lib/db.js';

const redis = process.env.REDIS_URL ? new Redis(process.env.REDIS_URL) : null;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const GROQ_API_KEY = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;
  const DEFAULT_MODEL = 'llama-3.1-8b-instant';
  const COMPLEX_MODEL = 'llama-3.3-70b-versatile';
  
  if (!GROQ_API_KEY) {
    return res.status(500).json({ error: 'GROQ_API_KEY not configured on server' });
  }

  // Identify User
  const cookies = cookie.parse(req.headers.cookie || '');
  const token = cookies.auth_token;
  let userEmail = null;
  let userId = req.headers['x-forwarded-for'] || 'anonymous';

  if (token) {
    const JWT_SECRET = process.env.NEXTAUTH_SECRET;
    if (!JWT_SECRET) {
      console.error('CRITICAL: NEXTAUTH_SECRET is not configured on the server.');
      return res.status(500).json({ error: 'Server authentication misconfiguration' });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      userId = decoded.id;
      userEmail = decoded.email;
    } catch(e) {
      console.warn('Invalid token payload or signature');
    }
  }

  // Proper AI API Limit Enforcement (MongoDB)
  if (userEmail) {
    try {
      const db = await getDb();
      const users = db.collection('users');
      const today = new Date().toISOString().split('T')[0];
      
      const user = await users.findOne({ email: userEmail });
      
      if (user) {
        // Reset count if new day
        if (user.usage_reset_date !== today) {
          await users.updateOne({ _id: user._id }, { $set: { usage_count: 0, usage_reset_date: today } });
          user.usage_count = 0;
        }

        if (user.usage_count >= 100) {
          return res.status(403).json({ 
            error: 'Daily AI limit reached (100/100). Please upgrade to Elite Plus for unlimited synthesis.',
            limitReached: true 
          });
        }

        // Increment usage
        await users.updateOne({ _id: user._id }, { $inc: { usage_count: 1 } });
      }
    } catch (e) {
      console.error('Usage enforcement error:', e);
    }
  }

  // Rate Limiting (Upstash Redis) - Protect Groq API Infrastructure
  if (redis) {
    try {
      const key = `ratelimit:chat:${userId}`;
      const limit = 30; // 30 reqs per minute
      const currentReqs = await redis.incr(key);
      if (currentReqs === 1) await redis.expire(key, 60);
      if (currentReqs > limit) {
        return res.status(429).json({ 
          error: 'Rate limit exceeded. Please wait 60 seconds.',
          isRateLimit: true 
        });
      }
    } catch (e) {
      console.error('Redis error:', e);
    }
  }

  try {
    const { messages, model, temperature, max_tokens, type = 'chat' } = req.body;
    
    // Performance: Fast llama-3.1-8b for chat, llama-3.3-70b only for advanced tasks
    const targetModel = model === 'llama-3.3-70b-versatile' ? 'llama-3.3-70b-versatile' : 'llama-3.1-8b-instant';

    // Context-specific max_tokens limits
    const tokenLimits = {
      chat: 800,
      notes: 2000,
      quiz: 1200,
      feynman: 500
    };

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: targetModel,
        messages: [
          { role: 'system', content: `Format responses using proper Markdown. Use ## for section headings, **bold** for key terms, - for lists. Never use === or --- as dividers. Keep responses concise and well-structured.` },
          ...messages
        ],
        temperature: temperature ?? 0.7,
        max_tokens: max_tokens ?? tokenLimits[type] ?? 800,
        stream: true,
      }),
    });

    if (!groqResponse.ok) {
      const errBody = await groqResponse.text();
      return res.status(groqResponse.status).json({
        error: `Groq API error: ${groqResponse.status}`,
        details: errBody,
      });
    }

    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    // Pipe the response body to the client
    const reader = groqResponse.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(value);
    }
    
    res.end();
  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
