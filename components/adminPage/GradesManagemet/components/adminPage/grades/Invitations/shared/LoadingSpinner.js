import React from 'react';

/**
 * Reusable LoadingSpinner component with different sizes and styles
 */
const LoadingSpinner = ({
  size = 'medium', // 'small', 'medium', 'large'
  message = '',
  className = '',
  color = 'primary' // 'primary', 'secondary', 'white'
}) => {
  const getSizeClass = () => {
    switch (size) {
      case 'small':
        return 'spinner-small';
      case 'large':
        return 'spinner-large';
      default:
        return 'spinner-medium';
    }
  };

  const getColorClass = () => {
    switch (color) {
      case 'secondary':
        return 'spinner-secondary';
      case 'white':
        return 'spinner-white';
      default:
        return 'spinner-primary';
    }
  };

  return (
    <div className={`loading-spinner-container ${className}`}>
      <div className={`loading-spinner ${getSizeClass()} ${getColorClass()}`}>
        <div className="spinner-circle">
          <div className="spinner-path"></div>
        </div>
      </div>
      
      {message && (
        <div className="loading-message">
          {message}
        </div>
      )}
    </div>
  );
};

/**
 * Inline spinner for buttons and small spaces
 */
export const InlineSpinner = ({ size = 'small', color = 'white' }) => {
  return (
    <div className={`inline-spinner spinner-${size} spinner-${color}`}>
      <div className="spinner-circle">
        <div className="spinner-path"></div>
      </div>
    </div>
  );
};

/**
 * Full page loading overlay
 */
export const LoadingOverlay = ({ message = 'Loading...', isVisible = true }) => {
  if (!isVisible) return null;

  return (
    <div className="loading-overlay">
      <div className="overlay-content">
        <LoadingSpinner size="large" color="white" />
        <div className="overlay-message">{message}</div>
      </div>
    </div>
  );
};

export default LoadingSpinner;

