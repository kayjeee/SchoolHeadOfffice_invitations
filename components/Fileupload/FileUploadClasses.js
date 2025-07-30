import React, { useState, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';

const FileUploadAdminClass = ({ onDataParsed, selectedClass, selectedSchool, onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [fileName, setFileName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setUploadError(null);
    }
  };

  const handleFileUpload = async () => {
    if (!file) {
      setUploadError('Please select a file first');
      return;
    }

    setIsUploading(true);
    
    try {
      const jsonData = await readExcelFile(file);
      const processedData = processExcelData(jsonData, selectedSchool, selectedClass);
      
      // Call the parsing handler
      await onDataParsed({ data: processedData });
      
      // Close modal and reset state
      setIsUploadModalOpen(false);
      setFile(null);
      setFileName('');
      
      // Notify parent component of successful upload
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error.message || 'Failed to process file');
    } finally {
      setIsUploading(false);
    }
  };

  const readExcelFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(worksheet);
          resolve(json);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  };

  const processExcelData = (jsonData, school, classInfo) => {
    return jsonData.map(item => ({
      ...item,
      schoolname: school,
      classId: classInfo?._id.toString() || '',
      classname: classInfo?.classname || item.Class || '',
      gradenumber: classInfo?.gradenumber || item.Grade || ''
    }));
  };

  const openUploadModal = () => {
    setIsUploadModalOpen(true);
  };

  const closeUploadModal = () => {
    setIsUploadModalOpen(false);
    setFile(null);
    setFileName('');
    setUploadError(null);
  };

  return (
    <div>
      <button 
        onClick={openUploadModal} 
        className="text-white bg-blue-500 px-4 py-2 rounded-lg hover:bg-blue-600"
      >
        Upload Spreadsheet
      </button>

      {isUploadModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Upload Spreadsheet</h2>
            
            <input 
              type="file" 
              accept=".xlsx, .xls" 
              onChange={handleFileChange} 
              ref={fileInputRef} 
              className="hidden" 
            />
            
            <div className="mb-4">
              <button
                onClick={() => fileInputRef.current.click()}
                className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500"
              >
                {fileName ? (
                  <span className="text-blue-600">{fileName}</span>
                ) : (
                  <span>Click to select file or drag and drop</span>
                )}
              </button>
            </div>

            {uploadError && (
              <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
                {uploadError}
              </div>
            )}

            <div className="flex justify-end space-x-4">
              <button 
                onClick={closeUploadModal} 
                className="px-4 py-2 bg-gray-300 rounded"
                disabled={isUploading}
              >
                Cancel
              </button>
              <button 
                onClick={handleFileUpload} 
                className="px-4 py-2 bg-blue-600 text-white rounded"
                disabled={isUploading || !file}
              >
                {isUploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploadAdminClass;