import React, { useState } from 'react';

export default function ProfileSettings() {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    profilePicture: null,
  });

  const handleInputChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setProfile({ ...profile, profilePicture: e.target.files[0] });
  };

  const handleSave = () => {
    // Save profile details
    console.log(profile);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Update Profile</h2>
      <div className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={profile.name}
          onChange={handleInputChange}
          className="w-full border p-2 rounded"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={profile.email}
          onChange={handleInputChange}
          className="w-full border p-2 rounded"
        />
        <input type="file" onChange={handleFileChange} className="w-full p-2" />
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
