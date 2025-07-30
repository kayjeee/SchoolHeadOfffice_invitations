import React, { useState } from 'react';

const FileUpload = ({ onChange }) => {
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
    onChange(e); // Pass the event to the parent component handler
  };

  return (
    <div className="flex flex-col items-center mb-6">
      <label htmlFor="file-upload" className="text-lg font-medium text-gray-700 mb-4">
        Upload School Logo
      </label>

      {preview ? (
        <div className="mb-4">
          <img
            src={preview}
            alt="School Logo Preview"
            className="w-32 h-32 object-cover rounded-full shadow-lg"
          />
        </div>
      ) : (
        <div className="w-32 h-32 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-full bg-gray-100 mb-4">
          <span className="text-gray-400">Preview</span>
        </div>
      )}

      <input
        id="file-upload"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="sr-only"
      />
      <label
        htmlFor="file-upload"
        className="inline-block px-6 py-2 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer transition duration-150 ease-in-out"
        aria-label="Upload School Logo"
      >
        Choose School Logo
      </label>
    </div>
  );
};

export default FileUpload;
