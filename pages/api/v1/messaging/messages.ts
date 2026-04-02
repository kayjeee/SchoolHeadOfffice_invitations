import { NextApiRequest, NextApiResponse } from 'next';
import { MessagingService } from '@/lib/services/MessagingService';
import { getSession } from '@auth0/nextjs-auth0';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession(req, res);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { method } = req;
  const conversationId = req.query.conversationId as string;
  const userId = session.user.sub;

  if (!conversationId) {
    return res.status(400).json({ error: 'Missing conversationId' });
  }

  switch (method) {
    case 'GET':
      try {
        const messages = await MessagingService.getMessages(conversationId, userId);
        res.status(200).json(messages);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
      break;

    case 'POST':
      try {
        const { content, type, metadata } = req.body;
        const messageId = await MessagingService.sendMessage(
          conversationId, userId, content, type, metadata
        );
        res.status(201).json({ messageId });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
      break;

    case 'PUT':
      // Support for read receipts and typing status
      try {
        const { action, isTyping } = req.body;
        if (action === 'read') {
          await MessagingService.markAsRead(conversationId, userId);
          return res.status(204).end();
        } else if (action === 'typing') {
          await MessagingService.setTypingStatus(conversationId, userId, !!isTyping);
          return res.status(204).end();
        }
        res.status(400).json({ error: 'Invalid action' });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
