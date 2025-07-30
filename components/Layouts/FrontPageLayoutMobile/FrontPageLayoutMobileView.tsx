import { useState, useEffect } from 'react';
import MobileNavbar from './MobileNav/MobileNavbar';
import Footer from '../../footer/Footer';
import Navbar from './MobileNav/MobileNavbar';
import Link from 'next/link';
import useWindowSize from '../../hooks/useWindowSize'; // Import the custom hook

export default function FrontPageLayoutMobileView({ children, school, schools, userRoles }) {
  const [searchQuery, setSearchQuery] = useState('');
  const size = useWindowSize(); // Get window size
  const isMobile = size.width <= 768; // Set a breakpoint (768px for mobile)

  return (
    <>
      {isMobile ? (
        <MobileNavbar 
          schoolImage={school?.logo}
          schools={schools}
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery}
          userRoles={userRoles} // Pass userRoles to MobileNavbar
        />
      ) : (
        <Navbar schoolImage={school?.logo} userRoles={userRoles} /> // Pass userRoles to Navbar
      )}
      <main className="flex-grow">{children}</main>
      <Footer />
    </>
  );
}
