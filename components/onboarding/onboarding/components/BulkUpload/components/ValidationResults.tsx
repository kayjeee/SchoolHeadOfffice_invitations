import React from 'react';
import { FiFile, FiTrash2, FiAlertTriangle, FiUpload, FiLoader } from 'react-icons/fi';
import { ValidationResults as ValidationResultsType } from '../types';

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
          <FiFile className="h-5 w-5 text-gray-400 mr-2" />
          <span className="text-sm font-medium text-gray-900">{uploadedFile?.name}</span>
          {uploadedFile && <span className="ml-2 text-xs text-gray-500">{(uploadedFile.size / 1024).toFixed(1)} KB</span>}
        </div>
        <button onClick={onReset} className="text-red-500 hover:text-red-700 text-sm flex items-center">
          <FiTrash2 className="mr-1 h-4 w-4" /> Start Over
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
          <FiAlertTriangle className="inline mr-1" /> {errorStatus}
        </p>
      )}

      {results.errors.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-red-800 mb-2 flex items-center">
            <FiAlertTriangle className="mr-1 h-4 w-4" />
            Errors ({results.errors.length})
          </h4>
          <div className="bg-red-50 border border-red-200 rounded-md p-3 max-h-32 overflow-y-auto">
            {results.errors.map((error, index) => (
              <div key={index} className="text-sm text-red-700">
                <strong>Row {error.row}</strong>: {error.messages}
              </div>
            ))}
          </div>
        </div>
      )}

      {results.warnings.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-yellow-800 mb-2 flex items-center">
            <FiAlertTriangle className="mr-1 h-4 w-4" />
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
              <FiLoader className="animate-spin mr-2 h-4 w-4" /> Uploading...
            </>
          ) : (
            <>
              <FiUpload className="mr-2 h-4 w-4" /> Confirm & Upload
            </>
          )}
        </button>
      </div>
    </div>
  );
};