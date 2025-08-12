import React, { useState, useEffect } from 'react';

/**
 * DateTimePicker component for selecting date and time
 * Features: date validation, time zones, min/max constraints
 */
const DateTimePicker = ({
  value,
  onChange,
  minDateTime,
  maxDateTime,
  timezone,
  className = '',
  disabled = false
}) => {
  const [dateValue, setDateValue] = useState('');
  const [timeValue, setTimeValue] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (value) {
      const date = new Date(value);
      setDateValue(formatDateForInput(date));
      setTimeValue(formatTimeForInput(date));
    } else {
      setDateValue('');
      setTimeValue('');
    }
  }, [value]);

  const formatDateForInput = (date) => {
    return date.toISOString().split('T')[0];
  };

  const formatTimeForInput = (date) => {
    return date.toTimeString().slice(0, 5);
  };

  const validateDateTime = (dateStr, timeStr) => {
    if (!dateStr || !timeStr) {
      return 'Both date and time are required';
    }

    const selectedDateTime = new Date(`${dateStr}T${timeStr}`);
    
    if (isNaN(selectedDateTime.getTime())) {
      return 'Invalid date or time';
    }

    if (minDateTime && selectedDateTime < minDateTime) {
      return `Date must be after ${minDateTime.toLocaleString()}`;
    }

    if (maxDateTime && selectedDateTime > maxDateTime) {
      return `Date must be before ${maxDateTime.toLocaleString()}`;
    }

    return '';
  };

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setDateValue(newDate);
    
    if (newDate && timeValue) {
      const validationError = validateDateTime(newDate, timeValue);
      setError(validationError);
      
      if (!validationError) {
        const dateTime = new Date(`${newDate}T${timeValue}`);
        onChange(dateTime);
      }
    }
  };

  const handleTimeChange = (e) => {
    const newTime = e.target.value;
    setTimeValue(newTime);
    
    if (dateValue && newTime) {
      const validationError = validateDateTime(dateValue, newTime);
      setError(validationError);
      
      if (!validationError) {
        const dateTime = new Date(`${dateValue}T${newTime}`);
        onChange(dateTime);
      }
    }
  };

  const getMinDate = () => {
    if (minDateTime) {
      return formatDateForInput(minDateTime);
    }
    return formatDateForInput(new Date());
  };

  const getMaxDate = () => {
    if (maxDateTime) {
      return formatDateForInput(maxDateTime);
    }
    return '';
  };

  const getMinTime = () => {
    if (minDateTime && dateValue === formatDateForInput(minDateTime)) {
      return formatTimeForInput(minDateTime);
    }
    return '';
  };

  const getMaxTime = () => {
    if (maxDateTime && dateValue === formatDateForInput(maxDateTime)) {
      return formatTimeForInput(maxDateTime);
    }
    return '';
  };

  const setToNow = () => {
    const now = new Date();
    setDateValue(formatDateForInput(now));
    setTimeValue(formatTimeForInput(now));
    onChange(now);
    setError('');
  };

  const setToTomorrow9AM = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    
    setDateValue(formatDateForInput(tomorrow));
    setTimeValue('09:00');
    onChange(tomorrow);
    setError('');
  };

  return (
    <div className={`datetime-picker ${className} ${error ? 'error' : ''}`}>
      <div className="datetime-inputs">
        <div className="date-input-group">
          <label htmlFor="date-input" className="input-label">Date</label>
          <input
            id="date-input"
            type="date"
            value={dateValue}
            onChange={handleDateChange}
            min={getMinDate()}
            max={getMaxDate()}
            disabled={disabled}
            className="date-input"
          />
        </div>

        <div className="time-input-group">
          <label htmlFor="time-input" className="input-label">Time</label>
          <input
            id="time-input"
            type="time"
            value={timeValue}
            onChange={handleTimeChange}
            min={getMinTime()}
            max={getMaxTime()}
            disabled={disabled}
            className="time-input"
          />
        </div>
      </div>

      {/* Quick Set Buttons */}
      <div className="quick-set-buttons">
        <button
          type="button"
          onClick={setToNow}
          disabled={disabled}
          className="quick-set-button"
        >
          Now
        </button>
        <button
          type="button"
          onClick={setToTomorrow9AM}
          disabled={disabled}
          className="quick-set-button"
        >
          Tomorrow 9 AM
        </button>
      </div>

      {/* Timezone Display */}
      {timezone && (
        <div className="timezone-display">
          <span className="timezone-label">Timezone:</span>
          <span className="timezone-value">{timezone}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="datetime-error">
          {error}
        </div>
      )}

      {/* Selected DateTime Display */}
      {dateValue && timeValue && !error && (
        <div className="selected-datetime">
          <strong>Selected:</strong> {new Date(`${dateValue}T${timeValue}`).toLocaleString()}
        </div>
      )}

      {/* Helper Text */}
      <div className="datetime-helper">
        <div className="helper-item">
          <strong>Format:</strong> Use 24-hour time format (e.g., 14:30 for 2:30 PM)
        </div>
        {minDateTime && (
          <div className="helper-item">
            <strong>Minimum:</strong> {minDateTime.toLocaleString()}
          </div>
        )}
        {maxDateTime && (
          <div className="helper-item">
            <strong>Maximum:</strong> {maxDateTime.toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
};

export default DateTimePicker;

