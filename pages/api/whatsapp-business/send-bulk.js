// pages/api/whatsapp-business/send-bulk.ts
export default async function handler(req, res) {
  const log = {
    request: {
      method: req.method,
      headers: req.headers,
      body: req.body,
      query: req.query,
    },
    response: null,
    errors: [],
    results: [],
    timings: {
      start: new Date(),
      end: null,
      duration: null
    }
  };

  // Country configurations
  const SUPPORTED_COUNTRIES = [
    {
      code: '27',
      name: 'South Africa',
      regex: /^27[1-9][0-9]{8}$/,
      minLength: 11,
      maxLength: 11,
    },
    {
      code: '256',
      name: 'Uganda',
      regex: /^256(7[0-9]|20|3[0-9])\d{7}$/,
      minLength: 12,
      maxLength: 12,
    },
    {
      code: '254',
      name: 'Kenya',
      regex: /^254(7[0-9]|1[0-9])\d{7}$/,
      minLength: 12,
      maxLength: 12,
    },
    {
      code: '267',
      name: 'Botswana',
      regex: /^267(7[0-9]|6[0-9])\d{6}$/,
      minLength: 11,
      maxLength: 11,
    },
    {
      code: '234',
      name: 'Nigeria',
      regex: /^234[7-9][0-1][0-9]{8}$/,
      minLength: 13,
      maxLength: 14,
    },
  ];

  // Phone validation function
  const validateAndFormatPhone = (phone, defaultCountryCode = '27') => {
    console.log('🔍 [validateAndFormatPhone] Input:', { phone, defaultCountryCode });
    
    let digits = phone.replace(/\D/g, '');
    console.log('🔍 [validateAndFormatPhone] After removing non-digits:', digits);
    
    // Add default country code if not present
    if (!digits.startsWith(defaultCountryCode) && digits.length < 11) {
      const oldDigits = digits;
      digits = digits.startsWith('0') 
        ? defaultCountryCode + digits.slice(1)
        : defaultCountryCode + digits;
      console.log('🔍 [validateAndFormatPhone] Added country code:', { oldDigits, newDigits: digits });
    }

    // Find matching country
    const country = [...SUPPORTED_COUNTRIES]
      .sort((a, b) => b.code.length - a.code.length)
      .find(c => digits.startsWith(c.code));

    console.log('🔍 [validateAndFormatPhone] Matched country:', country?.name || 'NONE');

    if (!country) {
      console.error('❌ [validateAndFormatPhone] No country match for:', digits);
      return {
        isValid: false,
        formattedNumber: digits,
        error: `Unsupported country code for number: ${phone} (digits: ${digits})`
      };
    }

    // Validate length
    if (digits.length < country.minLength || digits.length > country.maxLength) {
      console.error('❌ [validateAndFormatPhone] Length error:', {
        digits,
        length: digits.length,
        expected: `${country.minLength}-${country.maxLength}`
      });
      return {
        isValid: false,
        formattedNumber: digits,
        error: `Invalid ${country.name} number length: ${digits} (length: ${digits.length}, expected: ${country.minLength}-${country.maxLength})`
      };
    }

    // Validate format
    if (!country.regex.test(digits)) {
      console.error('❌ [validateAndFormatPhone] Format error:', {
        digits,
        regex: country.regex.toString()
      });
      return {
        isValid: false,
        formattedNumber: digits,
        error: `Invalid ${country.name} number format: ${digits}`
      };
    }

    console.log('✅ [validateAndFormatPhone] Valid:', { digits, country: country.name });
    return {
      isValid: true,
      formattedNumber: digits,
      country: country.name
    };
  };

  try {
    console.log('='.repeat(80));
    console.log('🚀 [BULK SEND API] Starting new request');
    console.log('='.repeat(80));

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
      console.error('❌ Missing environment variables:', missingVars);
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

    // Extract bulk message data
    const { 
      personalizedMessages, 
      schoolName,
      gradeIds,
      defaultCountryCode = '27' // Default to South Africa
    } = req.body;

    console.log('📦 [REQUEST BODY] Raw data:', {
      personalizedMessagesCount: personalizedMessages?.length,
      schoolName,
      gradeIds,
      defaultCountryCode,
      personalizedMessagesType: typeof personalizedMessages,
      isArray: Array.isArray(personalizedMessages)
    });

    // Log first 3 personalized messages for debugging
    if (personalizedMessages && personalizedMessages.length > 0) {
      console.log('📋 [SAMPLE MESSAGES] First 3 messages:', 
        personalizedMessages.slice(0, 3).map((m, i) => ({
          index: i,
          to: m.to,
          toType: typeof m.to,
          magicLink: m.magicLink?.substring(0, 50) + '...',
          gradeName: m.gradeName
        }))
      );
    }

    if (!personalizedMessages || !Array.isArray(personalizedMessages)) {
      console.error('❌ Invalid personalizedMessages:', typeof personalizedMessages);
      log.errors.push({ 
        code: 'INVALID_PAYLOAD', 
        message: 'personalizedMessages array is required' 
      });
      return res.status(400).json({ 
        error: 'Invalid payload: personalizedMessages must be an array',
        details: log 
      });
    }

    if (personalizedMessages.length === 0) {
      console.error('❌ Empty personalizedMessages array');
      log.errors.push({ 
        code: 'EMPTY_RECIPIENTS', 
        message: 'No recipients provided' 
      });
      return res.status(400).json({ 
        error: 'No recipients provided',
        details: log 
      });
    }

    console.log(`📊 [VALIDATION] Starting validation of ${personalizedMessages.length} recipients...`);

    // Pre-validate all phone numbers
    const validatedRecipients = [];
    const invalidRecipients = [];

    for (let i = 0; i < personalizedMessages.length; i++) {
      const recipient = personalizedMessages[i];
      console.log(`\n🔍 [${i + 1}/${personalizedMessages.length}] Validating:`, {
        to: recipient.to,
        gradeName: recipient.gradeName
      });

      const validation = validateAndFormatPhone(recipient.to, defaultCountryCode);
      
      if (validation.isValid) {
        console.log(`✅ [${i + 1}/${personalizedMessages.length}] Valid`);
        validatedRecipients.push({
          ...recipient,
          to: validation.formattedNumber,
          country: validation.country
        });
      } else {
        console.error(`❌ [${i + 1}/${personalizedMessages.length}] Invalid:`, validation.error);
        invalidRecipients.push({
          originalNumber: recipient.to,
          error: validation.error,
          index: i
        });
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('📊 [VALIDATION SUMMARY]');
    console.log('='.repeat(80));
    console.log(`✅ Valid: ${validatedRecipients.length}`);
    console.log(`❌ Invalid: ${invalidRecipients.length}`);
    console.log(`📊 Total: ${personalizedMessages.length}`);
    console.log('='.repeat(80));

    // Log invalid numbers
    if (invalidRecipients.length > 0) {
      console.log('\n❌ [INVALID NUMBERS] Details:');
      invalidRecipients.forEach((invalid, i) => {
        console.log(`  ${i + 1}. ${invalid.originalNumber} - ${invalid.error}`);
      });
    }

    // Log sample of valid numbers
    if (validatedRecipients.length > 0) {
      console.log('\n✅ [VALID NUMBERS] Sample (first 5):');
      validatedRecipients.slice(0, 5).forEach((valid, i) => {
        console.log(`  ${i + 1}. ${valid.to} (${valid.country})`);
      });
    }

    // If no valid recipients, return error
    if (validatedRecipients.length === 0) {
      console.error('❌ No valid recipients after validation');
      return res.status(400).json({
        error: 'No valid recipients found',
        details: {
          totalSubmitted: personalizedMessages.length,
          invalidCount: invalidRecipients.length,
          invalidNumbers: invalidRecipients
        }
      });
    }

    // Rate limiting configuration
    const BATCH_SIZE = 10; // Messages per batch
    const BATCH_DELAY_MS = 1000; // Delay between batches (1 second)
    const MESSAGE_DELAY_MS = 100; // Delay between individual messages

    console.log('\n📤 [SENDING] Configuration:', {
      batchSize: BATCH_SIZE,
      batchDelayMs: BATCH_DELAY_MS,
      messageDelayMs: MESSAGE_DELAY_MS,
      totalBatches: Math.ceil(validatedRecipients.length / BATCH_SIZE)
    });

    const whatsappUrl = `https://graph.facebook.com/v22.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
    const headers = {
      'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    };

    // Process messages in batches
    const results = {
      total: personalizedMessages.length,
      sent: 0,
      failed: invalidRecipients.length,
      details: []
    };

    // Add invalid numbers to results
    invalidRecipients.forEach(invalid => {
      results.details.push({
        to: invalid.originalNumber,
        success: false,
        error: invalid.error,
        timestamp: new Date().toISOString()
      });
    });

    // Helper function to send a single message
    const sendMessage = async (recipient, index) => {
      console.log(`\n📤 [SENDING ${index + 1}] To: ${recipient.to}`);
      
      const payload = {
        messaging_product: "whatsapp",
        to: recipient.to,
        type: "template",
        template: {
          name: "hello_world",
          language: { code: "en_US" },
          components: [
            {
              type: "body",
              parameters: [
                {
                  type: "text",
                  text: recipient.gradeName || "Grade"
                },
                {
                  type: "text",
                  text: recipient.magicLink || ""
                }
              ]
            }
          ]
        }
      };

      console.log(`📋 [PAYLOAD ${index + 1}]:`, JSON.stringify(payload, null, 2));

      try {
        const apiResponse = await fetch(whatsappUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload)
        });

        const responseData = await apiResponse.json();
        console.log(`📥 [RESPONSE ${index + 1}] Status: ${apiResponse.status}`, responseData);

        if (!apiResponse.ok) {
          console.error(`❌ [FAILED ${index + 1}]:`, responseData.error?.message);
          return {
            to: recipient.to,
            success: false,
            error: responseData.error?.message || 'WhatsApp API error',
            errorDetails: responseData,
            timestamp: new Date().toISOString()
          };
        }

        console.log(`✅ [SUCCESS ${index + 1}] MessageID: ${responseData.messages?.[0]?.id}`);
        return {
          to: recipient.to,
          success: true,
          messageId: responseData.messages?.[0]?.id,
          country: recipient.country,
          timestamp: new Date().toISOString()
        };
      } catch (error) {
        console.error(`❌ [ERROR ${index + 1}]:`, error.message);
        return {
          to: recipient.to,
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        };
      }
    };

    // Helper function to delay execution
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    // Process validated messages in batches
    for (let i = 0; i < validatedRecipients.length; i += BATCH_SIZE) {
      const batch = validatedRecipients.slice(i, i + BATCH_SIZE);
      const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(validatedRecipients.length / BATCH_SIZE);
      
      console.log(`\n${'='.repeat(80)}`);
      console.log(`📦 [BATCH ${batchNumber}/${totalBatches}] Processing ${batch.length} messages...`);
      console.log(`${'='.repeat(80)}`);

      // Process batch with individual delays
      for (let j = 0; j < batch.length; j++) {
        const recipient = batch[j];
        const globalIndex = i + j;
        const result = await sendMessage(recipient, globalIndex);
        results.details.push(result);
        
        if (result.success) {
          results.sent++;
          console.log(`✅ [PROGRESS] Sent: ${results.sent}/${validatedRecipients.length}`);
        } else {
          results.failed++;
          console.log(`❌ [PROGRESS] Failed: ${results.failed}/${validatedRecipients.length}`);
        }

        // Add delay between individual messages
        if (j < batch.length - 1) {
          await delay(MESSAGE_DELAY_MS);
        }
      }

      // Add delay between batches
      if (i + BATCH_SIZE < validatedRecipients.length) {
        console.log(`⏳ [DELAY] Waiting ${BATCH_DELAY_MS}ms before next batch...`);
        await delay(BATCH_DELAY_MS);
      }
    }

    // Log results
    log.results = results;
    log.timings.end = new Date();
    log.timings.duration = log.timings.end - log.timings.start;

    console.log('\n' + '='.repeat(80));
    console.log('🎉 [COMPLETE] Bulk send finished');
    console.log('='.repeat(80));
    console.log(`✅ Sent: ${results.sent}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`📊 Total: ${results.total}`);
    console.log(`⏱️  Duration: ${log.timings.duration}ms`);
    console.log('='.repeat(80));

    // Return success response
    return res.status(200).json({
      success: true,
      message: `Bulk send complete: ${results.sent} sent, ${results.failed} failed`,
      results: {
        totalCount: results.total,
        sentCount: results.sent,
        failedCount: results.failed,
        invalidCount: invalidRecipients.length,
        details: results.details
      },
      schoolName,
      gradeIds,
      timings: log.timings
    });

  } catch (error) {
    console.error('\n' + '='.repeat(80));
    console.error('💥 [FATAL ERROR]');
    console.error('='.repeat(80));
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    console.error('='.repeat(80));

    log.errors.push({
      code: 'SERVER_ERROR',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
    
    log.timings.end = new Date();
    log.timings.duration = log.timings.end - log.timings.start;

    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? log : null 
    });
  } finally {
    console.log('\n📝 [FINAL LOG] Complete request log:');
    console.log(JSON.stringify(log, null, 2));
  }
}