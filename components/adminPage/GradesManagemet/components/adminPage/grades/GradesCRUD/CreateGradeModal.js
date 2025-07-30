import React, { useState, useEffect } from 'react';
// Removed react-icons/fi as it's causing a resolution error.
// We will use inline SVG for the icons instead.
import axios from 'axios';

const CreateGradeModal = ({ isOpen, onClose, selectedSchool, schools, onGradeCreated }) => {
  // Log the schools prop to the console
  console.log('Schools prop:', schools);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    grade_level: '',
    capacity: '',
    min_age: '',
    max_age: '',
    academic_year_start: new Date().getFullYear().toString(),
    academic_year_end: (new Date().getFullYear() + 1).toString(),
    fees: '',
    subjects: []
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const gradeOptions = [
    { value: 'R', label: 'Grade R' },
    { value: '1', label: 'Grade 1' },
    { value: '2', label: 'Grade 2' },
    { value: '3', label: 'Grade 3' },
    { value: '4', label: 'Grade 4' },
    { value: '5', label: 'Grade 5' },
    { value: '6', label: 'Grade 6' },
    { value: '7', label: 'Grade 7' },
    { value: '8', label: 'Grade 8' },
    { value: '9', label: 'Grade 9' },
    { value: '10', label: 'Grade 10' },
    { value: '11', label: 'Grade 11' },
    { value: '12', label: 'Grade 12' }
  ];

  const subjectOptions = [
    'Mathematics', 'English', 'Afrikaans', 'Science', 'History',
    'Geography', 'Life Orientation', 'Arts', 'Physical Education',
    'Technology', 'Economics', 'Accounting', 'Business Studies'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubjectToggle = (subject) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Grade name is required';
    }

    if (!formData.grade_level) {
      newErrors.grade_level = 'Grade level is required';
    }

    if (!formData.capacity || parseInt(formData.capacity) <= 0) {
      newErrors.capacity = 'Valid capacity is required';
    }

    if (!formData.academic_year_start || !formData.academic_year_end) {
      newErrors.academic_year = 'Academic year dates are required';
    } else if (parseInt(formData.academic_year_start) >= parseInt(formData.academic_year_end)) {
      newErrors.academic_year = 'Start year must be before end year';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Get the school ID - handle both array and single object cases
    let schoolId;
    if (Array.isArray(schools) && schools.length > 0) {
      schoolId = schools[0].id;
    } else if (schools && schools.id) {
      schoolId = schools.id;
    } else if (selectedSchool && selectedSchool.id) {
      schoolId = selectedSchool.id;
    } else {
      setErrors({ submit: 'No school selected or school ID not found' });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        grade: {
          name: formData.name,
          description: formData.description,
          grade_level: formData.grade_level,
          capacity: parseInt(formData.capacity),
          min_age: formData.min_age ? parseInt(formData.min_age) : null,
          max_age: formData.max_age ? parseInt(formData.max_age) : null,
          fees: formData.fees ? parseFloat(formData.fees) : null,
          academic_year_start: `${formData.academic_year_start}-01-01`,
          academic_year_end: `${formData.academic_year_end}-12-31`,
          curriculum_info: {
            subjects: formData.subjects
          }
        }
      };

      const response = await axios.post(
        `http://localhost:4000/api/v1/schools/${schoolId}/grades`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        }
      );

      if (onGradeCreated) {
        onGradeCreated(response.data);
      }

      // Reset form
      setFormData({
        name: '',
        description: '',
        grade_level: '',
        capacity: '',
        min_age: '',
        max_age: '',
        academic_year_start: new Date().getFullYear().toString(),
        academic_year_end: (new Date().getFullYear() + 1).toString(),
        fees: '',
        subjects: []
      });

      onClose();
    } catch (error) {
      console.error('Error creating grade:', error);
      
      if (error.response && error.response.data) {
        if (error.response.data.errors) {
          setErrors(error.response.data.errors);
        } else {
          setErrors({ submit: error.response.data.message || 'Failed to create grade' });
        }
      } else {
        setErrors({ submit: error.message || 'Failed to create grade' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Create New Grade for {selectedSchool?.schoolName || (Array.isArray(schools) ? schools[0]?.schoolName : schools?.schoolName) || 'School'}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                {/* Inline SVG for Close icon */}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-6 w-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Grade Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.name ? 'border-red-300' : ''
                    }`}
                    placeholder="e.g., Grade 1A"
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                <div>
                  <label htmlFor="grade_level" className="block text-sm font-medium text-gray-700">
                    Grade Level *
                  </label>
                  <select
                    id="grade_level"
                    name="grade_level"
                    value={formData.grade_level}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.grade_level ? 'border-red-300' : ''
                    }`}
                  >
                    <option value="">Select Grade Level</option>
                    {gradeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.grade_level && <p className="mt-1 text-sm text-red-600">{errors.grade_level}</p>}
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Brief description of the grade..."
                  />
                </div>

                <div>
                  <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">
                    Capacity *
                  </label>
                  <input
                    type="number"
                    id="capacity"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    min="1"
                    max="100"
                    className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.capacity ? 'border-red-300' : ''
                    }`}
                    placeholder="Maximum number of learners"
                  />
                  {errors.capacity && <p className="mt-1 text-sm text-red-600">{errors.capacity}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="min_age" className="block text-sm font-medium text-gray-700">
                      Minimum Age
                    </label>
                    <input
                      type="number"
                      id="min_age"
                      name="min_age"
                      value={formData.min_age}
                      onChange={handleInputChange}
                      min="4"
                      max="20"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="max_age" className="block text-sm font-medium text-gray-700">
                      Maximum Age
                    </label>
                    <input
                      type="number"
                      id="max_age"
                      name="max_age"
                      value={formData.max_age}
                      onChange={handleInputChange}
                      min="4"
                      max="20"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="fees" className="block text-sm font-medium text-gray-700">
                    Annual Fees (optional)
                  </label>
                  <input
                    type="number"
                    id="fees"
                    name="fees"
                    value={formData.fees}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="e.g., 1000.00"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="academic_year_start" className="block text-sm font-medium text-gray-700">
                      Academic Year Start *
                    </label>
                    <input
                      type="number"
                      id="academic_year_start"
                      name="academic_year_start"
                      value={formData.academic_year_start}
                      onChange={handleInputChange}
                      min="2020"
                      max="2030"
                      className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                        errors.academic_year ? 'border-red-300' : ''
                      }`}
                    />
                  </div>
                  <div>
                    <label htmlFor="academic_year_end" className="block text-sm font-medium text-gray-700">
                      Academic Year End *
                    </label>
                    <input
                      type="number"
                      id="academic_year_end"
                      name="academic_year_end"
                      value={formData.academic_year_end}
                      onChange={handleInputChange}
                      min="2020"
                      max="2030"
                      className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                        errors.academic_year ? 'border-red-300' : ''
                      }`}
                    />
                  </div>
                  {errors.academic_year && (
                    <p className="col-span-2 mt-1 text-sm text-red-600">{errors.academic_year}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subjects (optional)
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                    {subjectOptions.map(subject => (
                      <label key={subject} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.subjects.includes(subject)}
                          onChange={() => handleSubjectToggle(subject)}
                          className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        />
                        <span className="ml-2 text-sm text-gray-700">{subject}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {errors.submit && (
                  <div className="p-3 bg-red-50 text-red-700 rounded-md">
                    <p className="text-sm">{errors.submit}</p>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse mt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </>
                  ) : (
                    <>
                      {/* Inline SVG for Save icon */}
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="mr-2 h-4 w-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.23 15.23a3.375 3.375 0 004.25-4.25M12 16.5H6.75A2.25 2.25 0 014.5 14.25v-5.5a2.25 2.25 0 012.25-2.25H12m0 11.25v-2.25m0 2.25a2.25 2.25 0 002.25-2.25v-1.375m0-1.125a2.25 2.25 0 012.25-2.25H18" />
                      </svg>
                      Create Grade
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateGradeModal;