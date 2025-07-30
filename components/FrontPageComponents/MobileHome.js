import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import MobileNavbar from '../Layouts/FrontPageLayoutMobile/MobileNav/MobileNavbar';
import { useSpring, animated } from '@react-spring/web';
import PageSearchBar from './LandingPageSearchBar/PageSearchBar';
import IntroductionSection from './IntroductionSection/IntroductionSection';
import NavigationButtons from './NavigationButtons/NavigationButtonsMobile';
import MobileCarousel from './MobileCarousel/MobileCarousel'; // Import the carousel component

const MobileHome = ({ handleChatClick, handleSearchClick, dropdownOpen, schools }) => {
  const [localDropdownOpen, setLocalDropdownOpen] = useState(dropdownOpen);
  const localDropdownRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const toggleDropdown = () => {
    setLocalDropdownOpen(!localDropdownOpen);
  };

  const handleClickOutside = (e) => {
    if (localDropdownRef.current && !localDropdownRef.current.contains(e.target)) {
      setLocalDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const searchBarAnimation = useSpring({
    opacity: 1,
    from: { opacity: 0 },
    config: { duration: 1000 },
  });

  return (
    <>
     
      <div className="relative min-h-screen mt-0 bg-white flex flex-col">
      <PageSearchBar   searchQuery={searchQuery} setSearchQuery={setSearchQuery} schools={schools} toggleDropdown={toggleDropdown} localDropdownOpen={localDropdownOpen} />
      <IntroductionSection />
      <NavigationButtons />
      <MobileCarousel /> {/* Add the carousel component here */}
        <div className="text-right">
          <h3 className="text-lg font-bold text-gray-800 mb-2">Available on</h3>
          <div className="flex justify-end items-center space-x-2">
            <div className="flex flex-col items-center">
              <img src="/android.png" alt="Android App" className="w-10 h-10 mb-1" />
              <span className="text-gray-600 text-sm">Android</span>
            </div>
            <div className="flex flex-col items-center">
              <img src="/ios.png" alt="iOS App" className="w-10 h-10 mb-1" />
              <span className="text-gray-600 text-sm">iOS</span>
            </div>
          </div>
        </div>
      </div>
     
    </>
  );
};

export default MobileHome;
