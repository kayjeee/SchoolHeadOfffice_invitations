// pages/api/whatsapp-business/bulk-invite.js

export default async function handler(req, res) {
  const { WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_ACCESS_TOKEN } = process.env;

  const log = {
    request: { method: req.method, headers: req.headers, body: req.body, query: req.query },
    metrics: { total: 0, sent: 0, failed: 0, retried: 0, deduplicated: 0 },
    results: [],
    errors: [],
    whatsappRequests: [],
    whatsappResponses: [],
    timings: { start: Date.now(), end: null, duration: null }
  };

  try {
    // ------------------ METHOD VALIDATION ------------------
    if (req.method !== "POST") {
      return res.status(405).json({ error: "POST only allowed", details: log });
    }

    // ------------------ ENV VALIDATION ------------------
    if (!WHATSAPP_PHONE_NUMBER_ID || !WHATSAPP_ACCESS_TOKEN) {
      return res.status(500).json({ error: "Missing WhatsApp environment variables", details: log });
    }

    // ------------------ INPUT VALIDATION ------------------
    const { personalizedMessages } = req.body;
    if (!Array.isArray(personalizedMessages) || personalizedMessages.length === 0) {
      return res.status(400).json({ error: "personalizedMessages[] is required", details: log });
    }

    log.metrics.total = personalizedMessages.length;

    // ------------------ HELPERS ------------------
    const sleep = ms => new Promise(r => setTimeout(r, ms));

    const normalizeNumber = num => {
      if (!num) return null;
      num = num.replace(/\D/g, "");
      if (num.startsWith("0") && num.length === 10) return "27" + num.slice(1);
      if (num.length >= 10 && num.length <= 15) return num;
      return null;
    };

    const url = `https://graph.facebook.com/v22.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;
    const headers = { Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`, "Content-Type": "application/json" };

    const sendMessage = async (payload, attempt = 1) => {
      log.whatsappRequests.push({ payload });

      try {
        const r = await fetch(url, { method: "POST", headers, body: JSON.stringify(payload) });
        const data = await r.json();
        log.whatsappResponses.push({ status: r.status, data });

        if (!r.ok) throw new Error(data.error?.message || "WhatsApp API error");
        return { success: true, data };

      } catch (err) {
        if (attempt <= 2) {
          log.metrics.retried++;
          await sleep(800 * attempt);
          return sendMessage(payload, attempt + 1);
        }
        return { success: false, error: err.message };
      }
    };

    // ------------------ DEDUPLICATE MESSAGES ------------------
    const dedupedMessagesMap = new Map();
    for (const msg of personalizedMessages) {
      const number = normalizeNumber(msg.to);
      if (!number) continue;
      if (!dedupedMessagesMap.has(number)) {
        dedupedMessagesMap.set(number, msg);
      } else {
        log.metrics.deduplicated++;
      }
    }

    const dedupedMessages = Array.from(dedupedMessagesMap.values());

    // ------------------ MAIN LOOP ------------------
    for (const msg of dedupedMessages) {
      const { to, schoolName, magicLink } = msg;

      if (!to || !magicLink) {
        log.metrics.failed++;
        log.results.push({ to, status: "failed", reason: "Missing to or magicLink" });
        continue;
      }

      if (magicLink.includes("school=undefined")) {
        log.metrics.failed++;
        log.results.push({ to, status: "failed", reason: "Invalid magicLink: school=undefined" });
        continue;
      }

      const number = normalizeNumber(to);
      if (!number) {
        log.metrics.failed++;
        log.results.push({ to, status: "failed", reason: "Invalid phone number" });
        continue;
      }

      const payload = {
        messaging_product: "whatsapp",
        to: number,
        type: "template",
        template: {
          name: "parent_invite", // ✅ working template
          language: { code: "en_US" },
          components: [
            {
              type: "body",
              parameters: [{ type: "text", text: schoolName || "Parent" }]
            },
            {
              type: "button",
              sub_type: "url",
              index: "0",
              parameters: [{ type: "text", text: magicLink }]
            }
          ]
        }
      };

      const result = await sendMessage(payload);

      if (result.success) {
        log.metrics.sent++;
        log.results.push({ to: number, status: "sent", messageId: result.data.messages?.[0]?.id });
      } else {
        log.metrics.failed++;
        log.results.push({ to: number, status: "failed", error: result.error });
      }

      await sleep(300); // rate limit
    }

    // ------------------ FINAL RESPONSE ------------------
    log.timings.end = Date.now();
    log.timings.duration = log.timings.end - log.timings.start;

    return res.status(200).json({
      success: true,
      stats: log.metrics,
      results: log.results,
      durationMs: log.timings.duration
    });

  } catch (error) {
    log.errors.push({
      code: "SERVER_ERROR",
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined
    });
    log.timings.end = Date.now();
    log.timings.duration = log.timings.end - log.timings.start;
    console.error("❌ SYSTEM ERROR", error);

    return res.status(500).json({ error: "Internal server error", details: process.env.NODE_ENV === "development" ? log : null });
  } finally {
    console.log("📝 BULK WHATSAPP LOG:", JSON.stringify(log, null, 2));
  }
}
