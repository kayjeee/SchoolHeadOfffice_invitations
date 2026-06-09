import { getSession } from '@auth0/nextjs-auth0';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handleLearnerTransition(req: NextApiRequest, res: NextApiResponse) {
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

    const { learnerId: queryLearnerId } = req.query;
    const learnerId = req.body.learner_id || queryLearnerId;
    const schoolId = req.body.school_id;
    const internalApiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:4000/api/v1';

    const response = await fetch(`${internalApiUrl}/learners/${learnerId}/move`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken || ''}`,
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        learner_id: learnerId,
        target_class_id: req.body.target_class_id,
        school_id: schoolId
      }),
    });

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      res.status(response.status).json(data);
    } else {
      const text = await response.text();
      console.error(`🔥 Upstream HTML Error [POST /api/admin/transition-learner]:`, text);
      res.status(response.status).json({
        success: false,
        error: `Upstream server returned ${response.status}`,
        details: text.substring(0, 500)
      });
    }
  } catch (error: any) {
    console.error('❌ Local Proxy Error [POST /api/admin/transition-learner]:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}
