// pages/api/create-payment.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

// PayFast Configuration
const PAYFAST_MERCHANT_ID = process.env.PAYFAST_MERCHANT_ID || '10000100';
const PAYFAST_MERCHANT_KEY = process.env.PAYFAST_MERCHANT_KEY || '46f0cd694581a';
const PAYFAST_PASSPHRASE = process.env.PAYFAST_PASSPHRASE || '';
const IS_SANDBOX = process.env.PAYFAST_SANDBOX !== 'false'; // Default to sandbox

// PayFast URL
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

// Generate PayFast signature
function generatePayFastSignature(data: Record<string, string>, passphrase: string = ''): string {
  let output = '';
  
  // Build parameter string
  for (const key in data) {
    if (data[key] !== '') {
      output += `${key}=${encodeURIComponent(data[key].trim()).replace(/%20/g, '+')}&`;
    }
  }
  
  // Remove last ampersand
  output = output.slice(0, -1);
  
  // Add passphrase if exists
  if (passphrase) {
    output += `&passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, '+')}`;
  }
  
  // Generate MD5 hash
  return crypto.createHash('md5').update(output).digest('hex');
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('🔥 ============================================');
  console.log('🔥 API Route Hit: /api/create-payment');
  console.log('🔥 ============================================');
  console.log('📍 Method:', req.method);
  console.log('📦 Body:', JSON.stringify(req.body, null, 2));
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    console.log('❌ Method not allowed:', req.method);
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    console.log('🔧 Environment Check:');
    console.log('  - Merchant ID:', PAYFAST_MERCHANT_ID);
    console.log('  - Has Merchant Key:', !!PAYFAST_MERCHANT_KEY);
    console.log('  - Has Passphrase:', !!PAYFAST_PASSPHRASE);
    console.log('  - Is Sandbox:', IS_SANDBOX);

    // Parse request body
    const { amount, item_name, user_id, billing_cycle, tier } = req.body as PaymentRequest;

    console.log('📋 Parsed Request:');
    console.log('  - Amount:', amount);
    console.log('  - Item:', item_name);
    console.log('  - User ID:', user_id);
    console.log('  - Billing Cycle:', billing_cycle);
    console.log('  - Tier:', tier);

    // Validate required fields
    if (!amount || !item_name || !user_id) {
      console.log('❌ Missing required fields');
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: amount, item_name, or user_id',
      });
    }

    console.log('✅ Validation passed');

    // Create transaction ID
    const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log('🆔 Generated Transaction ID:', transactionId);

    // Determine base URL
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers.host || 'localhost:3000';
    const baseUrl = `${protocol}://${host}`;
    
    console.log('🌐 Base URL:', baseUrl);

    // ============================================
    // IMPORTANT: Get school_id from user's profile
    // ============================================
    let schoolId = 'default-school'; // Fallback
    
    try {
      console.log('👤 Fetching user profile to get school_id...');
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 
                       'https://shobackendv2-production.up.railway.app/api/v1';
      
      const profileResponse = await fetch(
        `${API_BASE}/users/profile?auth0_id=${encodeURIComponent(user_id)}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (profileResponse.ok) {
        const profileResult = await profileResponse.json();
        if (profileResult.success && profileResult.data?.user?.school_id) {
          schoolId = profileResult.data.user.school_id;
          console.log('✅ School ID found:', schoolId);
        } else {
          console.log('⚠️ No school_id in user profile, using default');
        }
      } else {
        console.log('⚠️ Failed to fetch user profile, using default school_id');
      }
    } catch (profileError) {
      console.log('⚠️ Error fetching profile (continuing with default):', profileError);
    }

    // ============================================
    // Create transaction in backend with CORRECT fields
    // ============================================
    let backendTxnId = transactionId;
    
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 
                       'https://shobackendv2-production.up.railway.app/api/v1';
      
      console.log('📤 Creating backend transaction...');
      console.log('🔗 API URL:', `${API_BASE}/transactions`);
      
      // Build payload matching Rails Transaction model requirements
      const transactionPayload = {
        user_id: user_id,
        school_id: schoolId, // ✅ REQUIRED field
        amount: parseFloat(String(amount)),
        status: 'pending',
        payment_method: 'payfast',
        transaction_type: 'payment',
        description: `${tier.toUpperCase()} Plan - ${billing_cycle}`,
        reference_number: transactionId,
        metadata: {
          tier: tier,
          billing_cycle: billing_cycle,
          item_name: item_name,
          payfast_merchant_id: PAYFAST_MERCHANT_ID,
        },
      };

      console.log('📦 Transaction Payload:', JSON.stringify(transactionPayload, null, 2));
      
      const backendResponse = await fetch(`${API_BASE}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transactionPayload),
      });

      console.log('📡 Backend Response Status:', backendResponse.status);
      
      const responseText = await backendResponse.text();
      console.log('📄 Backend Response Body:', responseText);

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ Failed to parse backend response as JSON');
        console.error('Raw response:', responseText);
        throw new Error(`Backend returned invalid JSON: ${responseText.substring(0, 200)}`);
      }

      if (backendResponse.ok && result.success) {
        backendTxnId = result.data?.id || result.data?._id?.['$oid'] || transactionId;
        console.log('✅ Backend transaction created successfully');
        console.log('🆔 Backend Transaction ID:', backendTxnId);
      } else {
        console.error('❌ Backend transaction creation failed');
        console.error('Error:', result.error || 'Unknown error');
        throw new Error(result.error || 'Failed to create transaction in backend');
      }

    } catch (backendError: any) {
      console.error('❌ Backend Error:', backendError.message);
      console.error('Stack:', backendError.stack);
      
      // Continue anyway - we'll still redirect to PayFast
      // The IPN callback will create/update the transaction later
      console.log('⚠️ Continuing without backend transaction (will be created by IPN)');
    }

    // ============================================
    // Build PayFast payment data
    // ============================================
    console.log('💳 Building PayFast payment data...');
    
    const paymentData: Record<string, string> = {
      merchant_id: PAYFAST_MERCHANT_ID,
      merchant_key: PAYFAST_MERCHANT_KEY,
      return_url: `${baseUrl}/api/payfast/success?transaction_id=${backendTxnId}`,
      cancel_url: `${baseUrl}/api/payfast/cancel?transaction_id=${backendTxnId}`,
      notify_url: `${baseUrl}/api/payfast/notify`,
      m_payment_id: backendTxnId,
      amount: parseFloat(String(amount)).toFixed(2),
      item_name: String(item_name),
    };

    // Add custom fields (PayFast allows custom_str1-5)
    if (tier) paymentData.custom_str1 = String(tier);
    if (billing_cycle) paymentData.custom_str2 = String(billing_cycle);
    if (user_id) paymentData.custom_str3 = String(user_id);
    if (schoolId) paymentData.custom_str4 = String(schoolId);

    console.log('📋 Payment Data (before signature):', paymentData);

    // Generate signature
    if (PAYFAST_PASSPHRASE) {
      const signature = generatePayFastSignature(paymentData, PAYFAST_PASSPHRASE);
      paymentData.signature = signature;
      console.log('🔐 Signature generated:', signature);
    } else {
      console.log('⚠️ No passphrase set, skipping signature');
    }

    // Build PayFast URL
    const queryString = new URLSearchParams(paymentData).toString();
    const paymentUrl = `${PAYFAST_URL}?${queryString}`;

    console.log('✅ Payment URL created');
    console.log('📏 URL length:', paymentUrl.length);
    console.log('🔗 URL:', paymentUrl.substring(0, 150) + '...');

    console.log('🎉 ============================================');
    console.log('🎉 SUCCESS - Returning payment URL');
    console.log('🎉 ============================================');

    // Return success response
    return res.status(200).json({
      success: true,
      paymentUrl,
      transaction_id: backendTxnId,
    });

  } catch (error: any) {
    console.error('💥 ============================================');
    console.error('💥 FATAL ERROR');
    console.error('💥 ============================================');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    
    return res.status(500).json({
      success: false,
      error: 'Payment initialization failed',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
}