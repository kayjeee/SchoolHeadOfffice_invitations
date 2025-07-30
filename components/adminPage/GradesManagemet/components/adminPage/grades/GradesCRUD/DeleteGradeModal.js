import React, { useState } from 'react';
import { FiX, FiTrash2, FiAlertTriangle } from 'react-icons/fi';

const DeleteGradeModal = ({ isOpen, onClose, grade }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');

  const handleDelete = async () => {
    if (confirmationText !== grade?.name) {
      return;
    }

    setIsDeleting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Deleting grade:', grade.id);

      // Reset confirmation text
      setConfirmationText('');
      onClose();
    } catch (error) {
      console.error('Error deleting grade:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const isConfirmationValid = confirmationText === grade?.name;

  if (!isOpen || !grade) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          {/* Header */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <FiAlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Delete Grade
                  </h3>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>

            {/* Warning Content */}
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <FiAlertTriangle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Warning: This action cannot be undone
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>
                        You are about to permanently delete the grade <strong>"{grade.name}"</strong>. 
                        This will also affect:
                      </p>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>{grade.learnerCount || 0} learners will be unassigned</li>
                        <li>{grade.teacherCount || 0} teacher assignments will be removed</li>
                        <li>All grade-related data will be permanently lost</li>
                        <li>Historical records and reports may be affected</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grade Information */}
              <div className="bg-gray-50 rounded-md p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Grade Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Name:</span>
                    <span className="ml-2 font-medium">{grade.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Description:</span>
                    <span className="ml-2">{grade.description || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Current Learners:</span>
                    <span className="ml-2 font-medium">{grade.learnerCount || 0}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Assigned Teachers:</span>
                    <span className="ml-2 font-medium">{grade.teacherCount || 0}</span>
                  </div>
                </div>
              </div>

              {/* Confirmation Input */}
              <div>
                <label htmlFor="confirmation" className="block text-sm font-medium text-gray-700 mb-2">
                  To confirm deletion, type the grade name: <strong>{grade.name}</strong>
                </label>
                <input
                  type="text"
                  id="confirmation"
                  value={confirmationText}
                  onChange={(e) => setConfirmationText(e.target.value)}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  placeholder={`Type "${grade.name}" to confirm`}
                />
              </div>

              {/* Alternative Actions */}
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      Consider these alternatives:
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <ul className="list-disc list-inside space-y-1">
                        <li>Archive the grade instead of deleting it</li>
                        <li>Transfer learners to another grade first</li>
                        <li>Export grade data before deletion</li>
                        <li>Reassign teachers to other grades</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={handleDelete}
              disabled={!isConfirmationValid || isDeleting}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Deleting...
                </>
              ) : (
                <>
                  <FiTrash2 className="mr-2 h-4 w-4" />
                  Delete Grade
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteGradeModal;

