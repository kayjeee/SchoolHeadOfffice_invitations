// pages/api/whatsapp-business/send-bulk.js

export default async function handler(req, res) {
  const { WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_ACCESS_TOKEN } = process.env;

  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }

  if (!WHATSAPP_PHONE_NUMBER_ID || !WHATSAPP_ACCESS_TOKEN) {
    return res.status(500).json({ error: "Missing WhatsApp credentials" });
  }

  const { personalizedMessages, schoolName } = req.body;

  if (!Array.isArray(personalizedMessages) || personalizedMessages.length === 0) {
    return res.status(400).json({ error: "personalizedMessages[] required" });
  }

  // ⏱️ Set timeout safety margin (e.g., Vercel = 10s hobby, 60s pro)
  const FUNCTION_TIMEOUT = 8000; // 8 seconds for safety
  const startTime = Date.now();

  const log = {
    total: personalizedMessages.length,
    sent: 0,
    failed: 0,
    deduplicated: 0,
    invalidNumbers: 0,
    timedOut: false,
    results: []
  };

  /* -------------------- helpers -------------------- */

  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  const normalizeNumber = (num) => {
    if (!num) return null;
    const cleaned = String(num).replace(/\D/g, "");
    if (cleaned.startsWith("0") && cleaned.length === 10) {
      return "27" + cleaned.slice(1);
    }
    if (cleaned.length >= 10 && cleaned.length <= 15) {
      return cleaned;
    }
    return null;
  };

  const whatsappUrl =
    `https://graph.facebook.com/v22.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

  /* -------------------- deduplicate -------------------- */

  const unique = new Map();

  for (const msg of personalizedMessages) {
    const number = normalizeNumber(msg.to);

    if (!number) {
      log.invalidNumbers++;
      continue;
    }

    if (!unique.has(number)) {
      unique.set(number, { ...msg, to: number });
    } else {
      log.deduplicated++;
    }
  }

  const messages = Array.from(unique.values());

  /* -------------------- batch sending -------------------- */

  const BATCH_SIZE = 5; // Send 5 messages concurrently
  const DELAY_BETWEEN_BATCHES = 300; // 300ms between batches

  for (let i = 0; i < messages.length; i += BATCH_SIZE) {
    // ⏱️ Check if we're running out of time
    if (Date.now() - startTime > FUNCTION_TIMEOUT) {
      log.timedOut = true;
      break;
    }

    const batch = messages.slice(i, i + BATCH_SIZE);

    // Send batch concurrently
    await Promise.all(
      batch.map(async (msg) => {
        const displayName =
          msg.parentName ||
          msg.name ||
          schoolName ||
          "Parent";

        const payload = {
          messaging_product: "whatsapp",
          to: msg.to,
          type: "template",
          template: {
            name: "parent_invite",
            language: { code: "en_US" },
            components: [
              {
                type: "body",
                parameters: [
                  {
                    type: "text",
                    text: displayName
                  }
                ]
              }
            ]
          }
        };

        try {
          const r = await fetch(whatsappUrl, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
          });

          const data = await r.json();

          if (!r.ok) {
            throw new Error(data?.error?.message || "WhatsApp API error");
          }

          log.sent++;
          log.results.push({
            to: msg.to,
            status: "sent",
            messageId: data.messages?.[0]?.id
          });

        } catch (err) {
          log.failed++;
          log.results.push({
            to: msg.to,
            status: "failed",
            error: err.message
          });
        }
      })
    );

    // Delay between batches (except after the last batch)
    if (i + BATCH_SIZE < messages.length) {
      await sleep(DELAY_BETWEEN_BATCHES);
    }
  }

  return res.status(200).json({
    success: !log.timedOut,
    timedOut: log.timedOut,
    stats: log,
    message: log.timedOut 
      ? "Sending stopped due to timeout. Use a background job for large batches."
      : "All messages processed"
  });
}