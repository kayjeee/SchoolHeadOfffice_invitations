import React from 'react';
import { FiAlertTriangle, FiInfo } from 'react-icons/fi';
import { ValidationError, ValidationWarning } from '../types';

interface ErrorDisplayProps {
  errors: ValidationError[];
  warnings: ValidationWarning[];
  title?: string;
  maxHeight?: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  errors,
  warnings,
  title = 'Validation Results',
  maxHeight = '8rem'
}) => {
  if (errors.length === 0 && warnings.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {errors.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-red-800 mb-2 flex items-center">
            <FiAlertTriangle className="mr-1 h-4 w-4" />
            Errors ({errors.length})
          </h4>
          <div 
            className="bg-red-50 border border-red-200 rounded-md p-3 overflow-y-auto"
            style={{ maxHeight }}
          >
            {errors.map((error, index) => (
              <div key={index} className="text-sm text-red-700 mb-2 last:mb-0">
                <strong>Row {error.row}</strong>
                {error.field && <span className="ml-1">({error.field})</span>}
                {': '}{error.message}
              </div>
            ))}
          </div>
        </div>
      )}

      {warnings.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-yellow-800 mb-2 flex items-center">
            <FiInfo className="mr-1 h-4 w-4" />
            Warnings ({warnings.length})
          </h4>
          <div 
            className="bg-yellow-50 border border-yellow-200 rounded-md p-3 overflow-y-auto"
            style={{ maxHeight }}
          >
            {warnings.map((warning, index) => (
              <div key={index} className="text-sm text-yellow-700 mb-2 last:mb-0">
                <strong>Row {warning.row}</strong>
                {warning.field && <span className="ml-1">({warning.field})</span>}
                {': '}{warning.message}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Additional specialized error display components
interface SimpleErrorDisplayProps {
  message: string;
  type?: 'error' | 'warning' | 'info';
  className?: string;
}

export const SimpleErrorDisplay: React.FC<SimpleErrorDisplayProps> = ({
  message,
  type = 'error',
  className = ''
}) => {
  const getStyles = () => {
    switch (type) {
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'info':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-red-600 bg-red-50 border-red-200';
    }
  };

  return (
    <div className={`p-3 border rounded-md text-sm flex items-center ${getStyles()} ${className}`}>
      <FiAlertTriangle className="mr-2 h-4 w-4 flex-shrink-0" />
      {message}
    </div>
  );
};

interface UploadErrorDisplayProps {
  error: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export const UploadErrorDisplay: React.FC<UploadErrorDisplayProps> = ({
  error,
  onRetry,
  onDismiss
}) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-md p-4">
      <div className="flex items-start">
        <FiAlertTriangle className="h-5 w-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="text-sm font-medium text-red-800">Upload Failed</h4>
          <p className="mt-1 text-sm text-red-700">{error}</p>
          {(onRetry || onDismiss) && (
            <div className="mt-3 flex space-x-3">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="text-sm font-medium text-red-700 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  Try Again
                </button>
              )}
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className="text-sm font-medium text-red-700 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  Dismiss
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;