import axios from 'axios';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;
let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) return { client: cachedClient, db: cachedDb };

  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  await client.connect();
  const db = client.db(dbName);
  cachedClient = client;
  cachedDb = db;
  return { client, db };
}

function validateAndFormatPhoneNumber(phone) {
  if (!phone) throw new Error('Phone number is required');
  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.startsWith('27')) return cleaned;
  if (cleaned.startsWith('0')) return '27' + cleaned.slice(1);
  if (cleaned.length === 9) return '27' + cleaned;

  throw new Error(`Invalid phone number format: ${phone}`);
}

async function sendBulkSmsModule({ apiKey, message, recipients, scheduledTime = null, maxSegments = 2 }) {
  const results = [];
  const batchSize = 100;
  let successCount = 0;
  let failedCount = 0;

  const batches = [];
  for (let i = 0; i < recipients.length; i += batchSize) {
    batches.push(recipients.slice(i, i + batchSize));
  }

  for (const [batchIndex, batch] of batches.entries()) {
    const payload = {
      message,
      recipients: batch.map(r => ({
        mobileNumber: r.mobileNumber,
        clientMessageId: r.clientMessageId,
      })),
      maxSegments,
    };

    if (scheduledTime) {
      payload.scheduledTime = scheduledTime;
    }

    try {
      const response = await axios.post(
        'https://www.winsms.co.za/api/rest/v1/sms/outgoing/send',
        payload,
        {
          headers: {
            'Authorization': apiKey,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      const responseData = response.data;

      for (let i = 0; i < batch.length; i++) {
        const recipient = batch[i];
        const delivery = responseData[i] || {};
        const status = delivery.error ? 'FAILED' : 'ACCEPTED';

        if (status === 'ACCEPTED') successCount++;
        else failedCount++;

        results.push({
          ...recipient,
          status,
          response: delivery,
          batchIndex: batchIndex + 1,
        });
      }
    } catch (error) {
      console.error(`[SMS][ERROR] Batch ${batchIndex + 1} failed:`, error.message);
      for (const recipient of batch) {
        results.push({
          ...recipient,
          status: 'FAILED',
          error: error.message,
          batchIndex: batchIndex + 1,
        });
        failedCount++;
      }
    }

    if (batchIndex < batches.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return {
    success: successCount > 0,
    result: {
      messages: results,
      creditsUsed: successCount,
      totalProcessed: recipients.length,
      successCount,
      failedCount,
      batchCount: batches.length,
    },
    error: failedCount === recipients.length ? 'All messages failed to send' : null,
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { arguments: [args] } = req.body;
    const { message, recipients: frontendRecipients } = args;

    if (!Array.isArray(frontendRecipients) || frontendRecipients.length === 0) {
      return res.status(400).json({ success: false, error: 'Recipients array is required' });
    }

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ success: false, error: 'Invalid message content' });
    }

    const recipients = [];
    const invalidRecipients = [];

    for (const [index, r] of frontendRecipients.entries()) {
      try {
        const formattedPhone = validateAndFormatPhoneNumber(r.recipientPhone);
        recipients.push({
          mobileNumber: formattedPhone,
          clientMessageId: `msg_${Date.now()}_${index}`,
          originalRecipient: r,
        });
      } catch (err) {
        invalidRecipients.push({ ...r, error: err.message });
      }
    }

    if (recipients.length === 0) {
      return res.status(400).json({ success: false, error: 'No valid phone numbers found' });
    }

    const result = await sendBulkSmsModule({
      apiKey: process.env.WINSMS_API_KEY,
      message,
      recipients,
    });

    const sentCount = result.result.messages.filter(m => m.status === 'ACCEPTED').length;
    const failedCount = result.result.messages.length - sentCount + invalidRecipients.length;

    try {
      const { db } = await connectToDatabase();
      const bulkSmsCollection = db.collection('bulk_sms_sends');
      const smsCollection = db.collection('sms_sends');

      const logEntry = {
        message,
        totalRecipients: frontendRecipients.length,
        validRecipients: recipients.length,
        sentCount,
        failedCount,
        invalidRecipients,
        results: result.result.messages,
        batchCount: result.result.batchCount,
        creditsUsed: result.result.creditsUsed,
        timestamp: new Date(),
      };

      await bulkSmsCollection.insertOne(logEntry);

      const smsTracking = result.result.messages
        .filter(r => r.status === 'ACCEPTED')
        .map(r => ({
          updateOne: {
            filter: { phoneNumber: r.mobileNumber },
            update: { $set: { lastSentAt: new Date() }, $inc: { totalSends: 1 } },
            upsert: true,
          },
        }));

      if (smsTracking.length) {
        await smsCollection.bulkWrite(smsTracking);
      }
    } catch (logError) {
      console.error('[SMS][ERROR] Failed to log SMS sends:', logError.message);
    }

    res.status(200).json({
      success: true,
      sentCount,
      failedCount,
      creditsUsed: result.result.creditsUsed,
    });

  } catch (error) {
    console.error('[SMS][ERROR] Unhandled error:', error.message || error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal error during SMS send',
    });
  }
}