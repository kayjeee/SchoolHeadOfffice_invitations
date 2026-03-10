import React from 'react';
import { Search } from 'lucide-react';

interface SchoolSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const SchoolSearchBar: React.FC<SchoolSearchBarProps> = ({ value, onChange, placeholder = "Search by name or city..." }) => {
  return (
    <div className="relative max-w-md w-full mb-8">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
      </div>
      <input
        type="text"
        name="search"
        id="search"
        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

export default SchoolSearchBar;
