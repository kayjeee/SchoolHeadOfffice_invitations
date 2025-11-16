// components/auth/AuthGate.tsx

import React, { useMemo } from "react";

interface InvitationData {
  token?: string;
  school_name?: string;
  learner_name?: string;
}

interface AuthGateProps {
  invitationData?: InvitationData | null;
  returnTo?: string; // default: "/parent"
}

export default function AuthGate({
  invitationData,
  returnTo = "/parent",
}: AuthGateProps) {
  
  const hasInvitation = Boolean(invitationData?.token);

  /**
   * Build a safe returnTo URL that ALWAYS keeps the token.
   */
  const safeReturnTo = useMemo(() => {
    if (hasInvitation) {
      const url = `${returnTo}?token=${invitationData!.token}`;
      return encodeURIComponent(url);
    }
    return encodeURIComponent(returnTo);
  }, [invitationData, returnTo, hasInvitation]);

  const loginUrl = `/api/auth/login?returnTo=${safeReturnTo}`;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center border border-gray-100">

        {/* TITLE */}
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          {hasInvitation ? "You're Invited!" : "Welcome"}
        </h1>

        {/* SUBTITLE */}
        <p className="text-gray-600 mb-6 leading-relaxed">
          {hasInvitation ? (
            <>
              You’ve been invited to join <br />
              <span className="font-semibold text-gray-900 text-lg">
                {invitationData?.school_name}
              </span>

              {invitationData?.learner_name && (
                <span>
                  <br />
                  This invitation is for{" "}
                  <span className="font-semibold text-gray-900">
                    {invitationData.learner_name}
                  </span>
                  .
                </span>
              )}
            </>
          ) : (
            <>Log in to access your Parent Portal.</>
          )}
        </p>

        {/* CTA BUTTON */}
        <a
          href={loginUrl}
          className="w-full inline-flex items-center justify-center py-3 px-6
            bg-blue-600 hover:bg-blue-700 active:bg-blue-800
            text-white text-base font-semibold rounded-lg shadow-sm
            transition-all duration-150"
        >
          {hasInvitation ? "Accept & Continue" : "Log In"}
        </a>

        {/* Footer note */}
        {hasInvitation && (
          <p className="text-sm text-gray-500 mt-4">
            You will be asked to log in or create an account.
          </p>
        )}
      </div>
    </div>
  );
}
