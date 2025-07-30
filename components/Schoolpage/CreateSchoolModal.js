// components/Schoolpage/CreateSchoolModal.js
import React, { useState } from 'react';
import { useApp } from '../useApp';

const CreateSchoolModal = ({ isOpen, onClose, onSchoolCreated }) => {
  const app = useApp();
  const [schoolName, setSchoolName] = useState('');
  const [schoolDescription, setSchoolDescription] = useState('');
  const [schoolLogo, setSchoolLogo] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewParent({ ...newParent, [name]: value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) {
        console.error('User email is null.');
        return;
      }
      await app.currentUser.functions.createschool({
        schoolName,
        schoolDescription,
        schoolLogo,
        userEmail,
      });
      onSchoolCreated();
    } catch (error) {
      console.error('Error creating school:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoChange = (e) => {
    setSchoolLogo(e.target.files[0]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed z-10 inset-0 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Create School</h3>
                <form onSubmit={handleSubmit}>
                  <div className="mt-2">
                    <label htmlFor="schoolName" className="block text-sm font-medium text-gray-700">
                      School Name
                    </label>
                    <input
                      type="text"
                      id="schoolName"
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div className="mt-2">
                    <label htmlFor="schoolDescription" className="block text-sm font-medium text-gray-700">
                      School Description
                    </label>
                    <textarea
                      id="schoolDescription"
                      value={schoolDescription}
                      onChange={(e) => setSchoolDescription(e.target.value)}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      required
                    ></textarea>
                  </div>
                  <div className="mt-2">
                    <label htmlFor="schoolLogo" className="block text-sm font-medium text-gray-700">
                      School Logo
                    </label>
                    <input
                      type="file"
                      id="schoolLogo"
                      onChange={handleLogoChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button
                      type="submit"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      {loading ? 'Creating...' : 'Create'}
                    </button>
                    <button
                      type="button"
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                      onClick={onClose}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateSchoolModal;
