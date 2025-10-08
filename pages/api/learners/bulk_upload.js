import clientPromise from '../../../lib/mongodb';

export default async function handler(req, res) {
  console.log('=== BULK UPLOAD API CALL STARTED ===');
  console.log('Request method:', req.method);
  
  if (req.method !== 'POST') {
    console.log('Method not allowed:', req.method);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('Request body received');
    const { learners, userAuth0Id, schoolId } = req.body;

    // Log the incoming payload
    console.log('userAuth0Id:', userAuth0Id);
    console.log('schoolId:', schoolId);
    console.log('Number of learners:', learners ? learners.length : 0);
    
    if (learners && learners.length > 0) {
      console.log('First learner sample:', learners[0]);
    }

    // Validation
    if (!Array.isArray(learners) || learners.length === 0) {
      console.error('Validation failed: Empty or invalid learners array');
      return res.status(400).json({ 
        message: 'Invalid learners data. Expected non-empty array.' 
      });
    }

    if (!userAuth0Id || !schoolId) {
      console.error('Validation failed: Missing required fields');
      console.error('userAuth0Id provided:', !!userAuth0Id);
      console.error('schoolId provided:', !!schoolId);
      return res.status(400).json({ 
        message: 'Missing required fields: userAuth0Id or schoolId' 
      });
    }

    console.log('Connecting to MongoDB...');
    const client = await clientPromise;
    const db = client.db('tracker');
    console.log('Connected to database');

    // Add metadata to learners
    const validatedLearners = learners.map(learner => ({
      ...learner,
      school_id: schoolId,
      created_at: new Date(),
      updated_at: new Date(),
      status: 'active'
    }));

    console.log('Processed learners with metadata');
    console.log('First validated learner:', validatedLearners[0]);

    const session = client.startSession();
    console.log('MongoDB session started');
    
    try {
      console.log('Starting transaction...');
      await session.withTransaction(async () => {
        console.log('Transaction started');
        
        // 1. Insert learners into collection
        console.log('Inserting learners into collection...');
        const insertResult = await db.collection('learners').insertMany(
          validatedLearners,
          { session }
        );
        console.log('Learners inserted successfully:', insertResult.insertedCount, 'documents');

        // 2. Update user's onboarding status
        console.log('Updating user onboarding status for auth0_id:', userAuth0Id);
        
        // First, check if user exists
        const userCheck = await db.collection('users').findOne(
          { auth0_id: userAuth0Id },
          { session, projection: { auth0_id: 1, email: 1 } }
        );
        console.log('User check result:', userCheck ? 'Found' : 'Not found');
        
        if (userCheck) {
          console.log('User details - auth0_id:', userCheck.auth0_id, 'email:', userCheck.email);
        }

        const updateResult = await db.collection('users').updateOne(
          { auth0_id: userAuth0Id },
          {
            $set: {
              "onboarding_status.upload_learners": true,
              "onboarding_status.client_metadata.upload_learners_metadata.updated_at": new Date(),
              "onboarding_status.client_metadata.upload_learners_metadata.learner_count": insertResult.insertedCount,
              "updated_at": new Date()
            },
            $addToSet: {
              "onboarding_status.completed_steps": "upload_learners"
            },
            $inc: {
              "onboarding_status.completion_percentage": 25
            }
          },
          { session }
        );

        console.log('Update operation result:', {
          matchedCount: updateResult.matchedCount,
          modifiedCount: updateResult.modifiedCount,
          upsertedCount: updateResult.upsertedCount
        });

        if (updateResult.matchedCount === 0) {
          console.error('User not found with auth0_id:', userAuth0Id);
          
          // Check what users actually exist for debugging
          const allUsers = await db.collection('users').find(
            {}, 
            { projection: { auth0_id: 1, email: 1 } }
          ).limit(5).toArray();
          console.log('Sample of existing users:', allUsers);
          
          throw new Error(`User not found with auth0_id: ${userAuth0Id}`);
        }

        console.log('User onboarding status updated successfully');
        return { insertResult, updateResult };
      });

      console.log('Transaction completed successfully');
      
      const response = {
        success: true,
        message: `Successfully uploaded ${validatedLearners.length} learners and updated onboarding status`,
        data: {
          learnersInserted: validatedLearners.length,
          schoolId,
          timestamp: new Date().toISOString()
        }
      };
      
      console.log('Sending success response:', response);
      return res.status(200).json(response);

    } finally {
      await session.endSession();
      console.log('MongoDB session ended');
    }

  } catch (error) {
    console.error('=== BULK UPLOAD ERROR ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error code:', error.code);
    console.error('Error name:', error.name);

    if (error.code === 11000) {
      console.error('Duplicate key error detected');
      return res.status(409).json({
        success: false,
        message: 'Duplicate learner data detected',
        error: error.message
      });
    }

    console.error('Generic server error');
    return res.status(500).json({
      success: false,
      message: 'Server error during bulk upload',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  } finally {
    console.log('=== BULK UPLOAD API CALL COMPLETED ===');
  }
}