import React, { useState } from 'react';
import { useRouter } from "next/router";
import Step1BasicInfo from './steps/Step1BasicInfo';
import Step2Address from './steps/Step2Address';
import Step3Admins from './steps/Step3Admins';
import Step4Social from './steps/Step4Social';
import LoadingSpinner from '../../spinners/LoadingSpinner';
import { provisionNewSchool } from './services/schoolService';

const CreateSchoolForm = ({ user }) => {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    schoolName: '',
    schoolEmail: '',
    phone: '',
    theme: { mode: 'white', value: '#b8ebdbff' }, 
    logo: null,
    addressLine1: '',
    addressLine2: '',
    country: '',
    province: '',
    city: '',
    postalCode: '',
    location: null,
    adminUsers: [],
    website: '',
    facebook: '',
    tiktok: '',
    linkedin: '',
    status: 'active',
  });

  const updateField = (key, value) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const handleNextStep = () => setStep((prev) => prev + 1);
  const handlePreviousStep = () => setStep((prev) => prev - 1);

  const handleFormSubmission = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      console.log('📤 Submitting full school provisioning flow:', formData);
      console.log('🎨 Theme being sent to backend:', formData.theme);
      
      const school = await provisionNewSchool(formData, user);

      console.log('✅ Provisioning complete:', school);
      setSuccess(true);
    } catch (err) {
      console.error('💥 Error during provisioning:', err);
      setError('Failed to create and provision school. Please try again.');
    } finally {
      router.reload();
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Step1BasicInfo
            schoolName={formData.schoolName}
            schoolEmail={formData.schoolEmail}
            phoneNumber={formData.phone}
            theme={formData.theme}
            onFileChange={(file) => updateField('logo', file)}
            onSchoolNameChange={(e) => updateField('schoolName', e.target.value)}
            onSchoolEmailChange={(e) => updateField('schoolEmail', e.target.value)}
            onPhoneNumberChange={(e) => updateField('phone', e.target.value)}
            onThemeChange={(mode, value) =>
              setFormData((prev) => ({
                ...prev,
                theme: { mode, value },
              }))
            }
            onNext={handleNextStep}
          />
        );
      case 2:
        return (
          <Step2Address
            formData={formData}
            onLine1Change={(e) => updateField('addressLine1', e.target.value)}
            onLine2Change={(e) => updateField('addressLine2', e.target.value)}
            onCountryChange={(e) => updateField('country', e.target.value)}
            onProvinceChange={(e) => updateField('province', e.target.value)}
            onCityChange={(e) => updateField('city', e.target.value)}
            onPostalCodeChange={(e) => updateField('postalCode', e.target.value)}
            onMapClick={(coords) => updateField('location', coords)}
            onNext={handleNextStep}
            onPrevious={handlePreviousStep}
          />
        );
      case 3:
        return (
          <Step3Admins
            adminUsers={formData.adminUsers}
            onAdminUsersChange={(admins) => updateField('adminUsers', admins)}
            onNext={handleNextStep}
            onPrevious={handlePreviousStep}
          />
        );
      case 4:
        return (
          <Step4Social
            formData={formData}
            onWebsiteChange={(e) => updateField('website', e.target.value)}
            onFacebookChange={(e) => updateField('facebook', e.target.value)}
            onTikTokChange={(e) => updateField('tiktok', e.target.value)}
            onLinkedInChange={(e) => updateField('linkedin', e.target.value)}
            onPrevious={handlePreviousStep}
            onSubmit={handleFormSubmission}
          />
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="text-white text-lg mt-4 font-light">Creating your school platform...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Professional Header */}
      <div className="bg-gradient-to-b from-black via-gray-900 to-black border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Create Your School
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto font-light">
              Build your professional educational platform with our comprehensive setup wizard
            </p>
            
            {/* Progress Steps */}
            <div className="mt-8 flex justify-center">
              <div className="flex items-center space-x-8">
                {[1, 2, 3, 4].map((stepNumber) => (
                  <div key={stepNumber} className="flex items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all duration-300 ${
                        step === stepNumber
                          ? 'bg-white text-black border-white'
                          : step > stepNumber
                          ? 'bg-green-500 text-white border-green-500'
                          : 'bg-gray-800 text-gray-400 border-gray-600'
                      }`}
                    >
                      {step > stepNumber ? '✓' : stepNumber}
                    </div>
                    {stepNumber < 4 && (
                      <div
                        className={`w-16 h-0.5 transition-all duration-300 ${
                          step > stepNumber ? 'bg-green-500' : 'bg-gray-700'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Step Labels */}
            <div className="mt-4 flex justify-center space-x-16 text-sm">
              <div className={`text-center ${step >= 1 ? 'text-white' : 'text-gray-500'}`}>
                <div className="font-medium">Basic Info</div>
              </div>
              <div className={`text-center ${step >= 2 ? 'text-white' : 'text-gray-500'}`}>
                <div className="font-medium">Address</div>
              </div>
              <div className={`text-center ${step >= 3 ? 'text-white' : 'text-gray-500'}`}>
                <div className="font-medium">Team</div>
              </div>
              <div className={`text-center ${step >= 4 ? 'text-white' : 'text-gray-500'}`}>
                <div className="font-medium">Review</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-200">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-900/50 border border-green-700 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-200">
                  🎉 School created successfully! You've been set as the primary administrator.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Current Step */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl overflow-hidden">
          {renderStep()}
        </div>

        {/* Quick Navigation for Debugging */}
        <div className="mt-6 flex justify-center space-x-4">
          <button
            onClick={handlePreviousStep}
            disabled={step === 1}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
              step === 1
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                : 'bg-gray-700 text-white hover:bg-gray-600'
            }`}
          >
            ← Previous
          </button>
          <button
            onClick={handleNextStep}
            disabled={step === 4}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
              step === 4
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                : 'bg-gray-700 text-white hover:bg-gray-600'
            }`}
          >
            Next →
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-black border-t border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-500 text-sm">
            School Management Platform • Professional Edition
          </p>
          <p className="text-gray-600 text-xs mt-2">
            Secure • Scalable • Professional
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreateSchoolForm;