import React, { useState } from 'react';
import Step1BasicInfo from './steps/Step1BasicInfo';
import Step2Address from './steps/Step2Address';
import Step3Admins from './steps/Step3Admins';
import Step4Social from './steps/Step4Social';
import LoadingSpinner from '../../spinners/LoadingSpinner';
import { createSchool, uploadFileToCloudinary } from './services/schoolService';

const CreateSchoolForm = ({ user }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
    status: 'active',   // 👈 added here
  });

  const updateField = (key, value) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const handleNextStep = () => setStep((prev) => prev + 1);
  const handlePreviousStep = () => setStep((prev) => prev - 1);

  
const handleFormSubmission = async () => {
  try {
    setLoading(true);
    setError(null);

    console.log('📤 Submitting school data:', formData);

    // Upload logo to Cloudinary if exists
    let logoUrl = '';
    if (formData.logo) {
      logoUrl = await uploadFileToCloudinary(formData.logo);
    }

    const schoolPayload = {
      ...formData,
      logo: logoUrl || formData.logo,
       status: formData.status || 'active',  // 👈 ensure backend always gets a value
    };

    // 🔥 Actually call backend
    const schoolData = await createSchool(schoolPayload);

    console.log('✅ Backend school creation response:', schoolData);
    alert('School created successfully!');
  } catch (err) {
    console.error('💥 Error during form submission:', err);
    setError('Failed to create school. Please try again.');
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
      <h1 className="text-2xl font-bold mb-4">Create a School</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {renderStep()}
    </div>
  );
};

export default CreateSchoolForm;
