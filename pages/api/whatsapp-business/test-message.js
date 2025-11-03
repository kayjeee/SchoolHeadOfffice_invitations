// pages/api/whatsapp-business/test-message.js
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
    timings: {
      start: new Date(),
      end: null,
      duration: null,
    },
  };

  try {
    if (req.method !== "POST") {
      log.errors.push({ code: "INVALID_METHOD", message: "Only POST allowed" });
      return res.status(405).json({ error: "Method not allowed", details: log });
    }

    // ✅ Check env vars
    const requiredEnvVars = ["WHATSAPP_PHONE_NUMBER_ID", "WHATSAPP_ACCESS_TOKEN"];
    const missing = requiredEnvVars.filter((v) => !process.env[v]);
    if (missing.length) {
      log.errors.push({
        code: "MISSING_ENV_VARS",
        message: "Missing required env vars",
        missing,
      });
      return res.status(500).json({ error: "Server misconfigured", details: log });
    }

    // ✅ Extract payload
    const { to, gradeId, schoolName, testType } = req.body;
    if (!to) {
      log.errors.push({ code: "MISSING_PHONE_NUMBER", message: "Missing 'to'" });
      return res.status(400).json({ error: "Phone number required", details: log });
    }

    // ✅ Normalize phone number (digits only)
    const formattedNumber = to.replace(/\D/g, "");
    if (!formattedNumber.startsWith("27") || formattedNumber.length !== 11) {
      log.errors.push({
        code: "INVALID_SA_NUMBER",
        message: "South African numbers must start with 27 and be 11 digits",
      });
      return res.status(400).json({ error: "Invalid phone format", details: log });
    }

    // ✅ Build WhatsApp API request payload
    const whatsappUrl = `https://graph.facebook.com/v22.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

    const payload = {
      messaging_product: "whatsapp",
      to: formattedNumber,
      type: "template",
      template: {
        name: "school_invitation_message", // ✅ Your approved template name
        language: { code: "en_US" },
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: gradeId || "your child’s class" }, // {{gradeId}}
              { type: "text", text: testType || "https://portal.schoolheadoffice.com/join" }, // {{testType}} magic link
              { type: "text", text: schoolName || "Your School" }, // {{schoolName}}
            ],
          },
        ],
      },
    };

    log.whatsappRequest = {
      url: whatsappUrl,
      payload,
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
    };

    console.log("📤 Sending WhatsApp Template Message:", {
      to: formattedNumber,
      template: payload.template.name,
      variables: payload.template.components[0].parameters.map((p) => p.text),
    });

    // ✅ Send message
    const apiResponse = await fetch(whatsappUrl, {
      method: "POST",
      headers: log.whatsappRequest.headers,
      body: JSON.stringify(payload),
    });

    const responseData = await apiResponse.json();
    log.whatsappResponse = { status: apiResponse.status, data: responseData };

    console.log("📥 WhatsApp API Response:", responseData);

    if (!apiResponse.ok) {
      log.errors.push({
        code: "WHATSAPP_API_ERROR",
        message: responseData.error?.message || "WhatsApp API error",
        details: responseData,
      });
      return res.status(apiResponse.status).json({
        error: responseData.error?.message || "WhatsApp API error",
        details: log,
      });
    }

    // ✅ Success response
    log.timings.end = new Date();
    log.timings.duration = log.timings.end - log.timings.start;
    log.response = {
      status: 200,
      data: {
        success: true,
        messageId: responseData.messages?.[0]?.id,
        recipient: formattedNumber,
        timestamp: new Date().toISOString(),
      },
    };

    return res.status(200).json(log.response.data);
  } catch (error) {
    log.errors.push({
      code: "SERVER_ERROR",
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
    log.timings.end = new Date();
    log.timings.duration = log.timings.end - log.timings.start;
    console.error("❌ WhatsApp Template Message Error:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: process.env.NODE_ENV === "development" ? log : null,
    });
  } finally {
    console.log("📝 WhatsApp Template Message Log:", JSON.stringify(log, null, 2));
  }
}
