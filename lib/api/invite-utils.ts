import { InvitationAPI } from '@/lib/api/invitation-api';

export async function validateInviteClient(schoolSlug: string, token: string) {
  console.log(`🔍 [INVITE_VALIDATION_CLIENT] Validating token: ${token}`);

  try {
    const apiInvite = await InvitationAPI.verifyTeacherInvite(token);

    return {
      valid: true,
      invite: {
        _id: apiInvite.id,
        email: apiInvite.email || apiInvite.recipient_phone_number,
        status: apiInvite.status,
        expiresAt: apiInvite.expires_at || apiInvite.expired_at,
        teacherName: apiInvite.teacher_name,
      },
      school: {
        name: apiInvite.school_name || schoolSlug,
      }
    };
  } catch (error) {
    console.error('❌ [INVITE_VALIDATION_CLIENT] Failed:', error);
    return { valid: false, error: 'Invalid invitation' };
  }
}
