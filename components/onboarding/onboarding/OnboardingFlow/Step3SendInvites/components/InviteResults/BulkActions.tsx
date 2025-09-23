import React from 'react';
import { Icon } from '../UI/Icon';

interface BulkActionsProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onBulkResend: () => void;
  onBulkCancel: () => void;
  onDownload: () => void;
  onCopyLinks: () => void;
}

export const BulkActions: React.FC<BulkActionsProps> = ({
  selectedCount,
  totalCount,
  onSelectAll,
  onDeselectAll,
  onBulkResend,
  onBulkCancel,
  onDownload,
  onCopyLinks
}) => {
  const hasSelection = selectedCount > 0;
  const allSelected = selectedCount === totalCount;

  return (
    <div className="bulk-actions">
      <div className="selection-controls">
        <div className="selection-info">
          {selectedCount > 0 ? (
            <span>{selectedCount} of {totalCount} selected</span>
          ) : (
            <span>{totalCount} invites</span>
          )}
        </div>

        <div className="selection-buttons">
          {!allSelected && (
            <button
              type="button"
              onClick={onSelectAll}
              className="btn btn-link btn-sm"
            >
              Select All
            </button>
          )}
          
          {hasSelection && (
            <button
              type="button"
              onClick={onDeselectAll}
              className="btn btn-link btn-sm"
            >
              Deselect All
            </button>
          )}
        </div>
      </div>

      <div className="action-buttons">
        <div className="export-actions">
          <button
            type="button"
            onClick={onDownload}
            className="btn btn-secondary btn-sm"
            title="Download invite data as CSV"
          >
            <Icon name="download" />
            Download
          </button>
          
          <button
            type="button"
            onClick={onCopyLinks}
            className="btn btn-secondary btn-sm"
            title="Copy all invite links to clipboard"
          >
            <Icon name="copy" />
            Copy Links
          </button>
        </div>

        {hasSelection && (
          <div className="bulk-invite-actions">
            <button
              type="button"
              onClick={onBulkResend}
              className="btn btn-primary btn-sm"
              title={`Resend ${selectedCount} selected invites`}
            >
              <Icon name="refresh-cw" />
              Resend ({selectedCount})
            </button>
            
            <button
              type="button"
              onClick={onBulkCancel}
              className="btn btn-danger btn-sm"
              title={`Cancel ${selectedCount} selected invites`}
            >
              <Icon name="x" />
              Cancel ({selectedCount})
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkActions;

