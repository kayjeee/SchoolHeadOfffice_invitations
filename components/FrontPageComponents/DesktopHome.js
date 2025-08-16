// DesktopHome.js

import { useState } from 'react';
import SearchBarDesktop from './DesktopComponents/SearchBarDesktop';
import IntroSection from './DesktopComponents/IntroSection';
import DesktopNavigationButtons from './DesktopNavigationButtons/DesktopNavigationButtons';
import Courses from './DesktopCarousel/Courses';

import AppPromo from './DesktopComponents/AppPromo';

const DesktopHome = ({schools}) => {
  const [chatOpen, setChatOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  return (
    <>
      <div className="relative min-h-screen bg-white flex flex-col md:flex-row">
        <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-8 bg-gray-100 shadow-2xl">
          <SearchBarDesktop  searchQuery={searchQuery} setSearchQuery={setSearchQuery} schools={schools}/>
          <IntroSection />
        </div>

        <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-white shadow-2xl">
          <img src="/walking rabbit gif.gif" alt="Capitec Mobile App" className="max-w-full h-auto" />
        </div>
      </div>

      <DesktopNavigationButtons />
      <Courses />

      <div className="fixed bottom-4 right-4 flex flex-col items-end z-30">
        <button
          onClick={() => setChatOpen(!chatOpen)}
          className="bg-blue-500 text-white px-6 py-3 rounded-full shadow-lg hover:bg-blue-600 transition-colors duration-300 text-lg font-bold"
        >
          Chat with us
        </button>
        <AppPromo />
      </div>
    </>
  );
};

export default DesktopHome;
