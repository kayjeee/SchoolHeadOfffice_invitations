import React, { useState } from 'react';

export default function PreferencesSettings() {
  const [preferences, setPreferences] = useState({
    notifications: true,
    language: 'English',
  });

  const handleToggle = () => {
    setPreferences({ ...preferences, notifications: !preferences.notifications });
  };

  const handleLanguageChange = (e) => {
    setPreferences({ ...preferences, language: e.target.value });
  };

  const handleSave = () => {
    // Save preferences
    console.log(preferences);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Preferences</h2>
      <div className="space-y-4">
        <label>
          <input
            type="checkbox"
            checked={preferences.notifications}
            onChange={handleToggle}
          />
          Enable Email Notifications
        </label>
        <select
          value={preferences.language}
          onChange={handleLanguageChange}
          className="w-full border p-2 rounded"
        >
          <option value="English">English</option>
          <option value="Spanish">Spanish</option>
          {/* Add more languages */}
        </select>
        <button
          onClick={handleSave}
          className="bg-blue-500 text-white p-2 rounded"
        >
          Save
        </button>
      </div>
    </div>
  );
}
