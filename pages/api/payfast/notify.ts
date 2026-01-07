// pages/api/payfast/notify.ts
// This is the IPN endpoint - PayFast will POST here
import type { NextApiRequest, NextApiResponse } from 'next';

const RAILS_API_URL = process.env.RAILS_API_URL || 'http://localhost:4000';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method not allowed');
  }

  try {
    console.log('📨 PayFast IPN received');
    console.log('📦 IPN data:', req.body);

    // Forward IPN to Rails backend
    const response = await fetch(`${RAILS_API_URL}/api/v1/transactions/notify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(req.body).toString(),
    });

    const result = await response.text();
    console.log('📥 Rails IPN response:', result);

    // PayFast expects 'VALID' or 'INVALID'
    res.status(200).send(result);
  } catch (error: any) {
    console.error('❌ Error processing IPN:', error);
    res.status(500).send('ERROR');
  }
}
