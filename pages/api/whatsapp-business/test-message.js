// pages/api/whatsapp-business/test-message.js

export default async function handler(req, res) {
  const { WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_ACCESS_TOKEN } = process.env;

  console.log("📥 Incoming test message request:", {
    method: req.method,
    body: req.body
  });

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!WHATSAPP_PHONE_NUMBER_ID || !WHATSAPP_ACCESS_TOKEN) {
    return res.status(500).json({
      error: "Missing WhatsApp credentials"
    });
  }

  const { to, schoolName, magicLink } = req.body;

  if (!to || !magicLink) {
    return res.status(400).json({
      error: "Phone number and magicLink required"
    });
  }

  const formattedNumber = to.replace(/\D/g, "");

  const whatsappUrl =
    `https://graph.facebook.com/v22.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

  const payload = {
    messaging_product: "whatsapp",
    to: formattedNumber,
    type: "template",
    template: {
      name: "parent_invite",
      language: { code: "en_US" },
      components: [
        {
          type: "button",
          sub_type: "url",
          index: "0",
          parameters: [
            { type: "text", text: magicLink }
          ]
        }
      ]
    }
  };

  try {
    const apiResponse = await fetch(whatsappUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    // 🔥 SAFE PARSE
    let responseData;
    try {
      responseData = await apiResponse.json();
    } catch {
      responseData = await apiResponse.text();
    }

    if (!apiResponse.ok) {
      console.error("❌ WhatsApp API Error:", responseData);

      return res.status(apiResponse.status).json({
        success: false,
        error: "WhatsApp API error",
        raw: responseData,
        payload
      });
    }

    return res.status(200).json({
      success: true,
      messageId: responseData?.messages?.[0]?.id,
      to: formattedNumber,
      magicLink
    });

  } catch (error) {
    console.error("❌ SERVER CRASH:", error);

    return res.status(500).json({
      success: false,
      error: "Internal server error",
      details: error.message
    });
  }
}
