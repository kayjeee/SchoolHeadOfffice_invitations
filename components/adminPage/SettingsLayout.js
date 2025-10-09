import { useState, useEffect } from 'react';
import axios from 'axios';
import { QRCodeCanvas } from 'qrcode.react';

// Icons
import {
  FiUpload, FiDollarSign, FiMessageSquare, FiBell,
  FiFileText, FiUsers, FiSettings
} from 'react-icons/fi';
import { FaSchool, FaGraduationCap } from 'react-icons/fa';

// Sidebar
import Sidebar from './Sidebar';

// Grade Management Components
import {
  GradesContainer,
  LearnersTable,
  BulkUpload,
  TemplateManager,
  InvitationComposer,
  StatusTracker,
  CreditSystem
} from './GradesManagemet';

// ---------------- Tabs Definition ----------------
const tabs = {
  grades: [
    { id: 'grades-overview', label: 'Grades Overview', icon: <FaGraduationCap /> },
    { id: 'grades-classes', label: 'Classes', icon: <FiFileText /> },
    { id: 'grades-learners', label: 'Learners', icon: <FiUsers /> },
    { id: 'grades-upload-learners', label: 'Upload Learners', icon: <FiUpload /> },
    { id: 'grades-invitations', label: 'Invitations', icon: <FiMessageSquare /> },
    { id: 'grades-prcode', label: 'PR Code', icon: <FiSettings /> }, // ✅ PR Code tab
  ]
};

