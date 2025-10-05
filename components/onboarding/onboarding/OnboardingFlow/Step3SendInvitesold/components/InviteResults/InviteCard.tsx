import React from 'react';
import { Icon } from '../UI/Icon';
import { Invite, InviteStatus } from '../../types';

interface InviteCardProps {
  invite: Invite;
  isSelected: boolean;
  onSelect: () => void;
  onResend: () => void;
  onCancel: () => void;
}

export const InviteCard: React.FC<InviteCardProps> = ({
  invite,
  isSelected,
  onSelect,
  onResend,
  onCancel
}) => {
  const getStatusIcon = (status: InviteStatus) => {
    switch (status) {
      case 'sent': return 'mail';
      case 'delivered': return 'check';
      case 'opened': return 'eye';
      case 'accepted': return 'check-circle';
      case 'declined': return 'x-circle';
      case 'failed': return 'alert-circle';
      case 'pending': return 'clock';
      default: return 'circle';
    }
  };

  const getStatusColor = (status: InviteStatus) => {
    switch (status) {
      case 'sent': return 'blue';
      case 'delivered': return 'green';
      case 'opened': return 'purple';
      case 'accepted': return 'green';
      case 'declined': return 'red';
      case 'failed': return 'red';
      case 'pending': return 'yellow';
      default: return 'gray';
    }
  };

  const canResend = ['failed', 'declined'].includes(invite.status);
  const canCancel = ['pending', 'sent', 'delivered'].includes(invite.status);

  return (
    <div className={`invite-card ${isSelected ? 'selected' : ''}`}>
      <div className="invite-card-header">
        <div className="selection-checkbox">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onSelect}
            aria-label={`Select invite for ${invite.learnerName}`}
          />
        </div>

        <div className="learner-info">
          <div className="learner-avatar">
            {invite.learnerAvatar ? (
              <img src={invite.learnerAvatar} alt={`${invite.learnerName} avatar`} />
            ) : (
              <div className="avatar-placeholder">
                {invite.learnerName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="learner-details">
            <h4 className="learner-name">{invite.learnerName}</h4>
            <p className="learner-email">{invite.learnerEmail}</p>
            <span className="grade-badge">{invite.gradeName}</span>
          </div>
        </div>

        <div className={`invite-status ${getStatusColor(invite.status)}`}>
          <Icon name={getStatusIcon(invite.status)} />
          <span>{invite.status.charAt(0).toUpperCase() + invite.status.slice(1)}</span>
        </div>
      </div>

      <div className="invite-card-body">
        <div className="invite-details">
          <div className="detail-item">
            <Icon name="calendar" />
            <span>Sent: {new Date(invite.sentAt).toLocaleString()}</span>
          </div>
          
          {invite.deliveredAt && (
            <div className="detail-item">
              <Icon name="truck" />
              <span>Delivered: {new Date(invite.deliveredAt).toLocaleString()}</span>
            </div>
          )}
          
          {invite.openedAt && (
            <div className="detail-item">
              <Icon name="eye" />
              <span>Opened: {new Date(invite.openedAt).toLocaleString()}</span>
            </div>
          )}
          
          {invite.respondedAt && (
            <div className="detail-item">
              <Icon name="message-circle" />
              <span>Responded: {new Date(invite.respondedAt).toLocaleString()}</span>
            </div>
          )}

          <div className="detail-item">
            <Icon name="send" />
            <span>Channel: {invite.channel}</span>
          </div>
        </div>

        {invite.errorMessage && (
          <div className="error-message">
            <Icon name="alert-triangle" />
            <span>{invite.errorMessage}</span>
          </div>
        )}

        {invite.inviteLink && (
          <div className="invite-link">
            <Icon name="link" />
            <span>Invite Link:</span>
            <code>{invite.inviteLink}</code>
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(invite.inviteLink!)}
              className="copy-link-btn"
              title="Copy invite link"
            >
              <Icon name="copy" />
            </button>
          </div>
        )}
      </div>

      <div className="invite-card-actions">
        {canResend && (
          <button
            type="button"
            onClick={onResend}
            className="btn btn-secondary btn-sm"
          >
            <Icon name="refresh-cw" />
            Resend
          </button>
        )}
        
        {canCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-danger btn-sm"
          >
            <Icon name="x" />
            Cancel
          </button>
        )}

        {invite.status === 'accepted' && (
          <span className="success-message">
            <Icon name="check-circle" />
            Invite accepted!
          </span>
        )}
      </div>
    </div>
  );
};

export default InviteCard;

