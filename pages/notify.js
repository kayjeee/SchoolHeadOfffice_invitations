// pages/api/payfast-ipn.ts

import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Build PayFast validation string
    const validationString = Object.keys(req.body)
      .sort()
      .map((key) => `${key}=${encodeURIComponent(req.body[key])}`)
      .join("&");

    console.log("IPN Data:", req.body);

    // Send back to PayFast for validation
    const response = await fetch("https://www.payfast.co.za/eng/query/validate", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: validationString,
    });

    const verification = await response.text();

    if (verification.trim() === "VALID") {
      console.log("✅ Payment is valid");
      return res.status(200).send("Payment validated");
    } else {
      console.error("❌ Invalid payment");
      return res.status(400).send("Invalid payment");
    }
  } catch (error) {
    console.error("⚠️ Error verifying payment:", error);
    return res.status(500).send("Internal server error");
  }
}
