import React, { useState } from 'react';
import { FiX, FiEdit, FiMail, FiPhone, FiUser, FiCalendar, FiMapPin, FiHeart, FiSave, FiTrash2 } from 'react-icons/fi';

const LearnerDetail = ({ isOpen, onClose, learner }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedLearner, setEditedLearner] = useState(learner || {});
  const [activeTab, setActiveTab] = useState('personal');

  // Update editedLearner when learner prop changes
  React.useEffect(() => {
    if (learner) {
      setEditedLearner(learner);
    }
  }, [learner]);

  const handleInputChange = (field, value) => {
    setEditedLearner(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Updating learner:', editedLearner);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating learner:', error);
    }
  };

  const handleCancel = () => {
    setEditedLearner(learner);
    setIsEditing(false);
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-ZA');
  };

  const getStatusBadge = (status) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    switch (status) {
      case 'active':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'inactive':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  if (!isOpen || !learner) return null;

  const tabs = [
    { id: 'personal', name: 'Personal Info', icon: FiUser },
    { id: 'contact', name: 'Contact Details', icon: FiPhone },
    { id: 'medical', name: 'Medical Info', icon: FiHeart },
    { id: 'academic', name: 'Academic Records', icon: FiCalendar },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Header */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-12 w-12">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <FiUser className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {editedLearner.firstName} {editedLearner.lastName}
                  </h3>
                  <div className="flex items-center space-x-4 mt-1">
                    <p className="text-sm text-gray-500">ID: {editedLearner.studentId}</p>
                    <span className={getStatusBadge(editedLearner.status)}>
                      {editedLearner.status?.charAt(0).toUpperCase() + editedLearner.status?.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSave}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <FiSave className="mr-1 h-4 w-4" />
                      Save
                    </button>
                    <button
                      onClick={handleCancel}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <FiEdit className="mr-1 h-4 w-4" />
                    Edit
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="mt-4">
              <nav className="-mb-px flex space-x-8">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {tab.name}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <div className="px-4 py-5 sm:p-6">
            {activeTab === 'personal' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedLearner.firstName || ''}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    ) : (
                      <p className="text-sm text-gray-900">{editedLearner.firstName || 'N/A'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedLearner.lastName || ''}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    ) : (
                      <p className="text-sm text-gray-900">{editedLearner.lastName || 'N/A'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth
                    </label>
                    {isEditing ? (
                      <input
                        type="date"
                        value={editedLearner.dateOfBirth || ''}
                        onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    ) : (
                      <p className="text-sm text-gray-900">{formatDate(editedLearner.dateOfBirth)}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Age
                    </label>
                    <p className="text-sm text-gray-900">{calculateAge(editedLearner.dateOfBirth)} years</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Student ID
                    </label>
                    <p className="text-sm text-gray-900">{editedLearner.studentId || 'N/A'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Enrollment Date
                    </label>
                    <p className="text-sm text-gray-900">{formatDate(editedLearner.enrollmentDate)}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  {isEditing ? (
                    <textarea
                      rows={3}
                      value={editedLearner.address || ''}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  ) : (
                    <p className="text-sm text-gray-900">{editedLearner.address || 'N/A'}</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'contact' && (
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Learner Contact</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      {isEditing ? (
                        <input
                          type="email"
                          value={editedLearner.email || ''}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      ) : (
                        <div className="flex items-center">
                          <p className="text-sm text-gray-900">{editedLearner.email || 'N/A'}</p>
                          {editedLearner.email && (
                            <a
                              href={`mailto:${editedLearner.email}`}
                              className="ml-2 text-blue-600 hover:text-blue-900"
                            >
                              <FiMail className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone
                      </label>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={editedLearner.phone || ''}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      ) : (
                        <div className="flex items-center">
                          <p className="text-sm text-gray-900">{editedLearner.phone || 'N/A'}</p>
                          {editedLearner.phone && (
                            <a
                              href={`tel:${editedLearner.phone}`}
                              className="ml-2 text-blue-600 hover:text-blue-900"
                            >
                              <FiPhone className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Parent/Guardian Contact</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Parent/Guardian Name
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedLearner.parentName || ''}
                          onChange={(e) => handleInputChange('parentName', e.target.value)}
                          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      ) : (
                        <p className="text-sm text-gray-900">{editedLearner.parentName || 'N/A'}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Emergency Contact
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedLearner.emergencyContact || ''}
                          onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      ) : (
                        <p className="text-sm text-gray-900">{editedLearner.emergencyContact || 'N/A'}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Parent Email
                      </label>
                      {isEditing ? (
                        <input
                          type="email"
                          value={editedLearner.parentEmail || ''}
                          onChange={(e) => handleInputChange('parentEmail', e.target.value)}
                          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      ) : (
                        <div className="flex items-center">
                          <p className="text-sm text-gray-900">{editedLearner.parentEmail || 'N/A'}</p>
                          {editedLearner.parentEmail && (
                            <a
                              href={`mailto:${editedLearner.parentEmail}`}
                              className="ml-2 text-blue-600 hover:text-blue-900"
                            >
                              <FiMail className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Parent Phone
                      </label>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={editedLearner.parentPhone || ''}
                          onChange={(e) => handleInputChange('parentPhone', e.target.value)}
                          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      ) : (
                        <div className="flex items-center">
                          <p className="text-sm text-gray-900">{editedLearner.parentPhone || 'N/A'}</p>
                          {editedLearner.parentPhone && (
                            <a
                              href={`tel:${editedLearner.parentPhone}`}
                              className="ml-2 text-blue-600 hover:text-blue-900"
                            >
                              <FiPhone className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'medical' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Medical Information
                  </label>
                  {isEditing ? (
                    <textarea
                      rows={4}
                      value={editedLearner.medicalInfo || ''}
                      onChange={(e) => handleInputChange('medicalInfo', e.target.value)}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Enter any medical conditions, allergies, medications, or special requirements..."
                    />
                  ) : (
                    <div className="bg-gray-50 rounded-md p-3">
                      <p className="text-sm text-gray-900">
                        {editedLearner.medicalInfo || 'No medical information provided'}
                      </p>
                    </div>
                  )}
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <FiHeart className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        Important Medical Notes
                      </h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <ul className="list-disc list-inside space-y-1">
                          <li>Always verify medical information with parents/guardians</li>
                          <li>Keep emergency contact information up to date</li>
                          <li>Inform relevant staff about any medical conditions</li>
                          <li>Ensure proper medication storage and administration procedures</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'academic' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">85%</div>
                    <div className="text-xs text-blue-600">Overall Average</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">92%</div>
                    <div className="text-xs text-green-600">Attendance Rate</div>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-600">3</div>
                    <div className="text-xs text-yellow-600">Assignments Due</div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Recent Grades</h4>
                  <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <ul className="divide-y divide-gray-200">
                      {[
                        { subject: 'Mathematics', grade: 'A', date: '2024-01-15', assignment: 'Algebra Test' },
                        { subject: 'English', grade: 'B+', date: '2024-01-12', assignment: 'Essay Writing' },
                        { subject: 'Science', grade: 'A-', date: '2024-01-10', assignment: 'Lab Report' },
                        { subject: 'History', grade: 'B', date: '2024-01-08', assignment: 'Research Project' },
                      ].map((item, index) => (
                        <li key={index}>
                          <div className="px-4 py-4 flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="text-sm font-medium text-gray-900">{item.subject}</div>
                              <div className="ml-2 text-sm text-gray-500">{item.assignment}</div>
                            </div>
                            <div className="flex items-center">
                              <div className="text-sm text-gray-500 mr-4">{formatDate(item.date)}</div>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                item.grade.startsWith('A') ? 'bg-green-100 text-green-800' :
                                item.grade.startsWith('B') ? 'bg-blue-100 text-blue-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {item.grade}
                              </span>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Attendance Summary</h4>
                  <div className="bg-gray-50 rounded-md p-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-lg font-semibold text-green-600">138</div>
                        <div className="text-xs text-gray-500">Present</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-red-600">12</div>
                        <div className="text-xs text-gray-500">Absent</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-yellow-600">5</div>
                        <div className="text-xs text-gray-500">Late</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-blue-600">150</div>
                        <div className="text-xs text-gray-500">Total Days</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onClose}
              className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:w-auto sm:text-sm"
            >
              Close
            </button>
            {!isEditing && (
              <button
                type="button"
                className="mt-3 w-full inline-flex justify-center rounded-md border border-red-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-red-700 hover:bg-red-50 sm:mt-0 sm:mr-3 sm:w-auto sm:text-sm"
              >
                <FiTrash2 className="mr-2 h-4 w-4" />
                Remove Learner
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearnerDetail;

