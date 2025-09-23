import React from 'react';
import { Icon } from '../UI/Icon';
import { Learner } from '../../types';

interface LearnerCardProps {
  learner: Learner;
  isSelected: boolean;
  onToggle: () => void;
}

export const LearnerCard: React.FC<LearnerCardProps> = ({
  learner,
  isSelected,
  onToggle
}) => {
  return (
    <div 
      className={`learner-card ${isSelected ? 'selected' : ''}`}
      onClick={onToggle}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onToggle();
        }
      }}
    >
      <div className="learner-card-header">
        <div className="learner-avatar">
          {learner.avatar ? (
            <img src={learner.avatar} alt={`${learner.name} avatar`} />
          ) : (
            <div className="avatar-placeholder">
              {learner.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="selection-indicator">
          {isSelected ? (
            <Icon name="check-circle" className="selected-icon" />
          ) : (
            <Icon name="circle" className="unselected-icon" />
          )}
        </div>
      </div>

      <div className="learner-info">
        <h4 className="learner-name">{learner.name}</h4>
        <p className="learner-email">{learner.email}</p>
        <div className="learner-meta">
          <span className="grade-badge">{learner.gradeName}</span>
          {learner.lastActive && (
            <span className="last-active">
              Last active: {new Date(learner.lastActive).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      {learner.inviteStatus && (
        <div className={`invite-status ${learner.inviteStatus}`}>
          <Icon 
            name={
              learner.inviteStatus === 'sent' ? 'mail' :
              learner.inviteStatus === 'accepted' ? 'check' :
              learner.inviteStatus === 'declined' ? 'x' :
              'clock'
            } 
          />
          <span>{learner.inviteStatus}</span>
        </div>
      )}
    </div>
  );
};

export default LearnerCard;

