import React from 'react';
import DetailsTab from '../../Schoolpage/DetailsTab';
import ResourceTab from '../../schooldashboard/ResourceTabAdmin';
import NewsletterView from '../../schooldashboard/NewsletterViewAdmin';
import MyCalendar from '../../schooldashboard/CalendarAdmin';

const TabContent = ({ colorMode, selectedTab, accessStatus, school, newsletters, resources, events, folders, refreshFolders, refreshResources }) => {
  if (accessStatus !== 'Accepted' && selectedTab !== 'details') {
    return <div className="text-red-500 text-center">You do not have access to view this content.</div>;
  }

  switch (selectedTab) {
    case 'details':
      return <DetailsTab />;
    case 'resources':
      return <ResourceTab 
                resources={resources} 
                school={school} 
                folders={folders} 
                refreshFolders={refreshFolders} 
                refreshResources={refreshResources} />;
    case 'newsletter':
      return <NewsletterView school={school} newsletters={newsletters} />;
    case 'calendar':
      return <MyCalendar school={school} events={events} />;
    default:
      return null;
  }
};

export default TabContent;
