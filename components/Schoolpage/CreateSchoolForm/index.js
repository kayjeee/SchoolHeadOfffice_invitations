import React, { useState } from 'react';
import { useRouter } from "next/router";
import Step1BasicInfo from './steps/Step1BasicInfo';
import Step2Address from './steps/Step2Address';
import Step3Admins from './steps/Step3Admins';
import Step4Social from './steps/Step4Social';
import LoadingSpinner from '../../spinners/LoadingSpinner';
import { provisionNewSchool } from './services/schoolService';
import { ColorThemeProvider, useColorTheme } from "./context/ThemeContext";

const CreateSchoolFormContent = ({ user }) => {
  const router = useRouter();
  const { primaryColor } = useColorTheme();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    schoolName: '',
    schoolEmail: '',
    phone: '',
    theme: { mode: 'green', value: '#20B486' },
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
      const school = await provisionNewSchool(formData, user);

      console.log('✅ Provisioning complete:', school);
      setSuccess(true);
    } catch (err) {
      console.error('💥 Error during provisioning:', err);
      setError('Failed to create and provision school. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Step1BasicInfo
            schoolName={formData.schoolName}
            schoolEmail={formData.schoolEmail}
            phone={formData.phone}
            theme={formData.theme}
            onFileChange={(file) => updateField('logo', file)}
            onSchoolNameChange={(e) => updateField('schoolName', e.target.value)}
            onSchoolEmailChange={(e) => updateField('schoolEmail', e.target.value)}
            onPhoneChange={(e) => updateField('phone', e.target.value)}
            onThemeChange={(mode, value) =>
              updateField('theme', { mode, value })
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
      <div className="container mx-auto mt-8 p-4 bg-gray-100 border rounded-md">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto mt-8 p-4 bg-gray-100 border rounded-md">
      <h1 
        className="text-2xl font-bold mb-4"
        style={{ color: formData.theme.value }}
      >
        Create a School
      </h1>
      
      {/* Step indicator */}
      <div className="flex items-center justify-center mb-6">
        {[1, 2, 3, 4].map((stepNum) => (
          <React.Fragment key={stepNum}>
            <div
              className="flex items-center justify-center w-8 h-8 rounded-full font-semibold"
              style={{
                backgroundColor: step >= stepNum ? formData.theme.value : '#e5e7eb',
                color: step >= stepNum ? '#ffffff' : '#6b7280',
              }}
            >
              {stepNum}
            </div>
            {stepNum < 4 && (
              <div
                className="w-12 h-1 mx-2"
                style={{
                  backgroundColor: step > stepNum ? formData.theme.value : '#e5e7eb',
                }}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div 
          className="px-4 py-3 rounded mb-4"
          style={{
            backgroundColor: `${formData.theme.value}20`,
            border: `1px solid ${formData.theme.value}`,
            color: formData.theme.value,
          }}
        >
          🎉 School created and you've been set as Admin!
        </div>
      )}
      
      {renderStep()}
    </div>
  );
};

const CreateSchoolForm = ({ user }) => {
  return (
    <ColorThemeProvider>
      <CreateSchoolFormContent user={user} />
    </ColorThemeProvider>
  );
};

export default CreateSchoolForm;