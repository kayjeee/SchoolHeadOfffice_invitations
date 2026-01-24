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

  const log = {
    total: personalizedMessages.length,
    sent: 0,
    failed: 0,
    deduplicated: 0,
    invalidNumbers: 0,
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

  /* -------------------- send loop -------------------- */

  for (const msg of unique.values()) {
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
          // 🚫 NO BUTTON — template has STATIC URL
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

    await sleep(250);
  }

  return res.status(200).json({
    success: true,
    stats: log
  });
}
