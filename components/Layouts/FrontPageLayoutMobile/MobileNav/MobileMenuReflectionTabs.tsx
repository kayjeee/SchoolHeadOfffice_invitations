import Link from 'next/link';
import { UserRole } from '../../shared/types/UserRole';

interface MobileMenuReflectionTabsProps {
  closeModal: () => void;
  userRoles?: UserRole[];
}

const MobileMenuReflectionTabs: React.FC<MobileMenuReflectionTabsProps> = ({
  closeModal,
  userRoles = [],
}) => {
  // Example: show "Admin Panel" link only if user has Admin role
  const hasAdminRole = userRoles.some(role => role.name === 'Admin');

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      <div className="relative">
        {/* Close button */}
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Navigation Tabs */}
        <div className="px-4 py-2 border-b border-gray-200">
          <div className="flex justify-around py-2">
            <Link href="/Personal" passHref>
              <span className="text-gray-800 cursor-pointer hover:underline">
                Personal
              </span>
            </Link>
            <Link href="/Business" passHref>
              <span className="text-gray-800 cursor-pointer hover:underline">
                Business
              </span>
            </Link>
          </div>
        </div>

        {/* Menu Links */}
        <div className="px-4 py-2">
          <Link href="/Careers" passHref>
            <span className="block text-gray-800 cursor-pointer hover:underline py-2 border-b border-gray-300">
              Careers
            </span>
          </Link>
          <Link href="/Branches" passHref>
            <span className="block text-gray-800 cursor-pointer hover:underline py-2 border-b border-gray-300">
              Branches
            </span>
          </Link>
          <Link href="/Call-center" passHref>
            <span className="block text-gray-800 cursor-pointer hover:underline py-2 border-b border-gray-300">
              Call Center
            </span>
          </Link>
          <Link href="/Contact-us" passHref>
            <span className="block text-gray-800 cursor-pointer hover:underline py-2 border-b border-gray-300">
              Contact Us
            </span>
          </Link>
          <Link href="/privacy-policy" passHref>
            <span className="block text-gray-800 cursor-pointer hover:underline py-2 border-b border-gray-300">
              Privacy Policy
            </span>
          </Link>

          {/* Conditional Admin Panel */}
          {hasAdminRole && (
            <Link href="/admin" passHref>
              <span className="block text-gray-800 cursor-pointer hover:underline py-2 border-b border-gray-300">
                Admin Panel
              </span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileMenuReflectionTabs;
