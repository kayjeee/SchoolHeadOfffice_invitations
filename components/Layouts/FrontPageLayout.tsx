// components/Layouts/FrontPageLayout.tsx
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Navbar from './FrontPageLayout/Nav/Navbar';
import MobileNavbar from './FrontPageLayoutMobile/MobileNav/MobileNavbar';
import Footer from '../footer/Footer';
import { School } from './shared/types/School'; // Import shared type
// components/Layouts/FrontPageLayout.tsx


interface User {
  id: string;
  name: string;
  email: string;
}

interface FrontPageLayoutProps {
  children: React.ReactNode;
  school?: School;
  schools?: School[];
  user?: User | null;
  loading?: boolean;
  userRoles?: string[];
}

const FrontPageLayout: React.FC<FrontPageLayoutProps> = ({ 
  children, 
  school, 
  schools = [], 
  user = null, 
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

// Update the transformation to handle optional schoolName
const transformedSchools = schools.map(s => ({
  _id: s._id || s.id,
  id: s.id,
  name: s.name,
  schoolName: s.schoolName, // Now optional
  logo: s.logo,
  schoolImage: s.schoolImage
}));

  return (
    <>
      <Head>
        <title>SchoolHeadOffice</title>
      </Head>
      {isMobile ? (
        <MobileNavbar 
          schoolImage={school?.logo || school?.schoolImage}
          schools={transformedSchools}
          userRoles={userRoles}
        />
      ) : (
        <Navbar 
          schools={transformedSchools}
          user={user}
          loading={loading}
          userRoles={userRoles}
          searchQuery=""
          setSearchQuery={() => {}}
        />
      )}
      <main>{children}</main>
      <Footer />
    </>
  );
};

export default FrontPageLayout;
