import React, { useState } from 'react';
import { Copy } from 'lucide-react';
import { logger } from '../utils/logger';

interface CopyButtonProps {
  text: string;
  variant?: 'default' | 'outline';
  size?: 'sm' | 'md';
  className?: string;
}

export const CopyButton: React.FC<CopyButtonProps> = ({
  text,
  variant = 'default',
  size = 'sm',
  className = ''
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      logger.debug('CopyButton', 'Text copied to clipboard', { textLength: text.length });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      logger.error('CopyButton', 'Failed to copy text', error);
    }
  };

  const baseStyles = 'inline-flex items-center font-medium rounded transition-colors';
  const variantStyles = {
    default: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
    outline: 'border border-gray-300 hover:bg-gray-50 text-gray-600'
  };
  const sizeStyles = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm'
  };

  return (
    <button
      onClick={handleCopy}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      <Copy className="w-3 h-3 mr-1" />
      {copied ? '✅ Copied!' : 'Copy'}
    </button>
  );
};