// pages/api/payfast/cancel.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { transaction_id } = req.query;

  console.log('🚫 PayFast cancel callback');
  console.log('📦 Query params:', req.query);
  console.log('🆔 Transaction ID:', transaction_id);

  // Update transaction status to cancelled in backend
  if (transaction_id) {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 
                          'https://shobackendv2-production.up.railway.app/api/v1';
      
      await fetch(`${API_BASE_URL}/transactions/${transaction_id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'cancelled',
        }),
      });
      
      console.log('✅ Transaction marked as cancelled');
    } catch (error) {
      console.error('❌ Failed to update transaction:', error);
    }
  }

  // Redirect back to onboarding payment step
  res.redirect(
    302,
    `/parent/onboarding?step=payment&cancelled=true&transaction_id=${transaction_id || ''}`
  );
}