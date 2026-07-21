import React from 'react';
import { ValidationResults as ValidationResultsType } from '../types';

const FileIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);

const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const AlertTriangleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const UploadIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);

const LoaderIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

interface ValidationResultsProps {
  results: ValidationResultsType;
  uploadedFile: File | null;
  onReset: () => void;
  onConfirm: () => void;
  isProcessing: boolean;
  errorStatus: string;
}

export const ValidationResults: React.FC<ValidationResultsProps> = ({
  results,
  uploadedFile,
  onReset,
  onConfirm,
  isProcessing,
  errorStatus
}) => {
  return (
    <div>
      <div className="bg-gray-50 rounded-lg p-4 mb-4 flex items-center justify-between">
        <div className="flex items-center">
          <FileIcon className="h-5 w-5 text-gray-400 mr-2" />
          <span className="text-sm font-medium text-gray-900">{uploadedFile?.name}</span>
          {uploadedFile && <span className="ml-2 text-xs text-gray-500">{(uploadedFile.size / 1024).toFixed(1)} KB</span>}
        </div>
        <button onClick={onReset} className="text-red-500 hover:text-red-700 text-sm flex items-center">
          <TrashIcon className="mr-1 h-4 w-4" /> Start Over
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-blue-600">{results.totalRows}</div>
          <div className="text-xs text-blue-600">Total Rows</div>
        </div>
        <div className="bg-green-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-green-600">{results.validRows}</div>
          <div className="text-xs text-green-600">Ready to Upload</div>
        </div>
        <div className="bg-red-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-red-600">{results.invalidRows}</div>
          <div className="text-xs text-red-600">Invalid Rows</div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-yellow-600">{results.duplicates}</div>
          <div className="text-xs text-yellow-600">Duplicates</div>
        </div>
      </div>

      {errorStatus && (
        <p className="mt-4 mb-4 text-sm text-red-600 flex items-center justify-center">
          <AlertTriangleIcon className="inline mr-1" /> {errorStatus}
        </p>
      )}

      {results.errors.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-red-800 mb-2 flex items-center">
            <AlertTriangleIcon className="mr-1 h-4 w-4" />
            Errors ({results.errors.length})
          </h4>
          <div className="bg-red-50 border border-red-200 rounded-md p-3 max-h-32 overflow-y-auto">
            {results.errors.map((error, index) => (
              <div key={index} className="text-sm text-red-700">
                <strong>Row {error.row}</strong>: {error.message} {/* <-- fixed here */}
              </div>
            ))}
          </div>
        </div>
      )}

      {results.warnings.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-yellow-800 mb-2 flex items-center">
            <AlertTriangleIcon className="mr-1 h-4 w-4" />
            Warnings ({results.warnings.length})
          </h4>
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 max-h-32 overflow-y-auto">
            {results.warnings.map((warning, index) => (
              <div key={index} className="text-sm text-yellow-700">
                <strong>Row {warning.row}</strong>: {warning.message}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <button
          onClick={onConfirm}
          disabled={isProcessing}
          className="inline-flex justify-center items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
        >
          {isProcessing ? (
            <>
              <LoaderIcon className="animate-spin mr-2 h-4 w-4" /> Uploading...
            </>
          ) : (
            <>
              <UploadIcon className="mr-2 h-4 w-4" /> Confirm & Upload
            </>
          )}
        </button>
      </div>
    </div>
  );
};
