// pages/api/payfast/success.ts
// This handles the return from PayFast after successful payment
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { transaction_id, pf_payment_id } = req.query;

  console.log('✅ PayFast success callback:', { transaction_id, pf_payment_id });

  // Redirect to the success page with transaction ID
  res.redirect(
    302,
    `/parent/onboarding/payment-success?transaction_id=${transaction_id}`
  );
}