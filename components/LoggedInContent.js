// components/LoggedInContent.js
import React from 'react';
import SchoolList from './SchoolList'; // Adjust the import according to your file structure

const LoggedInContent = ({
  schoolList,
  showSchools,
  handleSchoolClick,
  handleViewPendingRequests,
  toggleView,
  showPendingRequestsModal,
  selectedSchool,

  handleAcknowledgeRequest,
  handleAcceptRequest,
  handleBlockRequest,
  handleCreateSchoolButtonClick,
  handleRefreshSchoolList,
  handleClosePendingRequestsModal,
}) => {
  return (
    <div className="p-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-end mb-4">
          <button
            onClick={handleCreateSchoolButtonClick}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
          >
            Create School
          </button>
          <button
            onClick={handleRefreshSchoolList}
            className="px-4 py-2 ml-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
          >
            Refresh School List
          </button>
          <button
            onClick={toggleView}
            className="px-4 py-2 ml-4 bg-yellow-600 text-white rounded-lg font-semibold hover:bg-yellow-700"
          >
            {showSchools ? 'View Pending Requests' : 'View Schools'}
          </button>
        </div>
        {showSchools && (
          <SchoolList
            schoolList={schoolList}
            onSchoolClick={handleSchoolClick}
            onViewPendingRequests={handleViewPendingRequests}
          />
        )}
        {showPendingRequestsModal && selectedSchool && (
          <div
            className="fixed inset-0 z-20 flex items-center justify-center bg-gray-500 bg-opacity-75"
            onClick={handleClosePendingRequestsModal}
          >
            <div
              className="bg-white rounded-lg shadow-md p-6 max-w-md w-full h-auto max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
          
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoggedInContent;
