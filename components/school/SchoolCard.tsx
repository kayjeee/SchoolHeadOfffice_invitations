import React from 'react';
import Link from 'next/link';
import { School } from '../../lib/api/school-api';

interface SchoolCardProps {
  school: School;
}

const SchoolCard: React.FC<SchoolCardProps> = ({ school }) => {
  // Use a fallback for the logo
  const logoUrl = school.logo || '/uploadphoto.png';

  // Slugify the school name: "Far North Secondary" → "Far+North+Secondary"
  const schoolSlug = encodeURIComponent(school.schoolName).replace(/%20/g, '+');

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow duration-200 flex flex-col h-full">
      <div className="flex items-center gap-4 mb-4">
        <div className="relative w-16 h-16 flex-shrink-0">
          <img
            src={logoUrl}
            alt={`${school.schoolName} Logo`}
            className="w-full h-full rounded-full object-cover border border-gray-50"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = '/uploadphoto.png';
            }}
          />
        </div>
        <div className="flex-1 overflow-hidden">
          <h3 className="text-lg font-bold text-gray-900 truncate" title={school.schoolName}>
            {school.schoolName}
          </h3>
          <p className="text-sm text-gray-500 flex items-center gap-1">
            <span className="truncate">{school.city}{school.province ? `, ${school.province}` : ''}</span>
          </p>
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-gray-50 flex flex-col gap-2">
        <Link
          href={`/teacher/school/${schoolSlug}`}
          className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          Select School
        </Link>
      </div>
    </div>
  );
};

export default SchoolCard;
