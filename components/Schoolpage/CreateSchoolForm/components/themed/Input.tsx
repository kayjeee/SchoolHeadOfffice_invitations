import React, { InputHTMLAttributes } from 'react';

const Input: React.FC<InputHTMLAttributes<HTMLInputElement>> = ({ className, style, ...props }) => {
  const defaultStyle: React.CSSProperties = {
    borderColor: 'var(--primary-color)',
    fontFamily: 'var(--font-family-primary)',
    fontSize: 'var(--font-size-base)',
    padding: 'var(--spacing-unit)',
  };

  const combinedStyle = {
    ...defaultStyle,
    ...style,
  };

  return (
    <input
      {...props}
      style={combinedStyle}
      className={className}
    />
  );
};

export default Input;
