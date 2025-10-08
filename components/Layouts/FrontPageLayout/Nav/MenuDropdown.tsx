import React, { useState } from "react";
import Link from "next/link";

interface MenuDropdownProps {
  toggleReflection: () => void;
  iconColor?: string;
  backgroundColor?: string;
}

const MenuDropdown: React.FC<MenuDropdownProps> = ({
  toggleReflection,
  iconColor = "white",
  backgroundColor = "transparent",
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
    toggleReflection(); // Trigger reflection in Navbar
  };

  return (
    <div className="relative inline-block text-left">
      {/* Dropdown Trigger */}
      <button
        onClick={handleToggle}
        className="flex items-center justify-center p-2 rounded-full transition-all duration-200 hover:scale-105 focus:outline-none"
        style={{ backgroundColor }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`w-6 h-6 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill={iconColor}
          viewBox="0 0 24 24"
          stroke={iconColor}
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-50 animate-fade-in">
          <ul className="flex flex-col p-2 text-gray-700 text-sm">
            <li>
              <Link
                href="/"
                className="block px-3 py-2 rounded-md hover:bg-gray-100 transition"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                href="/about"
                className="block px-3 py-2 rounded-md hover:bg-gray-100 transition"
              >
                About
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                className="block px-3 py-2 rounded-md hover:bg-gray-100 transition"
              >
                Contact
              </Link>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default MenuDropdown;
