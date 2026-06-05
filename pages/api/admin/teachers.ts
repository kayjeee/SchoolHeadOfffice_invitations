import { getSession } from '@auth0/nextjs-auth0';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handleTeachers(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession(req, res);

  if (!session) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const internalApiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api/v1';
  const { schoolId } = req.query;

  try {
    const response = await fetch(`${internalApiUrl}/schools/${schoolId}/teachers`, {
      headers: {
        'Authorization': `Bearer ${session.accessToken || ''}`,
      },
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
