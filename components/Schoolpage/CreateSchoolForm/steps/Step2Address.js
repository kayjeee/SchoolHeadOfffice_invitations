// components/schoolpage/CreateSchoolForm/steps/Step2Address.js
import React, { useState, useMemo, useCallback } from 'react';
import GoogleMapReact from 'google-map-react';
import Marker from '../../../Marker';
import useColorMode from '../hooks/useColorMode';
import { getBackgroundColor, getHoverColor } from '../utils/colorUtils';

const COUNTRIES = [
  'South Africa',
  'Kenya',
  'Botswana',
  'Nigeria',
  'Canada',
  'United States',
  'France',
  'New Zealand',
  'Namibia',
];

const Step2Address = ({
  formData,
  onLine1Change,
  onLine2Change,
  onCountryChange,
  onProvinceChange,
  onCityChange,
  onPostalCodeChange,
  onMapClick,
  onNext,
  onPrevious,
  isLoading = false,
}) => {
  const [colorMode, customColor] = useColorMode();
  const [errors, setErrors] = useState({});
  const [focusedField, setFocusedField] = useState(null);

  // ✅ Force inject Auth0 userId
  const userId = 'google-oauth2|111222333444';

  const addressLine1 =
    (formData.addressLine1 ?? formData.schoolAddressLine1) || '';
  const addressLine2 =
    (formData.addressLine2 ?? formData.schoolAddressLine2) || '';
  const selectedLocation =
    formData.location ?? formData.selectedLocation ?? null;

  const { previewBg, previewHover } = useMemo(
    () => ({
      previewBg: getBackgroundColor(colorMode, customColor),
      previewHover: getHoverColor(colorMode, customColor),
    }),
    [colorMode, customColor]
  );

  /** Validation */
  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!addressLine1.trim()) {
      newErrors.addressLine1 = 'Address Line 1 is required';
    }
    if (!(formData.country || '').trim()) {
      newErrors.country = 'Country is required';
    }
    if (!(formData.province || '').trim()) {
      newErrors.province = 'Province is required';
    }
    if (!(formData.city || '').trim()) {
      newErrors.city = 'City is required';
    }
    if (!(formData.postalCode || '').trim()) {
      newErrors.postalCode = 'Postal Code is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [
    addressLine1,
    formData.country,
    formData.province,
    formData.city,
    formData.postalCode,
  ]);

  /** Next */
  const handleNext = useCallback(() => {
    if (validateForm()) {
      // ✅ Pass userId into the form before moving forward
      onNext({
        ...formData,
        userId,
      });
    }
  }, [validateForm, onNext, formData]);

  /** Field-level error clearing */
  const handleFieldChange = (field, onChange) => (e) => {
    if (errors[field]) {
      setErrors((prev) => {
        const newErr = { ...prev };
        delete newErr[field];
        return newErr;
      });
    }
    onChange(e);
  };

  const defaultProps = {
    center: {
      lat: formData.latitude ?? -30.5595,
      lng: formData.longitude ?? 22.9375,
    },
    zoom: formData.latitude ? 14 : 4,
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-b from-white via-gray-100 to-white">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-100/20 via-transparent to-blue-100/20" />
        <div className="relative max-w-6xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-7xl font-black mb-4 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 bg-clip-text text-transparent">
              Welcome to SchoolHeadOffice
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 font-light">
              Create your premium education experience
            </p>
            <div className="mt-4 w-20 h-1 bg-blue-600 mx-auto rounded-full" />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Main Form Container */}
        <div className="bg-gradient-to-br from-gray-50 via-white to-gray-50 rounded-2xl shadow-2xl border border-gray-200">
          <div className="p-8 md:p-12">
            {/* Progress Indicator */}
            <div className="mb-10">
              <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                <span>Step 2 of 4</span>
                <span>50% Complete</span>
              </div>
              <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full w-1/2 bg-gradient-to-r from-blue-600 to-blue-500 transition-all duration-500 ease-out" />
              </div>
            </div>

            {/* Address & Map Section */}
            <div className="mb-10">
              <h2 className="text-3xl font-bold mb-8 text-gray-900 flex items-center">
                <div className="w-2 h-8 bg-blue-600 rounded-full mr-4" />
                School Address
              </h2>
              <p className="text-gray-600 text-lg mb-6">
                Please provide your school's physical address. You can also
                confirm the location by dropping a pin on the interactive map
                below.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Form Fields Column */}
                <div className="space-y-6">
                  <Field
                    label="Address Line 1 *"
                    id="addressLine1"
                    placeholder="1234 Main St"
                    value={addressLine1}
                    error={errors.addressLine1}
                    onChange={handleFieldChange('addressLine1', onLine1Change)}
                    focusedField={focusedField}
                    setFocusedField={setFocusedField}
                  />

                  <Field
                    label="Address Line 2"
                    id="addressLine2"
                    placeholder="Apartment, studio, or floor"
                    value={addressLine2}
                    onChange={onLine2Change}
                    focusedField={focusedField}
                    setFocusedField={setFocusedField}
                  />

                  <SelectField
                    label="Country *"
                    id="country"
                    value={formData.country || ''}
                    options={COUNTRIES}
                    error={errors.country}
                    onChange={handleFieldChange('country', onCountryChange)}
                    focusedField={focusedField}
                    setFocusedField={setFocusedField}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field
                      label="Province *"
                      id="province"
                      placeholder="Province"
                      value={formData.province || ''}
                      error={errors.province}
                      onChange={handleFieldChange(
                        'province',
                        onProvinceChange
                      )}
                      focusedField={focusedField}
                      setFocusedField={setFocusedField}
                    />
                    <Field
                      label="City *"
                      id="city"
                      placeholder="City"
                      value={formData.city || ''}
                      error={errors.city}
                      onChange={handleFieldChange('city', onCityChange)}
                      focusedField={focusedField}
                      setFocusedField={setFocusedField}
                    />
                  </div>

                  <Field
                    label="Postal Code *"
                    id="postalCode"
                    placeholder="Postal Code"
                    value={formData.postalCode || ''}
                    error={errors.postalCode}
                    onChange={handleFieldChange(
                      'postalCode',
                      onPostalCodeChange
                    )}
                    focusedField={focusedField}
                    setFocusedField={setFocusedField}
                  />
                </div>

                {/* Map Column */}
                <div className="flex flex-col">
                  <h3 className="text-xl font-bold mb-4">
                    Confirm Location on Map
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Click on the map to place a pin for your school's exact
                    location. This will help students find you easily.
                  </p>
                  <div className="relative flex-grow min-h-[300px] rounded-xl overflow-hidden shadow-lg border border-gray-200">
                    <GoogleMapReact
                      bootstrapURLKeys={{
                        key: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
                      }}
                      defaultCenter={defaultProps.center}
                      defaultZoom={defaultProps.zoom}
                      onClick={onMapClick}
                      center={selectedLocation || defaultProps.center}
                      zoom={selectedLocation ? 14 : defaultProps.zoom}
                    >
                      {selectedLocation && (
                        <Marker
                          lat={selectedLocation.lat}
                          lng={selectedLocation.lng}
                          text="School Location"
                        />
                      )}
                    </GoogleMapReact>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="pt-8 border-t border-gray-200 flex justify-between items-center">
              <button
                type="button"
                onClick={onPrevious}
                className="group relative py-3 px-6 text-gray-700 font-bold rounded-xl transition-all duration-300 border border-gray-300 hover:border-gray-400 hover:shadow-md hover:bg-gray-100"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl group-hover:-translate-x-1 transition-transform duration-200">
                    ←
                  </span>
                  <span>Previous Step</span>
                </div>
              </button>

              <button
                type="button"
                onClick={handleNext}
                disabled={isLoading}
                className={`group relative py-4 px-8 text-white font-bold text-lg rounded-xl transition-all duration-300
                  ${
                    isLoading
                      ? 'cursor-wait bg-blue-400'
                      : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 hover:shadow-2xl hover:shadow-blue-500/25 transform hover:scale-[1.02] active:scale-[0.98]'
                  }
                  focus:outline-none focus:ring-0 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                {isLoading ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving Address...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-3">
                    <span>Continue</span>
                    <span className="text-xl group-hover:translate-x-1 transition-transform duration-200">
                      →
                    </span>
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Background Pattern */}
      <div className="fixed inset-0 -z-10 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-transparent to-blue-100" />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #60a5fa 0%, transparent 50%),
                               radial-gradient(circle at 75% 75%, #3b82f6 0%, transparent 50%)`,
          }}
        />
      </div>
    </div>
  );
};

