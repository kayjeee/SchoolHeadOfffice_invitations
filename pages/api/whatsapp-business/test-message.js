// pages/api/whatsapp-business/test-message.js

export default async function handler(req, res) {
  const { WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_ACCESS_TOKEN } = process.env;
  const { to, schoolName, magicLink } = req.body;

  if (!to || !magicLink) {
    return res.status(400).json({ error: "Phone number and magicLink are required" });
  }

  const formattedNumber = to.replace(/\D/g, "");
  const whatsappUrl = `https://graph.facebook.com/v22.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

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
            { type: "text", text: schoolName || "Parent" }, // {{1}}
          ],
        },
        {
          type: "button",
          sub_type: "url",
          index: "0",
          parameters: [
            { type: "text", text: magicLink }, // {{2}} - dynamic button URL
          ],
        },
      ],
    },
  };

  const apiResponse = await fetch(whatsappUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const responseData = await apiResponse.json();
  if (!apiResponse.ok) {
    console.error("❌ WhatsApp API Error:", responseData);
    return res.status(apiResponse.status).json({
      success: false,
      error: responseData?.error?.message,
      details: responseData,
    });
  }

  res.status(200).json({
    success: true,
    messageId: responseData.messages?.[0]?.id,
  });
}
