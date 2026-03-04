import { seedSchool } from '@/lib/actions/seedActions';
import { createTeacherInvite } from '@/lib/actions/inviteActions';

export const dynamic = 'force-dynamic';

export default async function TestInvitePage() {
  const school = await seedSchool();
  const token = await createTeacherInvite(school._id, 'teacher@example.com');

  const inviteUrl = `/schools/${school.slug}/teacher/invite/${token}`;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Invite Flow Tester</h1>
      <div className="p-4 bg-gray-100 rounded">
        <p className="mb-2"><strong>School:</strong> {school.name}</p>
        <p className="mb-2"><strong>Invite URL:</strong></p>
        <code className="block p-2 bg-white border rounded mb-4">
          {inviteUrl}
        </code>
        <a
          href={inviteUrl}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Test This Link
        </a>
      </div>
    </div>
  );
}
