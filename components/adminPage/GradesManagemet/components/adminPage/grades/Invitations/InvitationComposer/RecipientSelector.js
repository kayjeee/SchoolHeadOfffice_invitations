import React, { useState, useEffect } from 'react';
import { GraduationCap, MessageCircle, Users, Search, Filter } from 'lucide-react';

const RecipientSelector = ({ 
  gradeId, 
  grades = [], 
  selectedGrade, 
  selectedRecipients = [], 
  onGradeSelect, 
  onRecipientsChange, 
  error 
}) => {
  const [recipients, setRecipients] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [errorState, setErrorState] = useState(null);
  const [showRecipientDetails, setShowRecipientDetails] = useState(false);

  // Fetch recipients when a grade is selected
  useEffect(() => {
    if (selectedGrade || gradeId) {
      fetchRecipients();
    } else {
      setRecipients([]);
      setFiltered([]);
    }
  }, [selectedGrade?.id, gradeId]);

  // Filter recipients based on search and status
  useEffect(() => {
    let results = recipients;
    if (search) {
      results = results.filter(r => 
        r.name.toLowerCase().includes(search.toLowerCase()) || 
        r.email.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (statusFilter !== 'all') {
      results = results.filter(r => 
        statusFilter === 'invited' ? r.status === 'invited' : r.status !== 'invited'
      );
    }
    setFiltered(results);
  }, [recipients, search, statusFilter]);

  const fetchRecipients = async () => {
    try {
      setIsLoading(true);
      // Simulate API call - replace with actual service call
      const mockRecipients = Array.from({ length: 25 }, (_, i) => ({
        id: `recipient-${i}`,
        name: `Parent ${i + 1}`,
        email: `parent${i + 1}@example.com`,
        phone: `+27 ${String(Math.floor(Math.random() * 900000000) + 100000000)}`,
        status: Math.random() > 0.7 ? 'invited' : 'not-invited',
        studentName: `Student ${i + 1}`
      }));
      setRecipients(mockRecipients);
      setFiltered(mockRecipients);
      setErrorState(null);
    } catch (err) {
      setErrorState('Failed to load recipients');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRecipient = (recipient) => {
    const isSelected = selectedRecipients.some(r => r.id === recipient.id);
    if (isSelected) {
      onRecipientsChange?.(selectedRecipients.filter(r => r.id !== recipient.id));
    } else {
      onRecipientsChange?.([...selectedRecipients, recipient]);
    }
  };

  const toggleAll = () => {
    const allSelected = filtered.every(r => selectedRecipients.some(s => s.id === r.id));
    if (allSelected) {
      onRecipientsChange?.(selectedRecipients.filter(r => !filtered.some(f => f.id === r.id)));
    } else {
      const toAdd = filtered.filter(r => !selectedRecipients.some(s => s.id === r.id));
      onRecipientsChange?.([...selectedRecipients, ...toAdd]);
    }
  };

  const handleGradeSelection = (grade) => {
    onGradeSelect?.(grade);
    setShowRecipientDetails(true);
  };

  // If no grade is selected and we have grades to choose from
  if (!selectedGrade && !gradeId && grades.length > 0) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <GraduationCap className="mr-2" size={24} />
          Select a Grade to send invitations
        </h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {grades.map((grade) => (
            <button
              key={grade.id}
              onClick={() => handleGradeSelection(grade)}
              className="p-6 rounded-lg border-2 text-left transition-all hover:shadow-md hover:scale-105 bg-white border-gray-200 hover:border-blue-300"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <GraduationCap className="text-blue-600 mr-2" size={20} />
                  <h3 className="font-semibold text-gray-900">{grade.name}</h3>
                </div>
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  {grade.level}
                </span>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <Users size={14} className="mr-2" />
                  <span>{grade.studentCount || 0} students</span>
                </div>
                <div className="flex items-center">
                  <MessageCircle size={14} className="mr-2" />
                  <span>{grade.parentCount || 0} parents</span>
                </div>
              </div>
              
              {grade.description && (
                <p className="mt-3 text-xs text-gray-500 line-clamp-2">
                  {grade.description}
                </p>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Show recipient selection interface
  return (
    <div className="space-y-4">
      {/* Header with selected grade info */}
      {selectedGrade && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <GraduationCap className="text-blue-600 mr-2" size={20} />
              <div>
                <h3 className="font-semibold text-gray-900">{selectedGrade.name}</h3>
                <p className="text-sm text-gray-600">
                  {selectedGrade.studentCount} students • {selectedGrade.parentCount} parents
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                onGradeSelect?.(null);
                setShowRecipientDetails(false);
              }}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Change Grade
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium flex items-center">
          <Users className="mr-2" size={20} />
          Select Recipients
        </h3>
        <p className="text-sm text-gray-500">
          {selectedRecipients.length} of {recipients.length} selected
        </p>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        </div>
        
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none border border-gray-300 rounded-lg px-8 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            <option value="all">All Status</option>
            <option value="invited">Invited</option>
            <option value="not-invited">Not Invited</option>
          </select>
          <Filter className="absolute left-2 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
        
        <button
          onClick={toggleAll}
          disabled={filtered.length === 0}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {filtered.every(r => selectedRecipients.some(s => s.id === r.id)) ? 'Deselect All' : 'Select All'}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center p-8">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-2 text-gray-600">Loading recipients...</p>
        </div>
      )}

      {/* Error State */}
      {errorState && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{errorState}</p>
          <button 
            onClick={fetchRecipients}
            className="mt-2 px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
          >
            Retry
          </button>
        </div>
      )}

      {/* Recipients List */}
      {!isLoading && !errorState && (
        <div className="border border-gray-200 rounded-lg divide-y divide-gray-200 max-h-96 overflow-y-auto bg-white">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Users className="mx-auto mb-3 text-gray-300" size={48} />
              <p className="text-lg font-medium">No recipients found</p>
              <p className="text-sm">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            filtered.map(recipient => (
              <div 
                key={recipient.id} 
                className={`flex items-center p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                  selectedRecipients.some(r => r.id === recipient.id) ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                }`}
                onClick={() => toggleRecipient(recipient)}
              >
                <input
                  type="checkbox"
                  checked={selectedRecipients.some(r => r.id === recipient.id)}
                  onChange={() => toggleRecipient(recipient)}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  onClick={(e) => e.stopPropagation()}
                />
                
                <div className="ml-4 flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {recipient.name}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {recipient.email}
                      </p>
                      {recipient.studentName && (
                        <p className="text-xs text-gray-400">
                          Parent of {recipient.studentName}
                        </p>
                      )}
                    </div>
                    
                    <div className="ml-4 flex flex-col items-end space-y-1">
                      <span className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${
                        recipient.status === 'invited' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {recipient.status === 'invited' ? 'Previously Invited' : 'Not Invited'}
                      </span>
                      
                      {recipient.phone && (
                        <p className="text-xs text-gray-400">{recipient.phone}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Summary */}
      {selectedRecipients.length > 0 && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            <span className="font-medium">{selectedRecipients.length} recipients</span> selected for invitation
          </p>
        </div>
      )}
    </div>
  );
};

export default RecipientSelector;