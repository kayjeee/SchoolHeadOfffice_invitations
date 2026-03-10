import React from 'react';

interface SchoolHeroProps {
  schoolName: string;
  logo: string | null;
  city: string;
  province: string;
}

const SchoolHero: React.FC<SchoolHeroProps> = ({ schoolName, logo, city, province }) => {
  const logoUrl = logo || '/uploadphoto.png';

  return (
    <div className="bg-white border-b border-gray-100 pb-12 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
        <div className="relative mb-6">
          <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-blue-50 shadow-sm overflow-hidden bg-white">
            <img
              src={logoUrl}
              alt={`${schoolName} Logo`}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = '/uploadphoto.png';
              }}
            />
          </div>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-3">
          {schoolName}
        </h1>
        <p className="text-lg sm:text-xl text-gray-500 font-medium">
          {city}{city && province ? ', ' : ''}{province}
        </p>
      </div>
    </div>
  );
};

export default SchoolHero;
