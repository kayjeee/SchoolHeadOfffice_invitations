import React, { useState, useEffect } from 'react';
import AdminSearchPage from '../../components/adminPage/AdminSearchPage';
import FrontPageLayout from '../../components/Layouts/FrontPageLayout';
import FrontPageLayoutMobileView from '../../components/Layouts/FrontPageLayoutMobile/FrontPageLayoutMobileView';
import { useUser } from '@auth0/nextjs-auth0/client';
import SettingsLayout from '../../components/adminPage/SettingsLayout';
import LoadingSpinner from '../../components/spinners/LoadingSpinner';
import CreateSchoolForm from '../../components/Schoolpage/CreateSchoolForm/index';
import ValidateSchoolStep from '../../components/Schoolpage/ValidateSchoolStep';
import ReviewSchoolStep from '../../components/Schoolpage/ReviewSchoolStep';

export default function Home() {
  const [isMobile, setIsMobile] = useState(false);
  const [schools, setSchools] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [step, setStep] = useState(1);
  const { user } = useUser();
  const [userRoles, setUserRoles] = useState([]);

  // Track window resize for responsive layout
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // When user is available, fetch schools and roles
  useEffect(() => {
    if (user) {
      fetchSchools();
      fetchAndSetUserRoles();
    }
  }, [user]);

  // Auth0 access token fetcher
  const fetchAccessToken = async () => {
    try {
      const response = await fetch('/api/getAccessToken', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to fetch access token');
      const { accessToken } = await response.json();
      return accessToken;
    } catch (error) {
      console.error('Error fetching access token:', error.message);
      throw error;
    }
  };

  // Fetch roles from Auth0
  const fetchUserRoles = async (accessToken, userId) => {
    try {
      const rolesUrl = `https://dev-t0o26rre86m7t8lo.us.auth0.com/api/v2/users/${encodeURIComponent(
        userId
      )}/roles`;

      const response = await fetch(rolesUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch user roles');

      const rolesData = await response.json();
      return rolesData.map((role) => role.name);
    } catch (error) {
      console.error('Error fetching user roles:', error.message);
      return [];
    }
  };

  // Get and set roles
  const fetchAndSetUserRoles = async () => {
    try {
      const accessToken = await fetchAccessToken();
      const roles = await fetchUserRoles(accessToken, user.sub);
      setUserRoles(roles);
    } catch (error) {
      console.error('Error setting user roles:', error.message);
    }
  };

  // Fetch schools for the current user
  const fetchSchools = async () => {
    if (!user?.sub) return;

    setIsLoading(true);
    setMessage('');
    try {
      const userId = encodeURIComponent(user.sub);

      const response = await fetch(
        `http://localhost:4000/api/v1/users/${userId}/schools`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (response.status === 404) {
        setSchools([]);
        setMessage('You have not created any school yet. Please create a new school.');
        return;
      }

      const data = await response.json();

      // ✅ Adjust here depending on backend shape
      if (response.ok && data.success) {
        // If backend sends { success: true, data: { schools: [...] } }
        setSchools(data.data?.schools || []);
      } else if (Array.isArray(data)) {
        // If backend sends just an array of schools
        setSchools(data);
      } else {
        setMessage(data.message || 'Error fetching schools.');
      }
    } catch (error) {
      console.error('Fetch schools error:', error);
      setMessage('Failed to fetch schools. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step navigation
  const handleNextStep = () => {
    setStep((prevStep) => (prevStep < 4 ? prevStep + 1 : prevStep));
  };

  const handlePreviousStep = () => {
    setStep((prevStep) => (prevStep > 1 ? prevStep - 1 : prevStep));
  };

  // Stepper UI
  const renderStepper = () => (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="w-full md:w-1/4">
        <div className="space-y-4">
          {['Search', 'Create', 'Validate', 'Complete'].map((title, index) => (
            <div
              key={title}
              className={`p-4 border rounded-lg flex items-center space-x-2 ${
                step === index + 1 ? 'bg-blue-100 border-blue-500' : 'bg-white'
              }`}
            >
              <div
                className={`w-8 h-8 flex items-center justify-center rounded-full text-white ${
                  step === index + 1 ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              >
                {index + 1}
              </div>
              <div>
                <h3 className="font-medium text-lg">{title}</h3>
                <p className="text-sm text-gray-500">
                  {index === 0 && 'Search for a school'}
                  {index === 1 && 'Enter school details'}
                  {index === 2 && 'Validate school information'}
                  {index === 3 && 'Review and finish'}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-4">
          <button
            className="px-4 py-2 border rounded-md text-gray-600 disabled:opacity-50"
            disabled={step === 1}
            onClick={handlePreviousStep}
          >
            Back
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:opacity-50"
            disabled={step === 4}
            onClick={handleNextStep}
          >
            Next
          </button>
        </div>
      </div>
      <div className="w-full md:w-3/4">{renderStepContent()}</div>
    </div>
  );

  // Step content
  const renderStepContent = () => {
    if (step === 1) return <AdminSearchPage user={user} />;
    if (step === 2) return <CreateSchoolForm user={user} onComplete={fetchSchools} />;
    if (step === 3) return <ValidateSchoolStep />;
    if (step === 4) return <ReviewSchoolStep />;
    return null;
  };

  // Main content
  const renderContent = () => {
    if (isLoading) return <LoadingSpinner />;
    if (message && schools.length === 0) {
      return renderStepper();
    }
    if (schools.length === 0) {
      return <AdminSearchPage user={user} />;
    }
    return <SettingsLayout schools={schools} user={user} />;
  };

  return isMobile ? (
    <FrontPageLayoutMobileView user={user} schools={schools} userRoles={userRoles}>
      {renderContent()}
    </FrontPageLayoutMobileView>
  ) : (
    <FrontPageLayout user={user} schools={schools} userRoles={userRoles}>
      {renderContent()}
    </FrontPageLayout>
  );
}
