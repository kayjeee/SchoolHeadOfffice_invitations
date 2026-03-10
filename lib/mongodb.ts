import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI as string;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!process.env.MONGODB_URI) {
  // During build we might not have MONGODB_URI, but we don't want to crash
  if (process.env.NODE_ENV === 'production') {
    clientPromise = Promise.resolve(null as any);
  } else {
    throw new Error('Please add your Mongo URI to .env.local');
  }
} else {
  if (process.env.NODE_ENV === 'development') {
    if (!(global as any)._mongoClientPromise) {
      client = new MongoClient(uri, options);
      (global as any)._mongoClientPromise = client.connect();
    }
    clientPromise = (global as any)._mongoClientPromise;
  } else {
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
  }
}

export default clientPromise;
