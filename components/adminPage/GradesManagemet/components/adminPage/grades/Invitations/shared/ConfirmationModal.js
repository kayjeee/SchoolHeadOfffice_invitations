import React, { useEffect } from 'react';

/**
 * Reusable ConfirmationModal component for user confirmations
 * Features: customizable content, different button styles, keyboard support
 */
const ConfirmationModal = ({
  title,
  content,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  confirmButtonClass = 'primary', // 'primary', 'danger', 'success'
  isVisible = true,
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!closeOnEscape) return;
      
      if (e.key === 'Escape') {
        onCancel();
      } else if (e.key === 'Enter' && e.ctrlKey) {
        onConfirm();
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isVisible, onCancel, onConfirm, closeOnEscape]);

  if (!isVisible) return null;

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onCancel();
    }
  };

  const renderContent = () => {
    if (typeof content === 'string') {
      return <p>{content}</p>;
    }
    return content;
  };

  return (
    <div className="confirmation-modal-overlay" onClick={handleOverlayClick}>
      <div className="confirmation-modal">
        <div className="modal-header">
          {title && <h3 className="modal-title">{title}</h3>}
          {showCloseButton && (
            <button
              onClick={onCancel}
              className="modal-close-button"
              aria-label="Close modal"
            >
              ×
            </button>
          )}
        </div>

        <div className="modal-body">
          {renderContent()}
        </div>

        <div className="modal-footer">
          <button
            onClick={onCancel}
            className="modal-button cancel-button"
          >
            {cancelText}
          </button>
          
          <button
            onClick={onConfirm}
            className={`modal-button confirm-button ${confirmButtonClass}`}
          >
            {confirmText}
          </button>
        </div>

        {/* Keyboard shortcuts hint */}
        <div className="modal-shortcuts">
          <small>
            Press <kbd>Esc</kbd> to cancel or <kbd>Ctrl+Enter</kbd> to confirm
          </small>
        </div>
      </div>
    </div>
  );
};

/**
 * Simple confirmation dialog for quick yes/no questions
 */
export const SimpleConfirmation = ({
  message,
  onConfirm,
  onCancel,
  confirmText = 'Yes',
  cancelText = 'No'
}) => {
  return (
    <ConfirmationModal
      title="Confirm Action"
      content={message}
      confirmText={confirmText}
      cancelText={cancelText}
      onConfirm={onConfirm}
      onCancel={onCancel}
      confirmButtonClass="primary"
    />
  );
};

/**
 * Destructive action confirmation (for delete, remove, etc.)
 */
export const DestructiveConfirmation = ({
  title = 'Confirm Deletion',
  message,
  itemName,
  onConfirm,
  onCancel
}) => {
  const content = (
    <div className="destructive-confirmation">
      <div className="warning-icon">⚠️</div>
      <p>{message || `Are you sure you want to delete "${itemName}"?`}</p>
      <p className="warning-text">
        <strong>This action cannot be undone.</strong>
      </p>
    </div>
  );

  return (
    <ConfirmationModal
      title={title}
      content={content}
      confirmText="Delete"
      cancelText="Cancel"
      onConfirm={onConfirm}
      onCancel={onCancel}
      confirmButtonClass="danger"
    />
  );
};

/**
 * Loading confirmation modal (shows progress)
 */
export const LoadingConfirmation = ({
  title,
  message,
  progress = null, // { current: number, total: number }
  onCancel
}) => {
  const content = (
    <div className="loading-confirmation">
      <div className="loading-spinner"></div>
      <p>{message}</p>
      {progress && (
        <div className="progress-info">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
          <div className="progress-text">
            {progress.current} of {progress.total}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <ConfirmationModal
      title={title}
      content={content}
      confirmText=""
      cancelText="Cancel"
      onConfirm={() => {}} // No confirm action for loading modal
      onCancel={onCancel}
      showCloseButton={false}
      closeOnOverlayClick={false}
      closeOnEscape={true}
    />
  );
};

export default ConfirmationModal;

