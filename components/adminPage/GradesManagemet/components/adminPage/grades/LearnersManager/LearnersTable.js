import React, { useState, useEffect } from 'react';
import { FiEdit, FiTrash2, FiEye, FiMail, FiPhone, FiUser, FiCalendar, FiMoreVertical } from 'react-icons/fi';
import axios from 'axios';

const LearnersTable = ({ selectedGrade, onSelectLearner, onOpenInvitationModal }) => {
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedLearners, setSelectedLearners] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [learners, setLearners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch learners from API
  useEffect(() => {
    const fetchLearners = async () => {
      try {
        setLoading(true);
        let url = 'http://localhost:4000/api/v1/learners';
        
        if (selectedGrade) {
          url = `http://localhost:4000/api/v1/grades/${selectedGrade.id}/learners`;
        }

        const response = await axios.get(url, {
          params: {
            page: currentPage,
            per_page: itemsPerPage,
            sort_by: sortField,
            sort_order: sortDirection
          }
        });

        setLearners(response.data.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchLearners();
  }, [selectedGrade, currentPage, sortField, sortDirection]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1); // Reset to first page when sorting changes
  };

  const handleSelectLearner = (learnerId) => {
    setSelectedLearners(prev => 
      prev.includes(learnerId)
        ? prev.filter(id => id !== learnerId)
        : [...prev, learnerId]
    );
  };

  const handleSelectAll = () => {
    if (selectedLearners.length === learners.length) {
      setSelectedLearners([]);
    } else {
      setSelectedLearners(learners.map(learner => learner.id));
    }
  };

  const handleDeleteLearner = async (learnerId) => {
    try {
      await axios.delete(`http://localhost:4000/api/v1/learners/${learnerId}`);
      setLearners(learners.filter(learner => learner.id !== learnerId));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(
        selectedLearners.map(id => 
          axios.delete(`http://localhost:4000/api/v1/learners/${id}`)
        )
      );
      setLearners(learners.filter(learner => !selectedLearners.includes(learner.id)));
      setSelectedLearners([]);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSendInvitationToLearner = (learner) => {
    if (onOpenInvitationModal) {
      onOpenInvitationModal(selectedGrade, [learner]);
    }
  };

  const handleBulkInvitation = () => {
    if (onOpenInvitationModal && selectedLearners.length > 0) {
      const selectedLearnerObjects = learners.filter(learner => 
        selectedLearners.includes(learner.id)
      );
      onOpenInvitationModal(selectedGrade, selectedLearnerObjects);
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    switch (status) {
      case 'active':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'inactive':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-ZA');
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">
              Error loading learners: {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      {/* Header */}
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Learners {selectedGrade && `in ${selectedGrade.name}`}
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              {learners.length} learners found
            </p>
          </div>
          
          {/* Bulk Actions */}
          {selectedLearners.length > 0 && (
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-500">
                {selectedLearners.length} selected
              </span>
              <button 
                className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                onClick={() => {
                  // Implement bulk email functionality
                }}
              >
                <FiMail className="mr-1 h-4 w-4" />
                Email
              </button>
              <button 
                className="inline-flex items-center px-3 py-1 border border-green-300 shadow-sm text-sm leading-4 font-medium rounded-md text-green-700 bg-white hover:bg-green-50"
                onClick={handleBulkInvitation}
              >
                <FiMail className="mr-1 h-4 w-4" />
                Invite Selected
              </button>
              <button 
                className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                onClick={handleBulkDelete}
              >
                <FiTrash2 className="mr-1 h-4 w-4" />
                Remove
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedLearners.length === learners.length && learners.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center">
                  Name
                  {sortField === 'name' && (
                    <span className="ml-1">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Age
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Parent/Guardian
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('enrollment_date')}
              >
                <div className="flex items-center">
                  Enrollment Date
                  {sortField === 'enrollment_date' && (
                    <span className="ml-1">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center">
                  Status
                  {sortField === 'status' && (
                    <span className="ml-1">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {learners.length > 0 ? (
              learners.map((learner) => (
                <tr key={learner.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedLearners.includes(learner.id)}
                      onChange={() => handleSelectLearner(learner.id)}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <FiUser className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {learner.first_name} {learner.last_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {learner.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {learner.accession_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {calculateAge(learner.date_of_birth)} years
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {learner.guardian_info?.[0]?.name || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {learner.guardian_info?.[0]?.email || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <a 
                        href={`tel:${learner.guardian_info?.[0]?.phone || ''}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <FiPhone className="h-4 w-4" />
                      </a>
                      <a 
                        href={`mailto:${learner.guardian_info?.[0]?.email || ''}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <FiMail className="h-4 w-4" />
                      </a>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <FiCalendar className="mr-1 h-4 w-4 text-gray-400" />
                      {formatDate(learner.enrollment_date)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getStatusBadge(learner.status)}>
                      {learner.status_display || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onSelectLearner(learner)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <FiEye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleSendInvitationToLearner(learner)}
                        className="text-green-600 hover:text-green-900"
                        title="Send Invitation"
                      >
                        <FiMail className="h-4 w-4" />
                      </button>
                      <button
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Edit"
                        onClick={() => {
                          // Implement edit functionality
                        }}
                      >
                        <FiEdit className="h-4 w-4" />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-900"
                        title="Remove"
                        onClick={() => handleDeleteLearner(learner.id)}
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="px-6 py-4 text-center text-sm text-gray-500">
                  No learners found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={learners.length < itemsPerPage}
            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing page <span className="font-medium">{currentPage}</span>
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={learners.length < itemsPerPage}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearnersTable;