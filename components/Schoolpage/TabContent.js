// TabContent.js
import React from 'react';
import ResourceTab from './ResourceTab';
import DetailsTab from './DetailsTab';
import NewsletterTab from './NewsletterTab';
import MyCalendar from '../../components/Calendar';

const TabContent = ({ selectedTab, resources, newsletters, events }) => {
  return (
    <div className="flex-1 p-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 p-4 bg-gray-200 flex flex-col overflow-y-auto" style={{ height: '500px' }}>
          <div className="deatailinside-box-container fixed bg-white rounded-lg shadow-md p-6 mx-auto max-w-2xl h-96 overflow-y-auto w-full">
            {selectedTab === 'details' && <DetailsTab />}
            {selectedTab === 'resources' && <ResourceTab resources={resources} />}
            {selectedTab === 'newsletter' && <NewsletterTab newsletters={newsletters} />}
            {selectedTab === 'calendar' && <MyCalendar events={events} />}
          </div>
        </div>
        {/* Ads section on the right with fixed height */}
        <div className="col-span-1" style={{ height: '100px' }}>
          <div className="h-full bg-gray-300 text-center flex justify-center items-center">
            <p>Advertisement</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TabContent;
