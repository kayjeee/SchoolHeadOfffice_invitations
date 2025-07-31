import React from 'react';
import { FiMail, FiMessageSquare, FiSmartphone, FiCheckCircle } from 'react-icons/fi';

/**
 * ChannelSelector Component
 * 
 * Handles the selection of communication channels for sending invitations.
 * Supports WhatsApp, SMS, and Email channels with visual indicators and descriptions.
 * 
 * @param {Object} props
 * @param {string[]} props.selectedChannels - Array of currently selected channel IDs
 * @param {Function} props.onChange - Callback function when channel selection changes
 * @param {Object} props.user - User object for any user-specific channel availability
 * @param {Object} props.selectedSchool - Selected school object for school-specific settings
 */
const ChannelSelector = ({ selectedChannels = [], onChange, user, selectedSchool }) => {
  const channels = [
    { 
      id: 'whatsapp', 
      name: 'WhatsApp', 
      icon: FiMessageSquare, 
      recommended: true,
      description: 'Instant delivery, high open rates',
      color: 'green',
      availability: 'available' // Could be 'available', 'limited', 'unavailable'
    },
    { 
      id: 'sms', 
      name: 'SMS', 
      icon: FiSmartphone, 
      recommended: false,
      description: 'Direct to mobile, reliable delivery',
      color: 'blue',
      availability: 'available'
    },
    { 
      id: 'email', 
      name: 'Email', 
      icon: FiMail, 
      recommended: false,
      description: 'Detailed content, supports attachments',
      color: 'purple',
      availability: 'available'
    }
  ];

  const handleChannelToggle = (channelId) => {
    if (typeof onChange === 'function') {
      onChange(channelId);
    }
  };

  const getChannelStatusColor = (channel) => {
    if (channel.availability === 'unavailable') return 'gray';
    if (selectedChannels.includes(channel.id)) return channel.color;
    return 'gray';
  };

  const getChannelBorderColor = (channel) => {
    if (selectedChannels.includes(channel.id)) {
      switch (channel.color) {
        case 'green': return 'border-green-500 bg-green-50';
        case 'blue': return 'border-blue-500 bg-blue-50';
        case 'purple': return 'border-purple-500 bg-purple-50';
        default: return 'border-gray-500 bg-gray-50';
      }
    }
    return 'border-gray-300 hover:border-gray-400';
  };

  const getRecommendedBadgeColor = (channel) => {
    switch (channel.color) {
      case 'green': return 'bg-green-100 text-green-800';
      case 'blue': return 'bg-blue-100 text-blue-800';
      case 'purple': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Delivery Channels
        </label>
        {selectedChannels.length > 0 && (
          <span className="text-xs text-gray-500">
            {selectedChannels.length} channel{selectedChannels.length !== 1 ? 's' : ''} selected
          </span>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {channels.map(channel => {
          const IconComponent = channel.icon;
          const isSelected = selectedChannels.includes(channel.id);
          const isDisabled = channel.availability === 'unavailable';
          
          return (
            <div
              key={channel.id}
              className={`relative rounded-lg border p-4 transition-all ${
                isDisabled 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'cursor-pointer'
              } ${getChannelBorderColor(channel)}`}
              onClick={() => !isDisabled && handleChannelToggle(channel.id)}
            >
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => !isDisabled && handleChannelToggle(channel.id)}
                    disabled={isDisabled}
                    className={`rounded border-gray-300 focus:ring-2 ${
                      channel.color === 'green' ? 'text-green-600 focus:ring-green-500' :
                      channel.color === 'blue' ? 'text-blue-600 focus:ring-blue-500' :
                      channel.color === 'purple' ? 'text-purple-600 focus:ring-purple-500' :
                      'text-gray-600 focus:ring-gray-500'
                    }`}
                  />
                </div>
                <div className="ml-3 flex-1">
                  <div className="flex items-center">
                    <IconComponent 
                      className={`h-4 w-4 mr-2 ${
                        isSelected 
                          ? `text-${channel.color}-600` 
                          : 'text-gray-500'
                      }`} 
                    />
                    <span className={`font-medium ${
                      isSelected ? 'text-gray-900' : 'text-gray-700'
                    }`}>
                      {channel.name}
                    </span>
                    {channel.recommended && (
                      <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getRecommendedBadgeColor(channel)}`}>
                        Recommended
                      </span>
                    )}
                    {isSelected && (
                      <FiCheckCircle className={`ml-2 h-4 w-4 text-${channel.color}-600`} />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {channel.description}
                  </p>
                  {channel.availability === 'limited' && (
                    <p className="text-xs text-amber-600 mt-1">
                      Limited availability
                    </p>
                  )}
                  {channel.availability === 'unavailable' && (
                    <p className="text-xs text-red-600 mt-1">
                      Currently unavailable
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {selectedChannels.length === 0 && (
        <div className="rounded-md bg-red-50 p-3">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                No channels selected
              </h3>
              <div className="mt-1 text-sm text-red-700">
                <p>Please select at least one delivery channel to continue.</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {selectedChannels.length > 0 && (
        <div className="rounded-md bg-blue-50 p-3">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Selected channels
              </h3>
              <div className="mt-1 text-sm text-blue-700">
                <p>
                  Messages will be sent via: {selectedChannels.map(id => 
                    channels.find(c => c.id === id)?.name
                  ).join(', ')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChannelSelector;

