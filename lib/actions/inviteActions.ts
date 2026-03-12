'use server';

import clientPromise from '@/lib/mongodb';
import { hashToken, generateToken } from '@/lib/utils/token';
import { createAuditLog } from '@/lib/utils/auditLogger';
import { InviteSchema } from '@/lib/models/schemas';

export async function createTeacherInvite(schoolId: string, email: string) {
  const client = await clientPromise;
  const db = client.db();

  const token = generateToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const inviteData = {
    schoolId,
    email,
    role: 'teacher',
    tokenHash,
    expiresAt,
    status: 'pending',
    createdAt: new Date(),
  };

  const validatedInvite = InviteSchema.parse(inviteData);

  await db.collection('invites').insertOne(validatedInvite);

  await createAuditLog({
    schoolId,
    action: 'INVITE_GENERATION',
    metadata: { email, expiresAt },
  });

  console.log('[INVITE_GENERATION]', { schoolId, email, expiresAt });

  return token; // In a real app, you'd email this or return the full link
}

import { SchoolAPI } from '@/lib/api/school-api';
import { InvitationAPI } from '@/lib/api/invitation-api';

export async function validateInvite(schoolSlug: string, token: string) {
  console.log(`🔍 [INVITE_VALIDATION] Validating token for school: ${schoolSlug}`);

  try {
    const client = await clientPromise;
    const db = client.db();

    // 1. First, try finding school in MongoDB
    let school = await db.collection('schools').findOne({ slug: schoolSlug });

    // 2. If not in MongoDB, try backend API
    if (!school) {
      console.log(`ℹ️ [INVITE_VALIDATION] School ${schoolSlug} not found in MongoDB, checking API...`);
      const decodedName = decodeURIComponent(schoolSlug.replace(/-/g, ' '));
      const apiResponse = await SchoolAPI.getSchools({ search: decodedName, limit: 1 });
      const apiSchool = apiResponse.schools.find(s =>
        s.schoolName.toLowerCase() === decodedName.toLowerCase() ||
        s.id === schoolSlug // some slugs might be IDs
      ) || apiResponse.schools[0];

      if (apiSchool) {
        school = {
          _id: apiSchool.id,
          name: apiSchool.schoolName,
          slug: schoolSlug,
        } as any;
      }
    }

    if (!school) {
      console.log('[INVITE_VALIDATION]', { schoolSlug, tokenStatus: 'SCHOOL_NOT_FOUND' });
      return { valid: false, error: 'School not found' };
    }

    const tokenHash = hashToken(token);

    // 3. Try finding invite in MongoDB
    let invite = await db.collection('invites').findOne({
      schoolId: school._id.toString(),
      tokenHash,
      status: 'pending'
    });

    // 4. If not in MongoDB, try verifying with backend API
    if (!invite) {
      console.log(`ℹ️ [INVITE_VALIDATION] Invite not found in MongoDB, checking backend API...`);
      try {
        const apiInvite = await InvitationAPI.verifyTeacherInvite(token);

        // If we got here, token is valid on backend
        // Check if it's for the correct school
        const apiSchoolSlug = apiInvite.school_slug || (apiInvite.school_name ? apiInvite.school_name.toLowerCase().replace(/ /g, '-') : null);

        if (apiSchoolSlug && apiSchoolSlug !== schoolSlug) {
           console.warn(`⚠️ [INVITE_VALIDATION] Token school slug mismatch: expected ${schoolSlug}, got ${apiSchoolSlug}`);
        }

        invite = {
          _id: apiInvite.id || `api_${token.substring(0, 8)}`,
          schoolId: apiInvite.school_id || school._id.toString(),
          email: apiInvite.recipient_phone_number || apiInvite.email || 'teacher@school', // Fallback for UI
          role: 'teacher',
          status: 'pending',
          expiresAt: apiInvite.expires_at || apiInvite.expired_at || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        } as any;

        // Ensure we have a valid invitation object
        if (!invite._id) {
           console.error(`❌ [INVITE_VALIDATION] API returned success but invitation data is incomplete`, apiInvite);
           invite = null;
        }
      } catch (apiError) {
        console.error(`❌ [INVITE_VALIDATION] Backend API verification failed:`, apiError);
      }
    }

    if (!invite) {
      console.log('[INVITE_VALIDATION]', { schoolSlug, tokenStatus: 'INVALID_TOKEN' });
      return { valid: false, error: 'Invalid or used token' };
    }

    // 5. Check expiry
    const expiryDate = new Date(invite.expiresAt);
    if (new Date() > expiryDate) {
      console.log('[INVITE_VALIDATION]', { schoolSlug, tokenStatus: 'EXPIRED' });

      // Only attempt update if it's a MongoDB record (has a real ObjectId or string ID that exists in 'invites' collection)
      if (typeof invite._id !== 'string' || invite._id.length === 24) {
         try {
           await db.collection('invites').updateOne(
             { _id: invite._id },
             { $set: { status: 'expired' } }
           );
         } catch (e) {}
      }

      return { valid: false, error: 'Token expired' };
    }

    console.log('[INVITE_VALIDATION]', { schoolSlug, tokenStatus: 'VALID' });

    return {
      valid: true,
      invite: JSON.parse(JSON.stringify(invite)),
      school: JSON.parse(JSON.stringify(school))
    };
  } catch (error: any) {
    console.error('❌ [INVITE_VALIDATION] Error during validation:', error);
    return { valid: false, error: 'An error occurred during validation' };
  }
}
