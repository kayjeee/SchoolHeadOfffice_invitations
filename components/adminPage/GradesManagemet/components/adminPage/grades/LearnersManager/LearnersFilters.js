import React, { useState } from 'react';
import { FiSearch, FiFilter, FiX, FiCalendar, FiUser, FiMail } from 'react-icons/fi';

const LearnersFilters = ({ selectedGrade, onFiltersChange }) => {
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    ageRange: 'all',
    enrollmentPeriod: 'all',
    parentContact: 'all',
    medicalConditions: 'all'
  });

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'pending', label: 'Pending' },
    { value: 'suspended', label: 'Suspended' }
  ];

  const ageRangeOptions = [
    { value: 'all', label: 'All Ages' },
    { value: '5-7', label: '5-7 years' },
    { value: '8-10', label: '8-10 years' },
    { value: '11-13', label: '11-13 years' },
    { value: '14-16', label: '14-16 years' },
    { value: '17-19', label: '17-19 years' }
  ];

  const enrollmentPeriodOptions = [
    { value: 'all', label: 'All Periods' },
    { value: 'this-year', label: 'This Year' },
    { value: 'last-year', label: 'Last Year' },
    { value: 'last-6-months', label: 'Last 6 Months' },
    { value: 'last-3-months', label: 'Last 3 Months' },
    { value: 'this-month', label: 'This Month' }
  ];

  const parentContactOptions = [
    { value: 'all', label: 'All Contacts' },
    { value: 'complete', label: 'Complete Contact Info' },
    { value: 'missing-email', label: 'Missing Email' },
    { value: 'missing-phone', label: 'Missing Phone' },
    { value: 'incomplete', label: 'Incomplete Contact Info' }
  ];

  const medicalConditionsOptions = [
    { value: 'all', label: 'All Learners' },
    { value: 'with-conditions', label: 'With Medical Conditions' },
    { value: 'allergies', label: 'With Allergies' },
    { value: 'medications', label: 'On Medications' },
    { value: 'no-conditions', label: 'No Medical Conditions' }
  ];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Call parent callback if provided
    if (onFiltersChange) {
      onFiltersChange(newFilters);
    }
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      search: '',
      status: 'all',
      ageRange: 'all',
      enrollmentPeriod: 'all',
      parentContact: 'all',
      medicalConditions: 'all'
    };
    setFilters(clearedFilters);
    
    if (onFiltersChange) {
      onFiltersChange(clearedFilters);
    }
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.status !== 'all') count++;
    if (filters.ageRange !== 'all') count++;
    if (filters.enrollmentPeriod !== 'all') count++;
    if (filters.parentContact !== 'all') count++;
    if (filters.medicalConditions !== 'all') count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Filter Learners</h3>
        <div className="flex items-center space-x-3">
          {activeFiltersCount > 0 && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {activeFiltersCount} active filter{activeFiltersCount !== 1 ? 's' : ''}
            </span>
          )}
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <FiFilter className="mr-1 h-4 w-4" />
            Advanced
          </button>
          {activeFiltersCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <FiX className="mr-1 h-4 w-4" />
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Basic Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Search */}
        <div className="col-span-1 md:col-span-2">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Search Learners
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="search"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Search by name, email, student ID..."
            />
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            id="status"
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="border-t border-gray-200 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Age Range */}
            <div>
              <label htmlFor="ageRange" className="block text-sm font-medium text-gray-700 mb-1">
                <FiUser className="inline mr-1 h-4 w-4" />
                Age Range
              </label>
              <select
                id="ageRange"
                value={filters.ageRange}
                onChange={(e) => handleFilterChange('ageRange', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                {ageRangeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Enrollment Period */}
            <div>
              <label htmlFor="enrollmentPeriod" className="block text-sm font-medium text-gray-700 mb-1">
                <FiCalendar className="inline mr-1 h-4 w-4" />
                Enrollment Period
              </label>
              <select
                id="enrollmentPeriod"
                value={filters.enrollmentPeriod}
                onChange={(e) => handleFilterChange('enrollmentPeriod', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                {enrollmentPeriodOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Parent Contact */}
            <div>
              <label htmlFor="parentContact" className="block text-sm font-medium text-gray-700 mb-1">
                <FiMail className="inline mr-1 h-4 w-4" />
                Parent Contact
              </label>
              <select
                id="parentContact"
                value={filters.parentContact}
                onChange={(e) => handleFilterChange('parentContact', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                {parentContactOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Medical Conditions */}
            <div>
              <label htmlFor="medicalConditions" className="block text-sm font-medium text-gray-700 mb-1">
                Medical Conditions
              </label>
              <select
                id="medicalConditions"
                value={filters.medicalConditions}
                onChange={(e) => handleFilterChange('medicalConditions', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                {medicalConditionsOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Filter Buttons */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-gray-700 mr-2">Quick filters:</span>
              <button
                onClick={() => handleFilterChange('status', 'active')}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200"
              >
                Active Only
              </button>
              <button
                onClick={() => handleFilterChange('medicalConditions', 'with-conditions')}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
              >
                With Medical Conditions
              </button>
              <button
                onClick={() => handleFilterChange('enrollmentPeriod', 'this-year')}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200"
              >
                New This Year
              </button>
              <button
                onClick={() => handleFilterChange('parentContact', 'incomplete')}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 hover:bg-red-200"
              >
                Incomplete Contact Info
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Summary */}
      {activeFiltersCount > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Active filters:</span>
            {filters.search && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                Search: "{filters.search}"
                <button
                  onClick={() => handleFilterChange('search', '')}
                  className="ml-1 text-gray-400 hover:text-gray-600"
                >
                  <FiX className="h-3 w-3" />
                </button>
              </span>
            )}
            {filters.status !== 'all' && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                Status: {statusOptions.find(opt => opt.value === filters.status)?.label}
                <button
                  onClick={() => handleFilterChange('status', 'all')}
                  className="ml-1 text-gray-400 hover:text-gray-600"
                >
                  <FiX className="h-3 w-3" />
                </button>
              </span>
            )}
            {filters.ageRange !== 'all' && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                Age: {ageRangeOptions.find(opt => opt.value === filters.ageRange)?.label}
                <button
                  onClick={() => handleFilterChange('ageRange', 'all')}
                  className="ml-1 text-gray-400 hover:text-gray-600"
                >
                  <FiX className="h-3 w-3" />
                </button>
              </span>
            )}
            {filters.enrollmentPeriod !== 'all' && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                Enrollment: {enrollmentPeriodOptions.find(opt => opt.value === filters.enrollmentPeriod)?.label}
                <button
                  onClick={() => handleFilterChange('enrollmentPeriod', 'all')}
                  className="ml-1 text-gray-400 hover:text-gray-600"
                >
                  <FiX className="h-3 w-3" />
                </button>
              </span>
            )}
            {filters.parentContact !== 'all' && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                Contact: {parentContactOptions.find(opt => opt.value === filters.parentContact)?.label}
                <button
                  onClick={() => handleFilterChange('parentContact', 'all')}
                  className="ml-1 text-gray-400 hover:text-gray-600"
                >
                  <FiX className="h-3 w-3" />
                </button>
              </span>
            )}
            {filters.medicalConditions !== 'all' && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                Medical: {medicalConditionsOptions.find(opt => opt.value === filters.medicalConditions)?.label}
                <button
                  onClick={() => handleFilterChange('medicalConditions', 'all')}
                  className="ml-1 text-gray-400 hover:text-gray-600"
                >
                  <FiX className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LearnersFilters;

