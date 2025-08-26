import { useState, useEffect } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { useRouter } from 'next/router';

function SearchBar({ schools = [] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [filteredSchools, setFilteredSchools] = useState([]); 
  const router = useRouter();

  const springProps = useSpring({
    opacity: showSearchBar ? 1 : 0,
    transform: showSearchBar ? 'translateY(0)' : 'translateY(-100%)',
    config: { tension: 200, friction: 20 }
  });

  useEffect(() => {
    const handleScroll = () => {
      setShowSearchBar(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = schools.filter((school) =>
        school.schoolName.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredSchools(filtered);
    } else {
      setFilteredSchools([]);
    }
  }, [searchQuery, schools]);

  const handleSearchClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const navigateTo = (path) => {
    router.push(path);
    setIsModalOpen(false);
  };

  const navigateToSchool = (schoolId) => {
    router.push(`/schools/${schoolId}`);
    setIsModalOpen(false);
  };

  return (
    <>
      <animated.div
        style={{
          ...springProps,
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          backgroundColor: 'white',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          padding: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img src='/shologotwo.PNG' alt="logo" width="70" height="70" className="md:order-first order-last" />
        <input
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          placeholder="Easily chat to any school..."
          className="border border-gray-300 rounded-full px-4 py-2 w-full max-w-xl focus:outline-none"
          onClick={handleSearchClick}
        />
      </animated.div>

      <input
        type="text"
        value={searchQuery}
        onChange={handleInputChange}
        placeholder="Easily chat to any school..."
        className="border border-gray-300 rounded-full px-4 py-2 w-full max-w-xl focus:outline-none"
        onClick={handleSearchClick}
      />

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-md w-full max-w-md relative">
            <button
              onClick={handleCloseModal}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <input
              type="text"
              value={searchQuery}
              onChange={handleInputChange}
              placeholder="Easily chat to any school..."
              className="w-full border border-gray-300 rounded-md px-4 py-2 mb-4"
            />

            {/* Tabs */}
            <div className="flex flex-col space-y-4 mb-4">
              <span onClick={() => navigateTo('/past-exams')} className="text-blue-500 cursor-pointer hover:underline">Past Exams</span>
              <span onClick={() => navigateTo('/schools')} className="text-blue-500 cursor-pointer hover:underline">Schools</span>
              <span onClick={() => navigateTo('/competitions')} className="text-blue-500 cursor-pointer hover:underline">Competitions</span>
            </div>

            {/* Show filtered school names below the tabs */}
            <div className="flex flex-col space-y-4">
              {filteredSchools.length > 0 ? (
                filteredSchools.map((school) => (
                  <span
                    key={school._id}
                    onClick={() => navigateToSchool(school._id)}
                    className="text-blue-500 cursor-pointer hover:underline"
                  >
                    {school.schoolName}
                  </span>
                ))
              ) : (
                <span className="text-gray-500">No schools found</span>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default SearchBar;
