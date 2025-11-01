// components/parent/Onboarding/steps/IdentityVerification.tsx
import React, { useState } from 'react';

interface IdentityVerificationProps {
  onComplete: (data: any) => void;
}

export default function IdentityVerification({ onComplete }: IdentityVerificationProps) {
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerification = () => {
    setIsVerifying(true);
    // Simulate a verification process
    setTimeout(() => {
      onComplete({ verified: true });
      setIsVerifying(false);
    }, 2000);
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md text-center">
      <h3 className="text-xl font-bold mb-4">Identity Verification</h3>
      <p className="text-gray-600 mb-6">
        To ensure the security of our platform, we need to verify your identity.
      </p>
      <button
        onClick={handleVerification}
        disabled={isVerifying}
        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
      >
        {isVerifying ? 'Verifying...' : 'Start Verification'}
      </button>
    </div>
  );
}
