// pages/api/whatsapp-business/test-message.js

export default async function handler(req, res) {
  console.log("📥 Incoming test-message request");

  const { WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_ACCESS_TOKEN } = process.env;
  const { to, schoolName, token, firstName } = req.body || {};

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!to || !token || !schoolName) {
    return res.status(400).json({
      error: "Missing required fields: to, token, schoolName"
    });
  }

  const formattedNumber = to.replace(/\D/g, "");
  console.log("📞 Normalized phone:", formattedNumber);
  console.log("🔑 Token:", token);
  console.log("👤 First Name:", firstName);
  console.log("🏫 School Name:", schoolName);

  const whatsappUrl = `https://graph.facebook.com/v22.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

  /**
   * ✅ ACCOUNT VERIFICATION TEMPLATE PAYLOAD
   * Template: account_verification
   * Body: "Hello {{1}}'s Parent/Guardian 
   *        Your child has been inducted into {{2}}. You are welcome 
   *        to follow their progress on SchoolHeadOffice."
   * Button: Dynamic URL with token
   */
  const payload = {
    messaging_product: "whatsapp",
    to: formattedNumber,
    type: "template",
    template: {
      name: "account_verification",
      language: { code: "en_US" },
      components: [
        {
          type: "body",
          parameters: [
            {
              type: "text",
              text: firstName || "Student"  // {{1}} - Child's first name
            },
            {
              type: "text",
              text: schoolName  // {{2}} - School name
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
              text: token   // This gets appended to the base URL
            }
          ]
        }
      ]
    }
  };

  console.log("📤 FINAL PAYLOAD:", JSON.stringify(payload, null, 2));

  try {
    const response = await fetch(whatsappUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ WhatsApp API error:", data);
      return res.status(response.status).json({
        success: false,
        error: data?.error?.message,
        details: data
      });
    }

    console.log("✅ Message sent:", data);
    return res.status(200).json({
      success: true,
      messageId: data.messages?.[0]?.id,
      sentTo: formattedNumber
    });
  } catch (err) {
    console.error("❌ Network error:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to reach WhatsApp API"
    });
  }
}