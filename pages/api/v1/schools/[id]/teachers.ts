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
      const teachers = await db.collection('teachers')
        .find({})
        .limit(20)
        .toArray();

      res.status(200).json(teachers.map(t => ({
        id: t.auth0Id || t._id.toString(),
        name: t.name || 'Unknown Staff',
        role: t.role || 'teacher'
      })));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
