import React, { useState } from 'react';
import { InviteCard } from './InviteCard';
import { BulkActions } from './BulkActions';
import { Icon } from '../UI/Icon';
import { Invite, InviteStatus } from '../../types';

interface InviteResultsProps {
  invites: Invite[];
  onResend: (inviteId: string) => void;
  onCancel: (inviteId: string) => void;
  onDownload: () => void;
  onCopyLinks: () => void;
  onComplete: () => void;
  onPrevious: () => void;
}

export const InviteResults: React.FC<InviteResultsProps> = ({
  invites,
  onResend,
  onCancel,
  onDownload,
  onCopyLinks,
  onComplete,
  onPrevious
}) => {
  const [selectedInvites, setSelectedInvites] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<InviteStatus | 'all'>('all');

  const statusCounts = invites.reduce((acc, invite) => {
    acc[invite.status] = (acc[invite.status] || 0) + 1;
    return acc;
  }, {} as Record<InviteStatus, number>);

  const filteredInvites = invites.filter(invite => 
    statusFilter === 'all' || invite.status === statusFilter
  );

  const handleSelectInvite = (inviteId: string) => {
    setSelectedInvites(prev => 
      prev.includes(inviteId) 
        ? prev.filter(id => id !== inviteId)
        : [...prev, inviteId]
    );
  };

  const handleSelectAll = () => {
    setSelectedInvites(filteredInvites.map(invite => invite.id));
  };

  const handleDeselectAll = () => {
    setSelectedInvites([]);
  };

  const handleBulkResend = () => {
    selectedInvites.forEach(inviteId => onResend(inviteId));
    setSelectedInvites([]);
  };

  const handleBulkCancel = () => {
    selectedInvites.forEach(inviteId => onCancel(inviteId));
    setSelectedInvites([]);
  };

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

  return (
    <div className="invite-results">
      <div className="results-header">
        <h3>Invitation Results</h3>
        <p>Review the status of sent invitations</p>
      </div>

      <div className="results-summary">
        <div className="summary-cards">
          <div className="summary-card total">
            <Icon name="users" />
            <div className="summary-info">
              <span className="summary-number">{invites.length}</span>
              <span className="summary-label">Total Invites</span>
            </div>
          </div>
          
          {Object.entries(statusCounts).map(([status, count]) => (
            <div 
              key={status} 
              className={`summary-card ${getStatusColor(status as InviteStatus)}`}
            >
              <Icon name={getStatusIcon(status as InviteStatus)} />
              <div className="summary-info">
                <span className="summary-number">{count}</span>
                <span className="summary-label">{status.charAt(0).toUpperCase() + status.slice(1)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="results-controls">
        <div className="filter-controls">
          <label htmlFor="status-filter">Filter by status:</label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as InviteStatus | 'all')}
            className="status-filter"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="sent">Sent</option>
            <option value="delivered">Delivered</option>
            <option value="opened">Opened</option>
            <option value="accepted">Accepted</option>
            <option value="declined">Declined</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        <BulkActions
          selectedCount={selectedInvites.length}
          totalCount={filteredInvites.length}
          onSelectAll={handleSelectAll}
          onDeselectAll={handleDeselectAll}
          onBulkResend={handleBulkResend}
          onBulkCancel={handleBulkCancel}
          onDownload={onDownload}
          onCopyLinks={onCopyLinks}
        />
      </div>

      <div className="invites-list">
        {filteredInvites.map(invite => (
          <InviteCard
            key={invite.id}
            invite={invite}
            isSelected={selectedInvites.includes(invite.id)}
            onSelect={() => handleSelectInvite(invite.id)}
            onResend={() => onResend(invite.id)}
            onCancel={() => onCancel(invite.id)}
          />
        ))}
      </div>

      {filteredInvites.length === 0 && (
        <div className="empty-state">
          <Icon name="inbox" />
          <p>No invites found matching the selected filter.</p>
        </div>
      )}

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
          onClick={onComplete}
          className="btn btn-primary"
        >
          <Icon name="check" />
          Complete
        </button>
      </div>
    </div>
  );
};

export default InviteResults;

