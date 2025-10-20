import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}

const Button: React.FC<ButtonProps> = ({ children, style, className, disabled, variant = 'primary', ...props }) => {
  const baseStyle: React.CSSProperties = {
    fontFamily: 'var(--font-family-primary)',
    fontSize: 'var(--font-size-base)',
    padding: 'calc(var(--spacing-unit) * 1.5) calc(var(--spacing-unit) * 3)',
    cursor: 'pointer',
    opacity: 1,
    transition: 'all 0.3s ease',
  };

  const primaryStyle: React.CSSProperties = {
    backgroundColor: 'var(--primary-color)',
    color: 'var(--logo-color)',
    border: 'none',
  };

  const secondaryStyle: React.CSSProperties = {
    backgroundColor: 'transparent',
    color: 'var(--primary-color)',
    border: '1px solid var(--primary-color)',
  };

  const disabledStyle: React.CSSProperties = {
    opacity: 0.5,
    cursor: 'not-allowed',
  };

  const combinedStyle = {
    ...baseStyle,
    ...(variant === 'primary' ? primaryStyle : secondaryStyle),
    ...style,
    ...(disabled ? disabledStyle : {}),
  };

  return (
    <button
      {...props}
      style={combinedStyle}
      className={className}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
