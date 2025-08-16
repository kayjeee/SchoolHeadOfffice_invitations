import { useState, useEffect } from 'react';
import Head from 'next/head';
import Navbar from './FrontPageLayout/Nav/Navbar';
import MobileNavbar from './FrontPageLayoutMobile/MobileNav/MobileNavbar';
import Footer from '../footer/Footer';
import { School } from './shared/types/School'; //Import shared type
import { User } from './shared/types/User'; // Import User type
import { useAppTheme } from '../../context/ThemeContext'; // Import theme context
import { UserRole } from './shared/types/UserRole';

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