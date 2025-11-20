import React, { useState, useEffect } from 'react';
import SchoolDashboardLayout from '../../components/schooldashboard/SchoolDashboardLayout';
import SideNavSchool from '../../components/schooldashboard/SideNavSchool';
import LoginModal from '../../components/LoginModal';
import clientPromise from '../../lib/mongodb';
import { useApp } from '../../components/useApp'; // Importing custom hook for app context
import { Credentials } from 'realm-web'; // Importing MongoDB Realm Credentials for login
import { AuthProvider } from '../../components/context/AuthContext'; // Importing authentication provider
import useColorMode from "../../components/schooldashboard/hooks/useColorMode"; // Custom hook for handling light/dark mode
import { useAccessStatus } from '../../components/hooks/schoolsindexpage/useAccessStatus'; // Hook for fetching user's access status
import { useFetchSchoolData } from '../../components/hooks/schoolsindexpage/useFetchSchoolData'; // Hook for fetching school-related data
import { useLogin } from '../../components/hooks/schoolsindexpage/useLogin'; // Hook for handling login functionality
import { useTabHandler } from '../../components/hooks/schoolsindexpage/useTabHandler'; // Hook for handling tab switching logic
import { SchoolModals } from '../../components/hooks/SchoolModals'; // Component for handling various modals like login, request access, etc.
import MainContentArea from '../../components/hooks/MainContentArea'; // Main content area component
import MobileMainContentArea from '../../components/hooks/MobileMainContentArea'; // Main content area component
import AdvertisementSection from '../../components/hooks/AdvertisementSection'; // Component for handling advertisements
import MobileAdvertisementSection from '../../components/hooks/MobileAdvertisementSection'; // Component for handling advertisements


export default function School({schools, school, folders, resources, requestAccess, newsletters, events, selectedSchool }) {
  const app = useApp();

  // State management for login, modal visibility, sidebar, etc.
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true); // New state for handling loading screen
  const [showModal, setShowModal] = useState(false);
  const [showRequestAccessModal, setShowRequestAccessModal] = useState(false);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  
  const [selectedTab, setSelectedTab] = useState('details'); // Default selected tab
  const [selectedSchools, setSelectedSchools] = useState([]);
  const [colorMode, customColor, setColorMode] = useColorMode();
  const [accessStatus, setAccessStatus] = useState(null);
  const { refreshFolders, refreshResources } = useFetchSchoolData(app, selectedSchool);
  const [isMobile, setIsMobile] = useState(false);

  // New state to store logged-in user's info
  const [loggedInUser, setLoggedInUser] = useState(null); // Store user's email and other info here

  // Toggle the visibility of the sidebar
  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        setLoading(true);
        const currentUser = app?.currentUser;
        setIsLoggedIn(currentUser !== null);
        if (currentUser) {
          const userProfile = currentUser.profile; 
          setLoggedInUser(userProfile); 
          console.log('loggedinuser:', userProfile); // Log the user profile directly
        }
      } catch (error) {
        console.error('Error checking login status:', error);
      } finally {
        setLoading(false);
      }
    };
  
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
  
    checkLoginStatus(); // Initial check for login status
    checkScreenSize(); // Initial check for screen size
    window.addEventListener('resize', checkScreenSize);
  
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, [app]);
  

  // Refresh folders and resources when the component mounts
  useEffect(() => {
    refreshFolders();
    refreshResources();
  }, []);

  // Open the login modal
  const openModal = () => {
    setShowModal(true);
  };

  // Handle login and close the modal once the login is successful
  const closeAndLogin = (email, password) => {
    handleLogin(email, password);
    setShowModal(false);
  };
  const handleRegister = async (email, password) => {
    try {
      await app.emailPasswordAuth.registerUser({ email, password });
      alert('Registration successful! Please check your email to confirm your account.');
      console.log('Registration successful. Please check your email to confirm your account.');
    } catch (error) {
      console.error('Registration failed:', error.message);
    }
  };
  // Function to handle login logic using MongoDB Realm credentials
 // Function to handle login logic using MongoDB Realm credentials
