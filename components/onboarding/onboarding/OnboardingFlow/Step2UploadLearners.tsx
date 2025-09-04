import React, { useState } from "react";

const Step2UploadLearners = ({ onNext, onBack, isLoading, onUpdateData }) => {
  const [file, setFile] = useState<File | null>(null);

  const handleFileUpload = async () => {
    if (onUpdateData) {
      onUpdateData({ learnersFile: file });
    }
    if (onNext) {
      onNext();
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">👥</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Upload Learners</h2>
        <p className="text-gray-600">Import your student roster using our template</p>
      </div>

      <div className="space-y-6">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-xl">📁</span>
          </div>
          <p className="text-gray-600 mb-4">Drag & drop your CSV file here or</p>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="px-6 py-2 bg-blue-600 text-white rounded-md cursor-pointer hover:bg-blue-700 transition-colors">
            Choose File
          </label>
          {file && (
            <p className="mt-4 text-sm text-green-600">
              Selected: {file.name}
            </p>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">Download Template</h3>
          <p className="text-sm text-blue-700 mb-3">Ensure your file matches our required format</p>
          <button className="px-4 py-2 bg-white border border-blue-300 text-blue-700 rounded-md hover:bg-blue-50 transition-colors">
            Download CSV Template
          </button>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={onBack}
          className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={handleFileUpload}
          disabled={!file || isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Uploading...' : 'Continue →'}
        </button>
      </div>
    </div>
  );
};

export default Step2UploadLearners;
