// pages/api/parent/link-learners.ts
import { getSession } from '@auth0/nextjs-auth0';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function linkLearners(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession(req, res);

  if (!session) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const { invitation_token, phone_number } = req.body;

  if (!invitation_token || !phone_number) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  try {
    const internalApiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://shobackendv2-production.up.railway.app';
    const response = await fetch(`${internalApiUrl}/api/v1/parents/link-learners`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: session.user.sub,
        invitation_token,
        phone_number,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(`Failed to link learners: ${response.statusText} - ${errorBody.message}`);
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
