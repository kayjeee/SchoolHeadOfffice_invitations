import { useState, ChangeEvent } from 'react';
import { useRouter } from 'next/router';
import { School } from '../../shared/types/School';

interface MobileSearchBarProps {
  schools?: School[];
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
}

const MobileSearchBar: React.FC<MobileSearchBarProps> = ({ schools = [], searchQuery, setSearchQuery }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const handleSearchClick = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value);

  const navigateTo = (path: string) => {
    router.push(path);
    setIsModalOpen(false);
  };

  return (
    <div>
      <div className="flex items-center border border-black px-3 py-2 rounded-md">
        <svg
          onClick={handleSearchClick}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6 cursor-pointer"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-md w-full max-w-md relative">
            <button onClick={handleCloseModal} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <input
              type="text"
              value={searchQuery}
              onChange={handleInputChange}
              placeholder="Find better ways to navigate your school"
              className="w-full border border-gray-300 rounded-md px-4 py-2 mb-4"
            />
            <div className="flex flex-col space-y-4">
              <span onClick={() => navigateTo('/past-exams')} className="text-blue-500 cursor-pointer hover:underline">Past Exams</span>
              <span onClick={() => navigateTo('/schools')} className="text-blue-500 cursor-pointer hover:underline">Schools</span>
              <span onClick={() => navigateTo('/competitions')} className="text-blue-500 cursor-pointer hover:underline">Competitions</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileSearchBar;
