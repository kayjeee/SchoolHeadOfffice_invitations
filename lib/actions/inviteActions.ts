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

export async function validateInvite(schoolSlug: string, token: string) {
  const client = await clientPromise;
  const db = client.db();

  // 1. Find school by slug
  const school = await db.collection('schools').findOne({ slug: schoolSlug });

  if (!school) {
    console.log('[INVITE_VALIDATION]', { schoolSlug, tokenStatus: 'SCHOOL_NOT_FOUND' });
    return { valid: false, error: 'School not found' };
  }

  const tokenHash = hashToken(token);

  // 2. Find invite
  const invite = await db.collection('invites').findOne({
    schoolId: school._id.toString(),
    tokenHash,
    status: 'pending'
  });

  if (!invite) {
    console.log('[INVITE_VALIDATION]', { schoolSlug, tokenStatus: 'INVALID_TOKEN' });
    return { valid: false, error: 'Invalid or used token' };
  }

  // 3. Check expiry
  if (new Date() > new Date(invite.expiresAt)) {
    console.log('[INVITE_VALIDATION]', { schoolSlug, tokenStatus: 'EXPIRED' });
    await db.collection('invites').updateOne(
      { _id: invite._id },
      { $set: { status: 'expired' } }
    );
    return { valid: false, error: 'Token expired' };
  }

  console.log('[INVITE_VALIDATION]', { schoolSlug, tokenStatus: 'VALID' });

  return {
    valid: true,
    invite: JSON.parse(JSON.stringify(invite)),
    school: JSON.parse(JSON.stringify(school))
  };
}
