import { ReactNode, useState } from 'react';
import MobileNavbar from './MobileNav/MobileNavbar';
import Navbar from './MobileNav/MobileNavbar';
import Footer from '../../footer/Footer';
import useWindowSize from '../../hooks/useWindowSize';
import { School } from '../shared/types/School';
import { UserRole } from '../shared/types/UserRole';
import { User } from '../shared/types/User'; // Or your custom User type

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
    <>
      {isMobile ? (
        <MobileNavbar
          schoolImage={school?.logo}
          schools={schools}
          user={user}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          userRoles={userRoles}
        />
      ) : (
        <Navbar
          schoolImage={school?.logo}
          schools={schools}
          user={user}
          userRoles={userRoles}
            searchQuery={searchQuery}   // ✅ Add
  setSearchQuery={setSearchQuery}  // ✅ Ad
        />
      )}

      <main className="flex-grow">{children}</main>
      <Footer />
    </>
  );
};

export default FrontPageLayoutMobileView;
