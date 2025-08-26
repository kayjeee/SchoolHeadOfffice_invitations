import { useState, useEffect } from 'react';
import {
  FiUpload, FiDollarSign, FiShoppingCart, FiPlus, FiMinus,
  FiTrash2, FiEdit, FiMessageSquare, FiBell, FiPieChart,
  FiCalendar, FiTruck, FiCreditCard, FiSettings, FiLifeBuoy,
  FiUsers, FiFileText, FiUser
} from 'react-icons/fi';
import {
  FaHamburger, FaPizzaSlice, FaIceCream, FaAppleAlt,
  FaSchool, FaMoneyBillWave, FaChartLine, FaCog, FaGraduationCap
} from 'react-icons/fa';
import Sidebar from './Sidebar';
import axios from 'axios';

// Import components from grades-management-components package
import {
  GradesContainer,
  LearnersTable,
  BulkUpload,
  TemplateManager,
  InvitationComposer,
  StatusTracker, 
  CreditSystem
} from './GradesManagemet';

const tabs = {
  grades: [
    { id: 'grades-overview', label: 'Grades Overview', icon: <FaGraduationCap /> },
    { id: 'grades-classes', label: 'Classes', icon: <FiFileText /> },
    { id: 'grades-learners', label: 'Learners', icon: <FiUsers /> },
    { id: 'grades-upload-learners', label: 'Upload Learners', icon: <FiUpload /> },
    { id: 'grades-invitations', label: 'Invitations', icon: <FiMessageSquare /> },
  ]
};

