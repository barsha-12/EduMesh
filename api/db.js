import getDb from './lib/db.js';
import cookie from 'cookie';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const cookies = cookie.parse(req.headers.cookie || '');
  const token = cookies.auth_token;
  if (!token) return res.status(401).json({ error: 'Unauthorized', data: null });

  let userId;
  try {
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'secret');
    userId = decoded.id;
  } catch (e) {
    return res.status(401).json({ error: 'Unauthorized', data: null });
  }

  const { collection, action, query, payload, options } = req.body;
  
  try {
    const db = await getDb();
    const col = db.collection(collection);
    
    // Security override: Force all queries to be scoped strictly to the authenticated user's ID
    const secureQuery = query ? { ...query, user_id: userId } : { user_id: userId };
    
    let result;
    switch (action) {
      case 'find':
        let cursor = col.find(secureQuery);
        if (options?.sort) cursor = cursor.sort(options.sort);
        if (options?.limit) cursor = cursor.limit(options.limit);
        result = await cursor.toArray();
        break;
      case 'findOne':
        result = await col.findOne(secureQuery);
        break;
      case 'insert':
        const securePayload = Array.isArray(payload) 
          ? payload.map(p => ({...p, user_id: userId}))
          : { ...payload, user_id: userId };
        result = Array.isArray(securePayload) ? await col.insertMany(securePayload) : await col.insertOne(securePayload);
        // Map _id to id to match Supabase schema patterns
        if (result.insertedId) {
           result = [{ id: result.insertedId.toString(), ...securePayload }];
        } else if (result.insertedIds) {
           result = Array.isArray(securePayload) ? securePayload.map((p, i) => ({ id: result.insertedIds[i].toString(), ...p })) : [];
        }
        break;
      case 'update':
        result = await col.updateMany(secureQuery, { $set: payload });
        break;
      case 'upsert':
        result = await col.updateOne(secureQuery, { $set: payload }, { upsert: true });
        break;
      case 'delete':
        result = await col.deleteMany(secureQuery);
        break;
      default:
        return res.status(400).json({ error: 'Invalid action', data: null });
    }
    
    res.status(200).json({ data: result || [] });
  } catch (error) {
    console.error('DB Proxy Error:', error);
    res.status(500).json({ error: error.message, data: null });
  }
}
