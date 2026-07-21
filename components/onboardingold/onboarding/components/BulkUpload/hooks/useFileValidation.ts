import { useState } from 'react';
import { ALLOWED_FILE_EXTENSIONS, MAX_FILE_SIZE } from '../utils/constants';

export const useFileValidation = () => {
  const [errorStatus, setErrorStatus] = useState('');

  const validateFile = (file: File): boolean => {
    setErrorStatus('');

    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    if (!ALLOWED_FILE_EXTENSIONS.includes(fileExtension)) {
      setErrorStatus('Please upload a valid Excel (.xlsx, .xls) or CSV file.');
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      setErrorStatus('File size must be less than 5MB.');
      return false;
    }

    return true;
  };

  return { errorStatus, setErrorStatus, validateFile };
};