import Link from "next/link";
import { useState } from "react";
import { UserRole } from "../../shared/types/UserRole";

interface MobileMenuDropdownProps {
  toggleReflection: () => void; // Function to toggle reflection in Navbar
  userRoles?: UserRole[]; // Add this so TypeScript knows about it
}

const MobileMenuDropdown: React.FC<MobileMenuDropdownProps> = ({
  toggleReflection,
  userRoles = [],
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
    toggleReflection();
  };

  return (
    <div className="relative">
      <div
        onClick={handleToggle}
        className="text-gray-800 cursor-pointer hover:underline flex items-center"
      >
        {/* Menu Icon */}
        <span className={`ml-1 transform ${isOpen ? "rotate-180" : ""}`}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-6 h-6"
          >
            <path
              fillRule="evenodd"
              d="M3 5.25a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 5.25Zm0 4.5A.75.75 0 0 1 3.75 9h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 9.75Zm0 4.5a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1-.75-.75Zm0 4.5a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1-.75-.75Z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      </div>

      {/* Dropdown Content */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 shadow-lg z-50">
          {/* Example menu items */}
          {Array.isArray(userRoles) &&
            userRoles.some((role) => role === "admin") && (
              <Link href="/admin" passHref>
                <span className="block px-4 py-2 text-gray-800 hover:bg-gray-100 cursor-pointer">
                  Admin Panel
                </span>
              </Link>
            )}

          <Link href="/option1" passHref>
            <span className="block px-4 py-2 text-gray-800 hover:bg-gray-100 cursor-pointer">
              Option 1
            </span>
          </Link>
          <Link href="/option2" passHref>
            <span className="block px-4 py-2 text-gray-800 hover:bg-gray-100 cursor-pointer">
              Option 2
            </span>
          </Link>
          <Link href="/option3" passHref>
            <span className="block px-4 py-2 text-gray-800 hover:bg-gray-100 cursor-pointer">
              Option 3
            </span>
          </Link>
        </div>
      )}
    </div>
  );
};

export default MobileMenuDropdown;
