import React, { useState } from 'react';
import Link from 'next/link';

// Default image URL for schools without a logo
const defaultLogoUrl = '/uploadphoto.PNG';

const SchoolList = ({ schoolList, onSchoolClick, onViewPendingRequests }) => {
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const handleSchoolSettings = (school) => {
    setSelectedSchool(school);
    setShowSettingsModal(true);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {schoolList?.result?.length > 0 ? (
        <div className="grid grid-cols-2 gap-4">
          {schoolList.result.map((school) => (
            <div
              key={school._id.$oid}
              className="bg-gray-100 rounded-lg p-4 hover:bg-gray-200 transition-colors duration-300 cursor-pointer flex flex-col"
              onClick={() => onSchoolClick(school.schoolName)}
            >
              <Link href={`/admin/${encodeURIComponent(school.schoolName)}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-shrink-0">
                    <img
                      src={school.logo || defaultLogoUrl} // Use school.logo for the logo URL
                      alt={`${school.schoolName} Logo`}
                      className="h-10 w-10 rounded-full"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = defaultLogoUrl; // Fallback to default image if logo URL fails to load
                      }}
                    />
                  </div>
                  <p className="text-lg font-semibold ml-2">{school.schoolName}</p>
                  <button
                    onClick={() => handleSchoolSettings(school)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v.01M12 18v.01M4 8.5H3a2 2 0 01-2-2v-.5a2 2 0 012-2h1m18 4h1a2 2 0 012 2v.5a2 2 0 01-2 2h-1"
                      />
                    </svg>
                  </button>
                </div>
              </Link>
              <p className="mb-2">{school.schoolemail}</p>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                onClick={() => onViewPendingRequests(school)}
              >
                View Pending Requests
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p>No schools found.</p>
      )}

   
    </div>
  );
};

export default SchoolList;