'use client';

interface AcceptInviteButtonProps {
  schoolId: string;
  email: string;
}

export default function AcceptInviteButton({ schoolId, email }: AcceptInviteButtonProps) {
  const handleAccept = () => {
    console.log("[ONBOARDING_START]", { schoolId, email });
    alert("Proceeding to account setup...");
    // Future: redirect to Auth0 or next onboarding step
  };

  return (
    <button
      className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition shadow-md"
      onClick={handleAccept}
    >
      Accept Invite & Create Account
    </button>
  );
}
