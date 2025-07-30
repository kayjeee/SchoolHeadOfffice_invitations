import React, { useState } from 'react';
import { FiMail, FiCheck, FiX, FiClock, FiRefreshCw, FiEye, FiSend } from 'react-icons/fi';

const StatusTracker = () => {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedInvitation, setSelectedInvitation] = useState(null);

  // Mock data for invitations
  const [invitations] = useState([
    {
      id: 1,
      recipientName: 'David Johnson',
      recipientEmail: 'david.johnson@email.com',
      learnerName: 'Sarah Johnson',
      subject: 'Welcome to Greenwood Primary - Grade 5A',
      status: 'delivered',
      sentDate: '2024-01-15T10:30:00',
      deliveredDate: '2024-01-15T10:31:00',
      openedDate: '2024-01-15T14:22:00',
      clickedDate: null,
      bounceReason: null,
      template: 'Welcome New Learner'
    },
    {
      id: 2,
      recipientName: 'Mary Smith',
      recipientEmail: 'mary.smith@email.com',
      learnerName: 'John Smith',
      subject: 'Grade Assignment Notification',
      status: 'opened',
      sentDate: '2024-01-14T09:15:00',
      deliveredDate: '2024-01-14T09:16:00',
      openedDate: '2024-01-14T16:45:00',
      clickedDate: '2024-01-14T16:47:00',
      bounceReason: null,
      template: 'Grade Assignment'
    },
    {
      id: 3,
      recipientName: 'Lisa Brown',
      recipientEmail: 'lisa.brown@email.com',
      learnerName: 'Michael Brown',
      subject: 'Your Parent Portal Access',
      status: 'bounced',
      sentDate: '2024-01-13T11:20:00',
      deliveredDate: null,
      openedDate: null,
      clickedDate: null,
      bounceReason: 'Invalid email address',
      template: 'Parent Portal Access'
    },
    {
      id: 4,
      recipientName: 'Jennifer Wilson',
      recipientEmail: 'jennifer.wilson@email.com',
      learnerName: 'James Wilson',
      subject: 'Welcome to Greenwood Primary - Grade 3B',
      status: 'sent',
      sentDate: '2024-01-16T08:45:00',
      deliveredDate: null,
      openedDate: null,
      clickedDate: null,
      bounceReason: null,
      template: 'Welcome New Learner'
    },
    {
      id: 5,
      recipientName: 'Robert Davis',
      recipientEmail: 'robert.davis@email.com',
      learnerName: 'Emma Davis',
      subject: 'Grade Assignment Notification',
      status: 'pending',
      sentDate: null,
      deliveredDate: null,
      openedDate: null,
      clickedDate: null,
      bounceReason: null,
      template: 'Grade Assignment'
    }
  ]);

  const statusOptions = [
    { value: 'all', label: 'All Status', count: invitations.length },
    { value: 'pending', label: 'Pending', count: invitations.filter(i => i.status === 'pending').length },
    { value: 'sent', label: 'Sent', count: invitations.filter(i => i.status === 'sent').length },
    { value: 'delivered', label: 'Delivered', count: invitations.filter(i => i.status === 'delivered').length },
    { value: 'opened', label: 'Opened', count: invitations.filter(i => i.status === 'opened').length },
    { value: 'bounced', label: 'Bounced', count: invitations.filter(i => i.status === 'bounced').length }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <FiClock className="h-4 w-4 text-yellow-500" />;
      case 'sent':
        return <FiSend className="h-4 w-4 text-blue-500" />;
      case 'delivered':
        return <FiCheck className="h-4 w-4 text-green-500" />;
      case 'opened':
        return <FiEye className="h-4 w-4 text-purple-500" />;
      case 'bounced':
        return <FiX className="h-4 w-4 text-red-500" />;
      default:
        return <FiMail className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    switch (status) {
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'sent':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'delivered':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'opened':
        return `${baseClasses} bg-purple-100 text-purple-800`;
      case 'bounced':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-ZA');
  };

  const filteredInvitations = selectedStatus === 'all' 
    ? invitations 
    : invitations.filter(inv => inv.status === selectedStatus);

  const handleResendInvitation = async (invitationId) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Resending invitation:', invitationId);
      alert('Invitation resent successfully!');
    } catch (error) {
      console.error('Error resending invitation:', error);
      alert('Error resending invitation. Please try again.');
    }
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Invitation Status Tracker
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Monitor the delivery and engagement status of sent invitations
            </p>
          </div>
          <button className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            <FiRefreshCw className="mr-1 h-4 w-4" />
            Refresh
          </button>
        </div>

        {/* Status Filter Tabs */}
        <div className="mb-6">
          <div className="sm:hidden">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label} ({option.count})
                </option>
              ))}
            </select>
          </div>
          <div className="hidden sm:block">
            <nav className="flex space-x-8">
              {statusOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => setSelectedStatus(option.value)}
                  className={`${
                    selectedStatus === option.value
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
                >
                  {option.label}
                  <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                    {option.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-yellow-50 rounded-lg p-3 text-center">
            <div className="text-lg font-semibold text-yellow-600">
              {invitations.filter(i => i.status === 'pending').length}
            </div>
            <div className="text-xs text-yellow-600">Pending</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <div className="text-lg font-semibold text-blue-600">
              {invitations.filter(i => i.status === 'sent').length}
            </div>
            <div className="text-xs text-blue-600">Sent</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <div className="text-lg font-semibold text-green-600">
              {invitations.filter(i => i.status === 'delivered').length}
            </div>
            <div className="text-xs text-green-600">Delivered</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-3 text-center">
            <div className="text-lg font-semibold text-purple-600">
              {invitations.filter(i => i.status === 'opened').length}
            </div>
            <div className="text-xs text-purple-600">Opened</div>
          </div>
          <div className="bg-red-50 rounded-lg p-3 text-center">
            <div className="text-lg font-semibold text-red-600">
              {invitations.filter(i => i.status === 'bounced').length}
            </div>
            <div className="text-xs text-red-600">Bounced</div>
          </div>
        </div>

        {/* Invitations List */}
        <div className="space-y-4">
          {filteredInvitations.map((invitation) => (
            <div key={invitation.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(invitation.status)}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        {invitation.recipientName}
                      </h4>
                      <p className="text-sm text-gray-600">{invitation.recipientEmail}</p>
                    </div>
                    <span className={getStatusBadge(invitation.status)}>
                      {invitation.status.charAt(0).toUpperCase() + invitation.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="mt-2">
                    <p className="text-sm text-gray-900">
                      <strong>Learner:</strong> {invitation.learnerName}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Subject:</strong> {invitation.subject}
                    </p>
                    <p className="text-sm text-gray-500">
                      <strong>Template:</strong> {invitation.template}
                    </p>
                  </div>

                  <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-500">
                    <div>
                      <span className="font-medium">Sent:</span>
                      <br />
                      {formatDateTime(invitation.sentDate)}
                    </div>
                    <div>
                      <span className="font-medium">Delivered:</span>
                      <br />
                      {formatDateTime(invitation.deliveredDate)}
                    </div>
                    <div>
                      <span className="font-medium">Opened:</span>
                      <br />
                      {formatDateTime(invitation.openedDate)}
                    </div>
                    <div>
                      <span className="font-medium">Clicked:</span>
                      <br />
                      {formatDateTime(invitation.clickedDate)}
                    </div>
                  </div>

                  {invitation.bounceReason && (
                    <div className="mt-2 bg-red-50 border border-red-200 rounded-md p-2">
                      <p className="text-sm text-red-800">
                        <strong>Bounce Reason:</strong> {invitation.bounceReason}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedInvitation(invitation)}
                    className="text-blue-600 hover:text-blue-900 text-sm"
                  >
                    View Details
                  </button>
                  {(invitation.status === 'bounced' || invitation.status === 'pending') && (
                    <button
                      onClick={() => handleResendInvitation(invitation.id)}
                      className="inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <FiRefreshCw className="mr-1 h-3 w-3" />
                      Resend
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredInvitations.length === 0 && (
          <div className="text-center py-8">
            <FiMail className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No invitations found</h3>
            <p className="mt-1 text-sm text-gray-500">
              No invitations match the selected status filter.
            </p>
          </div>
        )}
      </div>

      {/* Invitation Details Modal */}
      {selectedInvitation && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setSelectedInvitation(null)}></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Invitation Details
                  </h3>
                  <button
                    onClick={() => setSelectedInvitation(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Recipient</label>
                      <p className="text-sm text-gray-900">{selectedInvitation.recipientName}</p>
                      <p className="text-sm text-gray-500">{selectedInvitation.recipientEmail}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Learner</label>
                      <p className="text-sm text-gray-900">{selectedInvitation.learnerName}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Subject</label>
                    <p className="text-sm text-gray-900">{selectedInvitation.subject}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Template Used</label>
                    <p className="text-sm text-gray-900">{selectedInvitation.template}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Current Status</label>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(selectedInvitation.status)}
                      <span className={getStatusBadge(selectedInvitation.status)}>
                        {selectedInvitation.status.charAt(0).toUpperCase() + selectedInvitation.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Timeline</h4>
                    <div className="space-y-2">
                      {selectedInvitation.sentDate && (
                        <div className="flex items-center text-sm">
                          <FiSend className="h-4 w-4 text-blue-500 mr-2" />
                          <span className="text-gray-600">Sent:</span>
                          <span className="ml-2 text-gray-900">{formatDateTime(selectedInvitation.sentDate)}</span>
                        </div>
                      )}
                      {selectedInvitation.deliveredDate && (
                        <div className="flex items-center text-sm">
                          <FiCheck className="h-4 w-4 text-green-500 mr-2" />
                          <span className="text-gray-600">Delivered:</span>
                          <span className="ml-2 text-gray-900">{formatDateTime(selectedInvitation.deliveredDate)}</span>
                        </div>
                      )}
                      {selectedInvitation.openedDate && (
                        <div className="flex items-center text-sm">
                          <FiEye className="h-4 w-4 text-purple-500 mr-2" />
                          <span className="text-gray-600">Opened:</span>
                          <span className="ml-2 text-gray-900">{formatDateTime(selectedInvitation.openedDate)}</span>
                        </div>
                      )}
                      {selectedInvitation.clickedDate && (
                        <div className="flex items-center text-sm">
                          <FiMail className="h-4 w-4 text-indigo-500 mr-2" />
                          <span className="text-gray-600">Link Clicked:</span>
                          <span className="ml-2 text-gray-900">{formatDateTime(selectedInvitation.clickedDate)}</span>
                        </div>
                      )}
                      {selectedInvitation.bounceReason && (
                        <div className="flex items-center text-sm">
                          <FiX className="h-4 w-4 text-red-500 mr-2" />
                          <span className="text-gray-600">Bounced:</span>
                          <span className="ml-2 text-red-900">{selectedInvitation.bounceReason}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                {(selectedInvitation.status === 'bounced' || selectedInvitation.status === 'pending') && (
                  <button
                    onClick={() => {
                      handleResendInvitation(selectedInvitation.id);
                      setSelectedInvitation(null);
                    }}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    <FiRefreshCw className="mr-2 h-4 w-4" />
                    Resend Invitation
                  </button>
                )}
                <button
                  onClick={() => setSelectedInvitation(null)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusTracker;

