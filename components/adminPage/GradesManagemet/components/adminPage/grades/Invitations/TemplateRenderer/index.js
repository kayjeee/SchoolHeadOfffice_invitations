import React, { useState } from 'react';
import WhatsAppTemplate from './WhatsAppTemplate';
import SMSTemplate from './SMSTemplate';
import EmailTemplate from './EmailTemplate';

/**
 * TemplateRenderer Component
 * 
 * Main component that manages the rendering of different channel-specific templates.
 * Handles tab switching between channels and coordinates content changes.
 * 
 * @param {Object} props
 * @param {string[]} props.channels - Array of selected channel IDs
 * @param {Object} props.content - Object mapping channel IDs to their content
 * @param {string} props.subject - Email subject line
 * @param {Function} props.onChange - Callback when content changes
 * @param {Function} props.onSubjectChange - Callback when subject changes
 * @param {Object} props.selectedSchool - Selected school object
 * @param {Object} props.user - User object
 */
const TemplateRenderer = ({ 
  channels = [], 
  content = {}, 
  subject = '',
  onChange, 
  onSubjectChange,
  selectedSchool, 
  user 
}) => {
  const [activeTab, setActiveTab] = useState(channels[0] || 'whatsapp');

  // Update active tab if it's not in the selected channels
  React.useEffect(() => {
    if (channels.length > 0 && !channels.includes(activeTab)) {
      setActiveTab(channels[0]);
    }
  }, [channels, activeTab]);

  if (channels.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.013 8.013 0 01-7-4c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No channels selected</h3>
          <p className="mt-1 text-sm text-gray-500">
            Select one or more delivery channels to start composing your message.
          </p>
        </div>
      </div>
    );
  }

  const getChannelDisplayName = (channel) => {
    const names = {
      whatsapp: 'WhatsApp',
      sms: 'SMS',
      email: 'Email'
    };
    return names[channel] || channel;
  };

  const getChannelIcon = (channel) => {
    const icons = {
      whatsapp: '💬',
      sms: '📱',
      email: '📧'
    };
    return icons[channel] || '📝';
  };

  const getTabColor = (channel) => {
    const colors = {
      whatsapp: 'border-green-500 text-green-600',
      sms: 'border-blue-500 text-blue-600',
      email: 'border-purple-500 text-purple-600'
    };
    return colors[channel] || 'border-gray-500 text-gray-600';
  };

  const renderTemplate = () => {
    const commonProps = {
      selectedSchool,
      user,
      onChange
    };

    switch (activeTab) {
      case 'whatsapp':
        return (
          <WhatsAppTemplate
            {...commonProps}
            content={content.whatsapp || ''}
          />
        );
      case 'sms':
        return (
          <SMSTemplate
            {...commonProps}
            content={content.sms || ''}
          />
        );
      case 'email':
        return (
          <EmailTemplate
            {...commonProps}
            content={content.email || ''}
            subject={subject}
            onSubjectChange={onSubjectChange}
          />
        );
      default:
        return (
          <div className="text-center py-8 text-gray-500">
            <p>Unknown channel: {activeTab}</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Channel Tabs */}
      {channels.length > 1 && (
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {channels.map(channel => (
              <button
                key={channel}
                onClick={() => setActiveTab(channel)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                  activeTab === channel
                    ? getTabColor(channel)
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{getChannelIcon(channel)}</span>
                <span>{getChannelDisplayName(channel)} Content</span>
                {content[channel] && content[channel].trim() && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    ✓
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* Single Channel Header */}
      {channels.length === 1 && (
        <div className="flex items-center space-x-2 pb-2">
          <span className="text-lg">{getChannelIcon(channels[0])}</span>
          <h3 className="text-lg font-medium text-gray-900">
            {getChannelDisplayName(channels[0])} Message
          </h3>
          {content[channels[0]] && content[channels[0]].trim() && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Content ready
            </span>
          )}
        </div>
      )}

      {/* Template Content */}
      <div className="min-h-[400px]">
        {renderTemplate()}
      </div>

      {/* Content Summary */}
      {channels.length > 1 && (
        <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Content Summary</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {channels.map(channel => (
              <div key={channel} className="text-sm">
                <div className="flex items-center space-x-2">
                  <span>{getChannelIcon(channel)}</span>
                  <span className="font-medium">{getChannelDisplayName(channel)}</span>
                  {content[channel] && content[channel].trim() ? (
                    <span className="text-green-600">✓</span>
                  ) : (
                    <span className="text-gray-400">○</span>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {content[channel] && content[channel].trim() 
                    ? `${content[channel].length} characters`
                    : 'No content'
                  }
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateRenderer;

