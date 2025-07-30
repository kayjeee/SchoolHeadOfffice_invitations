import React, { useState } from 'react';

const RequestAccessForm = ({ schoolName, loggedInUserEmail, onRequestClose, onSuccess }) => {
  const [email, setEmail] = useState(loggedInUserEmail); // Initialize email state with logged-in user's email
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showPending, setShowPending] = useState(false); // State to show pending status

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Perform validation if needed
      // Submit the access request to your backend
      const response = await fetch('https://data.mongodb-api.com/app/tasktracker-uuloe/endpoint/requestaccess', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ schoolName, reason, loggedInUserEmail }), // Include loggedInUserEmail in the payload
      });

      if (!response.ok) {
        throw new Error('Request failed');
      }

      setSuccess(true);
      setShowPending(true); // Show pending status immediately
      onSuccess(schoolName); // Call the success callback to update the parent component

      // Reset form fields after successful submission
      setEmail('');
      setReason('');

    } catch (error) {
      setError('Error submitting request. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50">
      <div className="absolute w-full h-full bg-gray-900 opacity-50"></div>
      <div className="bg-white rounded-lg shadow-lg z-50 overflow-y-auto">
        <div className="py-4 px-6">
          <div className="mb-4 text-center">
            <h2 className="text-2xl font-semibold">Request Access to {schoolName}</h2>
          </div>
          {success ? (
            <p className="text-green-600">Request submitted successfully. Please wait for approval.</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Your Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
                  Reason for Access
                </label>
                <textarea
                  id="reason"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                  required
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={onRequestClose}
                  className="mr-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                  disabled={loading}
                >
                  {loading ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            </form>
          )}
          {showPending && (
            <div className="mt-4 bg-yellow-100 text-yellow-800 p-2 rounded-md">
              Request pending approval.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestAccessForm;
