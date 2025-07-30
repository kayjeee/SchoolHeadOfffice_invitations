import React, { useState } from 'react';


const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');


  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-1/4 bg-gray-100 p-4">
        <h2 className="text-xl font-bold mb-4">Settings</h2>
        <ul className="space-y-2">
          
        </ul>
      </div>

      {/* Content */}
   
    </div>
  );
};

export default Settings;
