import React from 'react';

export default function Sidebar({
  tabs,
  activeTab,
  onTabChange,
  isExpanded,
  onToggle,
}) {
  return (
    <div className={`flex flex-col h-[80vh] bg-gray-50 ${isExpanded ? 'w-64' : 'w-20'} transition-all duration-300 ease-in-out`}>
      {/* Collapse/Expand Toggle */}
      <button
        onClick={onToggle}
        className="p-4 text-gray-600 hover:text-gray-800 focus:outline-none"
      >
        {isExpanded ? '←' : '→'}
      </button>

      {/* Scrollable Navigation Sections */}
      <nav className="flex-1 overflow-y-auto max-h-[calc(80vh-100px)]">
        {/* Grades Navigation Section */}
        <div className="mb-6">
          <h3 className={`px-4 pt-4 text-xs font-semibold text-gray-500 uppercase tracking-wider ${
            isExpanded ? 'block' : 'hidden'
          }`}>
            Grades Management
          </h3>
          <div className="mt-2">
            {tabs.grades.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`w-full flex items-center px-4 py-2 text-sm font-medium ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                } ${isExpanded ? 'justify-start space-x-3' : 'justify-center'}`}
              >
                <span className="flex-shrink-0">{tab.icon}</span>
                <span className={`${isExpanded ? 'block' : 'hidden'}`}>
                  {tab.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Invite Members CTA (optional - remove if not needed) */}
      {false && (
        <div className="p-4">
          <button
            className={`w-full flex items-center justify-center p-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded ${
              isExpanded ? 'space-x-2' : ''
            }`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              ></path>
            </svg>
            <span className={`${isExpanded ? 'block' : 'hidden'}`}>Invite Members</span>
          </button>
        </div>
      )}
    </div>
  );
}