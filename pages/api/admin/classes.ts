import { getSession } from '@auth0/nextjs-auth0';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handleClasses(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getSession(req, res);

    if (!session) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const internalApiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:4000/api/v1';
    const { schoolId, gradeId, classId } = req.query;

    let response;
    const headers = {
      'Authorization': `Bearer ${session.accessToken || ''}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    const baseUrl = `${internalApiUrl}/schools/${schoolId}/grades/${gradeId}/classes`;

    if (req.method === 'GET') {
      response = await fetch(classId ? `${baseUrl}/${classId}` : baseUrl, { headers });
    } else if (req.method === 'POST') {
      response = await fetch(baseUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(req.body),
      });
    } else if (req.method === 'PATCH' || req.method === 'PUT') {
      response = await fetch(`${baseUrl}/${classId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(req.body),
      });
    } else if (req.method === 'DELETE') {
      response = await fetch(`${baseUrl}/${classId}`, {
        method: 'DELETE',
        headers,
      });
    } else {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    if (response.status === 204) return res.status(204).end();

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      res.status(response.status).json(data);
    } else {
      const text = await response.text();
      console.error(`🔥 Upstream HTML Error [${req.method} /api/admin/classes]:`, text);
      res.status(response.status).json({
        success: false,
        error: `Upstream server returned ${response.status}`,
        details: text.substring(0, 500)
      });
    }
  } catch (error: any) {
    console.error(`❌ Local Proxy Error [${req.method} /api/admin/classes]:`, error);
    res.status(500).json({ success: false, error: error.message });
  }
}
