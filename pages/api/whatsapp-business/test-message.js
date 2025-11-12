// pages/api/whatsapp-business/test-message.js
export default async function handler(req, res) {
  const log = {
    request: { method: req.method, headers: req.headers, body: req.body },
    whatsappRequest: null,
    whatsappResponse: null,
    timings: { start: new Date(), end: null, duration: null },
  };

  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_ACCESS_TOKEN } = process.env;
    if (!WHATSAPP_PHONE_NUMBER_ID || !WHATSAPP_ACCESS_TOKEN) {
      return res.status(500).json({
        error: "Missing WhatsApp credentials",
        details: { missing: ["WHATSAPP_PHONE_NUMBER_ID", "WHATSAPP_ACCESS_TOKEN"] },
      });
    }

    const { to, firstName, verifyItem } = req.body;

    if (!to) {
      return res.status(400).json({ error: "Recipient phone number required" });
    }

    const formattedNumber = to.replace(/\D/g, "");
    if (!formattedNumber.startsWith("27")) {
      return res.status(400).json({ error: "Invalid phone number format. Must start with 27" });
    }

    const whatsappUrl = `https://graph.facebook.com/v22.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

    // ✅ Template name and variables according to your new template
    const payload = {
      messaging_product: "whatsapp",
      to: formattedNumber,
      type: "template",
      template: {
        name: "parent_invite",
        language: { code: "en_US" },
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: firstName || "Parent" },     // {{1}}
              { type: "text", text: verifyItem || "your email address" }, // {{2}}
            ],
          },
        ],
      },
    };

    log.whatsappRequest = {
      url: whatsappUrl,
      payload,
      headers: {
        Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
    };

    console.log("📤 Sending WhatsApp Message:", log.whatsappRequest.payload);

    const apiResponse = await fetch(whatsappUrl, {
      method: "POST",
      headers: log.whatsappRequest.headers,
      body: JSON.stringify(payload),
    });

    const responseData = await apiResponse.json();
    log.whatsappResponse = { status: apiResponse.status, data: responseData };

    if (!apiResponse.ok) {
      console.error("❌ WhatsApp API Error:", responseData);
      return res.status(apiResponse.status).json({
        success: false,
        error: responseData?.error?.message || "WhatsApp API error",
        details: responseData,
      });
    }

    const success = {
      success: true,
      template: "parent_invite",
      messageId: responseData.messages?.[0]?.id,
      recipient: formattedNumber,
      timestamp: new Date().toISOString(),
    };

    console.log("✅ WhatsApp Message Sent:", success);
    return res.status(200).json(success);
  } catch (err) {
    console.error("💥 Server Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  } finally {
    log.timings.end = new Date();
    log.timings.duration = log.timings.end - log.timings.start;
    console.log("📝 Full WhatsApp Log:", JSON.stringify(log, null, 2));
  }
}
