import React from 'react';
import { FileUploaderProps } from '../types';

const UploadIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    className={className}
    fill="none" 
    viewBox="0 0 24 24" 
    stroke="currentColor"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
    />
  </svg>
);

const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    className={className}
    fill="none" 
    viewBox="0 0 24 24" 
    stroke="currentColor"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" 
    />
  </svg>
);

const InfoIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    className={className}
    fill="none" 
    viewBox="0 0 24 24" 
    stroke="currentColor"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
    />
  </svg>
);

const AlertTriangleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    className={className}
    fill="none" 
    viewBox="0 0 24 24" 
    stroke="currentColor"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
    />
  </svg>
);

export const FileUploader: React.FC<FileUploaderProps> = ({
  onFileProcessed,
  onDownloadTemplate,
  dragActive,
  onDrag,
  onDrop,
  errorStatus
}) => {
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileProcessed(e.target.files[0]);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={onDownloadTemplate}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
        >
          <DownloadIcon className="mr-2 h-4 w-4" /> Download Template
        </button>
        <p className="mt-2 text-sm text-gray-500">Get our template to ensure your learner data is in the correct format.</p>
      </div>

      <div
        className={`mt-4 flex flex-col items-center justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md transition-all duration-200 ${
          dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={onDrag}
        onDragLeave={onDrag}
        onDragOver={onDrag}
        onDrop={onDrop}
      >
        <div className="space-y-1 text-center">
          <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
          <div className="flex text-sm text-gray-600">
            <label
              htmlFor="file-upload"
              className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
            >
              <span>Upload a file</span>
              <input
                id="file-upload"
                name="file-upload"
                type="file"
                className="sr-only"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileInput}
              />
            </label>
            <p className="pl-1">or drag and drop</p>
          </div>
          <p className="text-xs text-gray-500">Excel (.xlsx, .xls) or CSV files up to 5MB</p>
        </div>
      </div>

      {errorStatus && (
        <p className="mt-4 text-sm text-red-600 flex items-center justify-center">
          <AlertTriangleIcon className="inline mr-1 h-4 w-4" /> {errorStatus}
        </p>
      )}

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
        <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
          <InfoIcon className="mr-2 h-4 w-4" /> Important File Requirements:
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>
            • <strong>Required columns</strong>: First name and last name (accepts various formats)
          </li>
          <li>
            • <strong>Optional columns</strong>: Gender, Phone Numbers, WhatsApp, Telegram, Student ID
          </li>
          <li>• Supports flexible and common column header variations.</li>
          <li>• You can upload any number of learners; large files may take longer to process.</li>
        </ul>
        <p className="mt-2 text-sm text-blue-700">
          Note: After successful upload, the onboarding progress status will be refreshed automatically.
        </p>
      </div>
    </div>
  );
};