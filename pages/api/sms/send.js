// pages/api/sms/send.js
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

function validateAndFormatPhoneNumber(phone) {
  if (!phone) throw new Error('Phone number is required');
  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.startsWith('27')) return cleaned;
  if (cleaned.startsWith('0')) return '27' + cleaned.slice(1);
  if (cleaned.length === 9) return '27' + cleaned;

  throw new Error(`Invalid phone number format: ${phone}`);
}

async function sendSingleSms(apiKey, phoneNumber, message, scheduledTime = null) {
  const params = new URLSearchParams();
  params.append('APIKey', apiKey);
  params.append('Message', message);
  params.append('Numbers', phoneNumber);

  if (scheduledTime) {
    params.append('ScheduledDateTime', scheduledTime);
  }

  const response = await axios.post(
    'https://www.winsms.co.za/api/batchmessage.asp',
    params.toString(),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      timeout: 30000,
    }
  );

  return response.data;
}

async function sendBulkSms(apiKey, message, recipients, scheduledTime = null, maxSegments = 2) {
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

  const WINSMS_API_KEY = process.env.WINSMS_API_KEY;

  if (!WINSMS_API_KEY) {
    return res.status(500).json({ error: 'WinSMS API key not configured' });
  }

  try {
    const { to, message, isBulk = false, recipients = [], scheduledTime = null, schoolId, testType, supplier = 'winsms' } = req.body;

    // Validate required fields
    if (isBulk) {
      if (!Array.isArray(recipients) || recipients.length === 0) {
        return res.status(400).json({ error: 'Recipients array is required for bulk SMS' });
      }
    } else {
      if (!to || !message) {
        return res.status(400).json({ error: 'Missing "to" or "message" for single SMS' });
      }
    }

    const { db } = await connectToDatabase();
    const smsCollection = db.collection('sms_sends');
    const bulkSmsCollection = db.collection('bulk_sms_sends');

    if (isBulk) {
      // Validate and format all phone numbers
      const validRecipients = [];
      const invalidRecipients = [];

      for (const [index, recipient] of recipients.entries()) {
        try {
          const formattedPhone = validateAndFormatPhoneNumber(
            typeof recipient === 'string' ? recipient : recipient.phone || recipient.mobileNumber
          );
          validRecipients.push({
            mobileNumber: formattedPhone,
            clientMessageId: `msg_${Date.now()}_${index}`,
            originalRecipient: recipient,
          });
        } catch (err) {
          invalidRecipients.push({
            recipient,
            error: err.message
          });
        }
      }

      if (validRecipients.length === 0) {
        return res.status(400).json({ 
          error: 'No valid phone numbers found',
          invalidRecipients 
        });
      }

      // Send bulk SMS
      const result = await sendBulkSms(WINSMS_API_KEY, message, validRecipients, scheduledTime);

      // Log bulk SMS send
      const logEntry = {
        type: 'BULK',
        message,
        totalRecipients: recipients.length,
        validRecipients: validRecipients.length,
        sentCount: result.result.successCount,
        failedCount: result.result.failedCount + invalidRecipients.length,
        invalidRecipients,
        results: result.result.messages,
        batchCount: result.result.batchCount,
        creditsUsed: result.result.creditsUsed,
        schoolId,
        testType,
        supplier,
        scheduledTime,
        timestamp: new Date(),
      };

      await bulkSmsCollection.insertOne(logEntry);

      // Update individual SMS tracking
      const smsTracking = result.result.messages
        .filter(r => r.status === 'ACCEPTED')
        .map(r => ({
          updateOne: {
            filter: { phoneNumber: r.mobileNumber },
            update: { 
              $set: { 
                lastSentAt: new Date(),
                schoolId,
                supplier 
              }, 
              $inc: { totalSends: 1 } 
            },
            upsert: true,
          },
        }));

      if (smsTracking.length) {
        await smsCollection.bulkWrite(smsTracking);
      }

      return res.status(200).json({
        success: true,
        type: 'BULK',
        sentCount: result.result.successCount,
        failedCount: result.result.failedCount + invalidRecipients.length,
        creditsUsed: result.result.creditsUsed,
        invalidRecipients,
        messageId: `bulk_${Date.now()}`,
      });
    } else {
      // Send single SMS
      const formattedPhone = validateAndFormatPhoneNumber(to);
      const response = await sendSingleSms(WINSMS_API_KEY, formattedPhone, message, scheduledTime);

      if (/error/i.test(response)) {
        return res.status(500).json({ error: response });
      }

      // Track SMS send
      await smsCollection.updateOne(
        { phoneNumber: formattedPhone },
        { 
          $set: { 
            lastSentAt: new Date(),
            schoolId,
            supplier
          },
          $inc: { totalSends: 1 } 
        },
        { upsert: true }
      );

      return res.status(200).json({ 
        success: true,
        type: 'SINGLE',
        response: response,
        creditsUsed: 1,
        messageId: `single_${Date.now()}`,
      });
    }
  } catch (error) {
    console.error('SMS send error:', error);
    return res.status(500).json({ 
      error: error.message || 'Failed to send SMS',
      details: error.response?.data
    });
  }
}