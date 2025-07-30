import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FaGraduationCap } from 'react-icons/fa'; // Icon for Grades

/**
 * GradesSection component for the sidebar navigation.
 * Displays the "Grades Management" tab with dropdown functionality.
 *
 * @param {object} props - Component props.
 * @param {object} props.tabs - Object containing all tab configurations.
 * @param {string} props.activeTab - The currently active tab ID.
 * @param {function} props.onTabChange - Callback function to change the active tab.
 * @param {boolean} props.isExpanded - Boolean indicating if the sidebar is expanded.
 * @returns {JSX.Element} The rendered Grades Section.
 */
const GradesSection = ({ tabs, activeTab, onTabChange, isExpanded }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // We'll still get the main tab data if available for its label/icon in the dropdown,
  // but the main button itself will use a default icon and hardcoded title.
  const gradesMainTab = tabs?.grades?.[0];

  // Debugging log: This warning will now only show if the tab data is missing
  // when the dropdown is opened, or if the initial structure is unexpected.
  useEffect(() => {
    if (!gradesMainTab) {
      console.warn("GradesSection: 'tabs.grades' array is empty or 'gradesMainTab' is undefined. Ensure 'tabs.grades' is correctly populated in SettingsLayout.js.");
    }
  }, [gradesMainTab]);

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  return (
    <div className="px-4 py-2">
      <button
        className="flex items-center justify-between w-full text-xs font-medium text-gray-500 focus:outline-none"
        onClick={toggleDropdown}
      >
        {/* Main Icon (Always Visible, using FaGraduationCap as default) */}
        <span className="flex-shrink-0 w-5 h-5">
          <FaGraduationCap /> {/* Using a direct icon here for consistency with SupportAndSettingsSection's main icon */}
        </span>

        {/* Section Title (Visible Only When Expanded) */}
        <span className={`${isExpanded ? 'block' : 'hidden'} whitespace-nowrap uppercase tracking-wider`}>
          Grades
        </span>

        {/* Dropdown Arrow (Visible Only When Expanded) */}
        {isExpanded && (
          <svg
            className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'transform rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>

      {/* Dropdown Content (Visible Only When Dropdown is Open AND tabs.grades has items) */}
      {isDropdownOpen && tabs?.grades?.length > 0 && (
        <ul className="mt-2 space-y-1">
          {/* Map over all grade tabs if there are multiple, or just the first one */}
          {tabs.grades.map((tab) => (
            <li key={tab.id}>
              <button
                onClick={() => onTabChange(tab.id)}
                className={`w-full flex items-center space-x-2 p-2 rounded cursor-pointer ${
                  activeTab === tab.id ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="w-5 h-5">{tab.icon || <FaGraduationCap />}</span>
                <span className={`text-sm ${isExpanded ? 'block' : 'hidden'}`}>{tab.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

GradesSection.propTypes = {
  tabs: PropTypes.object.isRequired,
  activeTab: PropTypes.string.isRequired,
  onTabChange: PropTypes.func.isRequired,
  isExpanded: PropTypes.bool.isRequired,
};

export default GradesSection;
