import React, { useState, useEffect } from 'react';

const DetailsTab = ({ school }) => {
  const [loading, setLoading] = useState(!school);
  const [schoolData, setSchoolData] = useState(school);

  useEffect(() => {
    // Only set loading to false if school data is available here
    if (school) {
      setSchoolData(school);
      setLoading(false); // Data is now available
    }
  }, [school]); // Update when the school prop changes

  if (loading) {
    return <div>Loading school details...</div>;
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-4">
      {/* School Logo */}
      <div className="flex justify-center mb-6">
        <img
          src={schoolData?.logo || 'https://via.placeholder.com/150'}
          alt={`${schoolData?.schoolName || 'School'} Logo`}
          className="w-32 h-32 object-cover rounded-full"
        />
      </div>

      {/* School Name */}
      <h2 className="text-3xl font-bold text-center mb-4">
        {schoolData?.schoolName || 'Unnamed School'}
      </h2>

      {/* Location */}
      <div className="flex items-center justify-center text-gray-600 mb-4">
        <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path fill="currentColor" d="M12 2C8.134 2 5 5.134 5 9c0 6.257 6.308 11.52 6.615 11.781a1 1 0 0 0 1.217 0C12.692 20.519 19 15.257 19 9c0-3.866-3.134-7-7-7zm0 17.908C10.198 18.346 7 14.977 7 9a5 5 0 0 1 10 0c0 5.977-3.198 9.346-5 10.908zM12 6.5A2.5 2.5 0 1 0 12 11a2.5 2.5 0 0 0 0-5z" />
        </svg>
        <p>{`${schoolData?.City || 'City'}, ${schoolData?.Province || 'Province'}, ${schoolData?.Country || 'Country'}`}</p>
      </div>

      {/* Email */}
      <div className="flex items-center justify-center text-gray-600 mb-4">
        <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12l-4-4m0 0l-4 4m4-4v12" />
        </svg>
        <a href={`mailto:${schoolData?.schoolemail || 'example@example.com'}`} className="text-blue-500">
          {schoolData?.schoolemail || 'N/A'}
        </a>
      </div>

      {/* Coordinates */}
      <div className="flex justify-center mb-6 text-gray-500">
        {schoolData?.latitude && schoolData?.longitude ? (
          <p>{`Coordinates: ${schoolData.latitude}, ${schoolData.longitude}`}</p>
        ) : (
          <p>No coordinates available</p>
        )}
      </div>

  
       
     
    </div>
  );
};

export default DetailsTab;
