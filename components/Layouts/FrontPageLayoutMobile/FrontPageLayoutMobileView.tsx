import { ReactNode, useState } from 'react';
import MobileNavbar from './MobileNav/MobileNavbar';
import Navbar from '../FrontPageLayout/Nav/Navbar'; // ✅ corrected import
import Footer from '../../footer/Footer';
import useWindowSize from '../../hooks/useWindowSize';
import { School } from '../shared/types/School';
import { UserRole } from '../shared/types/UserRole';
import { User } from '../shared/types/User';
import { AppThemeProvider } from '../context/ThemeContext';

interface FrontPageLayoutMobileViewProps {
  children: ReactNode;
  school?: School;
  schools?: School[];
  user?: User | null;
  userRoles?: UserRole[];
}

const FrontPageLayoutMobileView: React.FC<FrontPageLayoutMobileViewProps> = ({
  children,
  school,
  schools = [],
  user,
  userRoles = [],
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const size = useWindowSize();
  const isMobile = size.width <= 768;

  return (
    <AppThemeProvider>
      {isMobile ? (
        <MobileNavbar
          schoolImage={school?.logo}
          schools={schools}
          user={user}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          userRoles={userRoles}
          schoolTheme={school?.theme}
        />
      ) : (
        <Navbar
          schoolImage={school?.logo}
          schools={schools}
          user={user}
          userRoles={userRoles}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          schoolTheme={school?.theme}
            loading={false} // ✅ add this line
        />
      )}

      <main className="flex-grow">{children}</main>
      <Footer />
    </AppThemeProvider>
  );
};

export default FrontPageLayoutMobileView;
