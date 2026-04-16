import cookie from 'cookie';
import jwt from 'jsonwebtoken';
import getDb from '../lib/db.js';

export default async function handler(req, res) {
  const cookies = cookie.parse(req.headers.cookie || '');
  const token = cookies.auth_token;

  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  let decoded;
  try {
    const JWT_SECRET = process.env.NEXTAUTH_SECRET;
    if (!JWT_SECRET) {
      console.error('CRITICAL: NEXTAUTH_SECRET is not configured.');
      return res.status(500).json({ error: 'Authentication configuration error' });
    }
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ error: 'Invalid session' });
  }

  let db;
  try {
    db = await getDb();
  } catch (dbErr) {
    console.error('DATABASE CONNECTION ERROR:', dbErr);
    return res.status(500).json({ error: 'Database connection failed' });
  }

  const users = db.collection('users');

  // GET: Fetch User Profile & Usage
  if (req.method === 'GET') {
    const user = await users.findOne({ email: decoded.email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Handle usage reset (Daily reset at 100 requests)
    const today = new Date().toISOString().split('T')[0];
    if (user.usage_reset_date !== today) {
      await users.updateOne(
        { _id: user._id },
        { 
          $set: { 
            usage_count: 0, 
            usage_reset_date: today 
          } 
        }
      );
      user.usage_count = 0;
    }

    return res.status(200).json({
      id: user._id,
      email: user.email,
      display_name: user.display_name,
      avatar_url: user.avatar_url,
      usage_count: user.usage_count || 0,
      usage_limit: 100,
      preferred_model: user.preferred_model || 'llama-3.1-8b-instant',
      created_at: user.created_at
    });
  }

  // POST: Update Profile / Preferences
  if (req.method === 'POST') {
    const { display_name, preferred_model } = req.body;
    
    const updateData = {};
    if (display_name) updateData.display_name = display_name;
    if (preferred_model) updateData.preferred_model = preferred_model;

    await users.updateOne(
      { email: decoded.email },
      { $set: updateData }
    );

    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
