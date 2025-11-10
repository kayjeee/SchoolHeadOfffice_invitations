export default async function handler(req, res) {
  const log = {
    request: {
      method: req.method,
      headers: req.headers,
      body: req.body,
      query: req.query,
    },
    whatsappRequest: null,
    whatsappResponse: null,
    errors: [],
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

    const {
      to,
      messageContent,
      variables = {},
      fallbackTemplate = "school_invitation",
    } = req.body;

    if (!to) {
      return res.status(400).json({ error: "Recipient phone number required" });
    }

    const formattedNumber = to.replace(/\D/g, "");
    if (!formattedNumber.startsWith("27")) {
      return res.status(400).json({ error: "Invalid phone number format" });
    }

    const whatsappUrl = `https://graph.facebook.com/v22.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

    // ✅ Detect {{variables}} in the message
    const variableMatches = messageContent?.match(/{{\s*[\w.]+\s*}}/g) || [];

    // ✅ Replace placeholders with actual variable values
    let parsedMessage = messageContent;
    if (variableMatches.length > 0) {
      variableMatches.forEach((match) => {
        const key = match.replace(/[{}]/g, "").trim();
        const value = variables[key] ?? `[${key}]`;
        parsedMessage = parsedMessage.replace(match, value);
      });
    }

    // ✅ Decide whether to send raw text or Meta template
    const useRawText = variableMatches.length > 0 || messageContent?.trim().length > 0;

    const payload = useRawText
      ? {
          messaging_product: "whatsapp",
          to: formattedNumber,
          type: "text",
          text: { body: parsedMessage },
        }
      : {
          messaging_product: "whatsapp",
          to: formattedNumber,
          type: "template",
          template: {
            name: fallbackTemplate,
            language: { code: "en" },
            components: [
              {
                type: "body",
                parameters: Object.entries(variables).map(([_, val]) => ({
                  type: "text",
                  text: val,
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

    console.log("📤 Sending WhatsApp Message:", {
      to: formattedNumber,
      type: useRawText ? "text" : "template",
      messagePreview: parsedMessage,
    });

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
      type: useRawText ? "text" : "template",
      messageId: responseData.messages?.[0]?.id,
      messagePreview: parsedMessage,
      recipient: formattedNumber,
      timestamp: new Date().toISOString(),
    };

    console.log("✅ WhatsApp Message Sent:", success);
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
