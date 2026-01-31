// pages/api/payfast/notify.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

const PAYFAST_PASSPHRASE = process.env.PAYFAST_PASSPHRASE;
const IS_SANDBOX = process.env.PAYFAST_SANDBOX === 'true';

// PayFast server IPs for validation
const PAYFAST_HOSTS = IS_SANDBOX
  ? ['www.payfast.co.za', 'sandbox.payfast.co.za', 'w1w.payfast.co.za', 'w2w.payfast.co.za']
  : ['www.payfast.co.za', 'w1w.payfast.co.za', 'w2w.payfast.co.za'];

// Disable body parsing, we need raw body
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper to parse raw body
function getRawBody(req: NextApiRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

// Verify PayFast signature
function verifySignature(data: Record<string, string>, signature: string): boolean {
  // Create parameter string
  let pfParamString = '';
  for (let key in data) {
    if (data.hasOwnProperty(key) && key !== 'signature') {
      pfParamString += `${key}=${encodeURIComponent(data[key].trim()).replace(/%20/g, '+')}&`;
    }
  }

  // Remove last ampersand
  pfParamString = pfParamString.slice(0, -1);

  // Append passphrase
  if (PAYFAST_PASSPHRASE) {
    pfParamString += `&passphrase=${encodeURIComponent(PAYFAST_PASSPHRASE.trim()).replace(/%20/g, '+')}`;
  }

  // Calculate signature
  const calculatedSignature = crypto.createHash('md5').update(pfParamString).digest('hex');
  
  console.log('🔐 Signature verification:');
  console.log('   Received:', signature);
  console.log('   Calculated:', calculatedSignature);
  
  return calculatedSignature === signature;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method not allowed');
  }

  try {
    console.log('📨 PayFast IPN received');
    console.log('🌐 Headers:', req.headers);

    // Get raw body
    const rawBody = await getRawBody(req);
    const bodyString = rawBody.toString('utf8');
    
    console.log('📦 Raw body:', bodyString);

    // Parse the form data
    const params = new URLSearchParams(bodyString);
    const data: Record<string, string> = {};
    params.forEach((value, key) => {
      data[key] = value;
    });

    console.log('📋 Parsed IPN data:', data);

    // Verify signature
    const receivedSignature = data.signature;
    if (!receivedSignature) {
      console.error('❌ No signature in IPN data');
      return res.status(400).send('INVALID - No signature');
    }

    const isValidSignature = verifySignature(data, receivedSignature);
    if (!isValidSignature) {
      console.error('❌ Invalid signature');
      return res.status(400).send('INVALID - Signature mismatch');
    }

    console.log('✅ Signature verified');

    // Verify payment status
    const paymentStatus = data.payment_status;
    const transactionId = data.m_payment_id;
    const amount = parseFloat(data.amount_gross || '0');

    console.log('💰 Payment details:');
    console.log('   Status:', paymentStatus);
    console.log('   Transaction ID:', transactionId);
    console.log('   Amount:', amount);

    // Update transaction in backend
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 
                        'https://shobackendv2-production.up.railway.app/api/v1';

    console.log('📤 Updating transaction in backend...');
    
    const updateResponse = await fetch(`${API_BASE_URL}/transactions/${transactionId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: paymentStatus === 'COMPLETE' ? 'completed' : 'failed',
        payfast_payment_id: data.pf_payment_id,
        amount_paid: amount,
        ipn_data: data,
      }),
    });

    const updateResult = await updateResponse.json();
    console.log('📥 Backend update response:', updateResult);

    if (updateResult.success) {
      console.log('✅ Transaction updated successfully');
      
      // If payment is complete, activate subscription
      if (paymentStatus === 'COMPLETE') {
        try {
          const activateResponse = await fetch(
            `${API_BASE_URL}/subscriptions/activate`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                transaction_id: transactionId,
                user_id: data.custom_str3, // user_id from payment data
                tier: data.custom_str1, // tier from payment data
                billing_cycle: data.custom_str2, // billing_cycle from payment data
              }),
            }
          );

          const activateResult = await activateResponse.json();
          console.log('🎉 Subscription activation:', activateResult);
        } catch (activateError) {
          console.error('❌ Failed to activate subscription:', activateError);
        }
      }

      return res.status(200).send('VALID');
    } else {
      console.error('❌ Failed to update transaction');
      return res.status(500).send('ERROR');
    }

  } catch (error: any) {
    console.error('❌ IPN processing error:', error);
    return res.status(500).send('ERROR');
  }
}