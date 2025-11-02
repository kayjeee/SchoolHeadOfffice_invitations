import React, { useState, useMemo } from 'react';

const Step4Review = ({
  formData = {},
  theme,
  onPrevious,
  onSubmit,
  isLoading = false,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const themeColor = theme?.value || '#059669';
  const themeHover = adjustBrightness(themeColor, -10);

  // Extract all form data
  const schoolInfo = formData || {};
  const themeInfo = formData.theme || {};
  const adminUsers = formData.adminUsers || [];
  const socialInfo = {
    website: formData.website || '',
    facebook: formData.facebook || '',
    tiktok: formData.tiktok || '',
    linkedin: formData.linkedin || ''
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format phone number for display
  const formatPhoneNumber = (phone) => {
    if (!phone) return 'Not provided';
    // Basic formatting - you can enhance this based on your needs
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
  };

  // Format address for display
  const formatAddress = () => {
    const parts = [
      formData.addressLine1,
      formData.addressLine2,
      formData.city,
      formData.province,
      formData.postalCode,
      formData.country
    ].filter(Boolean);
    
    return parts.length > 0 ? parts.join(', ') : 'Not provided';
  };

  // Check if any social media is provided
  const hasSocialMedia = Object.values(socialInfo).some(value => value.trim());

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
              Ready to Launch
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 font-light">
              Review your school setup before going live
            </p>
            <div 
              className="mt-4 w-20 h-1 mx-auto rounded-full" 
              style={{ backgroundColor: themeColor }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-br from-gray-50 via-white to-gray-50 rounded-2xl shadow-2xl border border-gray-200">
          <div className="p-8 md:p-12">
            {/* Progress Indicator */}
            <div className="mb-10">
              <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                <span>Step 4 of 4</span>
                <span>100% Complete</span>
              </div>
              <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full w-full transition-all duration-500 ease-out" 
                  style={{ backgroundColor: themeColor }}
                />
              </div>
            </div>

            {/* Main Content */}
            <div className="mb-10">
              <h2 className="text-3xl font-bold mb-8 text-gray-900 flex items-center">
                <div 
                  className="w-2 h-8 rounded-full mr-4" 
                  style={{ backgroundColor: themeColor }}
                />
                Complete School Overview
              </h2>

              {/* Success Banner */}
              <div 
                className="mb-8 p-6 rounded-xl border-l-4 flex items-start gap-4"
                style={{ 
                  backgroundColor: `${themeColor}08`,
                  borderColor: themeColor
                }}
              >
                <div 
                  className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                  style={{ backgroundColor: `${themeColor}20` }}
                >
                  🎉
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 text-lg mb-2">You're almost there!</h4>
                  <p className="text-gray-600 leading-relaxed">
                    Everything looks perfect! Once you click "Launch School Platform", we'll set up your school account, 
                    configure your dashboard, and send invitation emails to all administrators. You'll be redirected to 
                    your new school dashboard immediately.
                  </p>
                </div>
              </div>

              {/* School Information Card */}
              <div className="mb-6 p-6 bg-white rounded-xl border-2 border-gray-200 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg font-bold"
                    style={{ backgroundColor: themeColor }}
                  >
                    🏫
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">School Information</h3>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <InfoField 
                      label="School Name" 
                      value={schoolInfo.schoolName} 
                      themeColor={themeColor}
                    />
                    <InfoField 
                      label="Contact Email" 
                      value={schoolInfo.schoolEmail} 
                      themeColor={themeColor}
                      type="email"
                    />
                    <InfoField 
                      label="Phone Number" 
                      value={formatPhoneNumber(schoolInfo.phone)} 
                      themeColor={themeColor}
                    />
                  </div>
                  <div className="space-y-4">
                    <InfoField 
                      label="School Logo" 
                      value={schoolInfo.logo ? '✓ Uploaded' : 'No logo uploaded'} 
                      themeColor={themeColor}
                    />
                    <InfoField 
                      label="School Status" 
                      value={schoolInfo.status || 'Active'} 
                      themeColor={themeColor}
                    />
                  </div>
                </div>
              </div>

              {/* Address Information Card */}
              <div className="mb-6 p-6 bg-white rounded-xl border-2 border-gray-200 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg font-bold"
                    style={{ backgroundColor: themeColor }}
                  >
                    📍
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Address Information</h3>
                </div>
                
                <div className="space-y-4">
                  <InfoField 
                    label="Full Address" 
                    value={formatAddress()} 
                    themeColor={themeColor}
                    fullWidth
                  />
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <InfoField 
                        label="Address Line 1" 
                        value={formData.addressLine1} 
                        themeColor={themeColor}
                      />
                      <InfoField 
                        label="Address Line 2" 
                        value={formData.addressLine2 || 'Not provided'} 
                        themeColor={themeColor}
                      />
                      <InfoField 
                        label="City" 
                        value={formData.city} 
                        themeColor={themeColor}
                      />
                    </div>
                    <div className="space-y-4">
                      <InfoField 
                        label="Province/State" 
                        value={formData.province} 
                        themeColor={themeColor}
                      />
                      <InfoField 
                        label="Postal Code" 
                        value={formData.postalCode} 
                        themeColor={themeColor}
                      />
                      <InfoField 
                        label="Country" 
                        value={formData.country} 
                        themeColor={themeColor}
                      />
                    </div>
                  </div>

                  {formData.location && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <label className="block text-sm font-medium text-gray-500 mb-2">Map Location</label>
                      <p className="text-gray-900 font-semibold">
                        ✓ Location pinned on map (Lat: {formData.location.lat?.toFixed(6)}, Lng: {formData.location.lng?.toFixed(6)})
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Theme Information Card */}
              <div className="mb-6 p-6 bg-white rounded-xl border-2 border-gray-200 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg font-bold"
                    style={{ backgroundColor: themeColor }}
                  >
                    🎨
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Brand & Theme</h3>
                </div>
                
                <div className="flex items-center gap-6">
                  <div 
                    className="w-20 h-20 rounded-xl shadow-lg border border-gray-200"
                    style={{ backgroundColor: themeInfo.value || themeColor }}
                  />
                  <div className="space-y-2">
                    <InfoField 
                      label="Theme Color" 
                      value={themeInfo.mode === 'custom' ? 'Custom Color' : (themeInfo.name || 'Default Theme')} 
                      themeColor={themeColor}
                    />
                    <InfoField 
                      label="Color Code" 
                      value={themeInfo.value || themeColor} 
                      themeColor={themeColor}
                    />
                    <InfoField 
                      label="Theme Mode" 
                      value={themeInfo.mode ? themeInfo.mode.charAt(0).toUpperCase() + themeInfo.mode.slice(1) : 'Default'} 
                      themeColor={themeColor}
                    />
                  </div>
                </div>
              </div>

              {/* Social Media Card */}
              <div className="mb-6 p-6 bg-white rounded-xl border-2 border-gray-200 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg font-bold"
                    style={{ backgroundColor: themeColor }}
                  >
                    🌐
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Social Media & Website</h3>
                </div>

                {hasSocialMedia ? (
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <InfoField 
                        label="Website" 
                        value={socialInfo.website} 
                        themeColor={themeColor}
                        type="url"
                      />
                      <InfoField 
                        label="Facebook" 
                        value={socialInfo.facebook} 
                        themeColor={themeColor}
                        type="url"
                      />
                    </div>
                    <div className="space-y-4">
                      <InfoField 
                        label="TikTok" 
                        value={socialInfo.tiktok} 
                        themeColor={themeColor}
                        type="url"
                      />
                      <InfoField 
                        label="LinkedIn" 
                        value={socialInfo.linkedin} 
                        themeColor={themeColor}
                        type="url"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                    <div 
                      className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl"
                      style={{ backgroundColor: `${themeColor}20` }}
                    >
                      🌐
                    </div>
                    <p className="text-gray-900 font-semibold mb-2">No social media links added</p>
                    <p className="text-gray-500 text-sm">
                      You can add social media links later from your dashboard
                    </p>
                  </div>
                )}
              </div>

              {/* Administrators Card */}
              <div className="p-6 bg-white rounded-xl border-2 border-gray-200 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg font-bold"
                    style={{ backgroundColor: themeColor }}
                  >
                    👥
                  </div>
                  <div className="flex items-center gap-4 flex-1">
                    <h3 className="text-xl font-bold text-gray-900">Administrator Team</h3>
                    <span 
                      className="px-3 py-1 rounded-full text-sm font-semibold"
                      style={{ 
                        backgroundColor: `${themeColor}15`,
                        color: themeColor
                      }}
                    >
                      {adminUsers.length} member{adminUsers.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {adminUsers.length > 0 ? (
                  <div className="space-y-4">
                    {adminUsers.map((admin, index) => (
                      <div
                        key={admin.id}
                        className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200"
                      >
                        <div 
                          className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold shadow-sm"
                          style={{ backgroundColor: themeColor }}
                        >
                          {admin.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 text-lg">{admin.name}</p>
                          <p className="text-gray-600 text-sm mb-2">{admin.email}</p>
                          <div className="flex items-center gap-2">
                            <span 
                              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
                              style={{ 
                                backgroundColor: `${themeColor}15`,
                                color: themeColor
                              }}
                            >
                              {admin.role || 'Administrator'}
                            </span>
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <span>📧</span>
                              <span>Invitation pending</span>
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">
                            Added: {new Date(admin.addedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    <p className="text-sm text-gray-500 mt-4 flex items-center gap-2">
                      <span>📧</span>
                      <span>Invitation emails will be sent immediately after launch</span>
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                    <div 
                      className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl"
                      style={{ backgroundColor: `${themeColor}20` }}
                    >
                      👥
                    </div>
                    <p className="text-gray-900 font-semibold mb-2">No administrators added</p>
                    <p className="text-gray-500 text-sm">
                      You can add administrators later from your dashboard
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
                onClick={handleSubmit}
                disabled={isLoading || isSubmitting}
                className={`flex-1 py-4 px-8 text-white font-bold text-lg rounded-xl transition-all duration-300 hover:shadow-2xl focus:outline-none focus:ring-0 transform hover:scale-[1.02] active:scale-[0.98] hover:-translate-y-1 ${
                  isLoading || isSubmitting ? 'cursor-wait opacity-50' : ''
                }`}
                style={{ 
                  backgroundColor: themeColor,
                  boxShadow: `0 10px 30px ${themeColor}40`
                }}
                onMouseEnter={(e) => {
                  if (!isLoading && !isSubmitting) {
                    e.currentTarget.style.backgroundColor = themeHover;
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = themeColor;
                }}
              >
                {isLoading || isSubmitting ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Launching Platform...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <span>🚀 Launch School Platform</span>
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
    </div>
  );
};

// Reusable InfoField component
const InfoField = ({ label, value, themeColor, type = 'text', fullWidth = false }) => (
  <div className={fullWidth ? 'w-full' : ''}>
    <label className="block text-sm font-medium text-gray-500 mb-1">{label}</label>
    <p className={`text-gray-900 font-semibold ${fullWidth ? 'text-lg' : 'text-md'} break-words`}>
      {value || 'Not provided'}
    </p>
  </div>
);

// Helper function
function adjustBrightness(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, Math.max(0, (num >> 16) + amt));
  const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amt));
  const B = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));
  return `#${((R << 16) | (G << 8) | B).toString(16).padStart(6, '0')}`;
}

export default Step4Review;