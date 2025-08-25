import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiUsers, FiMail, FiSettings, FiX, FiAlertCircle } from 'react-icons/fi';
import { FaGraduationCap } from 'react-icons/fa';
import axios from 'axios';
import CreateGradeModal from './GradesCRUD/CreateGradeModal';
import EditGradeModal from './GradesCRUD/EditGradeModal';
import DeleteGradeModal from './GradesCRUD/DeleteGradeModal';
import LearnersTable from './LearnersManager/LearnersTable';
import LearnersFilters from './LearnersManager/LearnersFilters';
import BulkUpload from './LearnersManager/BulkUpload';
import LearnerDetail from './LearnersManager/LearnerDetail';
import TemplateManager from './Invitations/TemplateManager';
import InvitationComposer from './Invitations/InvitationComposer/InvitationComposer';
import StatusTracker from './Invitations/StatusTracker';
import CreditSystem from './Invitations/CreditSystem';

const GradesContainer = ({ selectedSchool, user, schools, grades: propGrades = [] }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [selectedLearner, setSelectedLearner] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [showInvitationModal, setShowInvitationModal] = useState(false);
  const [selectedGradeForInvite, setSelectedGradeForInvite] = useState(null);
  const [grades, setGrades] = useState(propGrades || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Update local state when prop changes
  useEffect(() => {
    console.log('GradesContainer - propGrades changed:', propGrades?.length || 0);
    setGrades(propGrades || []);
  }, [propGrades]);

  // Debug selectedSchool changes
  useEffect(() => {
    console.log('GradesContainer - selectedSchool prop changed:', selectedSchool);
  }, [selectedSchool]);

  // Log component props on mount
  useEffect(() => {
    console.log('GradesContainer mounted with props:', {
      selectedSchool,
      user,
      schools,
      gradesCount: propGrades?.length || 0
    });
  }, []);

  // Log grades whenever they change
  useEffect(() => {
    console.log('Grades updated:', grades);
  }, [grades]);

  const handleCreateGrade = async (newGrade) => {
    console.log('Creating new grade:', newGrade);
    try {
      const token = localStorage.getItem('authToken');
      await axios.post(
        `http://localhost:4000/api/v1/schools/${selectedSchool.id}/grades`,
        {
          grade: newGrade
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('Grade created successfully');
      // Note: We can't refresh the list here since we're not fetching locally
      // The parent component should handle refreshing the grades list
      setShowCreateModal(false);
      
      // Show success message and suggest manual refresh
      alert('Grade created successfully! The grades list will need to be refreshed.');
    } catch (err) {
      console.error('Error creating grade:', err);
      throw err; // Let the modal handle the error
    }
  };

  const handleUpdateGrade = async (updatedGrade) => {
    console.log('Updating grade:', selectedGrade.id, 'with data:', updatedGrade);
    try {
      const token = localStorage.getItem('authToken');
      await axios.patch(
        `http://localhost:4000/api/v1/grades/${selectedGrade.id}`,
        {
          grade: updatedGrade
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('Grade updated successfully');
      // Note: We can't refresh the list here since we're not fetching locally
      // The parent component should handle refreshing the grades list
      setShowEditModal(false);
      
      // Show success message and suggest manual refresh
      alert('Grade updated successfully! The grades list will need to be refreshed.');
    } catch (err) {
      console.error('Error updating grade:', err);
      throw err; // Let the modal handle the error
    }
  };

  const handleDeleteGrade = async () => {
    console.log('Deleting grade:', selectedGrade.id);
    try {
      const token = localStorage.getItem('authToken');
      await axios.delete(
        `http://localhost:4000/api/v1/grades/${selectedGrade.id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      console.log('Grade deleted successfully');
      // Note: We can't refresh the list here since we're not fetching locally
      // The parent component should handle refreshing the grades list
      setShowDeleteModal(false);
      
      // Show success message and suggest manual refresh
      alert('Grade deleted successfully! The grades list will need to be refreshed.');
    } catch (err) {
      console.error('Error deleting grade:', err);
      throw err; // Let the modal handle the error
    }
  };

  const handleEditGrade = (grade) => {
    console.log('Editing grade:', grade);
    setSelectedGrade(grade);
    setShowEditModal(true);
  };

  const handleDeleteGradeClick = (grade) => {
    console.log('Delete grade clicked:', grade);
    setSelectedGrade(grade);
    setShowDeleteModal(true);
  };

  const handleViewLearners = (grade) => {
    console.log('Viewing learners for grade:', grade);
    setSelectedGrade(grade);
    setActiveTab('learners');
  };

  const handleOpenInvitationModal = (grade) => {
    console.log('Opening invitation modal for grade:', grade);
    setSelectedGradeForInvite(grade);
    setShowInvitationModal(true);
  };

  const handleInvitationSent = (result) => {
    console.log('Invitation sent successfully:', result);
    setShowInvitationModal(false);
  };

  // Log active tab changes
  useEffect(() => {
    console.log('Active tab changed to:', activeTab);
  }, [activeTab]);

  const renderTabContent = () => {
    console.log('Rendering tab content for:', activeTab);
    
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Grades Management</h2>
                <p className="text-gray-600">Manage grades, learners, and invitations for {selectedSchool?.schoolName || 'your school'}</p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={!selectedSchool?.id}
              >
                <FiPlus className="mr-2 h-4 w-4" />
                Create Grade
              </button>
            </div>

            {!selectedSchool?.id && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      Please select a school to view and manage grades.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <FaGraduationCap className="h-6 w-6 text-blue-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Grades</dt>
                        <dd className="text-lg font-medium text-gray-900">{grades.length}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <FiUsers className="h-6 w-6 text-green-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Learners</dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {grades.reduce((sum, grade) => sum + (grade.learners_count || grade.current_enrollment || 0), 0)}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <FiMail className="h-6 w-6 text-yellow-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Pending Invitations</dt>
                        <dd className="text-lg font-medium text-gray-900">12</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <FiSettings className="h-6 w-6 text-purple-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Active Templates</dt>
                        <dd className="text-lg font-medium text-gray-900">3</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Grades Table */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Grades List</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Overview of all grades in your school
                </p>
              </div>
              {grades.length === 0 && selectedSchool?.id ? (
                <div className="px-4 py-8 text-center text-gray-500">
                  <FaGraduationCap className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">No grades found</p>
                  <p className="text-sm text-gray-500 mb-4">Create your first grade to get started.</p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200"
                  >
                    <FiPlus className="mr-2 h-4 w-4" />
                    Create Grade
                  </button>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {grades.map((grade) => (
                    <li key={grade.id}>
                      <div className="px-4 py-4 flex items-center justify-between hover:bg-gray-50">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <FaGraduationCap className="h-5 w-5 text-blue-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{grade.name}</div>
                            <div className="text-sm text-gray-500">{grade.description || 'No description'}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-sm text-gray-500">
                            <span className="font-medium">{grade.learners_count || grade.current_enrollment || 0}</span> learners
                          </div>
                          <div className="text-sm text-gray-500">
                            <span className="font-medium">{grade.teachers_count || 0}</span> teachers
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleViewLearners(grade)}
                              className="text-blue-600 hover:text-blue-900 text-sm font-medium px-2 py-1 rounded hover:bg-blue-50"
                            >
                              View Learners
                            </button>
                            <button
                              onClick={() => handleOpenInvitationModal(grade)}
                              className="text-green-600 hover:text-green-900 text-sm font-medium flex items-center px-2 py-1 rounded hover:bg-green-50"
                            >
                              <FiMail className="mr-1 h-4 w-4" />
                              Send Invitations
                            </button>
                            <button
                              onClick={() => handleEditGrade(grade)}
                              className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                            >
                              <FiEdit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteGradeClick(grade)}
                              className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                            >
                              <FiTrash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        );

      case 'learners':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Learners Management {selectedGrade && `- ${selectedGrade.name}`}
                </h2>
                <p className="text-gray-600">Manage learners and their details</p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowBulkUpload(true)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <FiPlus className="mr-2 h-4 w-4" />
                  Bulk Upload
                </button>
                <button
                  onClick={() => setActiveTab('overview')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  Back to Overview
                </button>
              </div>
            </div>

            <LearnersFilters selectedGrade={selectedGrade} />
            <LearnersTable 
              selectedGrade={selectedGrade} 
              onSelectLearner={setSelectedLearner}
              onOpenInvitationModal={handleOpenInvitationModal}
            />
          </div>
        );

      case 'invitations':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Invitations Management</h2>
                <p className="text-gray-600">Manage invitation templates, compose invitations, and track status</p>
              </div>
            </div>

            {/* Debug Info for Tab View */}
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
              <p className="font-semibold text-blue-700 mb-2">Tab View Debug:</p>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div><strong>Selected School:</strong> {selectedSchool ? `${selectedSchool.schoolName} (ID: ${selectedSchool.id})` : 'NULL'}</div>
                <div><strong>Available Grades:</strong> {grades.length}</div>
                <div><strong>User:</strong> {user ? user.name || 'Present' : 'None'}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <TemplateManager />
                {/* Check if selectedSchool exists before rendering InvitationComposer */}
                {selectedSchool ? (
                  <InvitationComposer  
                    grades={grades}
                    user={user} 
                    schools={schools} 
                    selectedSchool={selectedSchool} 
                    selectedGrade={selectedGradeForInvite}
                    onInvitationSent={handleInvitationSent}
                  />
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <FiAlertCircle className="text-yellow-600 mr-3" size={20} />
                      <div>
                        <h3 className="text-yellow-800 font-medium">School Not Selected</h3>
                        <p className="text-yellow-700 text-sm">Please select a school first to send invitations.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-6">
                <StatusTracker user={user} />
                <CreditSystem user={user}/>
              </div>
            </div>
          </div>
        );

      default:
        return <div>Tab content not found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Tabs */}
      <div className="bg-white shadow">
        <div className="px-4 sm:px-6 lg:px-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: FaGraduationCap },
              { id: 'learners', name: 'Learners', icon: FiUsers },
              { id: 'invitations', name: 'Invitations', icon: FiMail },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    if (tab.id === 'invitations' && !selectedSchool) {
                      alert('Please select a school first to access invitations');
                      return;
                    }
                    setActiveTab(tab.id);
                  }}
                  className={`${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                    tab.id === 'invitations' && !selectedSchool ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={tab.id === 'invitations' && !selectedSchool}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {renderTabContent()}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateGradeModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          selectedSchool={selectedSchool}
          schools={schools}
          onGradeCreated={handleCreateGrade}
        />
      )}

      {showEditModal && selectedGrade && (
        <EditGradeModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          grade={selectedGrade}
          onGradeUpdated={handleUpdateGrade}
        />
      )}

      {showDeleteModal && selectedGrade && (
        <DeleteGradeModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          grade={selectedGrade}
          onGradeDeleted={handleDeleteGrade}
        />
      )}

      {showBulkUpload && (
        <BulkUpload
          isOpen={showBulkUpload}
          onClose={() => setShowBulkUpload(false)}
          selectedGrade={selectedGrade}
          user={user}
          schools={schools}
        />
      )}

      {selectedLearner && (
        <LearnerDetail
          isOpen={!!selectedLearner}
          onClose={() => setSelectedLearner(null)}
          learner={selectedLearner}
        />
      )}

      {/* Invitation Modal */}
      {showInvitationModal && selectedSchool && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-3/4 shadow-lg rounded-md bg-white max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b">
              <h3 className="text-xl font-bold">Send Invitations</h3>
              <button 
                onClick={() => setShowInvitationModal(false)} 
                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>
            
            {/* Debug Info */}
            <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded text-sm">
              <p className="font-semibold text-gray-700 mb-2">Debug Information:</p>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div><strong>Selected School:</strong> {selectedSchool ? `${selectedSchool.schoolName} (ID: ${selectedSchool.id})` : 'None'}</div>
                <div><strong>Available Grades:</strong> {grades.length}</div>
                <div><strong>Selected Grade:</strong> {selectedGradeForInvite ? `${selectedGradeForInvite.name} (ID: ${selectedGradeForInvite.id})` : 'None'}</div>
                <div><strong>User:</strong> {user ? user.name || 'Present' : 'None'}</div>
              </div>
            </div>
            
            <InvitationComposer 
              user={user} 
              schools={schools} 
              selectedSchool={selectedSchool} 
              selectedGrade={selectedGradeForInvite}
              grades={grades}
              onInvitationSent={handleInvitationSent}
              onClose={() => setShowInvitationModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default GradesContainer;