export default function SettingsLayout({ user, schools }) {
  const [activeTab, setActiveTab] = useState('grades-overview');
  const [isExpanded, setIsExpanded] = useState(true);
  const [balance, setBalance] = useState(50.00);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Get school ID from props - FIXED: Use the correct property name
  const userId = user?._id;
  const selectedSchool = schools?.length > 0 ? schools[0] : null;
  const schoolId = selectedSchool?.id || selectedSchool?._id; // Handle both id and _id
  const schoolName = selectedSchool?.schoolName;

  // Debug logging
  useEffect(() => {
    console.log('SettingsLayout - Schools prop:', schools);
    console.log('SettingsLayout - Selected School:', selectedSchool);
    console.log('SettingsLayout - School ID:', schoolId);
  }, [schools, selectedSchool, schoolId]);

  // Log grades whenever they change
  useEffect(() => {
    console.log('SettingsLayout - Grades updated:', {
      count: grades.length,
      grades: grades.map(g => ({ id: g.id, name: g.name }))
    });
  }, [grades]);

  // Function to fetch grades from backend - FIXED: Add more debugging
  const fetchGrades = async () => {
    console.log('fetchGrades called with schoolId:', schoolId);
    
    if (!schoolId) {
      console.log('No school ID available, cannot fetch grades');
      setGrades([]);
      return;
    }
    
    console.log('SettingsLayout - Fetching grades for school:', schoolId);
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('authToken');
      console.log('Using auth token:', token ? 'Token exists' : 'No token found');
      
      // FIXED: Use the correct endpoint format and add more debugging
      const apiUrl = `http://localhost:4000/api/v1/schools/${schoolId}/grades`;
      console.log('Making API call to:', apiUrl);
      
      const response = await axios.get(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        timeout: 30000 // Add timeout to prevent hanging requests
      });
      
      console.log('SettingsLayout - Grades API response:', response.data);
      
      // FIXED: Handle different response structures
      const fetchedGrades = response.data.data?.grades || response.data.grades || [];
      console.log('Fetched grades:', fetchedGrades);
      
      setGrades(fetchedGrades);
      
      console.log('SettingsLayout - Successfully fetched grades:', fetchedGrades.length);
    } catch (err) {
      console.error('SettingsLayout - Error fetching grades:', {
        error: err.message,
        status: err.response?.status,
        data: err.response?.data,
        config: err.config?.url
      });
      setError(`Failed to load grades: ${err.message}. Please try again.`);
      setGrades([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch grades when component mounts or schoolId changes - FIXED: Add more debugging
  useEffect(() => {
    console.log('useEffect triggered - schoolId:', schoolId, 'selectedSchool:', selectedSchool);
    
    if (schoolId) {
      console.log('SettingsLayout - School changed, fetching grades for school:', schoolId);
      fetchGrades();
    } else {
      console.log('SettingsLayout - No school selected or school has no ID');
      setGrades([]);
    }
  }, [schoolId]); // FIXED: Only depend on schoolId

  const renderContent = () => {
    console.log('SettingsLayout - Rendering tab:', activeTab, 'with grades count:', grades.length);
    
    switch (activeTab) {
      case 'grades-overview':
        return (
          <GradesContainer
            selectedSchool={selectedSchool}
            user={user}
            schools={schools}
            grades={grades}
          />
        );
      case 'grades-classes':
        return (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Class Management</h2>
              <p className="text-gray-600 mb-4">
                Manage class assignments and grade structures for {selectedSchool?.schoolName || 'your school'}.
              </p>
              <GradesContainer
                selectedSchool={selectedSchool}
                user={user}
                schools={schools}
                grades={grades}
              />
            </div>
          </div>
        );
      case 'grades-learners':
        return (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Learner Management</h2>
              <p className="text-gray-600 mb-4">
                View and manage learner information for {selectedSchool?.schoolName || 'your school'}.
              </p>
              <LearnersTable
                selectedGrade={null}
                onSelectLearner={(learner) => console.log('Selected learner:', learner)}
              />
            </div>
          </div>
        );
      case 'grades-upload-learners':
        return (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Bulk Upload Learners</h2>
              <p className="text-gray-600 mb-4">
                Upload multiple learners at once using Excel or CSV files.
              </p>
              <BulkUpload
                isOpen={true}
                onClose={() => setActiveTab('grades-learners')}
                selectedGrade={null}
                user={user}
                schools={schools}
              />
            </div>
          </div>
        );
      case 'grades-invitations':
        return (
          <div className="space-y-6">
            <InvitationManagementTabs 
              selectedSchool={selectedSchool}
              grades={grades}
              user={user}
            />
          </div>
        );
      default:
        return <DefaultTabContent tabId={activeTab} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isExpanded={isExpanded}
        onToggle={() => setIsExpanded((prev) => !prev)}
        balance={balance}
      />
      
      <div className="flex-1 p-6 overflow-auto">
        {/* Debug Info */}
        <div className="mb-4 p-3 bg-gray-100 border border-gray-300 rounded text-sm">
          <p className="font-semibold text-gray-700 mb-2">Debug Information:</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div><strong>School ID:</strong> {schoolId || 'None'}</div>
            <div><strong>Grades Count:</strong> {grades.length}</div>
            <div><strong>Selected School:</strong> {selectedSchool ? selectedSchool.schoolName : 'None'}</div>
            <div><strong>Active Tab:</strong> {activeTab}</div>
          </div>
        </div>
        
        {/* Loading State */}
        {loading && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded text-center">
            <div className="inline-flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <p className="text-blue-600">Loading grades...</p>
            </div>
          </div>
        )}
        
        {/* Error State */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
                <button 
                  onClick={fetchGrades}
                  className="mt-2 text-sm text-red-800 underline hover:text-red-900"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}
        
        {renderContent()}
      </div>
    </div>
  );
}

function InvitationManagementTabs({ selectedSchool, grades, user }) {
  const [activeInvitationTab, setActiveInvitationTab] = useState('composer');

  const invitationTabs = [
    { id: 'composer', label: 'Compose Invitations', icon: <FiMessageSquare /> },
    { id: 'templates', label: 'Templates', icon: <FiFileText /> },
    { id: 'status', label: 'Status Tracker', icon: <FiBell /> },
    { id: 'credits', label: 'Credit System', icon: <FiDollarSign /> },
  ];

  // Debug logging for InvitationManagementTabs
  useEffect(() => {
    console.log('InvitationManagementTabs - Props:', {
      selectedSchool: selectedSchool ? selectedSchool.schoolName : 'None',
      gradesCount: grades?.length || 0,
      userExists: !!user
    });
  }, [selectedSchool, grades, user]);

  const renderInvitationContent = () => {
    console.log('InvitationManagementTabs - Rendering tab:', activeInvitationTab);
    
    switch (activeInvitationTab) {
      case 'composer':
        return (
          <InvitationComposer 
            selectedSchool={selectedSchool}
            grades={grades}
            user={user}
          />
        );
      case 'templates':
        return <TemplateManager />;
      case 'status':
        return <StatusTracker />;
      case 'credits':
        return <CreditSystem />;
      default:
        return (
          <InvitationComposer 
            selectedSchool={selectedSchool}
            grades={grades}
            user={user}
          />
        );
    }
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 px-6">
          {invitationTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveInvitationTab(tab.id)}
              className={`${
                activeInvitationTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="p-6">
        {renderInvitationContent()}
      </div>
    </div>
  );
}

function DefaultTabContent({ tabId }) {
  const allTabs = Object.values(tabs).flat();
  const tabName = allTabs.find(tab => tab.id === tabId)?.label || 'this section';

  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-md">
        <FaSchool className="mx-auto text-4xl text-blue-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{tabName}</h2>
        <p className="text-gray-600">This feature is coming soon. Our team is working hard to implement {tabName} functionality.</p>
      </div>
    </div>
  );
}