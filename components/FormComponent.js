import React from 'react';

const FormComponent = ({ label, value, onChange, error, onBlur }) => {
  return (
    <label className="block mb-4">
      {label}:
      <div className="relative">
        <input
          className={`border w-full p-2 mt-1 ${error ? 'border-red-500' : ''}`}
          type="text"
          value={value}
          onChange={onChange}
          onBlur={onBlur} // Invoke onBlur function to check for existing school
        />
        {error && <span className="absolute top-0 right-0 text-red-500">*</span>}
      </div>
    </label>
  );
};

export default FormComponent;