// ---------------- Settings Layout ----------------
export default function SettingsLayout({ user, schools }) {
  const [activeTab, setActiveTab] = useState('grades-overview');
  const [isExpanded, setIsExpanded] = useState(true);
  const [balance, setBalance] = useState(50.0);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const selectedSchool = schools?.length > 0 ? schools[0] : null;
  const schoolId = selectedSchool?.id || selectedSchool?._id;
  const schoolName = selectedSchool?.schoolName;

  // Debug
  useEffect(() => {
    console.log('SettingsLayout - Selected School:', selectedSchool);
    console.log('SettingsLayout - School ID:', schoolId);
  }, [selectedSchool, schoolId]);

  // Fetch Grades
  const fetchGrades = async () => {
    if (!schoolId) {
      console.log('No schoolId provided.');
      setGrades([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('authToken');
      const apiUrl = `https://sho-backend-v2.onrender.com/api/v1/schools/${schoolId}/grades`;

      console.log('Fetching grades from:', apiUrl);

      const response = await axios.get(apiUrl, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 30000,
      });

      const fetchedGrades = response.data.data?.grades || response.data.grades || [];
      setGrades(fetchedGrades);

      console.log('Fetched grades:', fetchedGrades.length);
    } catch (err) {
      console.error('Error fetching grades:', err);
      setError(`Failed to load grades: ${err.message}`);
      setGrades([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (schoolId) fetchGrades();
  }, [schoolId]);

  // ---------------- Tab Content ----------------
  const renderContent = () => {
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
          <Section title="Class Management" description={`Manage classes for ${schoolName || 'your school'}`}>
            <GradesContainer selectedSchool={selectedSchool} user={user} schools={schools} grades={grades} />
          </Section>
        );

      case 'grades-learners':
        return (
          <Section title="Learner Management" description={`View and manage learners for ${schoolName || 'your school'}`}>
            <LearnersTable selectedGrade={null} onSelectLearner={(learner) => console.log('Selected learner:', learner)} />
          </Section>
        );

      case 'grades-upload-learners':
        return (
          <Section title="Bulk Upload Learners" description="Upload learners via Excel or CSV">
            <BulkUpload isOpen={true} onClose={() => setActiveTab('grades-learners')} selectedGrade={null} user={user} schools={schools} />
          </Section>
        );

      case 'grades-invitations':
        return (
          <InvitationManagementTabs selectedSchool={selectedSchool} grades={grades} user={user} />
        );

      case 'grades-prcode':
  return (
    <Section
      title="Invitation PR Code"
      description={`Share this QR with parents, learners, or guests of ${schoolName || 'your school'}`}
    >
      <div className="flex flex-col items-center space-y-4">
        {schoolId ? (
          <>
            {/* QR Code */}
            <QRCodeCanvas value={`https://www.schoolheadoffice.com/invite/${schoolId}`} size={180} />

            {/* Info text */}
            <p className="text-sm text-gray-500 text-center">
              Scan to open the invitation link or tap below:
            </p>

            {/* Live clickable link */}
            <a
              href={`https://www.schoolheadoffice.com//invite/${schoolId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline break-all text-center"
            >
              https://your-app.com/invite/{schoolId}
            </a>

            {/* Copy button */}
            <button
              onClick={() => navigator.clipboard.writeText(`https://www.schoolheadoffice.com/invite/${schoolId}`)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Copy Invite Link
            </button>
          </>
        ) : (
          <p className="text-red-500">No school selected. Please select a school to generate a PR Code.</p>
        )}
      </div>
    </Section>
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
        <DebugInfo schoolId={schoolId} grades={grades} selectedSchool={selectedSchool} activeTab={activeTab} />

        {/* States */}
        {loading && <InfoBanner type="loading" message="Loading grades..." />}
        {error && <InfoBanner type="error" message={error} onRetry={fetchGrades} />}

        {renderContent()}
      </div>
    </div>
  );
}

// ---------------- Sub Components ----------------
function Section({ title, description, children }) {
  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-2">{title}</h2>
        {description && <p className="text-gray-600 mb-4">{description}</p>}
        {children}
      </div>
    </div>
  );
}

function DebugInfo({ schoolId, grades, selectedSchool, activeTab }) {
  return (
    <div className="mb-4 p-3 bg-gray-100 border border-gray-300 rounded text-sm">
      <p className="font-semibold text-gray-700 mb-2">Debug Information:</p>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div><strong>School ID:</strong> {schoolId || 'None'}</div>
        <div><strong>Grades Count:</strong> {grades.length}</div>
        <div><strong>Selected School:</strong> {selectedSchool ? selectedSchool.schoolName : 'None'}</div>
        <div><strong>Active Tab:</strong> {activeTab}</div>
      </div>
    </div>
  );
}

function InfoBanner({ type, message, onRetry }) {
  if (type === 'loading') {
    return (
      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded text-center">
        <div className="inline-flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <p className="text-blue-600">{message}</p>
        </div>
      </div>
    );
  }

  if (type === 'error') {
    return (
      <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded">
        <p className="text-sm text-red-700">{message}</p>
        {onRetry && <button onClick={onRetry} className="mt-2 text-sm text-red-800 underline hover:text-red-900">Try Again</button>}
      </div>
    );
  }

  return null;
}

function InvitationManagementTabs({ selectedSchool, grades, user }) {
  const [activeInvitationTab, setActiveInvitationTab] = useState('composer');

  const invitationTabs = [
    { id: 'composer', label: 'Compose Invitations', icon: <FiMessageSquare /> },
    { id: 'templates', label: 'Templates', icon: <FiFileText /> },
    { id: 'status', label: 'Status Tracker', icon: <FiBell /> },
    { id: 'credits', label: 'Credit System', icon: <FiDollarSign /> },
  ];

  const renderInvitationContent = () => {
    switch (activeInvitationTab) {
      case 'composer': return <InvitationComposer selectedSchool={selectedSchool} grades={grades} user={user} />;
      case 'templates': return <TemplateManager />;
      case 'status': return <StatusTracker />;
      case 'credits': return <CreditSystem />;
      default: return <InvitationComposer selectedSchool={selectedSchool} grades={grades} user={user} />;
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
      <div className="p-6">{renderInvitationContent()}</div>
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
        <p className="text-gray-600">
          This feature is coming soon. Our team is working hard to implement {tabName}.
        </p>
      </div>
    </div>
  );
}
