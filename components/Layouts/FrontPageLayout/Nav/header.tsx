import { useState } from 'react';
import { useRouter } from 'next/router';
import SearchBar from './SearchBar';
import MenuReflectionTab from './MenuReflectionTab';

interface HeaderProps {
  user?: { name: string; email: string; roles: string[] };
  loading: boolean;
  schoolImage?: string;
  schools: any[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const Header: React.FC<HeaderProps> = ({
  user,
  loading,
  schoolImage,
  schools,
  searchQuery,
  setSearchQuery,
}) => {
  const [showReflection, setShowReflection] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const router = useRouter();

  const navigateTo = (path: string) => {
    router.push(path);
  };

  const toggleReflection = () => setShowReflection((prev) => !prev);
  const toggleProfileModal = () => setShowProfileModal((prev) => !prev);

  return (
    <header className="bg-gray-800 text-white">
      <nav className="max-w-7xl mx-auto flex items-center justify-between p-4">
        <img
          src={schoolImage || '/animatedlogo.gif'}
          alt="logo"
          width="70"
          height="70"
          className="cursor-pointer"
          onClick={() => navigateTo('/')}
        />

        <ul className="flex items-center space-x-4">
          {!loading ? (
            user ? (
              <>
                <li>
                  <button onClick={() => navigateTo('/profile')}>
                    Client Rendered Profile
                  </button>
                </li>
                <li>
                  <button onClick={() => navigateTo('/advanced/ssr-profile')}>
                    SSR Profile (Advanced)
                  </button>
                </li>
                <li>
                  <button onClick={() => navigateTo('/admin')}>Business</button>
                </li>
                <li>
                  <button onClick={() => navigateTo('/api/auth/logout')}>
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <li>
                <button onClick={() => navigateTo('/api/auth/login')}>
                  Login
                </button>
              </li>
            )
          ) : (
            <li>Loading...</li>
          )}
        </ul>
      </nav>

      {showReflection && <MenuReflectionTab />}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-75">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">User Profile</h2>
            <p>
              <strong>Name:</strong> {user?.name || 'N/A'}
            </p>
            <p>
              <strong>Email:</strong> {user?.email || 'N/A'}
            </p>
            <p>
              <strong>Roles:</strong> {user?.roles?.join(', ') || 'N/A'}
            </p>
            <button
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
              onClick={toggleProfileModal}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        header {
          background-color: #333;
        }
        nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        ul {
          display: flex;
          list-style: none;
          margin: 0;
          padding: 0;
        }
        li {
          margin-right: 1rem;
        }
        button {
          color: #fff;
          background: none;
          border: none;
          cursor: pointer;
          text-decoration: underline;
        }
      `}</style>
    </header>
  );
};

export default Header;
