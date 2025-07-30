import React, { useState } from 'react';
import Sidebar from './Sidebar/SideBar';
import SchoolDetails from './SchoolDetails';
import AdminSettings from './AdminSettings';

export default function SchoolManagementPage() {
  const [activeTab, setActiveTab] = useState('school-details');

  const tabs = [
    { id: 'school-details', label: 'School Details' },
    { id: 'admin-settings', label: 'Admin Settings' },
    // Add more tabs as needed
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'school-details':
        return <SchoolDetails />;
      case 'admin-settings':
        return <AdminSettings />;
      default:
        return <p>Invalid tab</p>;
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="w-3/4 h-full p-4">
        {renderContent()}
      </div>
    </div>
  );
}
