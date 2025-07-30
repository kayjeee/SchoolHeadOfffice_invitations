// components/MainContentArea.js
import React from 'react';
import DetailsTab from '../Schoolpage/DetailsTab';
import ResourceTab from '../schooldashboard/ResourceTabAdmin';
import NewsletterView from '../schooldashboard/NewsletterViewAdmin';
import MyCalendar from '../schooldashboard/CalendarAdmin';
import AccountTab from '../schooldashboard/AccountTab';
export default function MobileMainContentArea({
  selectedTab,
  accessStatus,
  resources,
  school,
  selectedSchool,
  folders,
  refreshFolders,
  refreshResources,
  events,
  newsletters,
  isLoggedIn,
  openModal,
  setShowRequestAccessModal,
  loggedInUser
}) {
  return (
    <div className="w-full flex flex-col bg-gray-200 overflow-y-auto" style={{ height: '100vh' }}>
      <div className="flex flex-col bg-white rounded-lg shadow-md p-4 mx-auto w-full h-full overflow-y-auto">
        {/* Conditional rendering based on selected tab */}
        {selectedTab === 'details' && <DetailsTab school={school}  />}
        {selectedTab === 'resources' && accessStatus === 'Accepted' && (
          <ResourceTab
            resources={resources}
            school={school}
            selectedSchool={selectedSchool}
            folders={folders}
            refreshFolders={refreshFolders}
            refreshResources={refreshResources}
          />
        )}
        {selectedTab === 'account' && accessStatus === 'Accepted' && (
          <AccountTab school={school} selectedSchool={selectedSchool} />
        )}
        {selectedTab === 'newsletter' && accessStatus === 'Accepted' && (
          <NewsletterView school={school} newsletters={newsletters} selectedSchool={selectedSchool} />
        )}
        {selectedTab === 'calendar' && accessStatus === 'Accepted' && (
          <MyCalendar school={school} events={events} />
        )}
        {/* Display message if user lacks access */}
        {selectedTab !== 'details' && accessStatus !== 'Accepted' && (
          <div className="text-center">
            <p className="text-red-500">You do not have access to view this content.</p>
            {isLoggedIn ? (
              <button
                onClick={() => setShowRequestAccessModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
              >
                Request Access
              </button>
            ) : (
              <button
                onClick={openModal}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
              >
                Login
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
