import React from 'react';
import { Icon } from '../UI/Icon';
import { InviteChannel } from '../../types';

interface ChannelSelectionProps {
  selectedChannel: InviteChannel | null;
  onSelectChannel: (channel: InviteChannel) => void;
  onNext: () => void;
  onPrevious: () => void;
  canProceed: boolean;
}

const AVAILABLE_CHANNELS: InviteChannel[] = [
  {
    id: 'email',
    name: 'Email',
    description: 'Send invites via email with customizable message',
    icon: 'mail',
    features: ['Customizable message', 'Automatic reminders', 'Delivery tracking'],
    recommended: true
  },
  {
    id: 'sms',
    name: 'SMS',
    description: 'Send invites via text message',
    icon: 'message-square',
    features: ['Instant delivery', 'High open rates', 'Character limit applies'],
    recommended: false
  },
  {
    id: 'app-notification',
    name: 'App Notification',
    description: 'Send push notifications through the mobile app',
    icon: 'smartphone',
    features: ['Real-time delivery', 'Rich media support', 'Requires app installation'],
    recommended: false
  },
  {
    id: 'portal-message',
    name: 'Portal Message',
    description: 'Send message through the learning portal',
    icon: 'monitor',
    features: ['Rich formatting', 'File attachments', 'Read receipts'],
    recommended: false
  }
];

export const ChannelSelection: React.FC<ChannelSelectionProps> = ({
  selectedChannel,
  onSelectChannel,
  onNext,
  onPrevious,
  canProceed
}) => {
  return (
    <div className="channel-selection">
      <div className="selection-header">
        <h3>Choose Invitation Channel</h3>
        <p>Select how you want to send invitations to learners</p>
      </div>

      <div className="channels-grid">
        {AVAILABLE_CHANNELS.map(channel => (
          <div
            key={channel.id}
            className={`channel-card ${selectedChannel?.id === channel.id ? 'selected' : ''}`}
            onClick={() => onSelectChannel(channel)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectChannel(channel);
              }
            }}
          >
            {channel.recommended && (
              <div className="recommended-badge">
                <Icon name="star" />
                Recommended
              </div>
            )}

            <div className="channel-header">
              <div className="channel-icon">
                <Icon name={channel.icon} />
              </div>
              <div className="channel-info">
                <h4>{channel.name}</h4>
                <p>{channel.description}</p>
              </div>
              <div className="selection-indicator">
                {selectedChannel?.id === channel.id ? (
                  <Icon name="check-circle" className="selected-icon" />
                ) : (
                  <Icon name="circle" className="unselected-icon" />
                )}
              </div>
            </div>

            <div className="channel-features">
              <h5>Features:</h5>
              <ul>
                {channel.features.map((feature, index) => (
                  <li key={index}>
                    <Icon name="check" className="feature-icon" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      <div className="step-actions">
        <button
          type="button"
          onClick={onPrevious}
          className="btn btn-secondary"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={onNext}
          className="btn btn-primary"
          disabled={!canProceed}
        >
          Next: Compose Message
        </button>
      </div>
    </div>
  );
};

export default ChannelSelection;

