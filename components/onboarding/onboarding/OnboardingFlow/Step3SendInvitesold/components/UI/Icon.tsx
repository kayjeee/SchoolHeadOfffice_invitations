import React from 'react';

interface IconProps {
  name: string;
  className?: string;
  size?: number;
}

export const Icon: React.FC<IconProps> = ({ 
  name, 
  className = '', 
  size = 16 
}) => {
  // This is a simplified icon component that would typically use an icon library
  // like Lucide React, Heroicons, or similar. For this example, we'll use
  // Unicode symbols and CSS classes.
  
  const getIconSymbol = (iconName: string): string => {
    const icons: Record<string, string> = {
      'check': '✓',
      'check-circle': '✓',
      'circle': '○',
      'x': '✕',
      'x-circle': '✕',
      'mail': '✉',
      'message-square': '💬',
      'smartphone': '📱',
      'monitor': '🖥',
      'star': '⭐',
      'eye': '👁',
      'send': '📤',
      'loader': '⟳',
      'users': '👥',
      'clock': '🕐',
      'alert-circle': '⚠',
      'alert-triangle': '⚠',
      'file-text': '📄',
      'refresh-cw': '↻',
      'download': '⬇',
      'copy': '📋',
      'link': '🔗',
      'calendar': '📅',
      'truck': '🚚',
      'message-circle': '💬',
      'inbox': '📥'
    };
    
    return icons[iconName] || '?';
  };

  return (
    <span 
      className={`icon icon-${name} ${className}`}
      style={{ fontSize: `${size}px` }}
      role="img"
      aria-label={name}
    >
      {getIconSymbol(name)}
    </span>
  );
};

export default Icon;

