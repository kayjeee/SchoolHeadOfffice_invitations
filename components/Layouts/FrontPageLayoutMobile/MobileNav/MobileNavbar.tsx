import { useState } from 'react';
import Link from 'next/link';
import MobileTabs from './MobileTabs';
import MobileSearchBar from './MobileSearchBar';
import MobileMenuDropdown from './MobileMenuDropdown';
import MobileMenuReflectionTabs from './MobileMenuReflectionTabs';
import { useAppTheme } from '../../../../context/ThemeContext';

interface School {
  id: string;
  schoolName: string;
  schoolImage?: string;
  // Add other school properties as needed
}

interface UserRole {
  id: string;
  name: string;
  // Add other role properties as needed
}

interface MobileNavbarProps {
  schools: School[];
  userRoles?: UserRole[];
  schoolImage?: string; // Added the missing prop
}

const MobileNavbar: React.FC<MobileNavbarProps> = ({ 
  schools, 
  userRoles = [], 
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
                  {currentSchool.schoolName}
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