import React, { useState } from 'react';
import { Icon } from '../UI/Icon';
import { Learner, InviteChannel, InviteMessage } from '../../types';

interface MessageComposerProps {
  message: InviteMessage;
  onMessageChange: (message: InviteMessage) => void;
  selectedLearners: Learner[];
  selectedChannel: InviteChannel;
  onSend: () => void;
  onPrevious: () => void;
  sending: boolean;
  canSend: boolean;
}

const MESSAGE_TEMPLATES = {
  email: {
    subject: 'You\'re invited to join our learning platform!',
    body: `Hi {{learnerName}},

You've been invited to join our learning platform. We're excited to have you as part of our learning community!

Click the link below to get started:
{{inviteLink}}

If you have any questions, feel free to reach out to us.

Best regards,
The Learning Team`
  },
  sms: {
    body: 'Hi {{learnerName}}! You\'re invited to join our learning platform. Get started: {{inviteLink}}'
  },
  'app-notification': {
    title: 'Learning Platform Invitation',
    body: 'Hi {{learnerName}}! You\'ve been invited to join our learning platform. Tap to get started.'
  },
  'portal-message': {
    subject: 'Welcome to the Learning Platform',
    body: `Dear {{learnerName}},

Welcome to our learning platform! We're thrilled to have you join our community of learners.

Your personalized learning journey awaits. Click here to get started:
{{inviteLink}}

Explore courses, connect with peers, and track your progress all in one place.

Happy learning!`
  }
};

export const MessageComposer: React.FC<MessageComposerProps> = ({
  message,
  onMessageChange,
  selectedLearners,
  selectedChannel,
  onSend,
  onPrevious,
  sending,
  canSend
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [previewLearner, setPreviewLearner] = useState(selectedLearners[0]);

  const template = MESSAGE_TEMPLATES[selectedChannel.id as keyof typeof MESSAGE_TEMPLATES];

  const useTemplate = () => {
    onMessageChange({
      ...message,
      ...template
    });
  };

  const handleFieldChange = (field: keyof InviteMessage, value: string) => {
    onMessageChange({
      ...message,
      [field]: value
    });
  };

  const renderPreview = () => {
    if (!previewLearner) return null;

    const replaceVariables = (text: string) => {
      return text
        .replace(/\{\{learnerName\}\}/g, previewLearner.name)
        .replace(/\{\{inviteLink\}\}/g, 'https://platform.example.com/invite/abc123')
        .replace(/\{\{gradeName\}\}/g, previewLearner.gradeName);
    };

    return (
      <div className="message-preview">
        <div className="preview-header">
          <h4>Preview for {previewLearner.name}</h4>
          <select
            value={previewLearner.id}
            onChange={(e) => {
              const learner = selectedLearners.find(l => l.id === e.target.value);
              if (learner) setPreviewLearner(learner);
            }}
            className="learner-selector"
          >
            {selectedLearners.map(learner => (
              <option key={learner.id} value={learner.id}>
                {learner.name}
              </option>
            ))}
          </select>
        </div>

        <div className="preview-content">
          {message.subject && (
            <div className="preview-field">
              <strong>Subject:</strong> {replaceVariables(message.subject)}
            </div>
          )}
          {message.title && (
            <div className="preview-field">
              <strong>Title:</strong> {replaceVariables(message.title)}
            </div>
          )}
          <div className="preview-field">
            <strong>Message:</strong>
            <div className="preview-body">
              {replaceVariables(message.body).split('\n').map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const getCharacterLimit = () => {
    switch (selectedChannel.id) {
      case 'sms': return 160;
      case 'app-notification': return 200;
      default: return null;
    }
  };

  const characterLimit = getCharacterLimit();
  const currentLength = message.body.length;

  return (
    <div className="message-composer">
      <div className="composer-header">
        <h3>Compose Invitation Message</h3>
        <p>Customize your invitation message for {selectedChannel.name}</p>
      </div>

      <div className="composer-actions">
        <button
          type="button"
          onClick={useTemplate}
          className="btn btn-secondary"
        >
          <Icon name="file-text" />
          Use Template
        </button>
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className="btn btn-secondary"
        >
          <Icon name="eye" />
          {showPreview ? 'Hide Preview' : 'Show Preview'}
        </button>
      </div>

      <div className="composer-content">
        <div className="message-form">
          {(selectedChannel.id === 'email' || selectedChannel.id === 'portal-message') && (
            <div className="form-field">
              <label htmlFor="subject">Subject</label>
              <input
                id="subject"
                type="text"
                value={message.subject || ''}
                onChange={(e) => handleFieldChange('subject', e.target.value)}
                placeholder="Enter subject line"
                className="form-input"
              />
            </div>
          )}

          {selectedChannel.id === 'app-notification' && (
            <div className="form-field">
              <label htmlFor="title">Title</label>
              <input
                id="title"
                type="text"
                value={message.title || ''}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                placeholder="Enter notification title"
                className="form-input"
              />
            </div>
          )}

          <div className="form-field">
            <label htmlFor="body">
              Message
              {characterLimit && (
                <span className={`character-count ${currentLength > characterLimit ? 'over-limit' : ''}`}>
                  {currentLength}/{characterLimit}
                </span>
              )}
            </label>
            <textarea
              id="body"
              value={message.body}
              onChange={(e) => handleFieldChange('body', e.target.value)}
              placeholder="Enter your invitation message"
              className="form-textarea"
              rows={selectedChannel.id === 'sms' ? 3 : 8}
            />
            {characterLimit && currentLength > characterLimit && (
              <div className="error-message">
                Message exceeds character limit by {currentLength - characterLimit} characters
              </div>
            )}
          </div>

          <div className="variable-help">
            <h5>Available Variables:</h5>
            <div className="variables">
              <span className="variable">{'{{learnerName}}'}</span>
              <span className="variable">{'{{inviteLink}}'}</span>
              <span className="variable">{'{{gradeName}}'}</span>
            </div>
          </div>
        </div>

        {showPreview && renderPreview()}
      </div>

      <div className="send-summary">
        <div className="summary-info">
          <Icon name="users" />
          <span>Sending to {selectedLearners.length} learners via {selectedChannel.name}</span>
        </div>
      </div>

      <div className="step-actions">
        <button
          type="button"
          onClick={onPrevious}
          className="btn btn-secondary"
          disabled={sending}
        >
          Previous
        </button>
        <button
          type="button"
          onClick={onSend}
          className="btn btn-primary"
          disabled={!canSend || sending}
        >
          {sending ? (
            <>
              <Icon name="loader" className="spinning" />
              Sending Invites...
            </>
          ) : (
            <>
              <Icon name="send" />
              Send Invites
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default MessageComposer;

