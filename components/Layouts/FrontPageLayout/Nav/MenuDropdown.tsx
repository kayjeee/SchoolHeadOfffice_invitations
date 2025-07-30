import { useState } from 'react';
import Link from 'next/link';

function MenuDropdown({ toggleReflection }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    toggleReflection(); // Toggle reflection in Navbar
  };

  return (
    <div className="relative">
      <div
        onClick={handleToggle}
        className="text-gray-800 cursor-pointer hover:underline flex items-center"
      >
        Menu
        <span className={`ml-1 transform ${isOpen ? 'rotate-180' : ''}`}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </span>
      </div>

      {isOpen && (
        <div className="absolute mt-2 w-48 bg-white border border-gray-200 shadow-lg">
       
        </div>
      )}
    </div>
  );
}

export default MenuDropdown;
