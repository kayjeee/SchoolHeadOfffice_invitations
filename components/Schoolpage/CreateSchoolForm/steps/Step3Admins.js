import React, { useState, useMemo } from 'react';
import useColorMode from '../hooks/useColorMode';
import { getBackgroundColor, getHoverColor } from '../utils/colorUtils';
import Button from '../components/themed/Button';
import Input from '../components/themed/Input';

const Step3Admins = ({
  formData = {},
  onAdminUsersChange,
  onNext,
  onPrevious,
  isLoading = false,
}) => {
  const [colorMode, customColor] = useColorMode();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [errors, setErrors] = useState({});
  const [focusedField, setFocusedField] = useState(null);
  const [adminUsers, setAdminUsers] = useState(formData.adminUsers || []);

  const { previewBg, previewHover } = useMemo(
    () => ({
      previewBg: getBackgroundColor(colorMode, customColor),
      previewHover: getHoverColor(colorMode, customColor),
    }),
    [colorMode, customColor]
  );

  const validateAdminInput = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name.trim()) {
      newErrors.name = 'Admin name is required';
    }
    if (!email.trim() || !emailRegex.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (
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

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-6xl mx-auto px-4 py-12 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4 text-blue-600">
            Build Your Team
          </h1>
          <p className="text-lg md:text-xl text-gray-600">
            Add administrators to manage your school platform
          </p>
          <div className="mt-4 w-20 h-1 bg-blue-500 mx-auto rounded-full" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200">
          <div className="p-8 md:p-12">
            {/* Progress */}
            <div className="mb-10">
              <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                <span>Step 3 of 4</span>
                <span>75% Complete</span>
              </div>
              <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full w-3/4 bg-blue-500 transition-all duration-500 ease-out" />
              </div>
            </div>

            {/* Admin Section */}
            <div className="mb-10">
              <h2 className="text-3xl font-bold mb-4 flex items-center">
                <div className="w-2 h-8 bg-blue-500 rounded-full mr-3" />
                Admin Team Setup
              </h2>
              <p className="text-gray-600 mb-8">
                Add key staff members who will help manage your school platform.
                They'll receive invitation emails to create their accounts.
              </p>

              {/* Add Admin Form */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mb-8">
                <h3 className="text-lg font-semibold mb-6 flex items-center gap-3 text-blue-700">
                  <span className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                    +
                  </span>
                  Add New Administrator
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <Input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none ${
                        errors.name
                          ? 'border-red-500 focus:border-red-500'
                          : 'border-gray-300 focus:border-blue-500'
                      }`}
                      placeholder="e.g., Dr. Sarah Johnson"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none ${
                        errors.email
                          ? 'border-red-500 focus:border-red-500'
                          : 'border-gray-300 focus:border-blue-500'
                      }`}
                      placeholder="sarah.johnson@school.edu"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                    )}
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={addAdmin}
                  disabled={!name.trim() || !email.trim()}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all`}
                >
                  Add Administrator
                </Button>
              </div>

              {/* Admin List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold flex items-center gap-3">
                    <span className="w-6 h-6 bg-blue-500 text-white rounded flex items-center justify-center text-sm font-bold">
                      {adminUsers.length}
                    </span>
                    Team Members
                  </h3>
                  {adminUsers.length > 0 && (
                    <span className="text-sm text-gray-500">
                      Click × to remove
                    </span>
                  )}
                </div>

                {adminUsers.length > 0 ? (
                  <div className="space-y-3">
                    {adminUsers.map((admin) => (
                      <div
                        key={admin.id}
                        className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl p-4 hover:shadow-sm transition"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-lg">
                            {admin.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold">{admin.name}</p>
                            <p className="text-gray-600 text-sm">
                              {admin.email}
                            </p>
                            <span className="inline-block px-2 py-1 mt-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                              Administrator
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAdmin(admin.id)}
                          className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 hover:bg-red-500 hover:text-white transition"
                          title={`Remove ${admin.name}`}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      👥
                    </div>
                    <p className="text-gray-600 font-medium">
                      No administrators added yet
                    </p>
                    <p className="text-gray-400 text-sm">
                      Add your first team member above to get started
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Navigation */}
            <div className="pt-8 border-t border-gray-200 flex justify-between items-center">
              <Button
                type="button"
                onClick={onPrevious}
                variant="secondary"
                className="px-6 py-3 font-semibold rounded-lg transition"
              >
                ← Previous Step
              </Button>

              <Button
                type="button"
                onClick={onNext}
                disabled={isLoading}
                className={`px-8 py-3 rounded-lg font-bold transition`}
              >
                {isLoading ? 'Processing...' : 'Continue to Social Links →'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step3Admins;
