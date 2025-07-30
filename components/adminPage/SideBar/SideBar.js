import React from 'react';

export default function Sidebar({ tabs, activeTab, onTabChange }) {
  return (
    <div className="w-1/4 h-full bg-gray-100 p-4">
      <ul className="space-y-4">
        {tabs.map((tab) => (
          <li
            key={tab.id}
            className={`cursor-pointer p-2 rounded ${
              activeTab === tab.id ? 'bg-blue-500 text-white' : 'bg-white text-black'
            }`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
