import React from 'react';

const ValidateSchoolStep = () => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-800">Validate School Information</h2>
      <p className="mt-2 text-gray-600">
        Please review the school information provided and make any necessary corrections before proceeding.
      </p>
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700" htmlFor="schoolName">
          School Name
        </label>
        <input
          type="text"
          id="schoolName"
          className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Enter school name"
        />
      </div>
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700" htmlFor="schoolAddress">
          School Address
        </label>
        <input
          type="text"
          id="schoolAddress"
          className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Enter school address"
        />
      </div>
      <button className="mt-6 w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700">
        Validate
      </button>
    </div>
  );
};

export default ValidateSchoolStep;
