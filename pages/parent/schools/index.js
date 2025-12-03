import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import clientPromise from '../../../lib/mongodb';
import { AuthProvider } from '../../../components/context/AuthContext';
import { useSelectedSchools } from '../../../components/hooks/useSelectedSchools';
import PersonalSchoolLayout from '../../../components/parent/schools/PersonalSchoolLayout';
import PersonalSchoolLayoutMobile from '../../../components/parent/schools/PersonalSchoolLayoutMobile';
import SchoolSelection from '../../../components/parent/schools/SchoolSelection';
import MobileSchoolSelection from '../../../components/parent/schools/MobileSchoolSelection';
import SelectedSchoolsScreen from '../../../components/parent/schools/SelectedSchoolsScreen';
import LoginUserModal from '../../../components/auth/LoginUserModal';
import { useApp } from '../../../components/redux/useApp';

export default function Schools({ schools }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isPaymentRequired, setIsPaymentRequired] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isMobile, setIsMobile] = useState(null); // Initialize as null to avoid flashing
  const app = useApp();

  const { selectedSchools, setSelectedSchools } = useSelectedSchools();

  // Detect if the screen is mobile when the component mounts
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768); // Set true if the screen width is less than 768px
    };

    handleResize(); // Check on initial load
    window.addEventListener('resize', handleResize); // Listen to window resize events

    return () => {
      window.removeEventListener('resize', handleResize); // Clean up event listener on component unmount
    };
  }, []);

  const handleSchoolSelection = (schoolName) => {
    setSelectedSchools((prevState) => {
      if (prevState.includes(schoolName)) {
        return prevState.filter((name) => name !== schoolName);
      } else if (prevState.length < 5) {
        return [...prevState, schoolName];
      }
      return prevState;
    });
  };

  const handleSaveSelections = async (selectedSchools) => {
    if (!app.currentUser || !app.currentUser.isLoggedIn) {
      setShowLoginModal(true); // Show login modal if user is not logged in
      return;
    }
    try {
      if (!app.currentUser) {
        throw new Error('User not authenticated');
      }

      const userEmail = app.currentUser.profile.email;

      const saveResponse = await fetch('https://data.mongodb-api.com/app/tasktracker-uuloe/endpoint/saveSelectedSchools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${app.currentUser.accessToken}`,
        },
        body: JSON.stringify({ email: userEmail, selectedSchools }), // Pass selected schools from state
      });

      if (!saveResponse.ok) {
        const errorDetail = await saveResponse.json();
        throw new Error(`Failed to save selected schools: ${errorDetail.message}`);
      }

      console.log('Selected schools saved successfully.');
      setIsPaymentRequired(true); // Trigger payment component after saving
    } catch (error) {
      console.error('Error saving selected schools:', error.message);
    }
  };

  const handleProceedToDashboard = () => {
    router.push('/dashboard');
  };

  const handleSkipToPayment = () => {
    setIsPaymentRequired(true); // Directly set payment required
  };

  // Filter schools based on the search query
  const filteredSchools = schools.filter((school) =>
    school.schoolName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderContent = () => {
    if (isMobile === null) {
      // If `isMobile` is still null (before screen size is detected), show a loading state
      return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    if (isMobile) {
      return (
        <PersonalSchoolLayoutMobile
          schools={schools} 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        >
          <div className="flex flex-col h-full w-full">
          {isPaymentRequired ? (
            <PaymentComponent onProceedToDashboard={handleProceedToDashboard} />
          ) : selectedSchools.length === 0 ? (
            <MobileSchoolSelection
              schools={schools}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedSchools={selectedSchools}
              handleSaveSelections={handleSaveSelections}
              onSkipToPayment={() => setIsPaymentRequired(true)}
            />
          ) : (
            <SelectedSchoolsScreen schools={schools} selectedSchools={selectedSchools} />
          )}
            <LoginUserModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
          </div>
        </PersonalSchoolLayoutMobile>
      );
    } else {
      return (
        <PersonalSchoolLayout
          schools={schools} 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        >
          <div className="flex flex-col h-full w-full">
          {isPaymentRequired ? (
            <PaymentComponent onProceedToDashboard={handleProceedToDashboard} />
          ) : selectedSchools.length === 0 ? (
            <SchoolSelection
              schools={schools}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedSchools={selectedSchools}
              handleSaveSelections={handleSaveSelections}
              onSkipToPayment={() => setIsPaymentRequired(true)}
            />
          ) : (
            <SelectedSchoolsScreen schools={schools} selectedSchools={selectedSchools} />
          )}
            <LoginUserModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
          </div>
        </PersonalSchoolLayout>
      );
    }
  };

  return (
    <AuthProvider>
      {renderContent()}
    </AuthProvider>
  );
}

export async function getServerSideProps() {
  try {
    const client = await clientPromise;
    const db = client.db('tracker');

    const schools = await db
      .collection('School')
      .find({})
      .sort({ metacritic: -1 })
      .limit(1000)
      .toArray();
     
      console.log('Fetched schools data:', schools);

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
