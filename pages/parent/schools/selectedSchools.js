import SchoolLayout from '../../components/SchoolLayout/SchoolLayout';
import clientPromise from '../../lib/mongodb';
import Link from 'next/link';
import { useState, useEffect } from 'react';

import { useApp } from '../../components/useApp';
import LoginUserModal from '../../components/LoginUserModal'; // Adjust the path as needed
import { useRouter } from 'next/router';
import { AuthProvider } from '../../components/context/AuthContext';
import RequestAccessForm  from '../../components/Schoolpage/RequestAccessForm';
 const SelectedSchools = ( {schools} ) => {
  const app = useApp();
  const [selectedSchools, setSelectedSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [currentSchool, setCurrentSchool] = useState('');
  const [loggedInUserEmail, setLoggedInUserEmail] = useState('');
  const [requestedSchools, setRequestedSchools] = useState([]);
  const [requestedSchoolsStatus, setRequestedSchoolsStatus] = useState({});
  const [showLoginModal, setShowLoginModal] = useState(false); // State for login modal
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (app?.currentUser) {
      setIsLoggedIn(true);
      setShowLoginModal(false);
      fetchSelectedSchools();
    } else {
      setIsLoggedIn(false);
     // setShowLoginModal(true);
      setLoading(false); // Ensure loading is set to false if user is not logged in
    }
  }, [app?.currentUser]);

  const fetchSelectedSchools = async () => {
    try {
      const userEmail = app.currentUser.profile.email;
      setLoggedInUserEmail(userEmail); // Set logged in user's email

      // Fetch selected schools
      const response = await fetch('https://data.mongodb-api.com/app/tasktracker-uuloe/endpoint/getSelectedSchools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${app.currentUser.accessToken}`,
        },
        body: JSON.stringify({ email: userEmail }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch selected schools');
      }

      const data = await response.json();

      // Check for empty or malformed response
      if (!data || !Array.isArray(data.selectedSchools)) {
        throw new Error('Empty or malformed response for selected schools');
      }

      setSelectedSchools(data.selectedSchools);

      // Fetch requests sent by the user
      const requestsResponse = await fetch('https://data.mongodb-api.com/app/tasktracker-uuloe/endpoint/getRequests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${app.currentUser.accessToken}`,
        },
        body: JSON.stringify({ email: userEmail }),
      });

      if (requestsResponse.ok) {
        const requestsData = await requestsResponse.json();

        // Check if requestedSchools array exists and is valid
        if (!requestsData || !Array.isArray(requestsData.requestedSchools)) {
          throw new Error('Empty or malformed response for requested schools');
        }

        setRequestedSchools(requestsData.requestedSchools.map(rs => rs.schoolName));

        // Initialize requestedSchoolsStatus with the statuses from the response
        const initialStatus = requestsData.requestedSchools.reduce((acc, { schoolName, status }) => {
          acc[schoolName] = status && status !== {} ? status : 'Pending';
          return acc;
        }, {});
        setRequestedSchoolsStatus(initialStatus);
      } else {
        throw new Error('Failed to fetch requests');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAccess = (schoolName) => {
    if (!app.currentUser) {
      setShowLoginModal(true); // Show login modal if user is not logged in
      return;
    }
    setCurrentSchool(schoolName);
    setShowRequestForm(true);
  };

  const handleRequestFormSuccess = () => {
    fetchSelectedSchools(); // Refresh the list after a successful request
    setShowRequestForm(false); // Close the request form
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <AuthProvider>
    <SchoolLayout schools={schools}>
      <div className="flex flex-col items-center justify-center min-h-screen py-12">
        <h1 className="text-4xl font-bold text-[#20B486] mb-8">Your Selected Schools</h1>
        <div className="w-full max-w-2xl">
          <ul className="space-y-4">
            {selectedSchools.length > 0 ? (
              selectedSchools.map((school, index) => {
                // Check if the school is in requestedSchools array
                const status = requestedSchoolsStatus[school];
                const isRequested = requestedSchools.includes(school);

                return (
                  <li key={index} className="border p-4 rounded-md hover:bg-gray-50 transition duration-200">
                    <div className="flex items-center justify-between">
                      <Link href={`/schools/${school}`}>
                        <span className="block text-center cursor-pointer">
                          <h2 className="text-lg font-semibold text-[#20B486]">{school.schoolemail}</h2>
                          <h3 className="text-md font-medium">{school}</h3>
                          <p className="text-sm text-gray-600">{school.user_id}</p>
                        </span>
                      </Link>
                      {/* Conditional rendering based on request status */}
                      {isRequested ? (
                        <div className="flex items-center space-x-2">
                          <div className={`px-4 py-2 ${status === 'Accepted' ? 'bg-green-600' : 'bg-yellow-300'} text-white rounded-lg font-semibold`}>
                            {status === 'Accepted' ? 'Approved' : 'Pending'}
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleRequestAccess(school)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                        >
                          Request Access
                        </button>
                      )}
                    </div>
                  </li>
                );
              })
            ) : (
              <li className="text-center text-gray-600 mt-8 mb-8">You have not selected any schools yet.</li>
            )}
          </ul>
        </div>
        {showRequestForm && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <RequestAccessForm
                schoolName={currentSchool}
                loggedInUserEmail={loggedInUserEmail} // Pass logged in user's email to RequestAccessForm
                onRequestClose={() => setShowRequestForm(false)}
                onSuccess={handleRequestFormSuccess} // Handle success to update the parent component
              />
            </div>
          </div>
        )}
        {showLoginModal && (
          <LoginUserModal
            isOpen={showLoginModal}
            onClose={() => setShowLoginModal(false)} // Close the modal when onClose is triggered
            onSuccess={async () => {
              setShowLoginModal(false); // Close modal on success
              setIsLoggedIn(true); // Set isLoggedIn state to true
              await fetchSelectedSchools(); // Fetch selected schools
            }}
          />
        )}
      </div>
      {/* Footer section */}
      <footer className="py-4 bg-gray-200 text-center w-full">
        <p className="text-gray-600 text-sm">Your footer content here</p>
      </footer>
    </SchoolLayout>
    </AuthProvider>
  );
};

export default SelectedSchools;
export async function getStaticProps() {
  try {
    const client = await clientPromise;
    const db = client.db('tracker');

    const schools = await db
      .collection('School')
      .find({})
      .sort({ metacritic: -1 })
      .limit(1000)
      .toArray();

    return {
      props: { schools: JSON.parse(JSON.stringify(schools)) },
    };
  } catch (e) {
    console.error('Error fetching schools:', e);
    return {
      props: { schools: [] },
    };
  }
}
