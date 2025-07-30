// NewsletterTab.js
import React from 'react';
import NewsletterView from '../../components/NewsletterView';

const NewsletterTab = ({school, newsletters, selectedSchool }) => (
  <div>


    <NewsletterView school={school} newsletters={newsletters} selectedSchool={selectedSchool} />
  </div>
);

export default NewsletterTab;
