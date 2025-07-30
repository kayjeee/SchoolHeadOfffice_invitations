import React, { useState } from 'react';
import { useApp } from '../redux/useApp'; // Assuming useApp is your context or app initialization

export default function AccountTab({ school, selectedSchool, isLoggedIn }) {
  const app = useApp(); // Get the app instance
  const currentUser = app?.currentUser;
  const userEmail = currentUser?.profile?.email || 'No email found'; // Get user's email from profile

  // Sample access requests, should be fetched dynamically in a real app
  const accessRequests = school?.accessRequests || [];

  // State for managing chat messages and input
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);

  // Function to handle chat input change
  const handleChatInputChange = (e) => {
    setChatInput(e.target.value);
  };

  // Function to handle sending a chat message
  const handleSendMessage = () => {
    if (!chatInput) return;
    
    const newMessage = {
      sender: userEmail, // Current logged-in user email
      message: chatInput,
      timestamp: new Date().toISOString(),
    };

    // Save message to the state (in a real app, you would save to the database)
    setChatMessages([...chatMessages, newMessage]);
    setChatInput(''); // Clear the input after sending
  };

  return (
    <div className="account-tab-container bg-white rounded-lg shadow-md p-4 sm:p-6 md:p-8 max-w-full h-screen overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4 text-center">Account Information</h2>

      {/* Parent Account Information */}
      <div className="mb-6">
        <h3 className="text-md font-semibold mb-2">Parent Account</h3>
        <p><strong>Email:</strong> {userEmail}</p>
        <p><strong>School Name:</strong> {school?.schoolName}</p>
        <p><strong>Selected School:</strong> {selectedSchool?.schoolName}</p>
        <button className="mt-2 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-center">
          Update Account Details
        </button>
      </div>

      {/* Linked Parents */}
      <div className="mb-6">
        <h3 className="text-md font-semibold mb-2">Parents Linked to School</h3>
        <ul className="space-y-2">
          {accessRequests.map((parent, index) => (
            <li key={index} className="bg-gray-100 p-4 rounded-lg shadow">
              <p><strong>Parent Email:</strong> {parent.loggedInUserEmail}</p>
              <p><strong>Status:</strong> {parent.status}</p>
              <p><strong>Reason for Access:</strong> {parent.reason}</p>
              <p><strong>Accepted By:</strong> {parent.acceptedBy}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* Two-way Chat Feature */}
      <div className="mb-6">
        <h3 className="text-md font-semibold mb-2">Chat with the School</h3>

        <div className="chat-window bg-gray-100 p-4 mb-4 rounded-lg shadow-md max-h-40 sm:max-h-64 overflow-y-auto">
          {chatMessages.length > 0 ? (
            chatMessages.map((msg, index) => (
              <div key={index} className={`chat-message mb-2 ${msg.sender === userEmail ? 'text-right' : 'text-left'}`}>
                <p className="text-sm">
                  <strong>{msg.sender === userEmail ? 'You' : msg.sender}</strong>: {msg.message}
                </p>
                <span className="text-xs text-gray-500">{new Date(msg.timestamp).toLocaleString()}</span>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No messages yet. Start the conversation!</p>
          )}
        </div>

        <div className="chat-input">
          <input
            type="text"
            value={chatInput}
            onChange={handleChatInputChange}
            placeholder="Type a message..."
            className="w-full p-2 border border-gray-300 rounded"
          />
          <button
            onClick={handleSendMessage}
            className="mt-2 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Send Message
          </button>
        </div>
      </div>

      {/* School Communications */}
      <div className="mb-6">
        <h3 className="text-md font-semibold mb-2">School Communications</h3>
        <p>Important notices or messages will be displayed here.</p>
        <button className="mt-2 w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
          Contact Teacher/Administrator
        </button>
      </div>

      {/* Account Settings */}
      <div>
        <h3 className="text-md font-semibold mb-2">Account Settings</h3>
        <button className="mt-2 w-full px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600">
          Change Password
        </button>
        <button className="mt-2 w-full px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400">
          Notification Preferences
        </button>
      </div>
    </div>
  );
}
