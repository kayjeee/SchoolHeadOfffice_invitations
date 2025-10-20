import React, { SelectHTMLAttributes } from 'react';

const Select: React.FC<SelectHTMLAttributes<HTMLSelectElement>> = ({ className, style, ...props }) => {
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
    <select
      {...props}
      style={combinedStyle}
      className={className}
    />
  );
};

export default Select;
