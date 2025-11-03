export default async function handler(req, res) {
  // 🧾 Structured log object
  const log = {
    request: {
      method: req.method,
      headers: req.headers,
      body: req.body,
      query: req.query,
    },
    response: null,
    errors: [],
    results: { sent: 0, failed: 0, total: 0, details: [] },
    timings: { start: new Date(), end: null, duration: null },
  };

  try {
    // ✅ Enforce POST
    if (req.method !== "POST") {
      log.errors.push({ code: "INVALID_METHOD", message: "Only POST allowed" });
      return res.status(405).json({ error: "Method not allowed", details: log });
    }

    // ✅ Validate environment
    const requiredEnvVars = ["WHATSAPP_PHONE_NUMBER_ID", "WHATSAPP_ACCESS_TOKEN"];
    const missingVars = requiredEnvVars.filter((v) => !process.env[v]);
    if (missingVars.length > 0) {
      log.errors.push({
        code: "MISSING_ENV_VARS",
        message: "Required environment variables not set",
        missing: missingVars,
      });
      return res.status(500).json({ error: "Server configuration error", details: log });
    }

    // ✅ Validate input
    const { gradeIds, schoolName, personalizedMessages } = req.body;
    if (!personalizedMessages || !Array.isArray(personalizedMessages) || personalizedMessages.length === 0) {
      log.errors.push({ code: "MISSING_MESSAGES", message: "No personalized messages provided" });
      return res.status(400).json({ error: "personalizedMessages array required", details: log });
    }

    log.results.total = personalizedMessages.length;
    const whatsappUrl = `https://graph.facebook.com/v22.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

    // ✅ Loop and send per recipient
    for (const entry of personalizedMessages) {
      const { to, message, gradeName, magicLink } = entry;
      try {
        if (!to) {
          log.results.failed++;
          log.results.details.push({ to, status: "failed", error: "Missing phone number" });
          continue;
        }

        const formattedNumber = to.replace(/\D/g, "");
        if (!formattedNumber.startsWith("27") || formattedNumber.length !== 11) {
          log.results.failed++;
          log.results.details.push({
            to: formattedNumber,
            status: "failed",
            error: "Invalid South African number (must be 27XXXXXXXXX)",
          });
          continue;
        }

        // ✅ Build WhatsApp Template Payload
        const payload = {
          messaging_product: "whatsapp",
          to: formattedNumber,
          type: "template",
          template: {
            name: "school_invitation_message", // ✅ Active Meta Template
            language: { code: "en_US" },
            components: [
              {
                type: "body",
                parameters: [
                  { type: "text", text: gradeName || "your child’s class" }, // {{gradeId}}
                  { type: "text", text: magicLink || "https://portal.schoolheadoffice.com/join" }, // {{testType}}
                  { type: "text", text: schoolName || "Your School" }, // {{schoolName}}
                ],
              },
            ],
          },
        };

        const apiResponse = await fetch(whatsappUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const responseData = await apiResponse.json();

        if (apiResponse.ok) {
          log.results.sent++;
          log.results.details.push({
            to: formattedNumber,
            status: "success",
            messageId: responseData.messages?.[0]?.id,
          });
        } else {
          log.results.failed++;
          log.results.details.push({
            to: formattedNumber,
            status: "failed",
            error: responseData.error?.message || "WhatsApp API error",
          });
        }

        // ⏳ small delay to prevent rate limits
        await new Promise((r) => setTimeout(r, 200));
      } catch (error) {
        log.results.failed++;
        log.results.details.push({
          to: entry?.to,
          status: "error",
          error: error.message,
        });
      }
    }

    // ✅ Summary response
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
    console.error("❌ WhatsApp Bulk Template Send Error:", error);
    return res.status(500).json({ error: "Internal server error", details: process.env.NODE_ENV === "development" ? log : null });
  } finally {
    console.log("📝 WhatsApp Bulk Template Send Log:", JSON.stringify(log, null, 2));
  }
}
