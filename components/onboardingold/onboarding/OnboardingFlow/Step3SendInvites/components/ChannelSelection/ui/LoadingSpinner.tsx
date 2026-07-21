import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
    className?: string;  // Add this
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  text = 'Loading...' 
}) => {
  const sizeStyles = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className="flex items-center space-x-2">
      <div
        className={`${sizeStyles[size]} border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin`}
      />
      {text && <span className="text-sm text-gray-600">{text}</span>}
    </div>
  );
};