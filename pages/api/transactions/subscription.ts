// pages/api/transactions/subscription.ts
import type { NextApiRequest, NextApiResponse } from 'next';

const RAILS_API_URL = process.env.RAILS_API_URL || 'http://localhost:4000';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false,
      error: 'Method not allowed' 
    });
  }

  try {
    console.log('📤 Proxying subscription request to Rails API');
    console.log('📦 Request body:', req.body);

    const response = await fetch(`${RAILS_API_URL}/api/v1/transactions/subscription`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    console.log('📥 Rails API response status:', response.status);
    
    const data = await response.json();
    console.log('📦 Rails API response data:', data);

    // Forward the response from Rails
    res.status(response.status).json(data);
  } catch (error: any) {
    console.error('❌ Error proxying to Rails API:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Failed to create subscription'
    });
  }
}
