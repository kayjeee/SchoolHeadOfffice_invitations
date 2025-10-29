import React, { useState, useMemo } from 'react';

const Step3Admins = ({
  formData = {},
  theme,
  onAdminUsersChange,
  onNext,
  onPrevious,
  isLoading = false,
}) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [errors, setErrors] = useState({});
  const [focusedField, setFocusedField] = useState(null);
  const [adminUsers, setAdminUsers] = useState(formData.adminUsers || []);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  const themeColor = theme?.value || '#059669';
  const themeHover = adjustBrightness(themeColor, -10);
  const themeLight = adjustBrightness(themeColor, 80);

  const validateAdminInput = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name.trim()) {
      newErrors.name = 'Admin name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (
      email.trim() &&
      adminUsers.some(
        (admin) => admin.email.toLowerCase() === email.toLowerCase()
      )
    ) {
      newErrors.email = 'This email is already added';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addAdmin = () => {
    if (validateAdminInput()) {
      const newAdmin = {
        id: Date.now().toString(),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role: 'Administrator',
        addedAt: new Date().toISOString(),
      };

      const updatedAdmins = [...adminUsers, newAdmin];
      setAdminUsers(updatedAdmins);
      onAdminUsersChange(updatedAdmins);

      // Show success animation
      setShowSuccessAnimation(true);
      setTimeout(() => setShowSuccessAnimation(false), 2000);

      // Clear form
      setEmail('');
      setName('');
      setErrors({});
      setFocusedField(null);
    }
  };

  const removeAdmin = (id) => {
    const updatedAdmins = adminUsers.filter((admin) => admin.id !== id);
    setAdminUsers(updatedAdmins);
    onAdminUsersChange(updatedAdmins);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addAdmin();
    }
  };

  const handleFieldChange = (field, setter) => (e) => {
    setter(e.target.value);
    if (errors[field]) {
      setErrors((prev) => {
        const newErr = { ...prev };
        delete newErr[field];
        return newErr;
      });
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-b from-white via-gray-100 to-white">
        <div 
          className="absolute inset-0 opacity-20"
          style={{ background: `linear-gradient(to right, ${themeColor}20, transparent, ${themeColor}20)` }}
        />
        <div className="relative max-w-6xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 
              className="text-5xl md:text-7xl font-black mb-4 bg-clip-text text-transparent"
              style={{ 
                backgroundImage: `linear-gradient(to right, ${themeColor}, ${adjustBrightness(themeColor, 20)})` 
              }}
            >
              Build Your Team
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 font-light">
              Invite administrators to help manage your school
            </p>
            <div 
              className="mt-4 w-20 h-1 mx-auto rounded-full" 
              style={{ backgroundColor: themeColor }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-br from-gray-50 via-white to-gray-50 rounded-2xl shadow-2xl border border-gray-200">
          <div className="p-8 md:p-12">
            {/* Progress Indicator */}
            <div className="mb-10">
              <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                <span>Step 3 of 4</span>
                <span>75% Complete</span>
              </div>
              <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full w-3/4 transition-all duration-500 ease-out" 
                  style={{ backgroundColor: themeColor }}
                />
              </div>
            </div>

            {/* Main Section */}
            <div className="mb-10">
              <h2 className="text-3xl font-bold mb-4 text-gray-900 flex items-center">
                <div 
                  className="w-2 h-8 rounded-full mr-4" 
                  style={{ backgroundColor: themeColor }}
                />
                Administrator Access
              </h2>
              <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                Add key staff members who will help manage your school platform. After registration is complete, 
                <span className="font-semibold text-gray-800"> each selected administrator will receive an email invitation</span> to 
                create their account and access the admin dashboard.
              </p>

              {/* Info Banner */}
              <div 
                className="mb-8 p-4 rounded-xl border-l-4 flex items-start gap-3"
                style={{ 
                  backgroundColor: `${themeColor}08`,
                  borderColor: themeColor
                }}
              >
                <div 
                  className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                  style={{ backgroundColor: `${themeColor}20` }}
                >
                  💡
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">What happens next?</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Once you complete the registration, we'll send personalized email invitations to all administrators. 
                    They'll receive a secure link to join your school's platform and set up their accounts. 
                    You can add more administrators later from your dashboard.
                  </p>
                </div>
              </div>

              {/* Add Admin Form - Notion Style */}
              <div className="mb-8 p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-xl font-bold shadow-lg"
                    style={{ backgroundColor: themeColor }}
                  >
                    +
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Add Administrator
                  </h3>
                </div>

                <div className="space-y-5">
                  {/* Name Input - Notion Style */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <span>Full Name</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={name}
                        onChange={handleFieldChange('name', setName)}
                        onKeyPress={handleKeyPress}
                        onFocus={() => setFocusedField('name')}
                        onBlur={() => setFocusedField(null)}
                        className={`w-full px-4 py-3.5 bg-white border-2 rounded-lg text-gray-900 placeholder-gray-400
                          transition-all duration-200 focus:outline-none
                          ${errors.name
                            ? 'border-red-500 focus:border-red-500'
                            : 'border-gray-200 hover:border-gray-300'
                          }
                          ${focusedField === 'name' ? 'shadow-lg' : 'shadow-sm'}`}
                        style={focusedField === 'name' && !errors.name ? { borderColor: themeColor } : {}}
                        placeholder="e.g., Dr. Sarah Johnson"
                      />
                      {focusedField === 'name' && !errors.name && (
                        <div 
                          className="absolute -inset-0.5 rounded-lg opacity-20 blur -z-10" 
                          style={{ backgroundColor: themeColor }}
                        />
                      )}
                    </div>
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                        <span>⚠️</span>
                        {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Email Input - Notion Style */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <span>Email Address</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={email}
                        onChange={handleFieldChange('email', setEmail)}
                        onKeyPress={handleKeyPress}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                        className={`w-full px-4 py-3.5 bg-white border-2 rounded-lg text-gray-900 placeholder-gray-400
                          transition-all duration-200 focus:outline-none
                          ${errors.email
                            ? 'border-red-500 focus:border-red-500'
                            : 'border-gray-200 hover:border-gray-300'
                          }
                          ${focusedField === 'email' ? 'shadow-lg' : 'shadow-sm'}`}
                        style={focusedField === 'email' && !errors.email ? { borderColor: themeColor } : {}}
                        placeholder="sarah.johnson@school.edu"
                      />
                      {focusedField === 'email' && !errors.email && (
                        <div 
                          className="absolute -inset-0.5 rounded-lg opacity-20 blur -z-10" 
                          style={{ backgroundColor: themeColor }}
                        />
                      )}
                    </div>
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                        <span>⚠️</span>
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Add Button */}
                  <button
                    type="button"
                    onClick={addAdmin}
                    disabled={!name.trim() || !email.trim()}
                    className={`w-full py-3.5 rounded-lg font-semibold text-white transition-all duration-300 shadow-md
                      ${name.trim() && email.trim()
                        ? 'hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]'
                        : 'opacity-50 cursor-not-allowed'
                      }`}
                    style={{ 
                      backgroundColor: name.trim() && email.trim() ? themeColor : '#d1d5db' 
                    }}
                    onMouseEnter={(e) => {
                      if (name.trim() && email.trim()) {
                        e.currentTarget.style.backgroundColor = themeHover;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (name.trim() && email.trim()) {
                        e.currentTarget.style.backgroundColor = themeColor;
                      }
                    }}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-lg">+</span>
                      <span>Add Administrator</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Success Animation */}
              {showSuccessAnimation && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 animate-fade-in">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">
                    ✓
                  </div>
                  <p className="text-green-800 font-medium">Administrator added successfully!</p>
                </div>
              )}

              {/* Admin List - Notion Style */}
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                      style={{ backgroundColor: themeColor }}
                    >
                      {adminUsers.length}
                    </div>
                    <span>Admin Members</span>
                  </h3>
                  {adminUsers.length > 0 && (
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <span>📧</span>
                      <span>Will receive invitations</span>
                    </span>
                  )}
                </div>

                {adminUsers.length > 0 ? (
                  <div className="space-y-3">
                    {adminUsers.map((admin, index) => (
                      <div
                        key={admin.id}
                        className="group relative bg-white border-2 border-gray-200 rounded-xl p-5 hover:border-gray-300 hover:shadow-lg transition-all duration-300"
                        style={{
                          animation: `slideIn 0.3s ease-out ${index * 0.1}s both`
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <div 
                              className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md"
                              style={{ backgroundColor: themeColor }}
                            >
                              {admin.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900 text-lg mb-1">
                                {admin.name}
                              </p>
                              <p className="text-gray-600 text-sm mb-2 flex items-center gap-2">
                                <span>📧</span>
                                <span>{admin.email}</span>
                              </p>
                              <div className="flex items-center gap-2">
                                <span 
                                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
                                  style={{ 
                                    backgroundColor: `${themeColor}15`,
                                    color: themeColor
                                  }}
                                >
                                  Administrator
                                </span>
                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                  <span>🔔</span>
                                  <span>Invitation pending</span>
                                </span>
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeAdmin(admin.id)}
                            className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-100 text-gray-500 hover:bg-red-500 hover:text-white transition-all duration-200 font-bold text-xl opacity-0 group-hover:opacity-100"
                            title={`Remove ${admin.name}`}
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                    <div 
                      className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl"
                      style={{ backgroundColor: themeLight }}
                    >
                      👥
                    </div>
                    <p className="text-gray-900 font-semibold text-lg mb-2">
                      No administrators added yet
                    </p>
                    <p className="text-gray-500 text-sm max-w-md mx-auto">
                      Add your first team member above. They'll receive an email invitation once you complete the registration.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="pt-8 border-t border-gray-200 flex gap-4">
              <button
                type="button"
                onClick={onPrevious}
                className="flex-1 py-4 px-8 bg-white text-black font-bold text-lg rounded-xl border-2 border-gray-300 transition-all duration-300 hover:border-gray-400 hover:shadow-lg focus:outline-none focus:ring-0 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="flex items-center justify-center gap-2">
                  <span>←</span>
                  <span>Previous</span>
                </div>
              </button>

              <button
                type="button"
                onClick={onNext}
                disabled={isLoading}
                className={`flex-1 py-4 px-8 text-white font-bold text-lg rounded-xl transition-all duration-300 hover:shadow-2xl focus:outline-none focus:ring-0 transform hover:scale-[1.02] active:scale-[0.98] hover:-translate-y-1 ${
                  isLoading ? 'cursor-wait opacity-50' : ''
                }`}
                style={{ 
                  backgroundColor: themeColor,
                  boxShadow: `0 10px 30px ${themeColor}40`
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.backgroundColor = themeHover;
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = themeColor;
                }}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <span>Continue</span>
                    <span>→</span>
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Background Pattern */}
      <div className="fixed inset-0 -z-10 opacity-5">
        <div 
          className="absolute inset-0"
          style={{ 
            background: `linear-gradient(to bottom right, ${themeColor}20, transparent, ${themeColor}20)` 
          }}
        />
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

// Helper function
function adjustBrightness(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, Math.max(0, (num >> 16) + amt));
  const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amt));
  const B = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));
  return `#${((R << 16) | (G << 8) | B).toString(16).padStart(6, '0')}`;
}

export default Step3Admins;