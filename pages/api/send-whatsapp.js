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

    // Validate and format phone number
    const { phoneNumber } = req.body;
    if (!phoneNumber) {
      log.errors.push({ code: 'MISSING_PHONE_NUMBER', message: 'No phone number provided' });
      return res.status(400).json({ 
        error: 'Phone number is required',
        details: log 
      });
    }

    // Format phone number (remove all non-digit characters)
    const formattedNumber = phoneNumber.replace(/\D/g, '');
    
    // Ensure South African numbers start with 27 and are 11 digits
    if (formattedNumber.startsWith('27') && formattedNumber.length !== 11) {
      log.errors.push({
        code: 'INVALID_SA_NUMBER',
        message: 'South African numbers must be 11 digits (including 27)'
      });
      return res.status(400).json({ 
        error: 'Invalid phone number format',
        details: log 
      });
    }

    // Prepare WhatsApp API request
    const whatsappUrl = `https://graph.facebook.com/v22.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
    
    const payload = {
      messaging_product: "whatsapp",
      to: formattedNumber,
      type: "template",
      template: {
        name: "hello_world",
        language: { code: "en_US" }
      }
    };

    log.whatsappRequest = {
      url: whatsappUrl,
      payload,
      headers: {
        'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    };

    // Make request to WhatsApp API
    const apiResponse = await fetch(whatsappUrl, {
      method: 'POST',
      headers: log.whatsappRequest.headers,
      body: JSON.stringify(payload)
    });

    const responseData = await apiResponse.json();
    log.whatsappResponse = {
      status: apiResponse.status,
      data: responseData
    };

    // Handle WhatsApp API errors
    if (!apiResponse.ok) {
      log.errors.push({
        code: 'WHATSAPP_API_ERROR',
        message: responseData.error?.message || 'WhatsApp API error',
        details: responseData
      });
      
      return res.status(apiResponse.status).json({ 
        error: responseData.error?.message || 'WhatsApp API error',
        details: log 
      });
    }

    // Successful response
    log.timings.end = new Date();
    log.timings.duration = log.timings.end - log.timings.start;
    log.response = {
      status: 200,
      data: responseData
    };

    return res.status(200).json(responseData);
  } catch (error) {
    log.errors.push({
      code: 'SERVER_ERROR',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
    
    log.timings.end = new Date();
    log.timings.duration = log.timings.end - log.timings.start;

    console.error('❌ Server Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? log : null 
    });
  } finally {
    // Log complete request/response cycle
    console.log('📝 WhatsApp API Request Log:', JSON.stringify(log, null, 2));
  }
}