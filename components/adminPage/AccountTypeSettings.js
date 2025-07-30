import React, { useState } from 'react';
import SchoolManagement from './AccountTypeSettings/SchoolManagement';
import Billing from './AccountTypeSettings/Billing';
import InviteMembers from './AccountTypeSettings/InviteMembers';

export default function AccountTypeSettings({ schools = [], user }) {
  const [accountType, setAccountType] = useState('personal');
  const [businessTab, setBusinessTab] = useState('schoolManagement'); // For nested tabs

  const renderBusinessTab = () => {
    switch (businessTab) {
      case 'schoolManagement':
        return <SchoolManagement schools={schools} />;
      case 'billing':
        return <Billing />;
      case 'inviteMembers':
        return <InviteMembers user={user}/>;
      default:
        return <p>Select a tab.</p>;
    }
  };

  const renderView = () => {
    switch (accountType) {
      case 'personal':
        return <p>Manage your personal account settings.</p>;
      case 'business':
        return (
          <div>
            <div className="flex space-x-4 mb-4">
              <button
                onClick={() => setBusinessTab('schoolManagement')}
                className={`p-2 ${businessTab === 'schoolManagement' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              >
                School Management
              </button>
              <button
                onClick={() => setBusinessTab('billing')}
                className={`p-2 ${businessTab === 'billing' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              >
                Billing
              </button>
              <button
                onClick={() => setBusinessTab('inviteMembers')}
                className={`p-2 ${businessTab === 'inviteMembers' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              >
                Invite Members
              </button>
            </div>
            {renderBusinessTab()}
          </div>
        );
      default:
        return <p>Select an account type to view details.</p>;
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Account Type</h2>
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={() => setAccountType('personal')}
          className={`p-2 ${accountType === 'personal' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Personal
        </button>
        <button
          onClick={() => setAccountType('business')}
          className={`p-2 ${accountType === 'business' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Business
        </button>
      </div>
      {renderView()}
    </div>
  );
}
