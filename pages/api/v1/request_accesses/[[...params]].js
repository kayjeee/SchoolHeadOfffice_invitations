import clientPromise from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  const client = await clientPromise;
  if (!client) {
    return res.status(500).json({ error: "Database client connection error" });
  }
  const db = client.db('tracker');
  const collection = db.collection('request_accesses');
  const learnersCollection = db.collection('learners');

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

      const request = await collection.findOne(typeof objectId === 'string' ? { id: objectId } : { _id: objectId });
      if (!request) {
        return res.status(404).json({ error: "Request not found" });
      }

      // Mark access request approved
      await collection.updateOne(
        typeof objectId === 'string' ? { id: objectId } : { _id: objectId },
        { $set: { status: 'approved', updated_at: new Date().toISOString() } }
      );

      // Perform real linking & auto-learner creation if not present in the DB
      const learnerName = request.learner_name || 'Unnamed Learner';
      const cleanName = learnerName.trim();

      // Look up existing learner matching name case-insensitively
      const existingLearner = await learnersCollection.findOne({
        school_id: request.school_id,
        $or: [
          { name: { $regex: new RegExp(`^${cleanName}$`, 'i') } },
          { fullName: { $regex: new RegExp(`^${cleanName}$`, 'i') } },
          { full_name: { $regex: new RegExp(`^${cleanName}$`, 'i') } },
          { first_name: { $regex: new RegExp(`^${cleanName.split(' ')[0]}$`, 'i') } }
        ]
      });

      if (existingLearner) {
        // Link parent info and activate existing learner
        await learnersCollection.updateOne(
          { _id: existingLearner._id },
          {
            $set: {
              status: 'active',
              parent_name: request.parent_name,
              parent_email: request.parent_email,
              updated_at: new Date()
            }
          }
        );
        console.log(`✅ Linked existing learner: ${existingLearner.name}`);
      } else {
        // Create a new learner document automatically in the 'learners' collection!
        const parts = cleanName.split(' ');
        const firstName = parts[0] || '';
        const lastName = parts.slice(1).join(' ') || '';

        // Fetch first grade in database to auto-assign a real grade context if possible
        const gradesCollection = db.collection('grades');
        const firstGrade = await gradesCollection.findOne({ school_id: request.school_id });
        const gradeId = firstGrade ? firstGrade._id.toString() : 'all';

        const newLearner = {
          school_id: request.school_id,
          name: cleanName,
          fullName: cleanName,
          full_name: cleanName,
          first_name: firstName,
          last_name: lastName,
          admission_number: `ADM-${Math.floor(Math.random() * 899999) + 100000}`,
          grade_id: gradeId,
          gradeId: gradeId,
          class_id: '',
          classId: '',
          status: 'Linked',
          status_text: 'Linked',
          parent_name: request.parent_name,
          parent_email: request.parent_email,
          parent_phone: '---',
          created_at: new Date(),
          updated_at: new Date(),
        };

        await learnersCollection.insertOne(newLearner);
        console.log(`✅ Automatically created new learner: ${newLearner.name}`);
      }

      return res.status(200).json({ success: true, message: "Request approved and learner record linked/created" });
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
