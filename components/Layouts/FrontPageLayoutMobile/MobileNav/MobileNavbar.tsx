import { useState } from 'react';
import Link from 'next/link';
import MobileSearchBar from './MobileSearchBar';
import MobileMenuDropdown from './MobileMenuDropdown';
import MobileMenuReflectionTabs from './MobileMenuReflectionTabs';
import { useAppTheme } from '../../../../context/ThemeContext';

// components/Layouts/FrontPageLayoutMobile/MobileNav/MobileNavbar.tsx
interface School {
  id: string;
  _id: string;
  name: string;
  schoolName?: string; // Made optional
  logo?: string;
  schoolImage?: string;
}

interface UserRole {
  id: string;
  name: string;
}

interface MobileNavbarProps {
  schools?: School[];
  userRoles?: string[]; 
  schoolImage?: string;
}

const MobileNavbar: React.FC<MobileNavbarProps> = ({ 
  schools = [],      // Default empty array
  userRoles = [],    // Default empty array
  schoolImage 
}) => {
  const [showReflection, setShowReflection] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);

  // Access theme context
  const { primaryColor, currentSchool } = useAppTheme();

  const toggleReflection = () => {
    setShowReflection(!showReflection);
  };

  const openLoginModal = () => {
    setShowLoginModal(true);
  };

  const closeLoginModal = () => {
    setShowLoginModal(false);
  };

  // Determine which image to use (priority: prop > context > default)
  const logoImage = schoolImage || currentSchool?.schoolImage || '/shologoredandbluetwo.PNG';

  return (
    <>
      <nav 
        className="border-b border-gray-200"
        style={{ backgroundColor: primaryColor || 'white' }}
      >
        <div className="max-w-full mx-auto h-20 flex justify-between items-center px-4">
          <Link href="/" passHref>
            <div className="flex items-center space-x-2 cursor-pointer">
              <img
                src={logoImage}
                alt="School logo"
                width={170}
                height={170}
                className="md:order-first order-last"
              />
              {currentSchool && (
                <h1 className="text-lg font-bold text-white hidden sm:block">
                  {currentSchool?.schoolName || currentSchool?.name}
                </h1>
              )}
            </div>
          </Link>

          <MobileSearchBar
            schools={schools}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />

          <MobileMenuDropdown 
            toggleReflection={toggleReflection} 
            userRoles={userRoles}
          />
        </div>
      </nav>

      {showReflection && (
        <div>
          <MobileMenuReflectionTabs 
            closeModal={toggleReflection} 
            userRoles={userRoles}
          />
        </div>
      )}
    </>
  );
};

export default MobileNavbar;
