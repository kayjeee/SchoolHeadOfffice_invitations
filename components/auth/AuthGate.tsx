// components/auth/AuthGate.tsx
import React from 'react';

interface AuthGateProps {
  invitationData?: any;
  returnTo: string;
}

export default function AuthGate({ invitationData, returnTo }: AuthGateProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {invitationData ? "You're Invited!" : "Please Log In"}
        </h1>
        <p className="text-gray-600 mb-6">
          {invitationData
            ? `You have been invited to join ${invitationData.school_name}.`
            : 'You need to be logged in to access this page.'}
        </p>
        <a
          href={`/api/auth/login?returnTo=${returnTo}`}
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition font-medium"
        >
          {invitationData ? 'Continue with Invitation' : 'Log In'}
        </a>
      </div>
    </div>
  );
}
