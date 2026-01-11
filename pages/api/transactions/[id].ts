// pages/api/transactions/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next';

const RAILS_API_URL = process.env.RAILS_API_URL || 'http://localhost:4000';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false,
      error: 'Method not allowed' 
    });
  }

  try {
    console.log('📥 Fetching transaction:', id);

    const response = await fetch(`${RAILS_API_URL}/api/v1/transactions/${id}`);
    console.log('📡 Rails API response status:', response.status);
    
    const data = await response.json();
    console.log('📦 Transaction data:', data);

    res.status(response.status).json(data);
  } catch (error: any) {
    console.error('❌ Error fetching transaction:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Failed to fetch transaction'
    });
  }
}