import React, { useState } from 'react';

export default function DeleteAccountSettings() {
  const [confirmation, setConfirmation] = useState('');

  const handleDelete = () => {
    if (confirmation.toLowerCase() === 'delete') {
      // Handle account deletion logic
      console.log('Account Deleted');
      alert('Your account has been deleted.');
    } else {
      alert('Type "delete" to confirm account deletion.');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-red-600">Delete Account</h2>
      <p className="text-gray-600 mb-4">
        Deleting your account is irreversible. All your data will be permanently deleted.
        To confirm, type <strong>"delete"</strong> in the box below.
      </p>
      <input
        type="text"
        placeholder="Type 'delete' to confirm"
        value={confirmation}
        onChange={(e) => setConfirmation(e.target.value)}
        className="w-full border p-2 rounded mb-4"
      />
      <button
        onClick={handleDelete}
        className="bg-red-500 text-white p-2 rounded"
      >
        Delete My Account
      </button>
    </div>
  );
}
