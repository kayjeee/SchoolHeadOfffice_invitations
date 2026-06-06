import { getSession } from '@auth0/nextjs-auth0';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handleGrades(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession(req, res);

  if (!session) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const internalApiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api/v1';
  const { schoolId, gradeId } = req.query;

  try {
    let response;
    const headers = {
      'Authorization': `Bearer ${session.accessToken || ''}`,
      'Content-Type': 'application/json',
    };

    if (req.method === 'GET') {
      // Use the school-nested grades index to get classes and learners
      const url = gradeId
        ? `${internalApiUrl}/grades/${gradeId}`
        : `${internalApiUrl}/schools/${schoolId}/grades`;
      response = await fetch(url, { headers });
    } else if (req.method === 'POST') {
      response = await fetch(`${internalApiUrl}/schools/${schoolId}/grades`, {
        method: 'POST',
        headers,
        body: JSON.stringify(req.body),
      });
    } else if (req.method === 'PATCH' || req.method === 'PUT') {
      response = await fetch(`${internalApiUrl}/grades/${gradeId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(req.body),
      });
    } else if (req.method === 'DELETE') {
      response = await fetch(`${internalApiUrl}/grades/${gradeId}`, {
        method: 'DELETE',
        headers,
      });
    } else {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    if (response.status === 204) return res.status(204).end();

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
