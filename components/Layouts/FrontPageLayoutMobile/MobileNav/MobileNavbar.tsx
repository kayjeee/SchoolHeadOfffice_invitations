import { useState } from 'react';
import Link from 'next/link';
import MobileSearchBar from './MobileSearchBar';
import MobileMenuDropdown from './MobileMenuDropdown';
import MobileMenuReflectionTabs from './MobileMenuReflectionTabs';
import { School } from '../../shared/types/School';
import { UserRole } from '../../shared/types/UserRole';
import { User } from '../../shared/types/User'; // 👈 same User type you imported in FrontPageLayoutMobileView
import { useAppTheme } from '../../../../context/ThemeContext';

interface MobileNavbarProps {
  schoolImage?: string;
  schools?: School[];
  user?: User | null; // 👈 add this
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  userRoles?: UserRole[];
}

const MobileNavbar: React.FC<MobileNavbarProps> = ({
  schoolImage,
  schools = [],
  user,
  searchQuery,
  setSearchQuery,
  userRoles = [],
}) => {
  const [showReflection, setShowReflection] = useState(false);
  const { primaryColor, currentSchool } = useAppTheme();

  const toggleReflection = () => setShowReflection((prev) => !prev);

  return (
    <>
      <nav className="border-b border-gray-200" style={{ backgroundColor: primaryColor || 'white' }}>
        <div className="max-w-full mx-auto h-20 flex justify-between items-center px-4">
          <Link href="/" passHref>
            <div className="flex items-center space-x-2 cursor-pointer">
              <img
                src={schoolImage || currentSchool?.schoolName || '/shologoredandbluetwo.PNG'}
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

          <MobileMenuDropdown toggleReflection={toggleReflection} />
        </div>
      </nav>

      {showReflection && <MobileMenuReflectionTabs closeModal={toggleReflection} />}
    </>
  );
};

export default MobileNavbar;
