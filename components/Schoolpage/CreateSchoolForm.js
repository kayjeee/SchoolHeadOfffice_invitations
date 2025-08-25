//Components/Schoolpage/CreateSchoolForm
import React, { useState, useEffect } from 'react';

import FormComponent from '../FormComponent';
import FileUpload from '../FileUpload';
import GoogleMapReact from 'google-map-react';
import Marker from '../Marker';
import LoadingSpinner from '../LoadingSpinner';

/**
 * CreateSchoolForm Component
 * Multi-step form for creating a new school with admin users and social media links
 *
 * @param {Function} onSchoolCreated - Callback when school is successfully created
 * @param {Function} onClose - Callback to close the form
 * @param {Function} handleSchoolCreated - Additional callback for school creation
 * @param {string} searchTerm - Search term (if any)
 * @param {Object} user - Authenticated user object from Auth0
 */
const CreateSchoolForm = ({ onSchoolCreated, onClose, handleSchoolCreated, searchTerm, user }) => {
  console.log('🚀 CreateSchoolForm component initialized');
  console.log('📋 Props received:', { onSchoolCreated, onClose, handleSchoolCreated, searchTerm, user });

  // ==================== STATE DECLARATIONS ====================

  // File upload state
  const [file, setFile] = useState(null);

  // Step 1: Basic school information
  const [schoolName, setSchoolName] = useState('');
  const [schoolEmail, setSchoolEmail] = useState('');
  const [theme, setTheme] = useState('#20B486');

  // Step 2: Address and location information
  const [schoolAddressLine1, setSchoolAddressLine1] = useState('');
  const [schoolAddressLine2, setSchoolAddressLine2] = useState('');
  const [country, setCountry] = useState('');
  const [province, setProvince] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');

  // Location and map related states
  const [currentLocation, setCurrentLocation] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  // Step 3: Admin user information
  const [adminUser1Name, setAdminUser1Name] = useState('');
  const [adminUser1Email, setAdminUser1Email] = useState('');
  const [adminUser2Name, setAdminUser2Name] = useState('');
  const [adminUser2Email, setAdminUser2Email] = useState('');

  // Step 4: Social media and website links
  const [website, setWebsite] = useState('');
  const [facebook, setFacebook] = useState('');
  const [tiktok, setTikTok] = useState('');
  const [linkedin, setLinkedIn] = useState('');

  // Form control states
  const [schoolExists, setSchoolExists] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  console.log('📊 Initial state set:', {
    step,
    schoolName,
    schoolEmail,
    theme,
    currentLocation,
    selectedLocation
  });

  // ==================== AUTH0 ACCESS TOKEN FUNCTION ====================

  /**
   * Fetches Auth0 management API access token
   * @returns {Promise<string>} Access token for Auth0 Management API
   */
  const getAccessToken = async () => {
    console.log('🔐 Requesting Auth0 access token...');
    
    try {
      const response = await fetch('/api/getAccessToken', {
        method: 'POST',
      });

      console.log('📡 Access token response status:', response.status);

      if (!response.ok) {
        console.error('❌ Failed to fetch access token:', response.statusText);
        throw new Error('Failed to fetch access token');
      }

      const data = await response.json();
      console.log('✅ Access token retrieved successfully');
      console.log('🔑 Token data:', { ...data, accessToken: data.accessToken ? '[REDACTED]' : 'null' });
      
      return data.accessToken;
    } catch (error) {
      console.error('💥 Error in getAccessToken:', error);
      throw error;
    }
  };

  // ==================== EFFECT HOOKS ====================

  /**
   * Effect: Handle user authentication and token retrieval
   * Runs when the user prop changes
   */
  useEffect(() => {
    console.log('🔄 User effect triggered, user:', user);
    
    if (user) {
      console.log('👤 User authenticated, fetching access token...');
      
      const fetchData = async () => {
        try {
          const token = await getAccessToken();
          console.log('✅ Token fetched successfully in user effect');
          
        } catch (err) {
          console.error('❌ Error fetching token in user effect:', err.message);
          // Note: setError is not defined in the original code, commenting out
          // setError(err.message);
        }
      };

      fetchData();
    } else {
      console.log('👤 No user authenticated');
    }
  }, [user]);

  /**
   * Effect: Get user's current geolocation
   * Runs once on component mount
   */
  useEffect(() => {
    console.log('🌍 Geolocation effect triggered');
    
    if ('geolocation' in navigator) {
      console.log('📍 Geolocation is supported, requesting current position...');
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          
          console.log('✅ Geolocation retrieved:', coords);
          console.log('📍 Accuracy:', position.coords.accuracy, 'meters');
          
          setCurrentLocation(coords);
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
        },
        (error) => {
          console.error('❌ Geolocation error:', error.message);
          console.log('🔧 Error code:', error.code);
          console.log('📍 Falling back to default location');
        }
      );
    } else {
      console.warn('⚠️ Geolocation is not supported by this browser');
    }
  }, []);

  // ==================== EVENT HANDLERS ====================

  /**
   * Handles file selection for school logo upload
   * @param {Event} e - File input change event
   */
  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0] || null;
    console.log('📁 File selected:', selectedFile ? {
      name: selectedFile.name,
      size: selectedFile.size,
      type: selectedFile.type
    } : 'No file selected');
    
    setFile(selectedFile);
  };

  /**
   * Handles map click events for location selection
   * @param {Object} coords - Coordinates object with lat and lng
   */
  const handleMapClick = ({ lat, lng }) => {
    console.log('🗺️ Map clicked at coordinates:', { lat, lng });
    
    const newLocation = { lat, lng };
    setSelectedLocation(newLocation);
    setLatitude(lat);
    setLongitude(lng);
    
    console.log('📍 Location updated:', newLocation);
  };

  /**
   * Handles navigation to the next step with validation
   */
  const handleNextStep = () => {
    console.log(`➡️ Attempting to move from step ${step} to step ${step + 1}`);
    
    // Step 1 validation: Basic school information
    if (step === 1) {
      console.log('🔍 Validating step 1 fields:', { schoolName, schoolEmail });
      
      if (!schoolName || !schoolEmail) {
        console.warn('⚠️ Step 1 validation failed: Missing required fields');
        alert('Please fill in all required fields: School Name and School Email.');
        return;
      }
      
      console.log('✅ Step 1 validation passed');
    }

    // Step 2 validation: Address information
    if (step === 2) {
      console.log('🔍 Validating step 2 fields:', {
        schoolAddressLine1,
        country,
        province,
        city,
        postalCode
      });
      
      if (!schoolAddressLine1 || !country || !province || !city || !postalCode) {
        console.warn('⚠️ Step 2 validation failed: Missing required address fields');
        alert('Please fill in all required address fields.');
        return;
      }
      
      console.log('✅ Step 2 validation passed');
    }

    const nextStep = step + 1;
    console.log(`✅ Moving to step ${nextStep}`);
    setStep(nextStep);
  };

  /**
   * Handles navigation to the previous step
   */
  const handlePreviousStep = () => {
    const prevStep = step - 1;
    console.log(`⬅️ Moving from step ${step} to step ${prevStep}`);
    setStep(prevStep);
  };

  /**
   * Main form submission handler
   * Handles authentication, file upload, school creation, and role assignment
   */
  const handleAuthenticationAndFormSubmission = async () => {
    console.log('🚀 Starting form submission process...');
    console.log('📋 Current form data:', {
      schoolName,
      schoolEmail,
      schoolAddressLine1,
      country,
      province,
      city,
      postalCode,
      hasFile: !!file,
      latitude,
      longitude,
      theme,
      adminUser1Name,
      adminUser1Email,
      adminUser2Name,
      adminUser2Email,
      website,
      facebook,
      tiktok,
      linkedin
    });

    // Final validation before submission
    if (!schoolName || !schoolEmail || !schoolAddressLine1 || !country || !province || !city || !postalCode) {
      console.error('❌ Final validation failed: Missing required fields');
      alert('Please fill in all required fields: School Name, School Email, and School Address.');
      return;
    }

    try {
      console.log('🔄 Setting loading state to true');
      setLoading(true);

      let cloudinaryImageUrl = '';
      
      // ==================== FILE UPLOAD TO CLOUDINARY ====================
      if (file) {
        console.log('📤 Uploading file to Cloudinary...');
        console.log('📁 File details:', {
          name: file.name,
          size: file.size,
          type: file.type
        });

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', process.env.REACT_APP_CLOUDINARY_PRESET || 'w1ofo4vi');

        console.log('☁️ Cloudinary preset:', process.env.REACT_APP_CLOUDINARY_PRESET || 'w1ofo4vi');

        const cloudinaryResponse = await fetch('https://api.cloudinary.com/v1_1/chameleon-techie/image/upload', {
          method: 'POST',
          body: formData,
        });

        console.log('📡 Cloudinary response status:', cloudinaryResponse.status);

        if (!cloudinaryResponse.ok) {
          console.error('❌ Cloudinary upload failed:', cloudinaryResponse.statusText);
          throw new Error('Error uploading file to Cloudinary');
        }

        const cloudinaryData = await cloudinaryResponse.json();
        cloudinaryImageUrl = cloudinaryData.secure_url;
        
        console.log('✅ File uploaded to Cloudinary successfully');
        console.log('🖼️ Image URL:', cloudinaryImageUrl);
      } else {
        console.log('📁 No file selected for upload');
      }

      // ==================== SCHOOL CREATION ====================
      console.log('🏫 Creating school record...');
      
      const schoolPayload = {
        schoolName,
        logo: cloudinaryImageUrl,
        schoolEmail,
        line1: schoolAddressLine1,
        line2: schoolAddressLine2,
        country,
        province,
        city,
        postalCode,
        theme,
        latitude,
        longitude,
        website,
        facebook,
        tiktok,
        linkedin,
        user_id: user?.sub,
        user_email: user?.email,
        school_created_by: user?.email,
      };

      console.log('📦 School payload:', schoolPayload);

      const schoolResponse = await fetch('http://localhost:4000/api/v1/schools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(schoolPayload),
      });

      console.log('📡 School creation response status:', schoolResponse.status);

      if (!schoolResponse.ok) {
        console.error('❌ School creation failed:', schoolResponse.statusText);
        throw new Error('Error submitting form data');
      }

  const schoolData = await schoolResponse.json();
console.log('✅ School created successfully');
console.log('🏫 Full school response:', schoolData);

// Extract school ID with detailed logging
const schoolId = schoolData.data?.school?._id;  // Changed this line
console.log('🔍 Extracting school ID...');
console.log('📊 School data structure:', {
  hasData: !!schoolData.data,
  hasSchool: !!schoolData.data?.school,
  hasId: !!schoolData.data?.school?._id,
  schoolId: schoolId
});

if (!schoolId) {
  console.error('❌ School ID extraction failed');
  console.error('🔍 School data:', schoolData);
  throw new Error("School ID not found in response");
}

// Also update the double-check structure validation:
if (!schoolData || !schoolData.data || !schoolData.data.school || !schoolData.data.school._id) {
  console.error('❌ Invalid school data structure');
  console.error('📊 Data structure check:', {
    hasSchoolData: !!schoolData,
    hasDataProperty: !!schoolData?.data,
    hasSchoolProperty: !!schoolData?.data?.school,
    hasIdProperty: !!schoolData?.data?.school?._id
  });
  throw new Error("School ID not found in response");
}
      console.log('✅ School ID extracted successfully:', schoolId);

      // ==================== AUTH0 ROLE ASSIGNMENT ====================
      console.log('👑 Assigning Admin role in Auth0...');
      
      const userId = encodeURIComponent(user.sub);
      console.log('👤 Encoded user ID:', userId);
      console.log('🔑 Auth0 user sub:', user.sub);

      const accessToken = await getAccessToken();
      console.log('🔐 Access token retrieved for role assignment');

      const roleUpdateResponse = await fetch(`https://dev-t0o26rre86m7t8lo.us.auth0.com/api/v2/users/${userId}/roles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ roles: ['rol_a6KrxwaZ1CguNPXS'] }),
      });

      console.log('📡 Auth0 role update response status:', roleUpdateResponse.status);

      if (!roleUpdateResponse.ok) {
        console.error('❌ Auth0 role assignment failed:', roleUpdateResponse.statusText);
        const errorText = await roleUpdateResponse.text();
        console.error('💥 Auth0 error details:', errorText);
        throw new Error('Error updating user role in Auth0');
      }

      console.log('✅ Auth0 role assigned successfully');

      // ==================== BACKEND ROLE SYNCHRONIZATION ====================
      console.log('🔄 Synchronizing role in backend...');

      const backendResponse = await fetch(`http://localhost:4000/api/v1/users/${userId}/update_roles`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roles: ['Admin'] }),
      });

      console.log('📡 Backend role sync response status:', backendResponse.status);

      if (!backendResponse.ok) {
        console.error('❌ Backend role synchronization failed:', backendResponse.statusText);
        const errorText = await backendResponse.text();
        console.error('💥 Backend error details:', errorText);
        throw new Error('Error updating user role in backend');
      }

      console.log('✅ Backend role synchronized successfully');

      // ==================== USER COLLECTION UPDATE ====================
      console.log('➕ Adding school to user\'s schools array...');

      const addSchoolResponse = await fetch(`http://localhost:4000/api/v1/users/${userId}/add_school`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schoolId }), // or { school: schoolId } based on your backend
      });

      console.log('📡 Add school response status:', addSchoolResponse.status);

      if (!addSchoolResponse.ok) {
        console.error('❌ Failed to add school to user:', addSchoolResponse.statusText);
        const errorText = await addSchoolResponse.text();
        console.error('💥 Backend error details:', errorText);
        throw new Error('Error adding school to user in backend');
      }

      console.log('✅ School added to user successfully');


      // ==================== SUCCESS HANDLING ====================
      console.log('🎉 Form submission completed successfully!');
      console.log('📊 Final summary:', {
        schoolCreated: true,
        schoolId: schoolId,
        roleAssigned: true,
        roleSynchronized: true,
        userCollectionUpdated: true
      });

      alert('School, Admin Users, Roles, and User Collection updated successfully!');

      console.log('🔄 Setting loading state to false');
      setLoading(false);
      
      console.log('🔄 Reloading page...');
      window.location.reload();

    } catch (error) {
      console.error('💥 Error during form submission:', error);
      console.error('🔍 Error stack:', error.stack);
      
      alert(error.message);
      
      console.log('🔄 Setting loading state to false due to error');
      setLoading(false);
    }
  };

  // ==================== COMPONENT RENDER ====================
  console.log('🎨 Rendering CreateSchoolForm, current step:', step);

  return (
    <div className="container mx-auto mt-8 p-4 bg-gray-100 border rounded-md">
      <h1 className="text-2xl font-bold mb-4">Create a School</h1>
      {loading ? (
        <>
          {console.log('⏳ Rendering loading spinner')}
          <LoadingSpinner />
        </>
      ) : (
        <>
          {/* ==================== STEP 1: BASIC INFORMATION ==================== */}
          {step === 1 && (
            <>
              {console.log('📋 Rendering Step 1: Basic Information')}
              <FormComponent
                label="School Name"
                value={schoolName}
                onChange={(e) => {
                  console.log('✏️ School name changed:', e.target.value);
                  setSchoolName(e.target.value);
                }}
              />
              <FormComponent
                label="School Email"
                type="email"
                value={schoolEmail}
                onChange={(e) => {
                  console.log('✏️ School email changed:', e.target.value);
                  setSchoolEmail(e.target.value);
                }}
              />
              <FileUpload onChange={handleFileChange} />
              <div>
                <label htmlFor="theme-color">Select Theme Color:</label>
                <select
                  id="theme-color"
                  value={theme}
                  onChange={(e) => {
                    console.log('🎨 Theme changed:', e.target.value);
                    setTheme(e.target.value);
                  }}
                >
                  <option value="#20B486">Green</option>
                  <option value="#FF5733">Orange</option>
                  <option value="#33C3FF">Blue</option>
                  <option value="#FF33A8">Pink</option>
                  <option value="#7D33FF">Purple</option>
                </select>
              </div>
              <button className="bg-blue-500 text-white py-2 px-4 rounded" onClick={handleNextStep}>
                Next
              </button>
            </>
          )}

          {/* ==================== STEP 2: ADDRESS & LOCATION ==================== */}
          {step === 2 && (
            <>
              {console.log('📍 Rendering Step 2: Address & Location')}
              <div className="form-group">
                <label htmlFor="addressLine1">Address Line 1</label>
                <input
                  type="text"
                  className="form-control"
                  id="addressLine1"
                  placeholder="1234 Main St"
                  value={schoolAddressLine1}
                  onChange={(e) => {
                    console.log('✏️ Address line 1 changed:', e.target.value);
                    setSchoolAddressLine1(e.target.value);
                  }}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="addressLine2">Address Line 2</label>
                <input
                  type="text"
                  className="form-control"
                  id="addressLine2"
                  placeholder="Apartment, studio, or floor"
                  value={schoolAddressLine2}
                  onChange={(e) => {
                    console.log('✏️ Address line 2 changed:', e.target.value);
                    setSchoolAddressLine2(e.target.value);
                  }}
                />
              </div>
              <div className="form-group">
                <label htmlFor="country">Country</label>
                <select
                  className="form-control"
                  id="country"
                  value={country}
                  onChange={(e) => {
                    console.log('✏️ Country changed:', e.target.value);
                    setCountry(e.target.value);
                  }}
                  required
                >
                  <option value="">Select Country</option>
                  <option value="Country1">Country1</option>
                  <option value="Country2">Country2</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="province">Province</label>
                <input
                  type="text"
                  className="form-control"
                  id="province"
                  placeholder="Province"
                  value={province}
                  onChange={(e) => {
                    console.log('✏️ Province changed:', e.target.value);
                    setProvince(e.target.value);
                  }}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="city">City</label>
                <input
                  type="text"
                  className="form-control"
                  id="city"
                  placeholder="City"
                  value={city}
                  onChange={(e) => {
                    console.log('✏️ City changed:', e.target.value);
                    setCity(e.target.value);
                  }}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="postalCode">Postal Code</label>
                <input
                  type="text"
                  className="form-control"
                  id="postalCode"
                  placeholder="Postal Code"
                  value={postalCode}
                  onChange={(e) => {
                    console.log('✏️ Postal code changed:', e.target.value);
                    setPostalCode(e.target.value);
                  }}
                  required
                />
              </div>
              <div className="form-group mt-4">
                <label>Location on Map</label>
                {console.log('🗺️ Rendering Google Map with:', {
                  currentLocation,
                  selectedLocation,
                  apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY ? '[REDACTED]' : 'undefined'
                })}
                <div style={{ height: '300px', width: '100%' }}>
                  <GoogleMapReact
                    bootstrapURLKeys={{ key: process.env.REACT_APP_GOOGLE_MAPS_API_KEY }}
                    defaultCenter={{ lat: -34.397, lng: 150.644 }}
                    defaultZoom={11}
                    onClick={handleMapClick}
                    center={selectedLocation || currentLocation}
                    zoom={selectedLocation ? 14 : 11}
                  >
                    {currentLocation && (
                      <>
                        {console.log('📍 Rendering current location marker:', currentLocation)}
                        <Marker lat={currentLocation.lat} lng={currentLocation.lng} text="My Location" />
                      </>
                    )}
                    {selectedLocation && (
                      <>
                        {console.log('📍 Rendering selected location marker:', selectedLocation)}
                        <Marker lat={selectedLocation.lat} lng={selectedLocation.lng} text="Selected Location" />
                      </>
                    )}
                  </GoogleMapReact>
                </div>
              </div>
              <div className="flex justify-between mt-4">
                <button className="bg-gray-500 text-white py-2 px-4 rounded" onClick={handlePreviousStep}>
                  Previous
                </button>
                <button className="bg-blue-500 text-white py-2 px-4 rounded" onClick={handleNextStep}>
                  Next
                </button>
              </div>
            </>
          )}

          {/* ==================== STEP 3: ADMIN USERS ==================== */}
          {step === 3 && (
            <>
              {console.log('👥 Rendering Step 3: Admin Users')}
              <FormComponent
                label="Admin User 1 Name"
                value={adminUser1Name}
                onChange={(e) => {
                  console.log('✏️ Admin user 1 name changed:', e.target.value);
                  setAdminUser1Name(e.target.value);
                }}
              />
              <FormComponent
                label="Admin User 1 Email"
                type="email"
                value={adminUser1Email}
                onChange={(e) => {
                  console.log('✏️ Admin user 1 email changed:', e.target.value);
                  setAdminUser1Email(e.target.value);
                }}
              />
              <FormComponent
                label="Admin User 2 Name"
                value={adminUser2Name}
                onChange={(e) => {
                  console.log('✏️ Admin user 2 name changed:', e.target.value);
                  setAdminUser2Name(e.target.value);
                }}
              />
              <FormComponent
                label="Admin User 2 Email"
                type="email"
                value={adminUser2Email}
                onChange={(e) => {
                  console.log('✏️ Admin user 2 email changed:', e.target.value);
                  setAdminUser2Email(e.target.value);
                }}
              />
              <div className="flex justify-between mt-4">
                <button className="bg-gray-500 text-white py-2 px-4 rounded" onClick={handlePreviousStep}>
                  Previous
                </button>
                <button className="bg-blue-500 text-white py-2 px-4 rounded" onClick={handleNextStep}>
                  Next
                </button>
              </div>
            </>
          )}

          {/* ==================== STEP 4: SOCIAL MEDIA & SUBMISSION ==================== */}
          {step === 4 && (
            <>
              {console.log('🌐 Rendering Step 4: Social Media & Final Submission')}
              <FormComponent
                label="Website URL"
                type="url"
                value={website}
                onChange={(e) => {
                  console.log('✏️ Website changed:', e.target.value);
                  setWebsite(e.target.value);
                }}
              />
              <FormComponent
                label="Facebook URL"
                type="url"
                value={facebook}
                onChange={(e) => {
                  console.log('✏️ Facebook changed:', e.target.value);
                  setFacebook(e.target.value);
                }}
              />
              <FormComponent
                label="TikTok URL"
                type="url"
                value={tiktok}
                onChange={(e) => {
                  console.log('✏️ TikTok changed:', e.target.value);
                  setTikTok(e.target.value);
                }}
              />
              <FormComponent
                label="LinkedIn URL"
                type="url"
                value={linkedin}
                onChange={(e) => {
                  console.log('✏️ LinkedIn changed:', e.target.value);
                  setLinkedIn(e.target.value);
                }}
              />
              <div className="flex justify-between mt-4">
                <button className="bg-gray-500 text-white py-2 px-4 rounded" onClick={handlePreviousStep}>
                  Previous
                </button>
                <button
                  className="bg-blue-500 text-white py-2 px-4 rounded"
                  onClick={() => {
                    console.log('🚀 Submit button clicked, initiating form submission...');
                    handleAuthenticationAndFormSubmission();
                  }}
                >
                  Submit
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default CreateSchoolForm;
