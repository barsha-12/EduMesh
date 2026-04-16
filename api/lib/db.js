import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
let client;
let dbConnection = null;

if (!uri) {
  throw new Error('Please add your Mongo URI to .env');
}

export default async function getDb() {
  if (dbConnection) return dbConnection;
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
  }
  dbConnection = client.db('edumesh_v2');
  return dbConnection;
}
