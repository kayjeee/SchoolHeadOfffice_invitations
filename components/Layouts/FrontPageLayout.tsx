import React, { useEffect, useState } from 'react';
import Head from 'next/head';

import { AppThemeProvider } from './context/ThemeContext';

import MobileNavbar from './FrontPageLayoutMobile/MobileNav/MobileNavbar';
import Navbar from './FrontPageLayout/Nav/Navbar';       // ← adjust path if your Navbar lives elsewhere
import Footer from '../footer/Footer';       // ← adjust path if your Footer lives elsewhere

import { School } from './shared/types/School';
import { User } from './shared/types/User';
import { UserRole } from './shared/types/UserRole';

interface FrontPageLayoutProps {
  children: React.ReactNode;
  school?: School;
  schools?: School[];
  user?: User;
  loading?: boolean;
  userRoles?: UserRole[];
  schoolTheme?: string; // New prop for dynamic theming
}

const FrontPageLayout: React.FC<FrontPageLayoutProps> = ({
  children,
  school,
  schools = [],
  user,
  loading = false,
  userRoles = [],
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    handleResize(); // initialize on mount
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
    <AppThemeProvider>
      <Head>
        <title>SchoolHeadOffice</title>
      </Head>

      {isMobile ? (
        <MobileNavbar
          schoolImage={school?.schoolImage}
          schools={schools}
          userRoles={userRoles}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          // user and schoolTheme are optional in your MobileNavbar, omit or add if needed:
          // user={user}
          // schoolTheme={school?.theme}
        />
      ) : (
        <Navbar
          schoolImage={school?.schoolImage}
          schools={schools}
          user={user}
          loading={loading}
          userRoles={userRoles}
          schoolTheme={school?.theme}
        />
      )}

      <main>{children}</main>
      <Footer />
    </AppThemeProvider>
  );
};

export default FrontPageLayout;

