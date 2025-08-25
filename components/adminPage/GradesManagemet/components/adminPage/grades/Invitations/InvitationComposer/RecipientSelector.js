import React, { useState, useEffect } from 'react';
import { GraduationCap, Users, Search, Filter } from 'lucide-react';

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

  // Fetch recipients for the selected grade or gradeId
  useEffect(() => {
    if (selectedGrade || gradeId) {
      fetchRecipients();
    } else {
      setRecipients([]);
      setFiltered([]);
    }
  }, [selectedGrade?.id, gradeId]);

  // Filter recipients based on search term and status
  useEffect(() => {
    let results = recipients;
    if (search.trim()) {
      const lowerSearch = search.toLowerCase();
      results = results.filter(r =>
        r.name.toLowerCase().includes(lowerSearch) ||
        r.email.toLowerCase().includes(lowerSearch)
      );
    }
    if (statusFilter !== 'all') {
      results = results.filter(r =>
        statusFilter === 'invited' ? r.status === 'invited' : r.status !== 'invited'
      );
    }
    setFiltered(results);
  }, [recipients, search, statusFilter]);

  // Simulated API call to fetch recipients, replace with real API
  const fetchRecipients = async () => {
    setIsLoading(true);
    setErrorState(null);
    try {
      const mockRecipients = Array.from({ length: 25 }, (_, i) => ({
        id: `recipient-${i}`,
        name: `Parent ${i + 1}`,
        email: `parent${i + 1}@example.com`,
        phone: `+27 ${Math.floor(Math.random() * 900000000 + 100000000)}`,
        status: Math.random() > 0.7 ? 'invited' : 'not-invited',
        studentName: `Student ${i + 1}`
      }));
      setRecipients(mockRecipients);
      setFiltered(mockRecipients);
    } catch {
      setErrorState('Failed to load recipients');
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle a single recipient selection
  const toggleRecipient = (recipient) => {
    const isSelected = selectedRecipients.some(r => r.id === recipient.id);
    if (isSelected) {
      onRecipientsChange?.(selectedRecipients.filter(r => r.id !== recipient.id));
    } else {
      onRecipientsChange?.([...selectedRecipients, recipient]);
    }
  };

  // Select or deselect all filtered recipients
  const toggleAll = () => {
    const allSelected = filtered.every(r => selectedRecipients.some(s => s.id === r.id));
    if (allSelected) {
      onRecipientsChange?.(selectedRecipients.filter(r => !filtered.some(f => f.id === r.id)));
    } else {
      const toAdd = filtered.filter(r => !selectedRecipients.some(s => s.id === r.id));
      onRecipientsChange?.([...selectedRecipients, ...toAdd]);
    }
  };

  // Handle selecting a grade
  const handleGradeSelection = (grade) => {
    onGradeSelect?.(grade);
  };

  // Show grade selection interface if no grade selected
  if (!selectedGrade && !gradeId) {
    return (
      <section>
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <GraduationCap className="mr-2" size={24} />
          Select a Grade to Manage Recipients
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {grades.map(grade => (
            <button
              key={grade.id}
              onClick={() => handleGradeSelection(grade)}
              className="p-6 rounded-lg border-2 border-gray-200 bg-white hover:border-blue-400 hover:shadow-md transition transform hover:scale-105 text-left"
            >
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center space-x-2">
                  <GraduationCap className="text-blue-600" size={20} />
                  <h3 className="font-semibold text-gray-900">{grade.name}</h3>
                </div>
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  {grade.level}
                </span>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <p><Users size={14} className="inline mr-1" /> {grade.studentCount || 0} students</p>
                <p><Users size={14} className="inline mr-1 rotate-180" /> {grade.parentCount || 0} parents</p>
              </div>
              {grade.description && (
                <p className="mt-3 text-xs text-gray-500 line-clamp-2">{grade.description}</p>
              )}
            </button>
          ))}
        </div>
      </section>
    );
  }

  // Show recipient management interface once grade is selected
  return (
    <section className="space-y-6">
      {/* Grade Header with change option */}
      {selectedGrade && (
        <header className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <GraduationCap className="text-blue-600" size={24} />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{selectedGrade.name}</h3>
              <p className="text-sm text-gray-600">
                {selectedGrade.studentCount} students • {selectedGrade.parentCount} parents
              </p>
            </div>
          </div>
          <button
            onClick={() => onGradeSelect?.(null)}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Change Grade
          </button>
        </header>
      )}

      <div className="flex justify-between items-center">
        <h4 className="text-lg font-medium flex items-center">
          <Users className="mr-2" size={20} /> Select Recipients
        </h4>
        <p className="text-sm text-gray-600">{selectedRecipients.length} of {recipients.length} selected</p>
      </div>

      {/* Search & filter */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full max-w-md">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-9 pr-4 py-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="appearance-none border border-gray-300 rounded-lg px-8 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            <option value="all">All Status</option>
            <option value="invited">Invited</option>
            <option value="not-invited">Not Invited</option>
          </select>
          <Filter className="absolute left-2 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
        </div>
        <button
          onClick={toggleAll}
          disabled={filtered.length === 0}
          className="px-4 py-2 bg-gray-100 rounded-lg text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {filtered.every(r => selectedRecipients.some(s => s.id === r.id)) ? 'Deselect All' : 'Select All'}
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center p-8">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-2 text-gray-600">Loading recipients...</p>
        </div>
      )}

      {/* Error state with retry */}
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
            filtered.map(recipient => {
              const isSelected = selectedRecipients.some(r => r.id === recipient.id);
              return (
                <div
                  key={recipient.id}
                  onClick={() => toggleRecipient(recipient)}
                  className={`cursor-pointer flex items-center p-4 hover:bg-gray-50 transition ${
                    isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleRecipient(recipient)}
                    onClick={e => e.stopPropagation()}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <div className="ml-4 flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{recipient.name}</p>
                    <p className="text-sm text-gray-500 truncate">{recipient.email}</p>
                    {recipient.studentName && (
                      <p className="text-xs text-gray-400">Parent of {recipient.studentName}</p>
                    )}
                  </div>
                  <div className="ml-4 flex flex-col items-end space-y-1">
                    <span
                      className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${
                        recipient.status === 'invited'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {recipient.status === 'invited' ? 'Previously Invited' : 'Not Invited'}
                    </span>
                    {recipient.phone && (
                      <p className="text-xs text-gray-400">{recipient.phone}</p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Selected Recipients Summary */}
      {selectedRecipients.length > 0 && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            <span className="font-medium">{selectedRecipients.length}</span> recipients selected for invitation
          </p>
        </div>
      )}
    </section>
  );
};

export default RecipientSelector;
