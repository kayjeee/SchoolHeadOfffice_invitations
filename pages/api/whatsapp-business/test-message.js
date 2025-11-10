export default async function handler(req, res) {
  const log = {
    request: { method: req.method, headers: req.headers, body: req.body, query: req.query },
    whatsappRequest: null,
    whatsappResponse: null,
    errors: [],
    timings: { start: new Date(), end: null, duration: null },
  };

  try {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    const { WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_ACCESS_TOKEN } = process.env;
    if (!WHATSAPP_PHONE_NUMBER_ID || !WHATSAPP_ACCESS_TOKEN) {
      return res.status(500).json({ error: "Missing WhatsApp credentials" });
    }

    const { to, variables = {}, fallbackTemplate = "school_invitation" } = req.body;

    if (!to) return res.status(400).json({ error: "Recipient phone number required" });

    const formattedNumber = to.replace(/\D/g, "");
    if (!formattedNumber.startsWith("27")) return res.status(400).json({ error: "Invalid phone number format" });

    const whatsappUrl = `https://graph.facebook.com/v22.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

    // ⚡ Ensure all variables for the template are present
    const requiredVariables = ["gradename", "magiclink", "supportemail", "schoolname"];
    for (const key of requiredVariables) {
      if (!variables[key]) {
        return res.status(400).json({ error: `Missing template variable: ${key}` });
      }
    }

    // Map variables in order to Meta template
    const payload = {
      messaging_product: "whatsapp",
      to: formattedNumber,
      type: "template",
      template: {
        name: fallbackTemplate,
        language: { code: "en" },
        components: [
          {
            type: "body",
            parameters: requiredVariables.map((key) => ({
              type: "text",
              text: variables[key],
            })),
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

    console.log("📤 Sending WhatsApp Template:", { to: formattedNumber, payload });

    const apiResponse = await fetch(whatsappUrl, {
      method: "POST",
      headers: log.whatsappRequest.headers,
      body: JSON.stringify(payload),
    });

    const responseData = await apiResponse.json();
    log.whatsappResponse = { status: apiResponse.status, data: responseData };

    if (!apiResponse.ok) {
      return res.status(apiResponse.status).json({
        success: false,
        error: responseData?.error?.message || "WhatsApp API error",
        details: responseData,
      });
    }

    const success = {
      success: true,
      type: "template",
      messageId: responseData.messages?.[0]?.id,
      recipient: formattedNumber,
      timestamp: new Date().toISOString(),
    };

    console.log("✅ WhatsApp Template Sent:", success);
    return res.status(200).json(success);
  } catch (err) {
    console.error("💥 Server Error:", err);
    return res.status(500).json({
      success: false,
      error: err.message,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  } finally {
    log.timings.end = new Date();
    log.timings.duration = log.timings.end - log.timings.start;
    console.log("📝 Full WhatsApp Log:", JSON.stringify(log, null, 2));
  }
}
