// pages/api/payfast/success.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { transaction_id } = req.query;

  console.log('✅ PayFast success callback');
  console.log('📦 Query params:', req.query);
  console.log('🆔 Transaction ID:', transaction_id);

  if (!transaction_id) {
    console.error('❌ No transaction ID provided');
    return res.redirect(302, '/parent/onboarding?error=no_transaction_id');
  }

  // Store transaction ID for the frontend to pick up
  // The frontend will then poll the backend to verify payment status

  // Redirect back to onboarding with transaction ID
  res.redirect(
    302,
    `/parent/onboarding?step=payment&transaction_id=${transaction_id}`
  );
}