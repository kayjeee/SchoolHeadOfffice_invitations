import React from 'react';

const ReviewSchoolStep = () => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-800">Review and Complete</h2>
      <p className="mt-2 text-gray-600">
        Review all details below. Once everything is confirmed, click "Finish" to complete the process.
      </p>
      <div className="mt-4">
        <div className="flex justify-between items-center border-b border-gray-300 py-2">
          <span className="text-gray-700 font-medium">School Name</span>
          <span className="text-gray-500">Example School</span>
        </div>
        <div className="flex justify-between items-center border-b border-gray-300 py-2">
          <span className="text-gray-700 font-medium">School Address</span>
          <span className="text-gray-500">123 Example Street</span>
        </div>
        <div className="flex justify-between items-center border-b border-gray-300 py-2">
          <span className="text-gray-700 font-medium">Contact Email</span>
          <span className="text-gray-500">contact@example.com</span>
        </div>
      </div>
      <button className="mt-6 w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700">
        Finish
      </button>
    </div>
  );
};

export default ReviewSchoolStep;
