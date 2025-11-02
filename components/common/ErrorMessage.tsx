import React from 'react';
import PropTypes from 'prop-types';

const ErrorMessage = ({ message }) => {
  return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
      <strong className="font-bold">Error: </strong>
      <span className="block sm:inline">{message}</span>
    </div>
  );
};

ErrorMessage.propTypes = {
  message: PropTypes.string.isRequired,
};

export default ErrorMessage;

// Add this line to explicitly satisfy the '--isolatedModules' compiler option.
// It ensures the file is recognized as a module, even if the compiler
// struggles with the other import/export lines.
export {};