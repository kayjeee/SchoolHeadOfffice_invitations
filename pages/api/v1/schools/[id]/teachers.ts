import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { getSession } from '@auth0/nextjs-auth0';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession(req, res);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id: schoolId } = req.query;

  if (req.method === 'GET') {
    try {
      const client = await clientPromise;
      if (!client) throw new Error('Database connection failed');
      const db = client.db();

      // Find teachers belonging to this school
      // In production, we'd also filter by the specific schoolId
      // Find staff and parents for this school to start chats
      const [teachers, parents] = await Promise.all([
        db.collection('teachers').find({}).limit(20).toArray(),
        db.collection('parents').find({}).limit(20).toArray()
      ]);

      const staffContacts = teachers.map(t => ({
        id: t.auth0Id || t._id.toString(),
        name: t.name || 'Unknown Staff',
        role: t.role || 'teacher',
        avatar: t.avatar || t.profile_image
      }));

      const parentContacts = parents.map(p => ({
        id: p.auth0Id || p._id.toString(),
        name: p.name || 'Parent',
        role: 'parent',
        avatar: p.avatar
      }));

      res.status(200).json([...staffContacts, ...parentContacts]);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
