import React, { useState } from 'react';

export default function LinkedAccountsSettings() {
  const [linkedAccounts, setLinkedAccounts] = useState({
    google: false,
    facebook: false,
  });

  const toggleLink = (account) => {
    setLinkedAccounts((prev) => ({
      ...prev,
      [account]: !prev[account],
    }));
  };

  const handleSave = () => {
    // Save linked accounts state
    console.log(linkedAccounts);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Linked Accounts</h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p>Google Account</p>
          <button
            onClick={() => toggleLink('google')}
            className={`p-2 rounded ${
              linkedAccounts.google ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
            }`}
          >
            {linkedAccounts.google ? 'Unlink' : 'Link'}
          </button>
        </div>
        <div className="flex items-center justify-between">
          <p>Facebook Account</p>
          <button
            onClick={() => toggleLink('facebook')}
            className={`p-2 rounded ${
              linkedAccounts.facebook ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
            }`}
          >
            {linkedAccounts.facebook ? 'Unlink' : 'Link'}
          </button>
        </div>
        <button
          onClick={handleSave}
          className="bg-blue-500 text-white p-2 rounded"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
