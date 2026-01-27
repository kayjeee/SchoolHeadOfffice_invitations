// pages/api/sms/sendSms.js
import axios from 'axios';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }
  
  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  
  try {
    await client.connect();
    const db = client.db(dbName);
    cachedClient = client;
    cachedDb = db;
    return { client, db };
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw new Error('Database connection failed');
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { phoneNumber, message, scheduledTime } = req.body;
  const WINSMS_API_KEY = process.env.WINSMS_API_KEY;

  if (!WINSMS_API_KEY) {
    return res.status(500).json({ error: 'WinSMS API key not configured' });
  }

  if (!phoneNumber || !message) {
    return res.status(400).json({ error: 'Missing phoneNumber or message' });
  }

  try {
    const { db } = await connectToDatabase();
    const smsCollection = db.collection('sms_sends');

    // Prepare WinSMS parameters
    const params = new URLSearchParams();
    params.append('APIKey', WINSMS_API_KEY);
    params.append('Message', message);
    params.append('Numbers', phoneNumber);

    if (scheduledTime) {
      params.append('ScheduledDateTime', scheduledTime);
    }

    // Send SMS via WinSMS API
    const response = await axios.post(
      'https://www.winsms.co.za/api/batchmessage.asp',
      params.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      }
    );

    if (/error/i.test(response.data)) {
      return res.status(500).json({ error: response.data });
    }

    // Track SMS send (without limiting)
    await smsCollection.updateOne(
      { phoneNumber },
      { 
        $set: { lastSentAt: new Date() },
        $inc: { totalSends: 1 } 
      },
      { upsert: true }
    );

    return res.status(200).json({ 
      success: true, 
      response: response.data,
      creditsUsed: 1
    });
  } catch (error) {
    console.error('WinSMS send error:', error);
    return res.status(500).json({ 
      error: error.message || 'Failed to send SMS',
      details: error.response?.data
    });
  }
}