export default async function handler(req, res) {
  // Set up logging
  const log = {
    request: {
      method: req.method,
      headers: req.headers,
      body: req.body,
      query: req.query,
    },
    response: null,
    errors: [],
    results: {
      sent: 0,
      failed: 0,
      total: 0,
      details: []
    },
    timings: {
      start: new Date(),
      end: null,
      duration: null
    }
  };

  try {
    // Validate request method
    if (req.method !== 'POST') {
      log.errors.push({ code: 'INVALID_METHOD', message: 'Only POST requests allowed' });
      return res.status(405).json({ 
        error: 'Method not allowed',
        details: log 
      });
    }

    // Validate required environment variables
    const requiredEnvVars = [
      'WHATSAPP_PHONE_NUMBER_ID',
      'WHATSAPP_ACCESS_TOKEN'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    if (missingVars.length > 0) {
      log.errors.push({
        code: 'MISSING_ENV_VARS',
        message: 'Required environment variables not set',
        missing: missingVars
      });
      return res.status(500).json({ 
        error: 'Server configuration error',
        details: log 
      });
    }

    // Validate and extract parameters
    const { gradeIds, message, schoolName, recipientNumbers } = req.body;
    
    if (!recipientNumbers || !Array.isArray(recipientNumbers) || recipientNumbers.length === 0) {
      log.errors.push({ 
        code: 'MISSING_RECIPIENTS', 
        message: 'No recipient numbers provided' 
      });
      return res.status(400).json({ 
        error: 'Recipient numbers are required',
        details: log 
      });
    }

    if (!message) {
      log.errors.push({ code: 'MISSING_MESSAGE', message: 'No message content provided' });
      return res.status(400).json({ 
        error: 'Message content is required',
        details: log 
      });
    }

    log.results.total = recipientNumbers.length;
    const whatsappUrl = `https://graph.facebook.com/v22.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

    // Send messages to each recipient
    for (const phoneNumber of recipientNumbers) {
      try {
        // Format phone number (remove all non-digit characters)
        const formattedNumber = phoneNumber.replace(/\D/g, '');
        
        // Ensure South African numbers start with 27 and are 11 digits
        if (formattedNumber.startsWith('27') && formattedNumber.length !== 11) {
          log.results.failed++;
          log.results.details.push({
            phoneNumber: formattedNumber,
            status: 'failed',
            error: 'Invalid SA number format - must be 11 digits'
          });
          continue;
        }

        const payload = {
          messaging_product: "whatsapp",
          to: formattedNumber,
          type: "text",
          text: {
            body: message
          }
        };

        const apiResponse = await fetch(whatsappUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        const responseData = await apiResponse.json();

        if (apiResponse.ok) {
          log.results.sent++;
          log.results.details.push({
            phoneNumber: formattedNumber,
            status: 'success',
            messageId: responseData.messages?.[0]?.id
          });
        } else {
          log.results.failed++;
          log.results.details.push({
            phoneNumber: formattedNumber,
            status: 'failed',
            error: responseData.error?.message || 'WhatsApp API error'
          });
        }

        // Small delay to avoid rate limiting (100ms between messages)
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        log.results.failed++;
        log.results.details.push({
          phoneNumber,
          status: 'error',
          error: error.message
        });
      }
    }

    // Successful response
    log.timings.end = new Date();
    log.timings.duration = log.timings.end - log.timings.start;
    
    log.response = {
      status: 200,
      data: {
        success: true,
        sentCount: log.results.sent,
        failedCount: log.results.failed,
        totalCount: log.results.total,
        details: log.results.details,
        timestamp: new Date().toISOString()
      }
    };

    return res.status(200).json(log.response.data);
  } catch (error) {
    log.errors.push({
      code: 'SERVER_ERROR',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
    
    log.timings.end = new Date();
    log.timings.duration = log.timings.end - log.timings.start;

    console.error('❌ WhatsApp Bulk Send Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? log : null 
    });
  } finally {
    // Log complete request/response cycle
    console.log('📝 WhatsApp Bulk Send Log:', JSON.stringify(log, null, 2));
  }
}