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
  const [meals, setMeals] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [grades, setGrades] = useState([]);
  
  useEffect(() => {
    console.log('BulkUpload user prop:', schools);
  }, [schools]);
  
  // Get school ID from props
  const userId = user?._id;
  const selectedSchool = schools?.length > 0 ? schools[0] : null;
  const schoolId = selectedSchool?._id;
  const schoolame = selectedSchool?.schoolName;

  // Function to fetch grades (replace with your actual API call)
  const fetchGrades = async () => {
    if (!schoolId) return;
    try {
      const response = await fetch('/api/grades/fetchGradesForSchool', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ schoolId }),
      });
      if (!response.ok) {
        throw new Error('Failed to fetch grades');
      }
      const data = await response.json();
      setGrades(data.grades || []);
    } catch (error) {
      console.error('Error fetching grades:', error);
      setGrades([]);
    }
  };

  // Fetch grades when component mounts or schoolId changes
  useEffect(() => {
    fetchGrades();
  }, [schoolId]);

  const handleAccountSelect = (account) => {
    setSelectedAccount(account);
    setActiveTab('account-details');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'grades-overview':
        return (
          <GradesContainer
            selectedSchool={selectedSchool}
            user={user}
            schools={schools}
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
            <InvitationManagementTabs />
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
        {renderContent()}
      </div>
    </div>
  );
}

function InvitationManagementTabs() {
  const [activeInvitationTab, setActiveInvitationTab] = useState('composer');

  const invitationTabs = [
    { id: 'composer', label: 'Compose Invitations', icon: <FiMessageSquare /> },
    { id: 'templates', label: 'Templates', icon: <FiFileText /> },
    { id: 'status', label: 'Status Tracker', icon: <FiBell /> },
    { id: 'credits', label: 'Credit System', icon: <FiDollarSign /> },
  ];

  const renderInvitationContent = () => {
    switch (activeInvitationTab) {
      case 'composer':
        return <InvitationComposer />;
      case 'templates':
        return <TemplateManager />;
      case 'status':
        return <StatusTracker />;
      case 'credits':
        return <CreditSystem />;
      default:
        return <InvitationComposer />;
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