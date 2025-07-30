import { useState } from 'react';
import Link from 'next/link';
import MobileTabs from './MobileTabs';
import MobileSearchBar from './MobileSearchBar';
import MobileMenuDropdown from './MobileMenuDropdown';
import MobileMenuReflectionTabs from './MobileMenuReflectionTabs';
import { useAppTheme } from '../../../../context/ThemeContext';

interface MobileNavbarProps {
  schools: any[];
  userRoles?: string[];
}

const MobileNavbar: React.FC<MobileNavbarProps> = ({ schools, userRoles = [] }) => {
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

  return (
    <>
      <nav 
        className="border-b border-gray-200"
        style={{ backgroundColor: primaryColor || 'white' }}
      >
        <div className="max-w-full mx-auto h-20 flex justify-between items-center px-4">
          <Link href="/" passHref>
            <div className="flex items-center space-x-2">
              <img
                src={currentSchool?.schoolImage || '/shologoredandbluetwo.PNG'}
                alt="logo"
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

          <MobileMenuDropdown toggleReflection={toggleReflection} />
        </div>
      </nav>

      {showReflection && (
        <div>
          <MobileMenuReflectionTabs closeModal={toggleReflection} />
        </div>
      )}
    </>
  );
};

export default MobileNavbar;