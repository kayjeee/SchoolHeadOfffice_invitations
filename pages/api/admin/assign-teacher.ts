import { getSession } from '@auth0/nextjs-auth0';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handleTeacherAssignment(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getSession(req, res);

    if (!session) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method Not Allowed' });
      return;
    }

    const { classId } = req.query;
    const internalApiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:4000/api/v1';

    const response = await fetch(`${internalApiUrl}/classes/${classId}/assign_teacher`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken || ''}`,
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        teacher_id: req.body.teacher_id,
        role: req.body.role,
        subject_id: req.body.subject_id,
        subject_ids: req.body.subject_ids
      }),
    });

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      res.status(response.status).json(data);
    } else {
      const text = await response.text();
      console.error(`🔥 Upstream HTML Error [POST /api/admin/assign-teacher]:`, text);
      res.status(response.status).json({
        success: false,
        error: `Upstream server returned ${response.status}`,
        details: text.substring(0, 500)
      });
    }
  } catch (error: any) {
    console.error('❌ Local Proxy Error [POST /api/admin/assign-teacher]:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}
