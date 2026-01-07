// pages/api/payfast/cancel.ts
// This handles the return from PayFast when user cancels
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { transaction_id } = req.query;

  console.log('🚫 PayFast cancel callback:', { transaction_id });

  // Redirect to the payment page or onboarding
  res.redirect(
    302,
    `/parent/onboarding?step=payment&cancelled=true&transaction_id=${transaction_id}`
  );
}