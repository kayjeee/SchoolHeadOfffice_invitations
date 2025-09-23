import React from 'react';
import { Icon } from './Icon';

interface ErrorStateProps {
  error: string | Error;
  onRetry?: () => void;
  title?: string;
  showDetails?: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ 
  error, 
  onRetry,
  title = 'Something went wrong',
  showDetails = false
}) => {
  const errorMessage = typeof error === 'string' ? error : error.message;
  const errorStack = typeof error === 'object' && error.stack ? error.stack : null;

  return (
    <div className="error-state">
      <div className="error-icon">
        <Icon name="alert-circle" size={48} className="error-icon-symbol" />
      </div>
      
      <div className="error-content">
        <h3 className="error-title">{title}</h3>
        <p className="error-message">{errorMessage}</p>
        
        {showDetails && errorStack && (
          <details className="error-details">
            <summary>Technical Details</summary>
            <pre className="error-stack">{errorStack}</pre>
          </details>
        )}
      </div>

      <div className="error-actions">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="btn btn-primary"
          >
            <Icon name="refresh-cw" />
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorState;

