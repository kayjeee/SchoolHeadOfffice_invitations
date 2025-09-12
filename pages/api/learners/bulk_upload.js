import clientPromise from '../../../lib/mongodb'; // your MongoDB connection helper

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { data } = req.body; // Array of learners
    if (!Array.isArray(data) || data.length === 0) {
      return res.status(400).json({ message: 'No learners provided.' });
    }

    const client = await clientPromise;
    const db = client.db('schoolDB'); // replace with your DB name

    // Extract schoolId and userAuth0Id from first learner
    const schoolId = data[0].school_id;
    const userAuth0Id = data[0].userAuth0Id; // make sure this is passed from frontend

    if (!schoolId || !userAuth0Id) {
      return res.status(400).json({ message: 'Missing schoolId or userAuth0Id.' });
    }

    // 1️⃣ Insert learners
    const insertResult = await db.collection('learners').insertMany(data);

    // 2️⃣ Update user's onboarding_status safely
    const updateResult = await db.collection('users').updateOne(
      { auth0_id: userAuth0Id },
      {
        $set: { 
          'onboarding_status.upload_learners': true,
        },
        $addToSet: { 
          'onboarding_status.completed_steps': 'upload_learners', // avoids duplicates
        },
        $currentDate: {
          'onboarding_status.client_metadata.upload_learners_metadata.updated_at': true
        },
      }
    );

    return res.status(200).json({
      inserted: insertResult.insertedCount,
      message: 'Learners uploaded and onboarding updated.',
      updateResult,
    });

  } catch (error) {
    console.error('Bulk upload error:', error);
    return res.status(500).json({ message: 'Server error during bulk upload.', error: error.message });
  }
}
