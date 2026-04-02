import { NextApiRequest, NextApiResponse } from 'next';
import { MessagingService } from '@/lib/services/MessagingService';
import { getSession } from '@auth0/nextjs-auth0';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession(req, res);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { method } = req;
  const schoolId = req.query.schoolId as string;
  const userId = session.user.sub;

  if (!schoolId) {
    return res.status(400).json({ error: 'Missing schoolId' });
  }

  // Role validation logic would go here in a production app
  // For now we assume session.user is valid for the requested operation

  switch (method) {
    case 'GET':
      try {
        const conversations = await MessagingService.getUserConversations(schoolId, userId);
        res.status(200).json(conversations);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
      break;

    case 'POST':
      try {
        const { type, participants, metadata } = req.body;
        if (type === 'direct') {
          const conversationId = await MessagingService.getOrCreateDirectConversation(
            schoolId, participants[0], participants[1], userId
          );
          res.status(201).json({ conversationId });
        } else {
          const conversationId = await MessagingService.createGroupConversation(
            schoolId, participants, metadata, userId
          );
          res.status(201).json({ conversationId });
        }
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
