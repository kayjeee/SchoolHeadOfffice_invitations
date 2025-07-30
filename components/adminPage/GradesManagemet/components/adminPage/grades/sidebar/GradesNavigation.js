import React, { useState } from 'react';
import { FaGraduationCap } from 'react-icons/fa';
import { FiUsers, FiMail, FiUpload, FiFileText, FiChevronDown, FiChevronRight } from 'react-icons/fi';

const GradesNavigation = ({ tabs, activeTab, onTabChange, isExpanded }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Define the grades navigation items
  const gradesNavItems = [
    { 
      id: 'grades-overview', 
      label: 'Overview', 
      icon: <FaGraduationCap />,
      description: 'Grades management dashboard'
    },
    { 
      id: 'grades-classes', 
      label: 'Classes', 
      icon: <FiFileText />,
      description: 'Manage class assignments'
    },
    { 
      id: 'grades-learners', 
      label: 'Learners', 
      icon: <FiUsers />,
      description: 'Manage learner information'
    },
    { 
      id: 'grades-upload-learners', 
      label: 'Upload Learners', 
      icon: <FiUpload />,
      description: 'Bulk upload learner data'
    },
    { 
      id: 'grades-invitations', 
      label: 'Invitations', 
      icon: <FiMail />,
      description: 'Manage parent invitations'
    }
  ];

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleNavItemClick = (itemId) => {
    onTabChange(itemId);
    if (!isExpanded) {
      setIsDropdownOpen(false);
    }
  };

  // Check if any grades tab is active
  const isGradesActive = gradesNavItems.some(item => item.id === activeTab);

  return (
    <div className="px-4 py-2">
      {/* Main Grades Button */}
      <button
        className={`flex items-center justify-between w-full text-xs font-medium focus:outline-none transition-colors duration-200 ${
          isGradesActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
        }`}
        onClick={toggleDropdown}
      >
        {/* Main Icon */}
        <div className="flex items-center">
          <span className="flex-shrink-0 w-5 h-5">
            <FaGraduationCap className={isGradesActive ? 'text-blue-600' : 'text-gray-400'} />
          </span>

          {/* Section Title (Visible Only When Expanded) */}
          <span className={`${isExpanded ? 'block ml-3' : 'hidden'} whitespace-nowrap uppercase tracking-wider`}>
            Grades
          </span>
        </div>

        {/* Dropdown Arrow (Visible Only When Expanded) */}
        {isExpanded && (
          <span className="transition-transform duration-200">
            {isDropdownOpen ? (
              <FiChevronDown className="w-4 h-4" />
            ) : (
              <FiChevronRight className="w-4 h-4" />
            )}
          </span>
        )}
      </button>

      {/* Dropdown Content */}
      {isDropdownOpen && (
        <div className="mt-2 space-y-1">
          {gradesNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavItemClick(item.id)}
              className={`w-full flex items-center space-x-2 p-2 rounded cursor-pointer transition-colors duration-200 ${
                activeTab === item.id 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              title={!isExpanded ? item.description : ''}
            >
              <span className="w-5 h-5 flex-shrink-0">
                {item.icon}
              </span>
              <span className={`text-sm ${isExpanded ? 'block' : 'hidden'}`}>
                {item.label}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Collapsed State - Show Active Item */}
      {!isExpanded && isGradesActive && (
        <div className="mt-2">
          <div className="w-full flex items-center justify-center p-2 rounded bg-blue-500 text-white">
            <span className="w-5 h-5">
              {gradesNavItems.find(item => item.id === activeTab)?.icon || <FaGraduationCap />}
            </span>
          </div>
        </div>
      )}

      {/* Quick Stats (Visible When Expanded and Dropdown Open) */}
      {isExpanded && isDropdownOpen && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
          <h4 className="text-xs font-medium text-gray-700 mb-2">Quick Stats</h4>
          <div className="space-y-1 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Total Grades:</span>
              <span className="font-medium">5</span>
            </div>
            <div className="flex justify-between">
              <span>Total Learners:</span>
              <span className="font-medium">142</span>
            </div>
            <div className="flex justify-between">
              <span>Pending Invitations:</span>
              <span className="font-medium text-yellow-600">12</span>
            </div>
          </div>
        </div>
      )}

      {/* Help Text (Visible When Expanded) */}
      {isExpanded && !isDropdownOpen && (
        <div className="mt-2 text-xs text-gray-500">
          <p>Manage grades, learners, and parent communications</p>
        </div>
      )}
    </div>
  );
};

export default GradesNavigation;

