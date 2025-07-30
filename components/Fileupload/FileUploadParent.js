// FileUploadAdmin.js
import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';

const FileUploadAdminParent = ({ onDataParsed, selectedClass, selectedSchool }) => {
  const [file, setFile] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const fileInputRef = useRef();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleFileUpload = () => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet);
      onDataParsed(json);
      setIsUploadModalOpen(false);
    };
    reader.readAsArrayBuffer(file);
  };

  const openUploadModal = () => {
    setIsUploadModalOpen(true);
  };

  const closeUploadModal = () => {
    setIsUploadModalOpen(false);
  };

  return (
    <div>
      <button onClick={openUploadModal} className="text-white bg-blue-500 px-4 py-2 rounded-lg hover:bg-blue-600">Upload Spreadsheet</button>

      {isUploadModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Upload Spreadsheet</h2>
            <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} ref={fileInputRef} className="hidden" />
            <div className="flex justify-center">
              <svg
                onClick={() => fileInputRef.current.click()}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-12 h-12 cursor-pointer"
              >
                <path
                  fillRule="evenodd"
                  d="M11.47 2.47a.75.75 0 0 1 1.06 0l4.5 4.5a.75.75 0 0 1-1.06 1.06l-3.22-3.22V16.5a.75.75 0 0 1-1.5 0V4.81L8.03 8.03a.75.75 0 0 1-1.06-1.06l4.5-4.5ZM3 15.75a.75.75 0 0 1 .75.75v2.25a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5V16.5a.75.75 0 0 1 1.5 0v2.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V16.5a.75.75 0 0 1 .75-.75Z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="mt-4 flex justify-end space-x-4">
              <button onClick={closeUploadModal} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
              <button onClick={handleFileUpload} className="px-4 py-2 bg-blue-600 text-white rounded">Upload</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploadAdminParent;