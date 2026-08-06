// pages/api/whatsapp-business/test-message.js

export default async function handler(req, res) {
  console.log("📥 Incoming test-message request");

  const { WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_ACCESS_TOKEN } = process.env;
  const { to, schoolName, magicLink } = req.body || {};

  /* ------------------------------------------------------------------
   * Basic validation
   * ------------------------------------------------------------------ */
  if (req.method !== "POST") {
    console.warn("⚠️ Invalid HTTP method:", req.method);
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!WHATSAPP_PHONE_NUMBER_ID || !WHATSAPP_ACCESS_TOKEN) {
    console.error("❌ Missing WhatsApp environment variables");
    return res.status(500).json({
      error: "WhatsApp configuration missing on server"
    });
  }

  if (!to) {
    console.warn("⚠️ Missing phone number");
    return res.status(400).json({
      error: "Phone number (to) is required"
    });
  }

  if (!magicLink) {
    console.warn("⚠️ Missing magicLink");
    return res.status(400).json({
      error: "Missing magicLink in request body"
    });
  }

  /* ------------------------------------------------------------------
   * Normalize phone number
   * ------------------------------------------------------------------ */
  const formattedNumber = to.replace(/\D/g, "");
  console.log("📞 Normalized phone number:", formattedNumber);

  /* ------------------------------------------------------------------
   * WhatsApp endpoint
   * ------------------------------------------------------------------ */
  const whatsappUrl = `https://graph.facebook.com/v22.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

  /* ------------------------------------------------------------------
   * IMPORTANT:
   * This template has a DYNAMIC URL button index 0.
   * ------------------------------------------------------------------ */
  const payload = {
    messaging_product: "whatsapp",
    to: formattedNumber,
    type: "template",
    template: {
      name: "parent_invitation_2",
      language: { code: "en_US" },
      components: [
        {
          type: "body",
          parameters: [
            {
              type: "text",
              text: schoolName || "Your School"
            },
            {
              type: "text",
              text: formattedNumber
            }
          ]
        },
        {
          type: "button",
          sub_type: "url",
          index: 0,
          parameters: [
            {
              type: "text",
              text: magicLink
            }
          ]
        }
      ]
    }
  };

  console.log(
    "📤 Final WhatsApp payload:",
    JSON.stringify(payload, null, 2)
  );

  /* ------------------------------------------------------------------
   * Send request to Meta
   * ------------------------------------------------------------------ */
  let apiResponse;
  let responseData;

  try {
    apiResponse = await fetch(whatsappUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    responseData = await apiResponse.json();
  } catch (error) {
    console.error("❌ Network / fetch error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to reach WhatsApp API"
    });
  }

  /* ------------------------------------------------------------------
   * Handle Meta response
   * ------------------------------------------------------------------ */
  if (!apiResponse.ok) {
    console.error("❌ WhatsApp API Error Response:", responseData);

    return res.status(apiResponse.status).json({
      success: false,
      error: responseData?.error?.message || "WhatsApp API error",
      details: responseData
    });
  }

  console.log("✅ WhatsApp message sent successfully:", responseData);

  return res.status(200).json({
    success: true,
    messageId: responseData?.messages?.[0]?.id
  });
}
