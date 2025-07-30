// NewsletterTabAdminhome.js
import React from 'react';
import NewsletterView from '../NewsletterView';
import NewsletterViewAdminHome from '../NewsletterViewAdminHome';

const NewsletterTab = ({ schoolList }) => {
  console.log("Received school list in NewsletterTab:", schoolList); // Add this line
  return (
    <div className="flex-grow">
      <h2 className="text-xl font-bold mb-2">Resources</h2>
      <NewsletterViewAdminHome result={schoolList} />
    </div>
  );
};

export default NewsletterTab;
