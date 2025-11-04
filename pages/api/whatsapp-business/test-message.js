// pages/api/whatsapp-business/test-message.js
export default async function handler(req, res) {
  const startTime = Date.now();
  
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ 
        error: "Method not allowed",
        details: "Only POST requests are supported"
      });
    }

    console.log('🔍 [test-message] Received request:', {
      method: req.method,
      body: {
        ...req.body,
        message: req.body.message ? req.body.message.substring(0, 100) + '...' : 'No message'
      }
    });

    const { to, message, schoolName, magicLink, grade } = req.body;

    // Validate required fields
    if (!to) {
      return res.status(400).json({ 
        error: "Phone number required",
        details: "The 'to' field is required"
      });
    }

    if (!message) {
      return res.status(400).json({ 
        error: "Message content required",
        details: "The 'message' field is required"
      });
    }

    // Check environment variables
    if (!process.env.WHATSAPP_PHONE_NUMBER_ID || !process.env.WHATSAPP_ACCESS_TOKEN) {
      console.error('❌ Missing WhatsApp environment variables');
      return res.status(500).json({ 
        error: "WhatsApp service not configured",
        details: "Check WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_ACCESS_TOKEN environment variables"
      });
    }

    // Format phone number (remove any non-digit characters except +)
    const formattedNumber = to.replace(/\D/g, "");
    console.log('📱 Phone number formatted:', { original: to, formatted: formattedNumber });

    // WhatsApp API URL
    const whatsappUrl = `https://graph.facebook.com/v17.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

    // ✅ USING TEXT MESSAGE - RELIABLE AND WORKS
    const payload = {
      messaging_product: "whatsapp",
      to: formattedNumber,
      type: "text",
      text: {
        body: message,
        preview_url: true // Allow link previews for magic links
      }
    };

    console.log('📤 Sending to WhatsApp API:', {
      url: whatsappUrl,
      payload: {
        ...payload,
        text: { ...payload.text, body: payload.text.body.substring(0, 100) + '...' }
      }
    });

    const apiResponse = await fetch(whatsappUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const responseData = await apiResponse.json();
    
    console.log('📥 WhatsApp API response:', {
      status: apiResponse.status,
      ok: apiResponse.ok,
      messageId: responseData.messages?.[0]?.id,
      error: responseData.error?.message
    });

    if (!apiResponse.ok) {
      console.error('❌ WhatsApp API error:', responseData.error);
      
      // Provide user-friendly error messages
      let userFriendlyError = "Failed to send WhatsApp message";
      if (responseData.error?.message?.includes("template")) {
        userFriendlyError = "Template issue detected. Using reliable text messages instead.";
      } else if (responseData.error?.message?.includes("permission")) {
        userFriendlyError = "WhatsApp Business account permissions issue";
      } else if (responseData.error?.message?.includes("rate limit")) {
        userFriendlyError = "WhatsApp rate limit exceeded. Please try again later.";
      }
      
      return res.status(apiResponse.status).json({
        error: userFriendlyError,
        details: responseData.error,
        type: 'whatsapp_api_error'
      });
    }

    // Success response
    const duration = Date.now() - startTime;
    console.log('✅ Message sent successfully in', duration + 'ms:', responseData.messages?.[0]?.id);
    
    return res.status(200).json({
      success: true,
      messageId: responseData.messages?.[0]?.id,
      recipient: formattedNumber,
      timestamp: new Date().toISOString(),
      magicLink: magicLink || null,
      schoolName: schoolName || null,
      grade: grade || null,
      type: "text", // Indicate we used text message
      duration: duration + 'ms'
    });

  } catch (error) {
    console.error('❌ Unexpected error in test-message API:', error);
    const duration = Date.now() - startTime;
    
    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
      duration: duration + 'ms'
    });
  }
}
