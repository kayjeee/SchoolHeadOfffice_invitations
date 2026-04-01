import { NextApiRequest, NextApiResponse } from 'next';
import { MessagingAgent } from '@/lib/ai/messaging-agent';
import { getSession } from '@auth0/nextjs-auth0';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession(req, res);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { method } = req;
  const userId = session.user.sub;
  const schoolId = req.query.schoolId as string || req.body.schoolId;

  if (!schoolId) {
    return res.status(400).json({ error: 'Missing schoolId' });
  }

  switch (method) {
    case 'POST':
      try {
        const { content, metadata } = req.body;
        if (!content) {
          return res.status(400).json({ error: 'Missing content' });
        }

        const agentResponse = await MessagingAgent.analyzeMessage(
          schoolId,
          userId,
          content,
          metadata
        );

        res.status(200).json(agentResponse);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
      break;

    default:
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
