import React from 'react';
import NewsletterView from '../NewsletterView';

const NewsletterTabAdmin = ({ newsletters, refreshNewsletters, selectedSchool }) => {
  return (
    <div>

      {/* Render the NewsletterViewAdmin component */}
      <NewsletterViewAdmin newsletters={newsletters} refreshNewsletters={refreshNewsletters} selectedSchool={selectedSchool} />

      {/* Display resources */}
 
    </div>
  );
};

export default NewsletterTabAdmin;