const Field = ({
  label,
  id,
  placeholder,
  value,
  onChange,
  error,
  focusedField,
  setFocusedField,
}) => (
  <div className="group">
    <label
      htmlFor={id}
      className="block text-sm font-medium text-gray-700 mb-2"
    >
      {label}
    </label>
    <div className="relative">
      <input
        type="text"
        id={id}
        className={`w-full px-4 py-4 bg-gray-50 border rounded-lg text-gray-900 placeholder-gray-500
          transition-all duration-300 focus:outline-none focus:ring-0
          ${
            error
              ? 'border-red-500 focus:border-red-400'
              : 'border-gray-300 focus:border-blue-500 hover:border-gray-400'
          }
          ${focusedField === id ? 'transform scale-[1.02]' : ''}`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={() => setFocusedField(id)}
        onBlur={() => setFocusedField(null)}
      />
      {focusedField === id && (
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg opacity-20 blur-sm -z-10" />
      )}
    </div>
    {error && (
      <p className="text-red-600 text-sm mt-2 flex items-center">⚠️ {error}</p>
    )}
  </div>
);

const SelectField = ({
  label,
  id,
  value,
  options,
  onChange,
  error,
  focusedField,
  setFocusedField,
}) => (
  <div className="group">
    <label
      htmlFor={id}
      className="block text-sm font-medium text-gray-700 mb-2"
    >
      {label}
    </label>
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={onChange}
        onFocus={() => setFocusedField(id)}
        onBlur={() => setFocusedField(null)}
        className={`w-full px-4 py-4 bg-gray-50 border rounded-lg text-gray-900 placeholder-gray-500
          transition-all duration-300 focus:outline-none focus:ring-0
          ${
            error
              ? 'border-red-500 focus:border-red-400'
              : 'border-gray-300 focus:border-blue-500 hover:border-gray-400'
          }
          ${focusedField === id ? 'transform scale-[1.02]' : ''}`}
      >
        <option value="">Select Country</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      {focusedField === id && (
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg opacity-20 blur-sm -z-10" />
      )}
    </div>
    {error && (
      <p className="text-red-600 text-sm mt-2 flex items-center">⚠️ {error}</p>
    )}
  </div>
);

export default Step2Address;
