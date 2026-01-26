import React from 'react';
import Head from 'next/head';

import { AppThemeProvider } from './context/ThemeContext';
import Navbar from './FrontPageLayout/Nav/Navbar';
import Footer from '../footer/Footer';

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
  schoolTheme?: string;
}

const FrontPageLayout: React.FC<FrontPageLayoutProps> = ({
  children,
  school,
  schools = [],
  user,
  loading = false,
  userRoles = [],
}) => {
  return (
    <AppThemeProvider>
      <Head>
        <title>SchoolHeadOffice</title>
      </Head>

      <Navbar
        schoolImage={school?.schoolImage}
        schools={schools}
        user={user}
        loading={loading}
        userRoles={userRoles}
        schoolTheme={school?.theme}
      />

      <main>{children}</main>
      <Footer />
    </AppThemeProvider>
  );
};

export default FrontPageLayout;