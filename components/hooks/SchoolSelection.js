import { useState, useEffect } from 'react';
import { useApp } from '../redux/useApp';

const SchoolSelection = ({ schools, selectedSchools, handleSaveSelections, searchQuery, setSearchQuery, onSkipToPayment }) => {
    const filteredSchools = schools.filter((school) =>
      school.schoolName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  
    return (
      <div>
        {/* Search input */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search schools"
        />
        
        {/* School list */}
        <div>
          {filteredSchools.map((school) => (
            <div key={school.id}>
              <label>
                <input
                  type="checkbox"
                  checked={selectedSchools.includes(school.schoolName)}
                  onChange={() => handleSchoolSelection(school.schoolName)}
                />
                {school.schoolName}
              </label>
            </div>
          ))}
        </div>
  
        {/* Save button */}
        <button onClick={() => handleSaveSelections(selectedSchools)}>Save Selections</button>
        <button onClick={onSkipToPayment}>Skip to Payment</button>
      </div>
    );
  };
  