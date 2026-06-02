import { getSession } from '@auth0/nextjs-auth0';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handleLearnerTransition(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession(req, res);

  if (!session) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const { learnerId: queryLearnerId } = req.query;
  const learnerId = req.body.learner_id || queryLearnerId;
  const schoolId = req.body.school_id;
  const internalApiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api/v1';

  try {
    // Backend requirement: POST /move_learner with IDs in body
    const response = await fetch(`${internalApiUrl}/move_learner`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken || ''}`,
      },
      body: JSON.stringify({
        learner_id: learnerId,
        target_class_id: req.body.target_class_id,
        school_id: schoolId
      }),
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
