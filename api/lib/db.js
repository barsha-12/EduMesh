import { MongoClient } from 'mongodb';

// Try multiple environment variable names for maximum compatibility
const uri = process.env.MONGODB_URI || process.env.MONGO_URL || process.env.DATABASE_URL;

const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

let client;
let clientPromise;

if (!uri) {
  throw new Error('Please add your MONGODB_URI or MONGO_URL to your environment variables');
}

// Extract database name from URI if possible, otherwise default to 'edumesh'
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
 * getDb - Returns the connected MongoDB database instance
 */
export default async function getDb() {
  const connectedClient = await clientPromise;
  return connectedClient.db(dbName);
}
