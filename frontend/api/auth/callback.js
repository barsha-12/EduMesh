import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import getDb from '../lib/db.js';

export default async function handler(req, res) {
  const JWT_SECRET = process.env.NEXTAUTH_SECRET;
  if (!JWT_SECRET) {
    console.error('CRITICAL: NEXTAUTH_SECRET not configured.');
    return res.status(500).json({ error: 'Auth configuration missing' });
  }

  // 1. Handle Sync Mode (Supabase -> MongoDB)
  if (req.method === 'POST' && req.body.syncOnly) {
    try {
      const { user } = req.body;
      if (!user) return res.status(400).json({ error: 'No user data' });

      const db = await getDb();
      const users = db.collection('users');
      
      // Upsert user into MongoDB for scalability (1000+ members)
      await users.updateOne(
        { email: user.email },
        { 
          $set: { 
            _id: user.id, // Use Supabase ID
            display_name: user.display_name,
            avatar_url: user.avatar_url,
            last_login: new Date()
          },
          $setOnInsert: { created_at: new Date(), model: 'llama-3.1-8b-instant' }
        },
        { upsert: true }
      );

      // 1.1 Generate Backend Session Cookie (JWT) to bridge Supabase & MongoDB functions
      const sessionJwt = jwt.sign(
        { id: user.id, email: user.email, display_name: user.display_name }, 
        JWT_SECRET, 
        { expiresIn: '7d' }
      );

      res.setHeader('Set-Cookie', cookie.serialize('auth_token', sessionJwt, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/'
      }));

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Sync error:', error);
      return res.status(500).json({ error: 'Sync failed' });
    }
  }

  // 2. Handle Legacy GET Callback (Manual OAuth - Fallback)
  const { code } = req.query;
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers.host || 'localhost:3000';
  const redirectUri = `${protocol}://${host}/api/auth/callback`;

  const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
  );

  try {
    const { tokens } = await client.getToken({ code, redirect_uri: redirectUri });
    client.setCredentials(tokens);
    const ticket = await client.verifyIdToken({ idToken: tokens.id_token, audience: process.env.GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();

    const db = await getDb();
    const users = db.collection('users');
    let user = await users.findOne({ email: payload.email });
    
    if (!user) {
      user = {
        _id: payload.sub,
        email: payload.email,
        display_name: payload.name,
        model: 'llama-3.1-8b-instant',
        created_at: new Date()
      };
      await users.insertOne(user);
    }

    const sessionJwt = jwt.sign(
      { id: user._id, email: user.email, display_name: user.display_name }, 
      JWT_SECRET, 
      { expiresIn: '7d' }
    );

    res.setHeader('Set-Cookie', cookie.serialize('auth_token', sessionJwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/'
    }));

    const frontendUrl = process.env.VITE_FRONTEND_URL || 'http://localhost:3002';
    res.redirect(`${frontendUrl}/dashboard`);
  } catch (error) {
    console.error('OAuth error:', error);
    res.redirect('/login?error=oauth_failed');
  }
}
