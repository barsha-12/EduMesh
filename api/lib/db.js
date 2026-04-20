import { MongoClient } from 'mongodb';

// Flexible environment variable support
const uri = process.env.MONGODB_URI || process.env.MONGO_URL || process.env.DATABASE_URL;

const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 15000, // Increased to 15s for better stability on Vercel
  socketTimeoutMS: 45000,
  family: 4, // Force IPv4 to avoid some Vercel/Atlas handshake issues
};

let client;
let clientPromise;

if (!uri) {
  throw new Error('Database connection string is missing from Environment Variables (MONGODB_URI/MONGO_URL)');
}

const getDbName = (connectionString) => {
  try {
    const url = new URL(connectionString);
    const path = url.pathname.replace('/', '');
    return path || 'edumesh';
  } catch (err) {
    return 'edumesh';
  }
};

const dbName = getDbName(uri);

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

/**
 * getDb - Returns the connected MongoDB database instance (or null if unavailable)
 */
export default async function getDb() {
  try {
    const connectedClient = await clientPromise;
    return connectedClient.db(dbName);
  } catch (err) {
    console.warn('DATABASE UNAVAILABLE (Degraded Mode Active):', err.message);
    // Return null instead of throwing so the app can continue without usage tracking
    return null;
  }
}
