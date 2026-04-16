import getDb from './lib/db.js';

export default async function handler(req, res) {
  const status = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    checks: {
      mongodb: 'checking...',
      auth_secret: process.env.NEXTAUTH_SECRET ? 'configured ✅' : 'MISSING ❌',
      frontend_url: process.env.VITE_FRONTEND_URL ? 'configured ✅' : 'MISSING ❌',
    }
  };

  try {
    const db = await getDb();
    const collections = await db.listCollections().toArray();
    status.checks.mongodb = `connected ✅ (${collections.length} collections found)`;
    return res.status(200).json(status);
  } catch (err) {
    status.checks.mongodb = `FAILED ❌: ${err.message}`;
    return res.status(500).json(status);
  }
}
