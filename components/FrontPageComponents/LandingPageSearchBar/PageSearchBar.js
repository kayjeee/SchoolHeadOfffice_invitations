import { useState, useRef, useEffect } from 'react';
import { useSpring, animated } from '@react-spring/web';
import Link from 'next/link';

const PageSearchBar = ({ toggleDropdown, localDropdownOpen, searchQuery, setSearchQuery, schools }) => {
  const localDropdownRef = useRef(null);
  const [filteredSchools, setFilteredSchools] = useState([]);

  const handleClickOutside = (e) => {
    if (localDropdownRef.current && !localDropdownRef.current.contains(e.target)) {
      toggleDropdown(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter schools based on search query
  useEffect(() => {
    if (searchQuery) {
      const filtered = schools.filter((school) =>
        school.schoolName.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredSchools(filtered);
    } else {
      setFilteredSchools([]); // Clear results if the query is empty
    }
  }, [searchQuery, schools]);

  const searchBarAnimation = useSpring({
    opacity: 1,
    from: { opacity: 0 },
    config: { duration: 1000 },
  });

  return (
    <div className="relative w-full h-full">
      <img
        src="/walking rabbit gif.gif"
        alt="Capitec Mobile App"
        className="w-full h-full object-cover"
      />
      <animated.div style={searchBarAnimation} className="absolute top-0 left-0 w-full flex flex-col items-center justify-center p-8 bg-transparent">
        <div className="relative mt-28 w-full max-w-lg">
          <div className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              placeholder="Easily chat to any school..."
              className="w-full px-4 py-4 pr-10 border border-red-300 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg font-bold truncate"
              onClick={toggleDropdown}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ maxWidth: 'calc(100% - 3rem)', overflow: 'hidden' }}
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
          </div>

          {localDropdownOpen && (
            <div
              ref={localDropdownRef}
              className="absolute top-full left-0 mt-2 w-full max-w-lg bg-white shadow-2xl rounded-lg z-40 border border-gray-300"
            >
              {/* Tabs */}
              <div className="p-4 border-b border-gray-200">
                <h4 className="text-lg font-bold text-gray-800">Popular Searches</h4>
              </div>
              <div className="p-4">
                <div className="flex flex-col space-y-2">
                  <button className="py-2 px-4 text-left w-full hover:bg-gray-100 rounded-lg text-lg font-medium border-b border-gray-200 hover:underline">
                    Past Exams
                  </button>
                  <button className="py-2 px-4 text-left w-full hover:bg-gray-100 rounded-lg text-lg font-medium hover:underline">
                    Competitions
                  </button>
                </div>
              </div>

              {/* Filtered School Names */}
              <div className="p-4">
                {filteredSchools.length > 0 ? (
                  <div className="flex flex-col space-y-2"> {/* Ensures vertical alignment */}
                    {filteredSchools.map((school) => (
                      <Link
                        key={school._id}
                        href={`/schools/${encodeURIComponent(school.schoolName)}`}
                      >
                        <span className="py-2 px-4 text-left w-full hover:bg-gray-100 rounded-lg text-base sm:text-lg font-medium border-b border-gray-200 hover:underline cursor-pointer">
                          {school.schoolName}
                        </span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 text-base sm:text-lg">
                    No matching schools found.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </animated.div>
    </div>
  );
};

export default PageSearchBar;
