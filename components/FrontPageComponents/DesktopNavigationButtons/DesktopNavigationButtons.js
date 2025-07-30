import React from 'react';

const DesktopNavigationButtons = () => {
  return (
    <div className="relative p-6 bg-gray-100 mt-8 rounded-lg shadow-md">
      <h3 className="text-2xl font-bold text-gray-800 mb-4">Where would you like to start?</h3>
      <p className="text-lg text-gray-700 mb-4">
        Choose from  Personal, to Business
      </p>
      <div className="grid grid-cols-2 gap-4">
    
        <div className="bg-gray-800 text-white rounded-lg shadow-md p-6 flex flex-col items-center hover:bg-blue-700 cursor-pointer">
          <img src="/haha hero.png" alt="GlobalBiz Business" className=" mb-4" />
          <span className="font-bold text-lg">Personal</span>
          <span>Are you a Parent or student? Chat to your School here </span>
        </div>
        <div className="bg-gray-600 text-white rounded-lg shadow-md p-6 flex flex-col items-center hover:bg-blue-500 cursor-pointer">
          <img src="/schoolkids2.png" alt="Live Better" className=" mb-4" />
          <span className="font-bold text-lg">Business</span>
          <span>Manage Your Customer Base</span>
        </div>
      </div>
    </div>
  );
};

export default DesktopNavigationButtons;
