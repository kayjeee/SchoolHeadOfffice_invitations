import React from 'react';
import { Icon } from './Icon';

interface LoadingStateProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
}

export const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = 'Loading...', 
  size = 'medium' 
}) => {
  const getSizeClass = () => {
    switch (size) {
      case 'small': return 'loading-small';
      case 'large': return 'loading-large';
      default: return 'loading-medium';
    }
  };

  return (
    <div className={`loading-state ${getSizeClass()}`}>
      <div className="loading-spinner">
        <Icon name="loader" className="spinning" size={size === 'large' ? 32 : size === 'small' ? 16 : 24} />
      </div>
      <div className="loading-message">
        {message}
      </div>
    </div>
  );
};

export default LoadingState;

