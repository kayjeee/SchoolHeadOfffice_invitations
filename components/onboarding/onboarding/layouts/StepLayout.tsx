
import React from 'react';

interface StepLayoutProps {
  children: React.ReactNode;
  stepTitle: string;
  stepDescription?: string;
}

const StepLayout: React.FC<StepLayoutProps> = ({ children, stepTitle, stepDescription }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-gray-900">{stepTitle}</h3>
        {stepDescription && (
          <p className="mt-1 text-sm text-gray-600">{stepDescription}</p>
        )}
      </div>
      {children}
    </div>
  );
};

export default StepLayout;


