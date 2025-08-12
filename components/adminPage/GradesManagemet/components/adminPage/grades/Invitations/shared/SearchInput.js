import React, { useState, useEffect } from 'react';

/**
 * Reusable SearchInput component with debouncing and clear functionality
 */
const SearchInput = ({
  value,
  onChange,
  placeholder = 'Search...',
  className = '',
  debounceMs = 300,
  showClearButton = true,
  disabled = false
}) => {
  const [localValue, setLocalValue] = useState(value || '');

  // Debounce the search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onChange && localValue !== value) {
        onChange(localValue);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [localValue, debounceMs, onChange, value]);

  // Update local value when prop value changes
  useEffect(() => {
    setLocalValue(value || '');
  }, [value]);

  const handleInputChange = (e) => {
    setLocalValue(e.target.value);
  };

  const handleClear = () => {
    setLocalValue('');
    if (onChange) {
      onChange('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleClear();
    }
  };

  return (
    <div className={`search-input-container ${className}`}>
      <div className="search-input-wrapper">
        <input
          type="text"
          value={localValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={`search-input ${disabled ? 'disabled' : ''}`}
        />
        
        <div className="search-input-icons">
          {/* Search Icon */}
          <svg 
            className="search-icon" 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          
          {/* Clear Button */}
          {showClearButton && localValue && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="clear-button"
              aria-label="Clear search"
            >
              <svg 
                width="14" 
                height="14" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
        </div>
      </div>
      
      {/* Search suggestions or results count could go here */}
    </div>
  );
};

export default SearchInput;

