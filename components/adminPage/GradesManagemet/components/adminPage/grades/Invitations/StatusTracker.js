import React, { useState } from 'react';
import { FiMail, FiCheck, FiX, FiClock, FiRefreshCw, FiEye, FiSend, FiMessageSquare, FiSmartphone, FiInfo } from 'react-icons/fi';

// Tooltip Component
function Tooltip({ children, content }) {
  const [isVisible, setIsVisible] = useState(false);
  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      {isVisible && (
        <div className="absolute z-10 px-2 py-1 text-xs text-white bg-gray-900 rounded-md -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
          {content}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
}

// Channel Status Component
function DeliveryStatus({ invitation }) {
  const getChannelIcon = (channelType) => {
    switch (channelType) {
      case 'whatsapp':
        return <FiMessageSquare className="h-3 w-3" />;
      case 'sms':
        return <FiSmartphone className="h-3 w-3" />;
      case 'email':
        return <FiMail className="h-3 w-3" />;
      default:
        return <FiMail className="h-3 w-3" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-500 text-white';
      case 'opened':
        return 'bg-purple-500 text-white';
      case 'failed':
      case 'bounced':
        return 'bg-red-500 text-white';
      case 'sent':
        return 'bg-blue-500 text-white';
      case 'pending':
        return 'bg-yellow-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="flex gap-1">
      {invitation.channels.map((channel, index) => (
        <Tooltip
           key={`${channel.type}-${index}`}
           content={`${channel.type.toUpperCase()}: ${channel.status} ${channel.deliveredAt ? `at ${new Date(channel.deliveredAt).toLocaleTimeString()}` : ''}`}
        >
          <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs ${getStatusColor(channel.status)}`}>
            {getChannelIcon(channel.type)}
          </div>
        </Tooltip>
      ))}
    </div>
  );
}

// Channel Timeline Component
function ChannelTimeline({ channels }) {
  const getChannelName = (type) => {
    switch (type) {
      case 'whatsapp': return 'WhatsApp';
      case 'sms': return 'SMS';
      case 'email': return 'Email';
      default: return type;
    }
  };

  const getChannelIcon = (type) => {
    switch (type) {
      case 'whatsapp': return <FiMessageSquare className="h-4 w-4 text-green-500" />;
      case 'sms': return <FiSmartphone className="h-4 w-4 text-blue-500" />;
      case 'email': return <FiMail className="h-4 w-4 text-red-500" />;
      default: return <FiMail className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <FiClock className="h-3 w-3 text-yellow-500" />;
      case 'sent': return <FiSend className="h-3 w-3 text-blue-500" />;
      case 'delivered': return <FiCheck className="h-3 w-3 text-green-500" />;
      case 'opened': return <FiEye className="h-3 w-3 text-purple-500" />;
      case 'failed':
      case 'bounced': return <FiX className="h-3 w-3 text-red-500" />;
      default: return <FiInfo className="h-3 w-3 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-3">
      {channels.map((channel, index) => (
        <div key={`${channel.type}-${index}`} className="border border-gray-200 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              {getChannelIcon(channel.type)}
              <span className="font-medium text-sm text-gray-900">
                {getChannelName(channel.type)}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              {getStatusIcon(channel.status)}
              <span className="text-xs text-gray-600 capitalize">
                {channel.status}
              </span>
            </div>
          </div>
          <div className="space-y-1 text-xs text-gray-500">
            {channel.sentAt && (
              <div className="flex justify-between">
                <span>Sent:</span>
                <span>{new Date(channel.sentAt).toLocaleString()}</span>
              </div>
            )}
            {channel.deliveredAt && (
              <div className="flex justify-between">
                <span>Delivered:</span>
                <span>{new Date(channel.deliveredAt).toLocaleString()}</span>
              </div>
            )}
            {channel.openedAt && (
              <div className="flex justify-between">
                <span>Opened:</span>
                <span>{new Date(channel.openedAt).toLocaleString()}</span>
              </div>
            )}
            {channel.clickedAt && (
              <div className="flex justify-between">
                <span>Link Clicked:</span>
                <span>{new Date(channel.clickedAt).toLocaleString()}</span>
              </div>
            )}
            {channel.failureReason && (
              <div className="bg-red-50 border border-red-200 rounded p-2 mt-2">
                <span className="text-red-800 font-medium">Error: </span>
                <span className="text-red-700">{channel.failureReason}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

const StatusTracker = () => {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedChannel, setSelectedChannel] = useState('all');
  const [selectedInvitation, setSelectedInvitation] = useState(null);

  // Enhanced mock data with multi-channel support
  const [invitations] = useState([
    {
      id: 1,
      recipientName: 'David Johnson',
      recipientEmail: 'david.johnson@email.com',
      recipientPhone: '+27821234567',
      learnerName: 'Sarah Johnson',
      subject: 'Welcome to Greenwood Primary - Grade 5A',
      overallStatus: 'delivered',
      priority: 'normal',
      template: 'Welcome New Learner',
      channels: [
        {
          type: 'whatsapp',
          status: 'delivered',
          sentAt: '2024-01-15T10:30:00',
          deliveredAt: '2024-01-15T10:30:15',
          openedAt: '2024-01-15T11:45:00',
          clickedAt: null,
          failureReason: null
        },
        {
          type: 'email',
          status: 'opened',
          sentAt: '2024-01-15T10:30:00',
          deliveredAt: '2024-01-15T10:31:00',
          openedAt: '2024-01-15T14:22:00',
          clickedAt: '2024-01-15T14:25:00',
          failureReason: null
        }
      ]
    },
    {
      id: 2,
      recipientName: 'Mary Smith',
      recipientEmail: 'mary.smith@email.com',
      recipientPhone: '+27821234568',
      learnerName: 'John Smith',
      subject: 'Grade Assignment Notification',
      overallStatus: 'delivered',
      priority: 'high',
      template: 'Grade Assignment',
      channels: [
        {
          type: 'sms',
          status: 'delivered',
          sentAt: '2024-01-14T09:15:00',
          deliveredAt: '2024-01-14T09:15:30',
          openedAt: null,
          clickedAt: null,
          failureReason: null
        },
        {
          type: 'email',
          status: 'opened',
          sentAt: '2024-01-14T09:15:00',
          deliveredAt: '2024-01-14T09:16:00',
          openedAt: '2024-01-14T16:45:00',
          clickedAt: '2024-01-14T16:47:00',
          failureReason: null
        }
      ]
    },
    {
      id: 3,
      recipientName: 'Lisa Brown',
      recipientEmail: 'invalid.email@invalid',
      recipientPhone: '+27821234569',
      learnerName: 'Michael Brown',
      subject: 'Your Parent Portal Access',
      overallStatus: 'partial_failure',
      priority: 'normal',
      template: 'Parent Portal Access',
      channels: [
        {
          type: 'whatsapp',
          status: 'delivered',
          sentAt: '2024-01-13T11:20:00',
          deliveredAt: '2024-01-13T11:20:20',
          openedAt: '2024-01-13T15:30:00',
          clickedAt: null,
          failureReason: null
        },
        {
          type: 'email',
          status: 'bounced',
          sentAt: '2024-01-13T11:20:00',
          deliveredAt: null,
          openedAt: null,
          clickedAt: null,
          failureReason: 'Invalid email address - domain does not exist'
        }
      ]
    },
    {
      id: 4,
      recipientName: 'Jennifer Wilson',
      recipientEmail: 'jennifer.wilson@email.com',
      recipientPhone: '+27821234570',
      learnerName: 'James Wilson',
      subject: 'Welcome to Greenwood Primary - Grade 3B',
      overallStatus: 'sent',
      priority: 'normal',
      template: 'Welcome New Learner',
      channels: [
        {
          type: 'whatsapp',
          status: 'sent',
          sentAt: '2024-01-16T08:45:00',
          deliveredAt: null,
          openedAt: null,
          clickedAt: null,
          failureReason: null
        },
        {
          type: 'email',
          status: 'sent',
          sentAt: '2024-01-16T08:45:00',
          deliveredAt: null,
          openedAt: null,
          clickedAt: null,
          failureReason: null
        }
      ]
    },
    {
      id: 5,
      recipientName: 'Robert Davis',
      recipientEmail: 'robert.davis@email.com',
      recipientPhone: '+27821234571',
      learnerName: 'Emma Davis',
      subject: 'Grade Assignment Notification',
      overallStatus: 'pending',
      priority: 'urgent',
      template: 'Grade Assignment',
      channels: [
        {
          type: 'whatsapp',
          status: 'pending',
          sentAt: null,
          deliveredAt: null,
          openedAt: null,
          clickedAt: null,
          failureReason: null
        },
        {
          type: 'sms',
          status: 'pending',
          sentAt: null,
          deliveredAt: null,
          openedAt: null,
          clickedAt: null,
          failureReason: null
        },
        {
          type: 'email',
          status: 'pending',
          sentAt: null,
          deliveredAt: null,
          openedAt: null,
          clickedAt: null,
          failureReason: null
        }
      ]
    },
    {
      id: 6,
      recipientName: 'Sarah Williams',
      recipientEmail: 'sarah.williams@email.com',
      recipientPhone: 'invalid_number',
      learnerName: 'Alex Williams',
      subject: 'School Event Notification',
      overallStatus: 'partial_failure',
      priority: 'low',
      template: 'Event Notification',
      channels: [
        {
          type: 'sms',
          status: 'failed',
          sentAt: '2024-01-15T14:20:00',
          deliveredAt: null,
          openedAt: null,
          clickedAt: null,
          failureReason: 'Invalid phone number format'
        },
        {
          type: 'email',
          status: 'delivered',
          sentAt: '2024-01-15T14:20:00',
          deliveredAt: '2024-01-15T14:21:00',
          openedAt: null,
          clickedAt: null,
          failureReason: null
        }
      ]
    }
  ]);

  const statusOptions = [
    { value: 'all', label: 'All Status', count: invitations.length },
    { value: 'pending', label: 'Pending', count: invitations.filter(i => i.overallStatus === 'pending').length },
    { value: 'sent', label: 'Sent', count: invitations.filter(i => i.overallStatus === 'sent').length },
    { value: 'delivered', label: 'Delivered', count: invitations.filter(i => i.overallStatus === 'delivered').length },
    { value: 'opened', label: 'Opened', count: invitations.filter(i => i.channels.some(c => c.status === 'opened')).length },
    { value: 'partial_failure', label: 'Partial Failure', count: invitations.filter(i => i.overallStatus === 'partial_failure').length },
    { value: 'failed', label: 'Failed', count: invitations.filter(i => i.overallStatus === 'failed').length }
  ];

  const channelOptions = [
    { value: 'all', label: 'All Channels' },
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'sms', label: 'SMS' },
    { value: 'email', label: 'Email' }
  ];

  const getOverallStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <FiClock className="h-4 w-4 text-yellow-500" />;
      case 'sent':
        return <FiSend className="h-4 w-4 text-blue-500" />;
      case 'delivered':
        return <FiCheck className="h-4 w-4 text-green-500" />;
      case 'opened':
        return <FiEye className="h-4 w-4 text-purple-500" />;
      case 'partial_failure':
        return <FiInfo className="h-4 w-4 text-orange-500" />;
      case 'failed':
        return <FiX className="h-4 w-4 text-red-500" />;
      default:
        return <FiMail className="h-4 w-4 text-gray-500" />;
    }
  };

  const getOverallStatusBadge = (status) => {
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
      case 'partial_failure':
        return `${baseClasses} bg-orange-100 text-orange-800`;
      case 'failed':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getPriorityBadge = (priority) => {
    const baseClasses = "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium";
    switch (priority) {
      case 'urgent':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'high':
        return `${baseClasses} bg-orange-100 text-orange-800`;
      case 'normal':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'low':
        return `${baseClasses} bg-gray-100 text-gray-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-ZA');
  };

  const filteredInvitations = invitations.filter(invitation => {
    const statusMatch = selectedStatus === 'all' || invitation.overallStatus === selectedStatus;
    const channelMatch = selectedChannel === 'all' || invitation.channels.some(c => c.type === selectedChannel);
    return statusMatch && channelMatch;
  });

  const handleResendInvitation = async (invitationId, channelType = null) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Resending invitation:', invitationId, channelType ? `via ${channelType}` : 'all channels');
      alert(`Invitation resent successfully${channelType ? ` via ${channelType}` : ''}!`);
    } catch (error) {
      console.error('Error resending invitation:', error);
      alert('Error resending invitation. Please try again.');
    }
  };

  const getDeliveryStats = () => {
    const stats = {
      whatsapp: { delivered: 0, failed: 0, pending: 0, total: 0 },
      sms: { delivered: 0, failed: 0, pending: 0, total: 0 },
      email: { delivered: 0, failed: 0, pending: 0, total: 0 }
    };

    invitations.forEach(invitation => {
      invitation.channels.forEach(channel => {
        if (stats[channel.type]) {
          stats[channel.type].total++;
          if (channel.status === 'delivered' || channel.status === 'opened') {
            stats[channel.type].delivered++;
          } else if (channel.status === 'failed' || channel.status === 'bounced') {
            stats[channel.type].failed++;
          } else if (channel.status === 'pending') {
            stats[channel.type].pending++;
          }
        }
      });
    });
    return stats;
  };

  const deliveryStats = getDeliveryStats();

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl leading-6 font-semibold text-gray-900">
              Multi-Channel Status Tracker
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Monitor delivery and engagement across WhatsApp, SMS, and Email channels
            </p>
          </div>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            <FiRefreshCw className="mr-2 h-4 w-4" />
            Refresh Status
          </button>
        </div>

        {/* Channel Performance Overview */}
        <div className="mb-6 bg-gray-50 rounded-lg p-4">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Channel Performance</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(deliveryStats).map(([channel, stats]) => {
              const successRate = stats.total > 0 ? ((stats.delivered / stats.total) * 100).toFixed(1) : 0;
              const getChannelIcon = (channel) => {
                switch (channel) {
                  case 'whatsapp': return <FiMessageSquare className="h-5 w-5 text-green-500" />;
                  case 'sms': return <FiSmartphone className="h-5 w-5 text-blue-500" />;
                  case 'email': return <FiMail className="h-5 w-5 text-red-500" />;
                  default: return null;
                }
              };
              return (
                <div key={channel} className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {getChannelIcon(channel)}
                      <span className="font-medium text-gray-900 capitalize">
                        {channel === 'whatsapp' ? 'WhatsApp' : channel.toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {successRate}%
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Delivered:</span>
                      <span className="text-green-600 font-medium">{stats.delivered}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Failed:</span>
                      <span className="text-red-600 font-medium">{stats.failed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pending:</span>
                      <span className="text-yellow-600 font-medium">{stats.pending}</span>
                    </div>
                  </div>
                  <div className="mt-3 bg-gray-200 rounded-full h-2">
                    <div
                       className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${successRate}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Filter Controls */}
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Channel</label>
            <select
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value)}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              {channelOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="mb-6">
          <div className="hidden sm:block">
            <nav className="flex space-x-8 overflow-x-auto">
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
                  <span className={`ml-2 py-0.5 px-2.5 rounded-full text-xs ${
                    selectedStatus === option.value ? 'bg-blue-100 text-blue-900' : 'bg-gray-100 text-gray-900'
                  }`}>
                    {option.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Invitations List */}
        <div className="space-y-4">
          {filteredInvitations.map((invitation) => (
            <div key={invitation.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    {getOverallStatusIcon(invitation.overallStatus)}
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h4 className="text-sm font-medium text-gray-900">
                          {invitation.recipientName}
                        </h4>
                        <span className={getOverallStatusBadge(invitation.overallStatus)}>
                          {invitation.overallStatus.replace('_', ' ').charAt(0).toUpperCase() + invitation.overallStatus.replace('_', ' ').slice(1)}
                        </span>
                        <span className={getPriorityBadge(invitation.priority)}>
                          {invitation.priority.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {invitation.recipientEmail} | {invitation.recipientPhone}
                      </p>
                    </div>
                    <DeliveryStatus invitation={invitation} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-sm text-gray-900">
                        <strong>Learner:</strong> {invitation.learnerName}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Subject:</strong> {invitation.subject}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">
                        <strong>Template:</strong> {invitation.template}
                      </p>
                      <p className="text-sm text-gray-500">
                        <strong>Channels:</strong> {invitation.channels.map(c => c.type).join(', ')}
                      </p>
                    </div>
                  </div>

                  {/* Channel Status Summary */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {invitation.channels.map((channel, index) => {
                      const channelName = channel.type === 'whatsapp' ? 'WhatsApp' : channel.type.toUpperCase();
                      const statusColor = channel.status === 'delivered' || channel.status === 'opened' ? 'text-green-600' :
                                         channel.status === 'failed' || channel.status === 'bounced' ? 'text-red-600' :
                                         channel.status === 'sent' ? 'text-blue-600' : 'text-yellow-600';
                                            return (
                        <span key={`${channel.type}-${index}`} className={`text-xs ${statusColor} bg-gray-100 px-2 py-1 rounded`}>
                          {channelName}: {channel.status}
                        </span>
                      );
                    })}
                  </div>

                  {/* Show failure reasons if any */}
                  {invitation.channels.some(c => c.failureReason) && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-3">
                      <h5 className="text-sm font-medium text-red-800 mb-2">Delivery Issues:</h5>
                      {invitation.channels.filter(c => c.failureReason).map((channel, index) => (
                        <p key={index} className="text-sm text-red-700">
                          <strong className="capitalize">{channel.type}:</strong> {channel.failureReason}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Expandable detailed timeline */}
                  <div className="mt-4">
                    <button
                      onClick={() => setSelectedInvitation(selectedInvitation?.id === invitation.id ? null : invitation)}
                      className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center"
                    >
                      {selectedInvitation?.id === invitation.id ? 'Hide Details' : 'View Details'}
                      {selectedInvitation?.id === invitation.id ? <FiX className="ml-1" /> : <FiEye className="ml-1" />}
                    </button>
                    {selectedInvitation?.id === invitation.id && (
                      <div className="mt-4">
                        <ChannelTimeline channels={invitation.channels} />
                        <div className="mt-4 flex gap-2">
                          <button
                            onClick={() => handleResendInvitation(invitation.id)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                          >
                            Resend All
                            <FiRefreshCw className="ml-2 h-3 w-3" />
                          </button>
                          {invitation.channels.map(channel => (
                            (channel.status === 'failed' || channel.status === 'bounced' || channel.status === 'pending') && (
                              <button
                                key={`resend-${invitation.id}-${channel.type}`}
                                onClick={() => handleResendInvitation(invitation.id, channel.type)}
                                className="inline-flex items-center px-3 py-1.5 border border-blue-500 text-xs font-medium rounded text-blue-700 bg-white hover:bg-blue-50"
                              >
                                Resend {channel.type.toUpperCase()}
                                {channel.type === 'whatsapp' && <FiMessageSquare className="ml-2 h-3 w-3" />}
                                {channel.type === 'sms' && <FiSmartphone className="ml-2 h-3 w-3" />}
                                {channel.type === 'email' && <FiMail className="ml-2 h-3 w-3" />}
                              </button>
                            )
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {filteredInvitations.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No invitations match your selected filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatusTracker;