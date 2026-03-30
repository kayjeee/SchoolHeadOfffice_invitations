import { NextApiRequest, NextApiResponse } from 'next';
import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0';
import { acceptTeacherInviteAction } from '../../../lib/actions/inviteActions';

export default withApiAuthRequired(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getSession(req, res);
  if (!session?.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }

  try {
    const result = await acceptTeacherInviteAction(token, session.user.sub);
    return res.status(200).json(result);
  } catch (error: any) {
    console.error('❌ [API.acceptInvite] Error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Internal server error' });
  }
});
