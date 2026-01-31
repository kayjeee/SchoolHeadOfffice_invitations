// pages/api/create-payment.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

const PAYFAST_MERCHANT_ID = process.env.PAYFAST_MERCHANT_ID;
const PAYFAST_MERCHANT_KEY = process.env.PAYFAST_MERCHANT_KEY;
const PAYFAST_PASSPHRASE = process.env.PAYFAST_PASSPHRASE; // Optional but recommended
const IS_SANDBOX = process.env.PAYFAST_SANDBOX === 'true';

// PayFast URLs
const PAYFAST_URL = IS_SANDBOX 
  ? 'https://sandbox.payfast.co.za/eng/process'
  : 'https://www.payfast.co.za/eng/process';

interface PaymentRequest {
  amount: number;
  item_name: string;
  user_id: string;
  billing_cycle: 'monthly' | 'annual';
  tier: 'premium' | 'standard';
}

interface PayFastData {
  merchant_id: string;
  merchant_key: string;
  return_url: string;
  cancel_url: string;
  notify_url: string;
  name_first?: string;
  email_address?: string;
  m_payment_id: string;
  amount: string;
  item_name: string;
  custom_str1?: string; // tier
  custom_str2?: string; // billing_cycle
  custom_str3?: string; // user_id
  signature?: string;
}

// Generate PayFast signature
function generateSignature(data: Record<string, string>, passPhrase: string = ''): string {
  // Create parameter string
  let pfOutput = '';
  for (let key in data) {
    if (data.hasOwnProperty(key)) {
      if (data[key] !== '') {
        pfOutput += `${key}=${encodeURIComponent(data[key].trim()).replace(/%20/g, '+')}&`;
      }
    }
  }

  // Remove last ampersand
  let getString = pfOutput.slice(0, -1);
  
  // Append passphrase if it exists
  if (passPhrase) {
    getString += `&passphrase=${encodeURIComponent(passPhrase.trim()).replace(/%20/g, '+')}`;
  }

  // Generate MD5 hash
  return crypto.createHash('md5').update(getString).digest('hex');
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    console.log('💳 Creating PayFast payment...');
    console.log('📦 Request body:', req.body);

    // Validate environment variables
    if (!PAYFAST_MERCHANT_ID || !PAYFAST_MERCHANT_KEY) {
      console.error('❌ Missing PayFast credentials');
      return res.status(500).json({
        success: false,
        error: 'Payment system not configured. Please contact support.',
      });
    }

    const { 
      amount, 
      item_name, 
      user_id, 
      billing_cycle,
      tier 
    }: PaymentRequest = req.body;

    // Validate required fields
    if (!amount || !item_name || !user_id || !billing_cycle || !tier) {
      return res.status(400).json({
        success: false,
        error: 'Missing required payment information',
      });
    }

    // Create unique transaction ID
    const transactionId = `TXN_${Date.now()}_${user_id.substring(0, 8)}`;

    // Get the base URL for callbacks
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                    (req.headers.host?.includes('localhost') 
                      ? `http://${req.headers.host}`
                      : `https://${req.headers.host}`);

    console.log('🌐 Base URL:', baseUrl);

    // First, create transaction record in your backend
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 
                          'https://shobackendv2-production.up.railway.app/api/v1';
      
      console.log('📤 Creating transaction in backend:', API_BASE_URL);
      
      const createTxnResponse = await fetch(`${API_BASE_URL}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id,
          amount,
          tier,
          billing_cycle,
          payment_method: 'payfast',
          status: 'pending',
          payfast_merchant_id: PAYFAST_MERCHANT_ID,
          external_id: transactionId,
        }),
      });

      const txnResult = await createTxnResponse.json();
      console.log('📥 Backend transaction response:', txnResult);

      if (!txnResult.success) {
        throw new Error(txnResult.error || 'Failed to create transaction');
      }

      // Use the backend-generated transaction ID
      const backendTxnId = txnResult.data?.id || transactionId;
      
      console.log('✅ Transaction created:', backendTxnId);

      // Build PayFast payment data
      const paymentData: PayFastData = {
        merchant_id: PAYFAST_MERCHANT_ID,
        merchant_key: PAYFAST_MERCHANT_KEY,
        return_url: `${baseUrl}/api/payfast/success?transaction_id=${backendTxnId}`,
        cancel_url: `${baseUrl}/api/payfast/cancel?transaction_id=${backendTxnId}`,
        notify_url: `${baseUrl}/api/payfast/notify`,
        m_payment_id: backendTxnId,
        amount: amount.toFixed(2),
        item_name: item_name,
        custom_str1: tier,
        custom_str2: billing_cycle,
        custom_str3: user_id,
      };

      // Generate signature if passphrase is set
      if (PAYFAST_PASSPHRASE) {
        const dataForSignature = { ...paymentData };
        delete dataForSignature.signature;
        paymentData.signature = generateSignature(dataForSignature, PAYFAST_PASSPHRASE);
        console.log('🔐 Generated signature:', paymentData.signature);
      }

      // Build the payment URL
      const queryString = new URLSearchParams(paymentData as any).toString();
      const paymentUrl = `${PAYFAST_URL}?${queryString}`;

      console.log('✅ Payment URL created');
      console.log('🔗 Redirect URL:', paymentUrl);

      // Return the payment URL to the frontend
      return res.status(200).json({
        success: true,
        paymentUrl,
        transaction_id: backendTxnId,
      });

    } catch (backendError: any) {
      console.error('❌ Backend error:', backendError);
      return res.status(500).json({
        success: false,
        error: 'Failed to initialize payment. Please try again.',
        details: backendError.message,
      });
    }

  } catch (error: any) {
    console.error('❌ Payment creation error:', error);
    return res.status(500).json({
      success: false,
      error: 'Payment system error. Please try again later.',
      details: error.message,
    });
  }
}