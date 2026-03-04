# Teacher Invite Flow

## Purpose
Securely onboard new teachers to a specific school using a time-limited, one-time-use magic link.

## Data Flow
1. **Admin Generation**: Admin creates an invite. The system generates a random token, hashes it, and stores the hash in MongoDB with an expiry of 7 days.
2. **User Visit**: Teacher clicks URL: `/schools/[schoolSlug]/teacher/invite/[token]`.
3. **Validation**:
   - Resolve `schoolSlug` to `schoolId`.
   - Hash the provided `token` and search the `invites` collection for a match with `schoolId` and `status: 'pending'`.
   - Check `expiresAt`.
4. **Onboarding**: If valid, the teacher is presented with the registration/onboarding form.
5. **Completion**: Upon form submission, the `invites` record status becomes 'accepted', and a `teachers` record is created.

## Security
- **Hashing**: Tokens are never stored in plain text. We use SHA-256.
- **Expiry**: Tokens automatically expire after 7 days.
- **One-time Use**: Status changes to 'accepted' immediately after use.

## Logging
- `[INVITE_GENERATION]`: Admin ID, School ID.
- `[INVITE_VALIDATION]`: School Slug, Token Status (valid/invalid/expired).
- `[INVITE_ACCEPTED]`: Teacher ID, School ID.

## AI Extension Hooks
- **Onboarding Personalization**: AI can suggest classroom setup templates based on the teacher's profile or school type.
