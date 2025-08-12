// components/Layouts/FrontPageLayout.tsx
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Navbar from './FrontPageLayout/Nav/Navbar';
import MobileNavbar from './FrontPageLayoutMobile/MobileNav/MobileNavbar';
import Footer from '../footer/Footer';

interface School {
  id: string;
  name: string;
  logo?: string;
  schoolImage?: string; // Added to match potential usage
}

interface User {
  id: string;
  name: string;
  email: string; // Added required email field
  // other user properties as needed
}

interface FrontPageLayoutProps {
  children: React.ReactNode;
  school?: School;
  schools?: School[];
  user?: User | null; // Make user optional or nullable
  loading?: boolean;
  userRoles?: string[];
}

const FrontPageLayout: React.FC<FrontPageLayoutProps> = ({ 
  children, 
  school, 
  schools = [], 
  user = null, // Provide default value
  loading = false,
  userRoles = []
}) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <Head>
        <title>SchoolHeadOffice</title>
      </Head>
      {isMobile? (
        <MobileNavbar 
          schoolImage={school?.logo || school?.schoolImage} 
          schools={schools}
          userRoles={userRoles}
        />
      ) : (
        <Navbar 
          schoolImage={school?.logo || school?.schoolImage} 
          schools={schools} 
          user={user} 
          loading={loading}
          userRoles={userRoles}
        />
      )}
      <main>{children}</main>
      <Footer />
    </>
  );
};

export default FrontPageLayout;
