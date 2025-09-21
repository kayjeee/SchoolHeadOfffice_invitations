import React, { useState } from 'react';
import { 
  FaGraduationCap, 
  FaQrcode, 
  FaUserPlus,
  FaLink,
  FaChartLine
} from 'react-icons/fa';
import { 
  FiUsers, 
  FiMail, 
  FiUpload, 
  FiFileText, 
  FiChevronDown, 
  FiChevronRight,
  FiSettings,
  FiTarget,
  FiTrendingUp
} from 'react-icons/fi';

const GradesNavigation = ({ tabs, activeTab, onTabChange, isExpanded }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showPRCodeSubmenu, setShowPRCodeSubmenu] = useState(false);

  // Main navigation items that match your existing tab structure
  const mainNavItems = [
    { 
      id: 'overview', 
      label: 'Overview', 
      icon: <FaGraduationCap />,
      description: 'Grades management dashboard',
      stats: { count: '5 Grades', color: 'text-blue-600' }
    },
    { 
      id: 'learners', 
      label: 'Learners', 
      icon: <FiUsers />,
      description: 'Manage learner information',
      stats: { count: '142 Students', color: 'text-green-600' }
    },
    { 
      id: 'invitations', 
      label: 'Invitations', 
      icon: <FiMail />,
      description: 'Manage parent invitations',
      stats: { count: '12 Pending', color: 'text-yellow-600' }
    }
  ];

  // PR Code system sub-navigation
  const prCodeNavItems = [
    { 
      id: 'pr-code-generator', 
      label: 'Code Generator', 
      icon: <FaUserPlus />,
      description: 'Create personalized referral codes',
      parent: 'prcode'
    },
    { 
      id: 'qr-code-management', 
      label: 'QR Codes', 
      icon: <FaQrcode />,
      description: 'Generate and manage QR codes',
      parent: 'prcode'
    },
    { 
      id: 'invite-links', 
      label: 'Invite Links', 
      icon: <FaLink />,
      description: 'Manage and track invitation links',
      parent: 'prcode'
    },
    { 
      id: 'invitation-analytics', 
      label: 'Analytics', 
      icon: <FaChartLine />,
      description: 'Track invitation performance',
      parent: 'prcode'
    }
  ];

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const togglePRCodeSubmenu = () => {
    setShowPRCodeSubmenu(!showPRCodeSubmenu);
  };

  const handleNavItemClick = (itemId) => {
    // If it's a PR Code sub-item, we need to handle it differently
    const prCodeItem = prCodeNavItems.find(item => item.id === itemId);
    if (prCodeItem) {
      // For PR Code sub-items, we might want to set a composite state
      onTabChange('prcode', itemId); // Pass both main tab and sub-tab
    } else {
      onTabChange(itemId);
    }
    
    if (!isExpanded) {
      setIsDropdownOpen(false);
    }
  };

  // Check if any grades tab is active
  const isGradesActive = mainNavItems.some(item => item.id === activeTab) || 
                        activeTab === 'prcode' || 
                        prCodeNavItems.some(item => item.id === activeTab);

  // Check if PR Code section is active
  const isPRCodeActive = activeTab === 'prcode' || 
                        prCodeNavItems.some(item => item.id === activeTab);

  return (
    <div className="px-4 py-2">
      {/* Main Grades Section Button */}
      <button
        className={`flex items-center justify-between w-full text-xs font-medium focus:outline-none transition-colors duration-200 ${
          isGradesActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
        }`}
        onClick={toggleDropdown}
      >
        <div className="flex items-center">
          <span className="flex-shrink-0 w-5 h-5">
            <FaGraduationCap className={isGradesActive ? 'text-blue-600' : 'text-gray-400'} />
          </span>

          {isExpanded && (
            <span className="ml-3 whitespace-nowrap uppercase tracking-wider">
              Grades & Invites
            </span>
          )}
        </div>

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
          {/* Main Navigation Items */}
          <div className="space-y-1">
            {mainNavItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavItemClick(item.id)}
                className={`w-full flex items-center justify-between p-2 rounded cursor-pointer transition-colors duration-200 ${
                  activeTab === item.id 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                title={!isExpanded ? item.description : ''}
              >
                <div className="flex items-center space-x-2">
                  <span className="w-5 h-5 flex-shrink-0">
                    {item.icon}
                  </span>
                  {isExpanded && (
                    <span className="text-sm">{item.label}</span>
                  )}
                </div>
                
                {isExpanded && item.stats && (
                  <span className={`text-xs ${
                    activeTab === item.id ? 'text-blue-100' : item.stats.color
                  }`}>
                    {item.stats.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* PR Code System Section */}
          {isExpanded && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              {/* PR Code Main Button */}
              <button
                onClick={() => {
                  handleNavItemClick('prcode');
                  togglePRCodeSubmenu();
                }}
                className={`w-full flex items-center justify-between p-2 rounded cursor-pointer transition-colors duration-200 ${
                  isPRCodeActive 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="w-5 h-5 flex-shrink-0">
                    <FiTarget className={isPRCodeActive ? 'text-white' : 'text-blue-600'} />
                  </span>
                  <span className="text-sm font-medium">PR Code System</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    isPRCodeActive 
                      ? 'bg-white bg-opacity-20 text-white' 
                      : 'bg-blue-100 text-blue-600'
                  }`}>
                    New
                  </span>
                  <span className="transition-transform duration-200">
                    {showPRCodeSubmenu ? (
                      <FiChevronDown className="w-3 h-3" />
                    ) : (
                      <FiChevronRight className="w-3 h-3" />
                    )}
                  </span>
                </div>
              </button>

              {/* PR Code Submenu */}
              {showPRCodeSubmenu && (
                <div className="mt-1 ml-4 space-y-1">
                  {prCodeNavItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleNavItemClick(item.id)}
                      className={`w-full flex items-center space-x-2 p-2 rounded cursor-pointer transition-colors duration-200 ${
                        activeTab === item.id 
                          ? 'bg-blue-500 text-white' 
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                      title={item.description}
                    >
                      <span className="w-4 h-4 flex-shrink-0">
                        {item.icon}
                      </span>
                      <span className="text-sm">{item.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Collapsed State - Show Active Item */}
      {!isExpanded && isGradesActive && (
        <div className="mt-2">
          <div className={`w-full flex items-center justify-center p-2 rounded ${
            isPRCodeActive 
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
              : 'bg-blue-500 text-white'
          }`}>
            <span className="w-5 h-5">
              {isPRCodeActive ? (
                <FiTarget />
              ) : (
                mainNavItems.find(item => item.id === activeTab)?.icon || <FaGraduationCap />
              )}
            </span>
          </div>
        </div>
      )}

      {/* Enhanced Stats Panel */}
      {isExpanded && isDropdownOpen && (
        <div className="mt-3 p-3 bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg border border-blue-100">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold text-gray-700">Quick Stats</h4>
            <FiTrendingUp className="w-3 h-3 text-green-500" />
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-white p-2 rounded shadow-sm">
              <div className="font-medium text-gray-700">142</div>
              <div className="text-gray-500">Total Learners</div>
            </div>
            <div className="bg-white p-2 rounded shadow-sm">
              <div className="font-medium text-blue-600">8</div>
              <div className="text-gray-500">Active Codes</div>
            </div>
            <div className="bg-white p-2 rounded shadow-sm">
              <div className="font-medium text-yellow-600">12</div>
              <div className="text-gray-500">Pending</div>
            </div>
            <div className="bg-white p-2 rounded shadow-sm">
              <div className="font-medium text-green-600">78%</div>
              <div className="text-gray-500">Success Rate</div>
            </div>
          </div>
          
          {/* Quick Action */}
          <button 
            onClick={() => handleNavItemClick('pr-code-generator')}
            className="w-full mt-2 px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 transition-colors duration-200"
          >
            Generate New Code
          </button>
        </div>
      )}

      {/* Help Text */}
      {isExpanded && !isDropdownOpen && (
        <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-gray-600 border-l-2 border-blue-400">
          <p className="font-medium text-gray-700">Grades & Invitations</p>
          <p>Manage learners and create PR codes</p>
          <div className="mt-1 flex items-center space-x-1">
            <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
            <span className="text-blue-600 font-medium">PR Code System Active</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default GradesNavigation;