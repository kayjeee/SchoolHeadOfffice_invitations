
import React from 'react';
import FrontPageLayout from '../../../Layouts/FrontPageLayout';

interface OnboardingLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  showNavbar?: boolean;
}

const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({
  children,
  title,
  description,
  showNavbar,
}) => {
  const content = (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {title}
        </h2>
        {description && (
          <p className="mt-2 text-center text-sm text-gray-600 max-w">
            {description}
          </p>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {children}
        </div>
      </div>
    </div>
  );

  if (showNavbar) {
    return (
      <FrontPageLayout>
        {content}
      </FrontPageLayout>
    );
  }

  return content;
};

export default OnboardingLayout;
