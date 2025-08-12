import { useState, useEffect, useRef, FC } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Tabs from './Tabs';
import MenuDropdown from './MenuDropdown';
import AdminDrop from './AdminDrop';
import MenuReflectionTab from './MenuReflectionTab';
import { useAppTheme } from '../../../../context/ThemeContext';

// Define User interface locally since it's specific to this component
interface User {
  id?: string;
  name: string;
  email: string;
  image?: string;
}

// Define School interface locally since it's not exported from ThemeContext
interface School {
  _id: string;
  schoolName: string;
  logo?: string;
}

interface NavbarProps {
  user?: User | null;
  loading: boolean;
  schools: School[];
  searchQuery: string;
  userRoles?: string[];
  setSearchQuery: (query: string) => void;
}

const Navbar: FC<NavbarProps> = ({
  user = null,
  loading = false,
  schools = [],
  searchQuery = '',
  userRoles = [],
  setSearchQuery = () => {},
}) => {
  const [showReflection, setShowReflection] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAdminDropdown, setShowAdminDropdown] = useState(false);
  const router = useRouter();

  const { primaryColor, currentSchool } = useAppTheme();
  const adminDropdownRef = useRef<HTMLDivElement>(null);
  const profileModalRef = useRef<HTMLDivElement>(null);

  const isAdmin = userRoles.includes('Admin');

  // Get the school logo URL safely
  const getSchoolLogo = () => {
    if (currentSchool?.logo) return currentSchool.logo;
    return '/felixwhitbg.PNG';
  };

  // Handler functions
  const handleLogin = () => router.push('/api/auth/login');
  const handleLogout = () => router.push('/api/auth/logout');
  const toggleReflection = () => setShowReflection(prev => !prev);
  const toggleProfileModal = () => setShowProfileModal(prev => !prev);
  const toggleAdminDropdown = () => setShowAdminDropdown(prev => !prev);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (adminDropdownRef.current && !adminDropdownRef.current.contains(event.target as Node)) {
        setShowAdminDropdown(false);
      }
      if (profileModalRef.current && !profileModalRef.current.contains(event.target as Node)) {
        setShowProfileModal(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative">
      {/* Main Navigation Bar */}
      <nav 
        className="border-b border-gray-200"
        style={{ backgroundColor: primaryColor || 'white' }}
      >
        <div className="max-w-full mx-auto h-20 flex items-center px-4">
          {/* Left Section - Logo and School Name */}
          <div className="flex items-center space-x-6">
            <Link href="/" passHref>
              <div className="cursor-pointer">
                <img
                  src={getSchoolLogo()}
                  alt={`${currentSchool?.schoolName || 'School'} Logo`}
                  width={70}
                  height={70}
                  className="object-contain"
                />
              </div>
            </Link>
            {currentSchool?.schoolName && (
              <h1 className="text-xl font-bold text-white">
                {currentSchool.schoolName}
              </h1>
            )}
          </div>

          {/* Center Section - Navigation Tabs */}
          <div className="flex flex-1 justify-center">
            <Tabs />
          </div>

          {/* Right Section - User Controls */}
          <div className="flex items-center space-x-4 ml-4">
            {loading ? (
              <span className="text-white">Loading...</span>
            ) : user ? (
              <>
                {/* Admin Controls */}
                {isAdmin && (
                  <div className="relative" ref={adminDropdownRef}>
                    <button
                      onClick={toggleAdminDropdown}
                      className="text-white hover:text-gray-200 transition-colors"
                      aria-label="Admin menu"
                    >
                      <AdminIcon />
                    </button>
                    {showAdminDropdown && (
                      <AdminDrop userRoles={userRoles} user={user} />
                    )}
                  </div>
                )}

                {/* User Profile */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={toggleProfileModal}
                    className="text-white hover:text-gray-200 hover:underline transition-colors"
                    aria-label="User profile"
                  >
                    Profile
                  </button>
                </div>

                {/* Logout Button */}
                <button 
                  onClick={handleLogout}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              /* Login Button */
              <button 
                onClick={handleLogin}
                className="text-white hover:text-gray-200 transition-colors"
              >
                Login
              </button>
            )}

            {/* Mobile Menu Dropdown */}
            <MenuDropdown toggleReflection={toggleReflection} />
          </div>
        </div>
      </nav>

      {/* Reflection Tab */}
      {showReflection && <MenuReflectionTab />}

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div 
            ref={profileModalRef}
            className="bg-white p-6 rounded-lg shadow-xl w-96 max-w-full mx-4"
          >
            <h2 className="text-2xl font-bold mb-4">User Profile</h2>
            <div className="space-y-3">
              <p><span className="font-semibold">Name:</span> {user?.name || 'N/A'}</p>
              <p><span className="font-semibold">Email:</span> {user?.email || 'N/A'}</p>
              <p><span className="font-semibold">Roles:</span> {userRoles.join(', ') || 'None'}</p>
            </div>
            <button
              className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full"
              onClick={toggleProfileModal}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Extracted icon component for better readability
const AdminIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    stroke="currentColor"
    className="w-6 h-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"
    />
  </svg>
);

export default Navbar;
