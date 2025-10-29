import React, { useState, useMemo, useEffect } from 'react';
import FormComponent from '../../../FormComponent';
import FileUpload from '../../../FileUpload';
import useColorMode from '../hooks/useColorMode';
import { getBackgroundColor, getHoverColor } from '../utils/colorUtils';

const THEME_PRESETS = [
  { mode: 'blue', value: '#1E40AF', name: 'Sky Blue' },
  { mode: 'green', value: '#059669', name: 'Forest Green' },
  { mode: 'purple', value: '#7C3AED', name: 'Royal Purple' },
  { mode: 'orange', value: '#F97316', name: 'Sunset Orange' },
  { mode: 'teal', value: '#14B8A6', name: 'Ocean Teal' },
];

const Step1BasicInfo = ({
  schoolName = '',
  schoolEmail = '',
  phoneNumber = '',
  theme, // theme prop from parent
  onFileChange,
  onSchoolNameChange,
  onSchoolEmailChange,
  onPhoneNumberChange,
  onThemeChange,
  onNext,
  isLoading = false,
}) => {
  const [colorMode, customColor, setColorMode] = useColorMode();
  const [errors, setErrors] = useState({});
  const [focusedField, setFocusedField] = useState(null);

  // DEBUG: Log initial props
  useEffect(() => {
    console.log('🔍 Step1BasicInfo - Initial props:', {
      schoolName,
      schoolEmail,
      phoneNumber,
      theme
    });
  }, []);

  // ✅ FIX: Initialize color mode from parent theme prop
  useEffect(() => {
    if (theme && theme.mode && theme.value) {
      setColorMode(theme.mode, theme.value);
    }
  }, [theme, setColorMode]);

  const { previewBg, previewHover } = useMemo(
    () => ({
      previewBg: getBackgroundColor(colorMode, customColor),
      previewHover: getHoverColor(colorMode, customColor),
    }),
    [colorMode, customColor]
  );

  const validateForm = () => {
    const newErrors = {};

    if (!schoolName.trim()) {
      newErrors.schoolName = 'School name is required';
    }

    if (!schoolEmail.trim()) {
      newErrors.schoolEmail = 'School email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(schoolEmail)) {
      newErrors.schoolEmail = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext();
    }
  };

  const handleColorChange = (mode, value) => {
    setColorMode(mode, value);

    // ✅ Send theme data back to parent
    if (onThemeChange) {
      onThemeChange(mode, value);
    }
  };

  // DEBUG: Handle phone number changes with logging
  const handlePhoneNumberChange = (e) => {
    const value = e.target.value;
    console.log('📞 Phone number input changed:', {
      value,
      valueLength: value.length,
      previousValue: phoneNumber,
      eventType: e.type
    });
    
    if (onPhoneNumberChange) {
      onPhoneNumberChange(e);
    } else {
      console.error('❌ onPhoneNumberChange prop is not provided or is undefined');
    }
  };

  // DEBUG: Log current state
  useEffect(() => {
    console.log('📊 Step1BasicInfo - Current state:', {
      phoneNumber,
      phoneNumberLength: phoneNumber?.length,
      schoolName,
      schoolEmail,
      focusedField,
      colorMode,
      customColor
    });
  }, [phoneNumber, schoolName, schoolEmail, focusedField, colorMode, customColor]);

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
              Create your own custom school communication experience
            </p>
            <div className="mt-4 w-20 h-1 bg-blue-600 mx-auto rounded-full" />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* DEBUG: Current values display */}
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="text-sm font-bold text-yellow-800 mb-2">🔍 DEBUG INFO:</h3>
          <div className="text-xs text-yellow-700 grid grid-cols-2 gap-2">
            <div>Phone Number: <span className="font-mono bg-yellow-100 px-1 rounded">{phoneNumber || '(empty)'}</span></div>
            <div>Length: <span className="font-mono bg-yellow-100 px-1 rounded">{phoneNumber?.length || 0}</span></div>
            <div>School Name: <span className="font-mono bg-yellow-100 px-1 rounded">{schoolName || '(empty)'}</span></div>
            <div>School Email: <span className="font-mono bg-yellow-100 px-1 rounded">{schoolEmail || '(empty)'}</span></div>
          </div>
        </div>

        {/* Main Form Container */}
        <div className="bg-gradient-to-br from-gray-50 via-white to-gray-50 rounded-2xl shadow-2xl border border-gray-200">
          <div className="p-8 md:p-12">
            {/* Progress Indicator */}
            <div className="mb-10">
              <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                <span>Step 1 of 3</span>
                <span>33% Complete</span>
              </div>
              <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full w-1/3 bg-gradient-to-r from-blue-600 to-blue-500 transition-all duration-500 ease-out" />
              </div>
            </div>

            {/* School Info + Branding */}
            <div className="mb-10 flex flex-col md:flex-row gap-8">
              {/* School Info */}
              <div className="md:w-2/3">
                <h2 className="text-3xl font-bold mb-8 text-gray-900 flex items-center">
                  <div className="w-2 h-8 bg-blue-600 rounded-full mr-4" />
                  School Information
                </h2>
                <p className="text-gray-600 text-lg mb-6">
                  Provide your school's essential contact details below.
                </p>

                <div className="space-y-6">
                  {/* School Name */}
                  <div className="group">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      School Name *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={schoolName}
                        onChange={onSchoolNameChange}
                        onFocus={() => setFocusedField('schoolName')}
                        onBlur={() => setFocusedField(null)}
                        placeholder="Enter your school name"
                        className={`w-full px-4 py-4 bg-gray-50 border rounded-lg text-black placeholder-gray-500
                          transition-all duration-300 focus:outline-none focus:ring-0
                          ${errors.schoolName
                            ? 'border-red-500 focus:border-red-400'
                            : 'border-gray-300 focus:border-blue-500 hover:border-gray-400'}
                          ${focusedField === 'schoolName' ? 'transform scale-[1.02]' : ''}`}
                      />
                    </div>
                    {errors.schoolName && (
                      <p className="text-red-600 text-sm mt-2">{errors.schoolName}</p>
                    )}
                  </div>

                  {/* School Email */}
                  <div className="group">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      School Email *
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={schoolEmail}
                        onChange={onSchoolEmailChange}
                        onFocus={() => setFocusedField('schoolEmail')}
                        onBlur={() => setFocusedField(null)}
                        placeholder="contact@yourschool.edu"
                        className={`w-full px-4 py-4 bg-gray-50 border rounded-lg text-black placeholder-gray-500
                          transition-all duration-300 focus:outline-none focus:ring-0
                          ${errors.schoolEmail
                            ? 'border-red-500 focus:border-red-400'
                            : 'border-gray-300 focus:border-blue-500 hover:border-gray-400'}
                          ${focusedField === 'schoolEmail' ? 'transform scale-[1.02]' : ''}`}
                      />
                    </div>
                    {errors.schoolEmail && (
                      <p className="text-red-600 text-sm mt-2">{errors.schoolEmail}</p>
                    )}
                  </div>

                  {/* Phone Number - DEBUG: Enhanced with logging */}
                  <div className="group">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={handlePhoneNumberChange}
                      onFocus={() => {
                        console.log('📞 Phone number field focused');
                        setFocusedField('phoneNumber');
                      }}
                      onBlur={() => {
                        console.log('📞 Phone number field blurred');
                        setFocusedField(null);
                      }}
                      onKeyDown={(e) => {
                        console.log('⌨️ Phone number key pressed:', e.key);
                      }}
                      placeholder="+1 (555) 123-4567"
                      className={`w-full px-4 py-4 bg-gray-50 border border-gray-300 rounded-lg text-black
                        placeholder-gray-500 transition-all duration-300 focus:outline-none focus:ring-0
                        focus:border-blue-500 hover:border-gray-400
                        ${focusedField === 'phoneNumber' ? 'transform scale-[1.02] border-2 border-blue-500' : ''}`}
                      style={{ 
                        color: 'black',
                        backgroundColor: '#f9fafb'
                      }}
                    />
                    {/* DEBUG: Show current value below input */}
                    <div className="mt-1 text-xs text-gray-500">
                      Current value: <span className="font-mono bg-gray-100 px-1 rounded">{phoneNumber || '(empty)'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Logo Upload */}
              <div className="md:w-1/3">
                <h2 className="text-3xl font-bold mb-8 text-gray-900 flex items-center">
                  <div className="w-2 h-8 bg-blue-600 rounded-full mr-4" />
                  School Branding
                </h2>
                <p className="text-gray-600 text-lg mb-6">
                  Upload your official school logo. Need one? Email{' '}
                  <span className="font-semibold text-blue-600">
                    freeLogo@SchoolHeadOffice.com
                  </span>
                  .
                </p>
                <div className="bg-gray-100/50 border border-gray-200 rounded-xl p-8 hover:border-gray-300 transition-all duration-300">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) onFileChange(file);
                    }}
                    className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 
                      file:rounded-full file:border-0 file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
              </div>
            </div>

            {/* Theme Section */}
            <div className="mb-10">
              <h2 className="text-3xl font-bold mb-8 text-gray-900 flex items-center">
                <div className="w-2 h-8 bg-blue-600 rounded-full mr-4" />
                Choose Your Style
              </h2>

              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                  {THEME_PRESETS.map((preset) => (
                    <button
                      key={preset.mode}
                      type="button"
                      onClick={() => handleColorChange(preset.mode, preset.value)}
                      className={`group relative p-6 rounded-xl border-2 transition-all duration-300
                        hover:scale-105 hover:shadow-2xl focus:outline-none focus:scale-105
                        ${
                          colorMode === preset.mode
                            ? 'border-blue-600 shadow-xl scale-105'
                            : 'border-gray-300 hover:border-blue-300'
                        }`}
                      style={{
                        background: `linear-gradient(135deg, ${preset.value}11, ${preset.value}05)`,
                        borderColor: colorMode === preset.mode ? preset.value : undefined,
                      }}
                    >
                      <div
                        className="w-12 h-12 rounded-full mx-auto mb-3 shadow-lg"
                        style={{ backgroundColor: preset.value }}
                      />
                      <p className="text-sm font-medium text-gray-800 group-hover:text-gray-700">
                        {preset.name}
                      </p>
                      {colorMode === preset.mode && (
                        <div className="absolute top-2 right-2">
                          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {/* Custom Color Picker */}
                <div className="flex items-center gap-4 p-4 bg-gray-100/50 rounded-xl border border-gray-200">
                  <input
                    type="color"
                    value={customColor}
                    onChange={(e) => handleColorChange('custom', e.target.value)}
                    className="w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-300 hover:border-blue-400 transition-colors"
                  />
                  <div>
                    <p className="text-gray-900 font-medium">Custom Color</p>
                    <p className="text-gray-600 text-sm">Choose your own brand color</p>
                  </div>
                </div>

                {/* Live Preview */}
                <div className="bg-gray-100/50 border border-gray-200 rounded-xl p-6">
                  <p className="text-gray-900 font-medium mb-4">Live Preview</p>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      className="px-8 py-3 rounded-lg font-semibold text-white transition-all duration-200 transform hover:scale-105 shadow-lg"
                      style={{ backgroundColor: previewBg }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = previewHover;
                        e.currentTarget.style.boxShadow = `0 10px 30px ${previewBg}40`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = previewBg;
                        e.currentTarget.style.boxShadow = `0 4px 20px ${previewBg}20`;
                      }}
                    >
                      Primary Button
                    </button>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full border border-gray-400"
                        style={{ backgroundColor: previewBg }}
                      />
                      <span className="text-gray-600 text-sm">Brand Color</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Continue Button */}
            <div className="pt-8 border-t border-gray-200">
              <button
                type="button"
                onClick={handleNext}
                disabled={isLoading}
                className={`group relative w-full py-4 px-8 bg-gradient-to-r from-blue-600 to-blue-700
                  text-white font-bold text-lg rounded-xl transition-all duration-300
                  hover:from-blue-500 hover:to-blue-600 hover:shadow-2xl hover:shadow-blue-500/25
                  focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed
                  transform hover:scale-[1.02] active:scale-[0.98]
                  ${isLoading ? 'cursor-wait' : 'hover:-translate-y-1'}`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Creating Your Experience...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-3">
                    <span>Continue to Next Step</span>
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

export default Step1BasicInfo;