const handleLogin = async (email, password) => {
  try {
    const credentials = Credentials.emailPassword(email, password);
    await app.logIn(credentials); // Logging into the Realm app
    setIsLoggedIn(true);
    setLoggedInUser(app.currentUser.profile); // Set the logged-in user info after successful login

    console.log('User logged in:', app.currentUser.profile); // Log the user info after login
    console.log('Logged In User:', loggedInUser); // Log the logged-in user info
    
    // Force a full page refresh after successful login
    window.location.reload();
  } catch (error) {
    console.error('Login failed:', error.message);
  }
};
  // Function to check the user's access status for the selected school
  const checkAccessStatus = async () => {
    try {
      if (app && app.currentUser) {
        const userEmail = app.currentUser.profile.email; // Get the logged-in user's email
        const accessRequest = requestAccess.find((req) => req.loggedInUserEmail === userEmail); // Find matching access request
        if (accessRequest) {
          return accessRequest.status; // Return the access status directly
        } else {
          return null; // Return null if no access request found
        }
      }
    } catch (error) {
      console.error('Error checking access status:', error);
      return null;
    }
  };

  // Function to handle tab clicks and control access based on login and access status
  const handleTabClick = async (tab) => {
    if (!isLoggedIn) {
      openModal(); // Prompt user to log in if they are not logged in
      return; // Exit early if not logged in
    }

    const status = await checkAccessStatus(); // Get access status directly and wait for the result

    // Update state based on access status
    setAccessStatus(status);

    // Handle access logic only after the state is updated
    if (status === 'Accepted') {
      setSelectedTab(tab); // Allow switching to the selected tab if access is accepted
    } else if (status === 'Pending') {
      setShowPendingModal(true); // Show pending modal if access request is still pending
    } else if (status === null || (status !== 'Accepted' && status !== 'Pending')) {
      setShowRequestAccessModal(true); // Show request access modal only if access is neither Accepted nor Pending
    }
  };

  // Close various modals
  const closeModal = () => setShowModal(false);
  const closeRequestAccessModal = () => setShowRequestAccessModal(false);
  const closePendingModal = () => setShowPendingModal(false);

  // Handle success after submitting access request
  const handleSuccess = (schoolName) => {
    console.log(`Request submitted for ${schoolName}`);
    closeRequestAccessModal();
    setShowPendingModal(true);
    window.location.reload(); // Reload the page to reflect the latest status
  };

  return (
    <AuthProvider> {/* Wrap the component with AuthProvider to provide authentication context */}
      <SchoolDashboardLayout
        schools={schools}
        school={school}
        colorMode={colorMode}
        setColorMode={setColorMode}
        customColor={customColor}
      >
        <div className="flex">
          {/* Show the toggle button for the sidebar when it's not visible */}
          {!sidebarVisible && (
            <button
              className="md:hidden fixed top-16 left-4 z-50 bg-gray-600 text-white p-2 rounded-full shadow-md"
              onClick={toggleSidebar}
            >
              <img src={school.logo} alt="School Logo" className="h-8 w-8" />
            </button>
          )}
          {/* Sidebar and overlay for mobile */}
          <div className={`fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden ${sidebarVisible ? 'block' : 'hidden'}`} onClick={toggleSidebar}></div>
          <div className={`fixed z-40 md:relative md:translate-x-0 transform ${sidebarVisible ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}>
            <SideNavSchool
              school={school}
              selectedTab={selectedTab}
              onTabClick={handleTabClick}
              isLoggedIn={isLoggedIn}
              theme={colorMode}
              colorMode={colorMode}
              setColorMode={setColorMode}
              customColor={customColor}
            />
          </div>

          {/* Main content area - Conditionally rendering based on screen size */}
          <div className="flex-1 p-4">
            {isMobile ? (
              // Wrapping Advertisement and Main Content in a flex column for mobile
              <div className="flex flex-col space-y-4">
                <MobileAdvertisementSection />
                <MobileMainContentArea
                  selectedTab={selectedTab}
                  accessStatus={accessStatus}
                  resources={resources}
                  school={school}
                  selectedSchool={selectedSchool}
                  folders={folders}
                  refreshFolders={refreshFolders}
                  refreshResources={refreshResources}
                  events={events}
                  newsletters={newsletters}
                  isLoggedIn={isLoggedIn}
                  loggedInUser={loggedInUser}
                  openModal={openModal}
                  setShowRequestAccessModal={setShowRequestAccessModal}
                />
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                <MainContentArea
                  selectedTab={selectedTab}
                  accessStatus={accessStatus}
                  resources={resources}
                  school={school}
                  selectedSchool={selectedSchool}
                  folders={folders}
                  refreshFolders={refreshFolders}
                  refreshResources={refreshResources}
                  events={events}
                  newsletters={newsletters}
                  isLoggedIn={isLoggedIn}
                  loggedInUser={loggedInUser}
                  openModal={openModal}
                  setShowRequestAccessModal={setShowRequestAccessModal}
                />
                <AdvertisementSection />
              </div>
            )}
          </div>

        </div>

        {/* Modals for handling login, request access, and pending request */}
        <SchoolModals
        selectedSchool={selectedSchool}
          showModal={showModal}
          showPendingModal={showPendingModal}
          showRequestAccessModal={showRequestAccessModal}
          school={school}
          closeModal={closeModal}
          closePendingModal={closePendingModal}
          closeRequestAccessModal={closeRequestAccessModal}
          handleLogin={handleLogin}
          handleSuccess={handleSuccess}
        />
         {/* Login modal component */}
      <LoginModal isOpen={showModal} onClose={() => setShowModal(false)} onLogin={closeAndLogin}   onRegister={handleRegister} />
      </SchoolDashboardLayout>
    </AuthProvider>
  );
}


export async function getServerSideProps(context) {
  try {
    const client = await clientPromise;
    const db = client.db('tracker');
    const { params } = context;

    // Fetch all data in parallel
    const [
      school, 
      schools, 
      resources, 
      folders, 
      newsletters, 
      events, 
      requestAccess
    ] = await Promise.all([
      db.collection('School').findOne({ schoolName: decodeURIComponent(params.schoolId) }),
      db.collection('School').find({}).sort({ metacritic: -1 }).limit(1000).toArray(),
      db.collection('Resource').find({ schoolname: decodeURIComponent(params.schoolId) }).toArray(),
      db.collection('Folder').find({ schoolName: decodeURIComponent(params.schoolId) }).toArray(),
      db.collection('Newsletter').find({ schoolname: decodeURIComponent(params.schoolId) }).toArray(),
      db.collection('Events').find({ schoolname: decodeURIComponent(params.schoolId) }).toArray(),
      db.collection('RequestAccess').find({ schoolName: decodeURIComponent(params.schoolId) }).toArray()
    ]);

    if (!school) {
      return {
        notFound: true,
      };
    }

    return {
      props: {
        schools: JSON.parse(JSON.stringify(schools)),
        school: JSON.parse(JSON.stringify(school)),
        resources: JSON.parse(JSON.stringify(resources)),
        folders: JSON.parse(JSON.stringify(folders)),
        newsletters: JSON.parse(JSON.stringify(newsletters)),
        events: JSON.parse(JSON.stringify(events)),
        requestAccess: JSON.parse(JSON.stringify(requestAccess)),
        selectedSchool: decodeURIComponent(params.schoolId),
      },
    };
  } catch (e) {
    console.error(e);
    return {
      props: {
        schools: [],
        school: null,
        resources: [],
        folders: [],
        newsletters: [],
        events: [],
        requestAccess: [],
        selectedSchool: context.params?.schoolId || '',
      },
    };
  }
}