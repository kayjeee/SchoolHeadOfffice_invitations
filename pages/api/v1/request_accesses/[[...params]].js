import clientPromise from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  const client = await clientPromise;
  if (!client) {
    return res.status(500).json({ error: "Database client connection error" });
  }
  const db = client.db('tracker');
  const collection = db.collection('request_accesses');

  const { params } = req.query;
  const method = req.method;

  // GET /api/v1/request_accesses/school/:schoolId -> Fetch and seed if empty
  if (params && params[0] === 'school') {
    const schoolId = params[1];
    if (method === 'GET') {
      const requests = await collection.find({ school_id: schoolId }).sort({ created_at: -1 }).toArray();

      if (requests.length === 0) {
        // High fidelity seeding matching the user inputs
        const seedRequests = [
          {
            parent_name: 'Mrs Manana',
            parent_email: '700400585@gdeschools.gov.za',
            learner_name: 'KAMO Sebogodi',
            status: 'pending',
            school_id: schoolId,
            created_at: new Date(Date.now() - 3600000 * 3).toISOString()
          },
          {
            parent_name: 'Mr Sello',
            parent_email: 'mrsello@gmail.com',
            learner_name: 'kagiso sebogodi',
            status: 'pending',
            school_id: schoolId,
            created_at: new Date(Date.now() - 3600000 * 20).toISOString()
          }
        ];

        const inserted = [];
        for (const r of seedRequests) {
          const resInsert = await collection.insertOne(r);
          inserted.push({
            id: resInsert.insertedId.toString(),
            ...r,
            _id: resInsert.insertedId.toString()
          });
        }
        return res.status(200).json({ success: true, request_accesses: inserted });
      }

      const formatted = requests.map(r => ({
        id: r._id.toString(),
        ...r,
        _id: r._id.toString()
      }));
      return res.status(200).json({ success: true, request_accesses: formatted });
    }
  }

  // POST actions: approve and reject
  if (method === 'POST') {
    if (params && params[0] === 'approve') {
      const { id } = req.body;
      let objectId;
      try { objectId = new ObjectId(id); } catch (e) { objectId = id; }

      await collection.updateOne(
        typeof objectId === 'string' ? { id: objectId } : { _id: objectId },
        { $set: { status: 'approved', updated_at: new Date().toISOString() } }
      );
      return res.status(200).json({ success: true, message: "Request approved" });
    }

    if (params && params[0] === 'reject') {
      const { id } = req.body;
      let objectId;
      try { objectId = new ObjectId(id); } catch (e) { objectId = id; }

      await collection.updateOne(
        typeof objectId === 'string' ? { id: objectId } : { _id: objectId },
        { $set: { status: 'rejected', updated_at: new Date().toISOString() } }
      );
      return res.status(200).json({ success: true, message: "Request rejected" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
