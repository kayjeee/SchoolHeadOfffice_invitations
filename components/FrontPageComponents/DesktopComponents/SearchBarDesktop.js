import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

const SearchBarDesktop = ({ searchQuery, setSearchQuery, schools }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [filteredSchools, setFilteredSchools] = useState([]);
  const dropdownRef = useRef(null);

  // Handle dropdown toggle on search input click
  const handleSearchClick = () => {
    setDropdownOpen(true); // Always open the dropdown when clicked
  };

  // Filter schools based on search query
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Filter schools by matching name with query
    const filtered = schools.filter((school) =>
      school.schoolName.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredSchools(filtered);
    setDropdownOpen(query.length > 0 || filtered.length > 0); // Show dropdown if there's a query or filtered schools
  };

  // Close dropdown when clicking outside
  const handleClickOutside = (e) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      setDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative w-full max-w-lg mt-8">
      <input
        type="text"
        placeholder="Search for schools..."
        value={searchQuery}
        onChange={handleSearchChange}
        onClick={handleSearchClick}
        className="w-full px-4 py-3 border border-red-300 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg font-bold truncate"
      />
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <svg
          className="w-6 h-6 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M11 4a7 7 0 015.415 11.413l4.826 4.827a1 1 0 01-1.415 1.414l-4.827-4.827A7 7 0 1111 4z"
          ></path>
        </svg>
      </div>
      {dropdownOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 mt-2 w-full max-w-lg bg-white shadow-2xl rounded-lg z-40 border border-gray-300"
        >
          <div className="p-4 border-b border-gray-200">
            <h4 className="text-lg font-bold text-gray-800">Explore Categories</h4>
          </div>
          <div className="p-4">
            {/* Search result tabs */}
            <div className="flex flex-col space-y-2">
              {/* Updated Link for Competitions */}
              <Link href="/Competitions">
                <button className="py-2 px-4 text-left w-full hover:bg-gray-100 rounded-lg text-lg font-medium border-b border-gray-200 hover:underline">
                  Competitions in Your Area
                </button>
              </Link>
              <button className="py-2 px-4 text-left w-full hover:bg-gray-100 rounded-lg text-lg font-medium hover:underline">
                Events Near You
              </button>
            </div>

            {/* Show filtered schools if query exists */}
            {searchQuery.length > 0 && filteredSchools.length > 0 && (
              <>
                <div className="p-4 border-t border-gray-200">
                  <h4 className="text-lg font-bold text-gray-800">Matching Schools</h4>
                </div>
                <div className="p-4">
                  <div className="flex flex-col space-y-2">
                    {filteredSchools.map((school) => (
                      <Link
                        key={school._id}
                        href={`/schools/${encodeURIComponent(school.schoolName)}`}
                      >
                        <span className="py-2 px-4 text-left w-full hover:bg-gray-100 rounded-lg text-lg font-medium border-b border-gray-200 hover:underline">
                          {school.schoolName}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBarDesktop;
