import React, { useState, useMemo, useEffect } from "react";
import useColorMode from "../hooks/useColorMode";
import { getBackgroundColor, getHoverColor } from "../utils/colorUtils";

const THEME_PRESETS = [
  { mode: "blue", value: "#1E40AF", name: "Sky Blue" },
  { mode: "green", value: "#059669", name: "Forest Green" },
  { mode: "purple", value: "#7C3AED", name: "Royal Purple" },
  { mode: "orange", value: "#F97316", name: "Sunset Orange" },
  { mode: "teal", value: "#14B8A6", name: "Ocean Teal" },
];

const Step1BasicInfo = ({
  schoolName = "",
  schoolEmail = "",
  phoneNumber = "",
  theme,
  onFileChange = () => {},
  onSchoolNameChange = () => {},
  onSchoolEmailChange = () => {},
  onPhoneNumberChange = () => {},
  onThemeChange = () => {},
  onNext = () => {},
  isLoading = false,
}) => {
  const [colorMode, customColor, setColorMode] = useColorMode();
  const [errors, setErrors] = useState({});
  const [focusedField, setFocusedField] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);

  // Initialize theme from parent
  useEffect(() => {
    if (theme?.mode && theme?.value) {
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

    if (!schoolName.trim()) newErrors.schoolName = "School name is required";

    if (!schoolEmail.trim()) {
      newErrors.schoolEmail = "School email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(schoolEmail)) {
      newErrors.schoolEmail = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) onNext();
  };

  const handleColorChange = (mode, value) => {
    setColorMode(mode, value);
    onThemeChange(mode, value);
  };

  const handlePhoneNumberChange = (e) => {
    if (typeof onPhoneNumberChange === "function") {
      onPhoneNumberChange(e);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file (JPEG, PNG, etc.)');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      setLogoFile(file);
      onFileChange(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoPreview(null);
    setLogoFile(null);
    onFileChange(null);
    // Clear the file input
    const fileInput = document.getElementById('logo-upload');
    if (fileInput) fileInput.value = '';
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-b from-white via-gray-100 to-white">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-100/20 via-transparent to-blue-100/20" />
        <div className="relative max-w-6xl mx-auto px-4 py-12 text-center">
          <h1 className="text-5xl md:text-7xl font-black mb-4 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 bg-clip-text text-transparent">
            Welcome to SchoolHeadOffice
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 font-light">
            Create your own custom school communication experience
          </p>
          <div className="mt-4 w-20 h-1 bg-blue-600 mx-auto rounded-full" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-br from-gray-50 via-white to-gray-50 rounded-2xl shadow-2xl border border-gray-200">
          <div className="p-8 md:p-12">
            {/* Step progress */}
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      School Name *
                    </label>
                    <input
                      type="text"
                      value={schoolName}
                      onChange={onSchoolNameChange}
                      onFocus={() => setFocusedField("schoolName")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="Enter your school name"
                      className={`w-full px-4 py-4 bg-gray-50 border rounded-lg text-black placeholder-gray-500
                        transition-all duration-300 focus:outline-none focus:ring-0
                        ${
                          errors.schoolName
                            ? "border-red-500 focus:border-red-400"
                            : "border-gray-300 focus:border-blue-500 hover:border-gray-400"
                        }
                        ${
                          focusedField === "schoolName"
                            ? "transform scale-[1.02]"
                            : ""
                        }`}
                    />
                    {errors.schoolName && (
                      <p className="text-red-600 text-sm mt-2">
                        {errors.schoolName}
                      </p>
                    )}
                  </div>

                  {/* School Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      School Email *
                    </label>
                    <input
                      type="email"
                      value={schoolEmail}
                      onChange={onSchoolEmailChange}
                      onFocus={() => setFocusedField("schoolEmail")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="contact@yourschool.edu"
                      className={`w-full px-4 py-4 bg-gray-50 border rounded-lg text-black placeholder-gray-500
                        transition-all duration-300 focus:outline-none focus:ring-0
                        ${
                          errors.schoolEmail
                            ? "border-red-500 focus:border-red-400"
                            : "border-gray-300 focus:border-blue-500 hover:border-gray-400"
                        }
                        ${
                          focusedField === "schoolEmail"
                            ? "transform scale-[1.02]"
                            : ""
                        }`}
                    />
                    {errors.schoolEmail && (
                      <p className="text-red-600 text-sm mt-2">
                        {errors.schoolEmail}
                      </p>
                    )}
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={handlePhoneNumberChange}
                      onFocus={() => setFocusedField("phoneNumber")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="+1 (555) 123-4567"
                      className={`w-full px-4 py-4 bg-gray-50 border border-gray-300 rounded-lg text-black
                        placeholder-gray-500 transition-all duration-300 focus:outline-none focus:ring-0
                        focus:border-blue-500 hover:border-gray-400
                        ${
                          focusedField === "phoneNumber"
                            ? "transform scale-[1.02] border-2 border-blue-500"
                            : ""
                        }`}
                    />
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
                  Upload your official school logo. Need one? Email{" "}
                  <span className="font-semibold text-blue-600">
                    freeLogo@SchoolHeadOffice.com
                  </span>
                  .
                </p>
                
                <div className="bg-gray-100/50 border border-gray-200 rounded-xl p-6 hover:border-gray-300 transition-all duration-300">
                  {/* Logo Preview */}
                  {logoPreview ? (
                    <div className="mb-4 text-center">
                      <div className="relative inline-block">
                        <img 
                          src={logoPreview} 
                          alt="School logo preview" 
                          className="w-32 h-32 object-contain rounded-lg border-2 border-gray-300 mx-auto"
                        />
                        <button
                          type="button"
                          onClick={removeLogo}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold hover:bg-red-600 transition-colors"
                          title="Remove logo"
                        >
                          ×
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        Logo preview
                      </p>
                      {logoFile && (
                        <p className="text-xs text-gray-500 mt-1">
                          {logoFile.name} ({(logoFile.size / 1024).toFixed(1)} KB)
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="text-center mb-4 py-8 border-2 border-dashed border-gray-300 rounded-lg bg-white">
                      <div className="w-16 h-16 mx-auto mb-3 bg-gray-200 rounded-full flex items-center justify-center text-gray-400">
                        🏫
                      </div>
                      <p className="text-gray-500 text-sm">
                        No logo uploaded
                      </p>
                    </div>
                  )}

                  {/* File Upload */}
                  <div className="text-center">
                    <input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="logo-upload"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors duration-200 font-medium text-sm"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      {logoPreview ? 'Change Logo' : 'Upload Logo'}
                    </label>
                    <p className="text-xs text-gray-500 mt-2">
                      PNG, JPG, SVG up to 5MB
                    </p>
                  </div>
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
                {/* Preset Colors */}
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
                            ? "border-blue-600 shadow-xl scale-105"
                            : "border-gray-300 hover:border-blue-300"
                        }`}
                      style={{
                        background: `linear-gradient(135deg, ${preset.value}11, ${preset.value}05)`,
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
                    onChange={(e) =>
                      handleColorChange("custom", e.target.value)
                    }
                    className="w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-300 hover:border-blue-400 transition-colors"
                  />
                  <div>
                    <p className="text-gray-900 font-medium">Custom Color</p>
                    <p className="text-gray-600 text-sm">
                      Choose your own brand color
                    </p>
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
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = previewBg;
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

            {/* Continue Button - CHANGED TO GREEN */}
            <div className="pt-8 border-t border-gray-200">
              <button
                type="button"
                onClick={handleNext}
                disabled={isLoading}
                className={`group relative w-full py-4 px-8 bg-gradient-to-r from-green-600 to-green-700
                  text-white font-bold text-lg rounded-xl transition-all duration-300
                  hover:from-green-500 hover:to-green-600 hover:shadow-2xl hover:shadow-green-500/25
                  focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed
                  transform hover:scale-[1.02] active:scale-[0.98]
                  ${isLoading ? "cursor-wait" : "hover:-translate-y-1"}`}
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