import { getSession } from '@auth0/nextjs-auth0';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handleTeacherAssignment(req: NextApiRequest, res: NextApiResponse) {
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
  const internalApiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api/v1';

  try {
    const response = await fetch(`${internalApiUrl}/admin/assign-teacher?classId=${classId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken || ''}`,
      },
      body: JSON.stringify({
        teacher_id: req.body.teacher_id,
        role: req.body.role,
                subject_id: req.body.subject_id, // Singular as per backend spec
                subject_ids: req.body.subject_ids // Keep plural for compatibility
      }),
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
