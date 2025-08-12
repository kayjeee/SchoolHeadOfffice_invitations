import { useState, useEffect } from 'react';
import Head from 'next/head';
import Navbar from './FrontPageLayout/Nav/Navbar';
import MobileNavbar from './FrontPageLayoutMobile/MobileNav/MobileNavbar';
import Footer from '../footer/Footer';

// Define props for MobileNavbar
interface MobileNavbarProps {
  schoolImage?: string;
  // Add other props if MobileNavbar needs them
}

type LayoutProps = {
  user?: any;
  loading?: boolean;
  children: React.ReactNode;
  userRoles?: string[];
};

interface School {
  logo?: string;
}

interface FrontPageLayoutProps {
  children: React.ReactNode;
  school?: School;
  schools?: any[];
  user?: any;
  loading?: boolean;
  userRoles?: string[];
}

const FrontPageLayout: React.FC<FrontPageLayoutProps> = ({ 
  children, 
  school, 
  schools, 
  user, 
  loading = false,
  userRoles
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
        <MobileNavbar schoolImage={school?.logo} />
      ) : (
        <Navbar 
          schoolImage={school?.logo} 
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