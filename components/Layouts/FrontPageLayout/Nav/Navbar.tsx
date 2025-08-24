import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Tabs from './Tabs';
import MenuDropdown from './MenuDropdown';
import AdminDrop from './AdminDrop';
import MenuReflectionTab from './MenuReflectionTab';
import { useRouter } from 'next/router';
import { useAppTheme } from '../../../../context/ThemeContext';
import { School } from '../../shared/types/School';
import { User } from '../../shared/types/User';
import { UserRole } from '../../shared/types/UserRole';

interface NavbarProps {
  schoolImage?: string;
  user?: User;
  loading: boolean;
  schools?: School[];
  searchQuery?: string;
  userRoles?: UserRole[];
  setSearchQuery?: (query: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({
  user,
  loading,
  schools = [],
  searchQuery = '',
  userRoles = [],
  setSearchQuery,
  schoolImage
}) => {
  const [showReflection, setShowReflection] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAdminDropdown, setShowAdminDropdown] = useState(false);
  const router = useRouter();
  const { primaryColor, currentSchool } = useAppTheme();

  const adminDropdownRef = useRef<HTMLDivElement | null>(null);
  const profileModalRef = useRef<HTMLDivElement | null>(null);

  const isAdmin = userRoles.some(role => role.name === 'Admin');

  const handleLogin = () => router.push('/api/auth/login');
  const handleLogout = () => router.push('/api/auth/logout');
  const toggleReflection = () => setShowReflection(prev => !prev);
  const toggleProfileModal = () => setShowProfileModal(prev => !prev);
  const toggleAdminDropdown = () => setShowAdminDropdown(prev => !prev);

  // Close dropdowns on outside click
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
    <>
      <nav
        className="border-b border-gray-200 relative"
        style={{ backgroundColor: primaryColor || 'white' }}
      >
        <div className="max-w-full mx-auto h-20 flex items-center px-4">
          {/* Left Section */}
          <div className="flex items-center space-x-6">
            <Link href="/" passHref>
              <img
                src={schoolImage || '/ShoLogoUpdate.png'}
                alt="School Logo"
                width={70}
                height={70}
                className="cursor-pointer"
              />
            </Link>
            {currentSchool && (
              <h1 className="text-xl font-bold text-white">
                {currentSchool.schoolName}
              </h1>
            )}
          </div>

          {/* Center Section */}
          <div className="flex flex-1 justify-center">
            <Tabs />
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-16 ml-4">
            {!loading ? (
              user ? (
                <>
                  {/* Admin Dropdown */}
                  {isAdmin && (
                    <div className="relative" ref={adminDropdownRef}>
                      <button
                        onClick={toggleAdminDropdown}
                        className="text-white hover:text-gray-200"
                      >
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
                      </button>
                      {showAdminDropdown && <AdminDrop userRoles={userRoles} user={user} />}
                    </div>
                  )}
                  {/* Profile Section */}
                  <div
                    className="flex items-center space-x-2 cursor-pointer"
                    onClick={toggleProfileModal}
                  >
                    <span className="text-white hover:text-gray-200 hover:underline">Profile</span>
                  </div>
                  <button onClick={handleLogout} className="text-white hover:text-gray-200">
                    Logout
                  </button>
                </>
              ) : (
                <button onClick={handleLogin} className="text-white hover:text-gray-200">
                  Login
                </button>
              )
            ) : (
              <span className="text-white">Loading...</span>
            )}
            <MenuDropdown toggleReflection={toggleReflection} />
          </div>
        </div>
      </nav>

      {/* Reflection Tab */}
      {showReflection && <MenuReflectionTab />}

      {/* Profile Modal */}
      {showProfileModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-75"
          ref={profileModalRef}
        >
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">User Profile</h2>
            <p>
              <strong>Name:</strong> {user?.name || 'N/A'}
            </p>
            <p>
              <strong>Email:</strong> {user?.email || 'N/A'}
            </p>
            <p>
              <strong>Roles:</strong> {userRoles.map(r => r.name).join(', ') || 'N/A'}
            </p>
            <button
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              onClick={toggleProfileModal}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
