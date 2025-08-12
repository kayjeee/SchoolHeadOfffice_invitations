import { useState, useEffect } from 'react';
import Head from 'next/head';
import Navbar from './FrontPageLayout/Nav/Navbar';
import MobileNavbar from './FrontPageLayoutMobile/MobileNav/MobileNavbar';
import Footer from '../footer/Footer';

interface School {
  id: string;
  schoolName: string;
  schoolImage?: string;
}

interface UserRole {
  id: string;
  name: string;
}

interface User {
  id: string;
  name: string;
  // other user properties
}

interface FrontPageLayoutProps {
  children: React.ReactNode;
  school?: School;
  schools?: School[];
  user?: User;
  loading?: boolean;
  userRoles?: UserRole[];
}

const FrontPageLayout: React.FC<FrontPageLayoutProps> = ({ 
  children, 
  school, 
  schools = [], 
  user, 
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
      {isMobile ? (
        <MobileNavbar 
          schoolImage={school?.schoolImage} 
          schools={schools}
          userRoles={userRoles}
        />
      ) : (
        <Navbar 
          schoolImage={school?.schoolImage} 
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