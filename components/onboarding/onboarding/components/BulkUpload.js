import React, { useState, useRef, useEffect } from 'react';
import {
  FiX,
  FiUpload,
  FiDownload,
  FiCheck,
  FiAlertTriangle,
  FiFile,
  FiTrash2,
  FiInfo,
  FiLoader
} from 'react-icons/fi';
import * as XLSX from 'xlsx';

const BulkUpload = ({ isOpen, onClose, selectedGrade, onUploadSuccess, schools }) => {
  const [uploadStep, setUploadStep] = useState('upload'); // upload, validate, confirm, complete
  const [uploadedFile, setUploadedFile] = useState(null);
  const [validationResults, setValidationResults] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [errorStatus, setErrorStatus] = useState('');
  const fileInputRef = useRef(null);

  // Debug: Log schools prop on changes
  useEffect(() => {
    console.log('BulkUpload schools prop:', schools);
  }, [schools]);

  // Extract school info from schools prop (first school) or empty defaults
  const getSchoolAndUserInfo = () => {
    if (!Array.isArray(schools) || schools.length === 0) {
      return { schoolName: '', schoolEmail: '', userEmail: '', province: '' };
    }
    const firstSchool = schools[0];
    return {
      schoolName: firstSchool.schoolName || '',
      schoolEmail: firstSchool.schoolEmail || '',
      userEmail: firstSchool.userEmail || '',
      province: firstSchool.province || '',
    };
  };

  useEffect(() => {
    if (isOpen) {
      resetUpload();
      setErrorStatus('');
    }
  }, [isOpen]);

  const handleDrag = e => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = e => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const processFile = file => {
    if (!file) return;
    setErrorStatus('');

    const allowedExtensions = ['.xlsx', '.xls', '.csv'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    if (!allowedExtensions.includes(fileExtension)) {
      setErrorStatus('Please upload a valid Excel (.xlsx, .xls) or CSV file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorStatus('File size must be less than 5MB.');
      return;
    }

    setUploadedFile(file);
    setUploadStep('validate');
    validateAndParseFile(file);
  };

  const validateAndParseFile = async file => {
    setIsProcessing(true);
    setErrorStatus('');

    const reader = new FileReader();

    reader.onload = async e => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, blankrows: false });

        if (jsonData.length === 0) {
          setErrorStatus('The uploaded file is empty.');
          setUploadStep('upload');
          setIsProcessing(false);
          return;
        }

        const firstNameHeaders = [
          'Learner First Name', 'First Name', 'Firstname', 'Name', 'Given Name', 'Forename',
          'LearnerFirstName', 'Student First Name', 'StudentFirstName'
        ];
        const lastNameHeaders = [
          'Learner Surname', 'Last Name', 'Lastname', 'Surname', 'Family Name',
          'LearnerSurname', 'Student Surname', 'Student Last Name', 'StudentSurname'
        ];

        const normalizeHeader = header => header ? header.toLowerCase().replace(/[\s\n\r\t_-]/g, '') : '';

        const headerExists = (headers, possibleNames) => {
          const normalizedHeaders = headers.map(normalizeHeader);
          return possibleNames.some(name => normalizedHeaders.includes(normalizeHeader(name)));
        };

        let headerRowIndex = -1;
        for (let i = 0; i < jsonData.length; i++) {
          const row = jsonData[i].map(cell => (cell ? String(cell).trim() : ''));
          if (headerExists(row, firstNameHeaders) && headerExists(row, lastNameHeaders)) {
            headerRowIndex = i;
            break;
          }
        }

        if (headerRowIndex === -1) {
          setErrorStatus(
            'Could not find valid header row. Please ensure your file contains columns for first name and last name.'
          );
          setUploadStep('upload');
          setIsProcessing(false);
          return;
        }

        const headers = jsonData[headerRowIndex].map(h => (h ? String(h).trim() : ''));
        const rows = jsonData.slice(headerRowIndex + 1);

        const findHeaderIndex = (possibleNames) => {
          const normalizedHeaders = headers.map(normalizeHeader);
          for (const name of possibleNames) {
            const normalizedName = normalizeHeader(name);
            const index = normalizedHeaders.findIndex(header => header === normalizedName);
            if (index !== -1) return index;
          }
          return -1;
        };

        const colIndexes = {
          firstName: findHeaderIndex(firstNameHeaders),
          lastName: findHeaderIndex(lastNameHeaders),
          gender: findHeaderIndex(['Gender', 'Sex', 'M/F', 'Male/Female']),
          cellPhone: findHeaderIndex(['Cell Phone Number', 'Mobile', 'Cell', 'Phone', 'Mobile Number', 'Cell Number', 'Contact Number', 'Phone Number']),
          telHome: findHeaderIndex(['Tel Number\n(H)ome', 'Tel Number (H)ome', 'Home Phone', 'Home Number', 'Tel Home', 'Home Tel', 'Telephone Home', 'Tel Number (Home)', 'TelNumber(H)ome']),
          telEmergency: findHeaderIndex(['Tel Number\n(E)mergency', 'Tel Number (E)mergency', 'Emergency Phone', 'Emergency Number', 'Tel Emergency', 'Emergency Tel', 'Emergency Contact', 'Tel Number (Emergency)', 'TelNumber(E)mergency']),
          whatsapp: findHeaderIndex(['WhatsApp', 'WhatsApp Number', 'Whatsapp', 'WhatsApp Phone', 'WA Number', 'WhatsApp Contact', 'Whatsapp Number']),
          telegram: findHeaderIndex(['Telegram', 'Telegram Username', 'Telegram Handle', 'Telegram ID', 'Telegram Contact', '@Telegram']),
          accessionNumber: findHeaderIndex(['Accession Number', 'ID', 'Student ID', 'Learner ID', 'ID Number', 'Student Number', 'Accession', 'Reference Number']),
        };

        let totalRows = 0;
        let validRows = 0;
        let invalidRows = 0;
        let errors = [];
        let warnings = [];
        let duplicates = 0;
        let preview = [];
        const processedData = [];

        // Extract school info from schools prop
        const { schoolName, schoolEmail, userEmail, province } = getSchoolAndUserInfo();

        rows.forEach((row, i) => {
          if (row.every(cell => cell === null || cell === undefined || String(cell).trim() === '')) return;

          totalRows++;

          const learner = {
            firstName: colIndexes.firstName !== -1 ? (row[colIndexes.firstName] || '').toString().trim() : '',
            lastName: colIndexes.lastName !== -1 ? (row[colIndexes.lastName] || '').toString().trim() : '',
            gender: colIndexes.gender !== -1 ? (row[colIndexes.gender] || '').toString().trim() : '',
            accessionNumber: colIndexes.accessionNumber !== -1 ? (row[colIndexes.accessionNumber] || '').toString().trim() : '',
            schoolName,
            schoolEmail,
            userEmail,
            province,
          };

          const cellPhoneRaw = colIndexes.cellPhone !== -1 ? (row[colIndexes.cellPhone] || '').toString().trim() : '';
          let telHomeRaw = colIndexes.telHome !== -1 ? (row[colIndexes.telHome] || '').toString().trim() : '';
          let telEmerRaw = colIndexes.telEmergency !== -1 ? (row[colIndexes.telEmergency] || '').toString().trim() : '';
          const whatsappRaw = colIndexes.whatsapp !== -1 ? (row[colIndexes.whatsapp] || '').toString().trim() : '';
          const telegramRaw = colIndexes.telegram !== -1 ? (row[colIndexes.telegram] || '').toString().trim() : '';

          telHomeRaw = telHomeRaw.replace(/^\(H\)\s*/, '').trim();
          telEmerRaw = telEmerRaw.replace(/^\(E\)\s*/, '').trim();

          learner.phone = cellPhoneRaw || telHomeRaw || telEmerRaw || '';
          learner.telHome = telHomeRaw;
          learner.telEmergency = telEmerRaw;
          learner.whatsapp = whatsappRaw;
          learner.telegram = telegramRaw;

          let rowErrors = [];

          if (!learner.firstName) rowErrors.push('First name is required.');
          if (!learner.lastName) rowErrors.push('Last name is required.');

          if (learner.phone && !/^\+?(\d[\d\s\-\(\)]*)$/.test(learner.phone)) {
            warnings.push({ row: headerRowIndex + 2 + i, field: 'phone', message: 'Phone number format might be incorrect.' });
          }
          if (learner.whatsapp && !/^\+?(\d[\d\s\-\(\)]*)$/.test(learner.whatsapp)) {
            warnings.push({ row: headerRowIndex + 2 + i, field: 'whatsapp', message: 'WhatsApp number format might be incorrect.' });
          }

          if (rowErrors.length > 0) {
            invalidRows++;
            errors.push({ row: headerRowIndex + 2 + i, messages: rowErrors.join('; ') });
          } else {
            validRows++;
            learner.gradeId = selectedGrade?.id || null;

            if (preview.length < 3) {
              preview.push({
                firstName: learner.firstName,
                lastName: learner.lastName,
                email: '', // No email column
                phone: learner.phone,
                whatsapp: learner.whatsapp,
                telegram: learner.telegram,
                parentName: '',
              });
            }

            processedData.push(learner);
          }
        });

        setValidationResults({
          totalRows,
          validRows,
          invalidRows,
          duplicates,
          errors,
          warnings,
          preview,
          dataToUpload: processedData,
        });

        setUploadStep('confirm');
      } catch (error) {
        console.error('File parsing error:', error);
        setErrorStatus('Error processing file. Please ensure it is correctly formatted.');
        setUploadStep('upload');
      } finally {
        setIsProcessing(false);
      }
    };

    reader.onerror = () => {
      setErrorStatus('Failed to read file.');
      setIsProcessing(false);
    };

    if (file.type === 'text/csv') {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  };

  const handleConfirmUpload = async () => {
    if (!validationResults || validationResults.validRows === 0) {
      setErrorStatus('No valid learners to upload.');
      return;
    }

    setIsProcessing(true);
    setErrorStatus('');

    try {
      const response = await fetch('http://localhost:4000/api/v1/learners/bulk_upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: validationResults.dataToUpload }),
      });

      const result = await response.json();

      if (response.ok) {
        setValidationResults(prev => ({
          ...prev,
          inserted: result.inserted || prev.validRows,
          duplicates: result.duplicatesSkipped || 0,
          errors: (prev.errors || []).concat(result.errors || []),
        }));
        setUploadStep('complete');
        if (onUploadSuccess) onUploadSuccess(result);
      } else {
        setErrorStatus(`Upload failed: ${result.message || 'Unknown error'}`);
        setUploadStep('confirm');
      }
    } catch (error) {
      console.error('API upload error:', error);
      setErrorStatus('Network error during upload. Please check your connection.');
      setUploadStep('confirm');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetUpload = () => {
    setUploadStep('upload');
    setUploadedFile(null);
    setValidationResults(null);
    setIsProcessing(false);
    setDragActive(false);
    setErrorStatus('');
  };

  const downloadTemplate = () => {
    const csvContent =
      'First Name,Last Name,Gender,Phone Number,Tel Number (H)ome,Tel Number (E)mergency,WhatsApp,Telegram,Student ID\n' +
      'John,Smith,Male,+27123456789,+27112223333,+27114445555,+27123456789,@johnsmith,12345\n' +
      'Sarah,Johnson,Female,+27129876543,+27113334444,+27117778888,+27129876543,@sarahjohnson,67890';

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'learners_upload_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  const { schoolName, schoolEmail } = getSchoolAndUserInfo();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Bulk Upload Learners {selectedGrade && `to ${selectedGrade.name}`}
                </h3>
                {schoolName && (
                  <p className="text-sm text-gray-500 mt-1">
                    School: {schoolName} ({schoolEmail})
                  </p>
                )}
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100" aria-label="Close">
                <FiX className="h-6 w-6" />
              </button>
            </div>
            {/* Progress Steps */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                {['upload', 'validate', 'confirm', 'complete'].map((step, index) => (
                  <React.Fragment key={step}>
                    <div className="flex flex-col items-center flex-1">
                      <div
                        className={`flex-shrink-0 w-8 h-8 border-2 rounded-full flex items-center justify-center transition-colors duration-200 ${
                          uploadStep === step
                            ? 'border-blue-600 bg-blue-50 text-blue-600'
                            : index < ['upload', 'validate', 'confirm', 'complete'].indexOf(uploadStep)
                            ? 'border-green-600 bg-green-50 text-green-600'
                            : 'border-gray-300 text-gray-400'
                        }`}
                      >
                        {index < ['upload', 'validate', 'confirm', 'complete'].indexOf(uploadStep) ? (
                          <FiCheck className="w-4 h-4" />
                        ) : (
                          <span className="text-sm font-medium">{index + 1}</span>
                        )}
                      </div>
                      <span
                        className={`mt-2 text-xs sm:text-sm font-medium capitalize text-center ${
                          uploadStep === step
                            ? 'text-blue-600'
                            : index < ['upload', 'validate', 'confirm', 'complete'].indexOf(uploadStep)
                            ? 'text-green-600'
                            : 'text-gray-600'
                        }`}
                      >
                        {step === 'upload' ? 'Upload File' : step}
                      </span>
                    </div>
                    {index < 3 && <div className={`flex-1 h-0.5 mx-2 sm:mx-4 transition-colors duration-200 ${index < ['upload', 'validate', 'confirm', 'complete'].indexOf(uploadStep) ? 'bg-green-600' : 'bg-gray-300'}`}></div>}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Step Content */}
            {uploadStep === 'upload' && (
              <div>
                <div className="mb-6">
                  <button
                    onClick={downloadTemplate}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <FiDownload className="mr-2 h-4 w-4" /> Download Template
                  </button>
                  <p className="mt-2 text-sm text-gray-500">Get our template to ensure your learner data is in the correct format.</p>
                </div>

                <div
                  className={`mt-4 flex flex-col items-center justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md transition-all duration-200 ${
                    dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <div className="space-y-1 text-center">
                    <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
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
                          ref={fileInputRef}
                          onChange={e => processFile(e.target.files[0])}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">Excel (.xlsx, .xls) or CSV files up to 5MB</p>
                  </div>
                </div>

                {errorStatus && (
                  <p className="mt-4 text-sm text-red-600 flex items-center justify-center">
                    <FiAlertTriangle className="inline mr-1 h-4 w-4" /> {errorStatus}
                  </p>
                )}

                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
                  <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
                    <FiInfo className="mr-2 h-4 w-4" /> Important File Requirements:
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>
                      • <strong>Required columns</strong>: First name and last name (accepts various formats like "First Name", "Learner First Name", "Given Name", etc.)
                    </li>
                    <li>
                      • <strong>Optional columns</strong>: Gender, Phone Numbers (Cell, Home, Emergency), WhatsApp, Telegram, Student ID
                    </li>
                    <li>• Supports flexible and common column header variations.</li>
                    <li>• You can upload any number of learners; large files may take longer to process.</li>
                  </ul>
                </div>
              </div>
            )}

            {uploadStep === 'validate' && (
              <div className="text-center py-10">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-lg font-semibold text-gray-700">Validating File...</p>
                <p className="text-sm text-gray-500">This may take a few moments as we process your data.</p>
              </div>
            )}

            {uploadStep === 'confirm' && validationResults && (
              <div>
                <div className="bg-gray-50 rounded-lg p-4 mb-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <FiFile className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-900">{uploadedFile?.name}</span>
                    {uploadedFile && <span className="ml-2 text-xs text-gray-500">{(uploadedFile.size / 1024).toFixed(1)} KB</span>}
                  </div>
                  <button onClick={resetUpload} className="text-red-500 hover:text-red-700 text-sm flex items-center">
                    <FiTrash2 className="mr-1 h-4 w-4" /> Start Over
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-blue-600">{validationResults.totalRows}</div>
                    <div className="text-xs text-blue-600">Total Rows</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-green-600">{validationResults.validRows}</div>
                    <div className="text-xs text-green-600">Ready to Upload</div>
                  </div>
                  <div className="bg-red-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-red-600">{validationResults.invalidRows}</div>
                    <div className="text-xs text-red-600">Invalid Rows</div>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-yellow-600">{validationResults.duplicates}</div>
                    <div className="text-xs text-yellow-600">Duplicates</div>
                  </div>
                </div>

                {errorStatus && (
                  <p className="mt-4 mb-4 text-sm text-red-600 flex items-center justify-center">
                    <FiAlertTriangle className="inline mr-1" /> {errorStatus}
                  </p>
                )}

                {validationResults.errors.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-red-800 mb-2 flex items-center">
                      <FiAlertTriangle className="mr-1 h-4 w-4" />
                      Errors ({validationResults.errors.length})
                    </h4>
                    <div className="bg-red-50 border border-red-200 rounded-md p-3 max-h-32 overflow-y-auto">
                      {validationResults.errors.map((error, index) => (
                        <div key={index} className="text-sm text-red-700">
                          <strong>Row {error.row}</strong>: {error.messages}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {validationResults.warnings.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-yellow-800 mb-2 flex items-center">
                      <FiAlertTriangle className="mr-1 h-4 w-4" />
                      Warnings ({validationResults.warnings.length})
                    </h4>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 max-h-32 overflow-y-auto">
                      {validationResults.warnings.map((warning, index) => (
                        <div key={index} className="text-sm text-yellow-700">
                          <strong>Row {warning.row}</strong>: {warning.message}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-800 mb-2">Preview (First 3 valid rows)</h4>
                  <div className="overflow-x-auto border border-gray-200 rounded-md">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">WhatsApp</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Telegram</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Parent</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {validationResults.preview.length > 0 ? (
                          validationResults.preview.map((row, index) => (
                            <tr key={index}>
                              <td className="px-3 py-2 text-sm text-gray-900">
                                {row.firstName} {row.lastName}
                              </td>
                              <td className="px-3 py-2 text-sm text-gray-900">{row.phone || '-'}</td>
                              <td className="px-3 py-2 text-sm text-gray-900">{row.whatsapp || '-'}</td>
                              <td className="px-3 py-2 text-sm text-gray-900">{row.telegram || '-'}</td>
                              <td className="px-3 py-2 text-sm text-gray-900">{row.parentName || '-'}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="5" className="px-3 py-4 text-sm text-gray-500 text-center">
                              No valid rows to preview.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {uploadStep === 'complete' && validationResults && (
              <div className="text-center py-10">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                  <FiCheck className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Upload Complete!</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Successfully uploaded <strong>{validationResults.validRows || 0}</strong> learners to{' '}
                  <strong>{selectedGrade?.name || 'the selected grade'}</strong> for{' '}
                  <strong>{schoolName}</strong>.
                </p>
                {validationResults.duplicates > 0 && (
                  <p className="mt-1 text-sm text-yellow-600">
                    <strong>{validationResults.duplicates}</strong> learners were skipped (e.g.,
                    duplicates).
                  </p>
                )}
                {validationResults.errors && validationResults.errors.length > 0 && (
                  <p className="mt-1 text-sm text-red-600">
                    <strong>{validationResults.errors.length}</strong> rows had errors and were
                    not uploaded.
                  </p>
                )}
                <div className="mt-6 bg-green-50 border border-green-200 rounded-md p-4 text-left">
                  <h4 className="text-sm font-medium text-green-800 mb-2">What happens next:</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Learners have been added to {schoolName}.</li>
                    <li>• All records include school information ({schoolEmail}).</li>
                    <li>• Contact information (phone, WhatsApp, Telegram) has been captured for communication.</li>
                    <li>• You can now view and manage the new learners in the Learners table.</li>
                    <li>• Student IDs have been automatically generated for new learners.</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Footer buttons */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            {uploadStep === 'upload' && (
              <button
                type="button"
                onClick={onClose}
                className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            )}

            {uploadStep === 'confirm' && (
              <>
                <button
                  type="button"
                  onClick={handleConfirmUpload}
                  disabled={isProcessing || validationResults?.validRows === 0}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <FiLoader className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                      Uploading...
                    </>
                  ) : (
                    `Upload ${validationResults?.validRows || 0} Learners`
                  )}
                </button>
                <button
                  type="button"
                  onClick={resetUpload}
                  disabled={isProcessing}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  <FiTrash2 className="mr-2 h-4 w-4" />
                  Start Over
                </button>
              </>
            )}

            {uploadStep === 'complete' && (
              <button
                type="button"
                onClick={onClose}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 transition-colors sm:w-auto sm:text-sm"
              >
                Done
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkUpload;
