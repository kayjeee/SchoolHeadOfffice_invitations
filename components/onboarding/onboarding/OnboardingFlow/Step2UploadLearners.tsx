// components/onboarding/OnboardingFlow/Step2UploadLearners.tsx
import React, { useState, useEffect } from 'react';
import BulkUpload from '../components/BulkUpload';
import { useOnboardingFlow } from '../hooks/useOnboardingFlow';

const Step2UploadLearners = ({ 
  onNext, 
  onBack, 
  isLoading, 
  onUpdateData, 
  school,
  user 
}) => {
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [grades, setGrades] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [isLoadingGrades, setIsLoadingGrades] = useState(true);
  const [gradeError, setGradeError] = useState(null);
  const { updateOnboardingData } = useOnboardingFlow();

  // Fetch grades for the current school
  useEffect(() => {
    const fetchGrades = async () => {
      if (!school?.id) {
        setGradeError('No school selected');
        setIsLoadingGrades(false);
        return;
      }
      
      try {
        setIsLoadingGrades(true);
        setGradeError(null);
        const token = localStorage.getItem('authToken');
        const response = await fetch(
          `http://localhost:4000/api/v1/schools/${school.id}/grades`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (response.ok) {
          const gradesData = await response.json();
          setGrades(gradesData.data?.grades || []);
        } else {
          console.error('Failed to fetch grades');
          setGradeError('Failed to load grades. Please try again.');
        }
      } catch (error) {
        console.error('Error fetching grades:', error);
        setGradeError('Network error. Please check your connection.');
      } finally {
        setIsLoadingGrades(false);
      }
    };

    fetchGrades();
  }, [school]);

  const handleUploadSuccess = (result) => {
    // Update onboarding data with upload results
    if (onUpdateData) {
      onUpdateData({ 
        learnersUploaded: true, 
        uploadResults: result,
        uploadedGrade: selectedGrade
      });
    }
    
    // Close modal and proceed to next step
    setIsBulkUploadOpen(false);
    if (onNext) {
      onNext();
    }
  };

  const downloadTemplate = () => {
    const csvContent =
      'First Name,Last Name,Gender,Phone Number,Tel Number (H)ome,Tel Number (E)mergency,WhatsApp,Telegram,Student ID\n' +
      'John,Smith,Male,+27123456789,+27112223333,+27114445555,+27123456789,@johnsmith,12345\n' +
      'Sarah,Johnson,Female,+27129876543,+27113334444,+27117778888,+27129876543,@sarahjohnson,67890';

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'learners_upload_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleGradeSelection = (grade) => {
    setSelectedGrade(grade);
    setIsBulkUploadOpen(true);
  };

  if (isLoadingGrades) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading grades...</p>
        </div>
      </div>
    );
  }

  if (gradeError) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📚</span>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Unable to Load Grades</h2>
          <p className="text-gray-600 mb-6">{gradeError}</p>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  if (grades.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📚</span>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">No Grades Available</h2>
          <p className="text-gray-600 mb-6">
            You need to create grades before uploading learners. 
            Please go back and create at least one grade for your school.
          </p>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            ← Go Back to Create Grades
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">👥</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Upload Learners to Grades</h2>
        <p className="text-gray-600">Select a grade and upload learners specifically for that class</p>
      </div>

      <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 mb-2 flex items-center">
          <span className="mr-2">ℹ️</span> How it works
        </h3>
        <ol className="text-sm text-blue-700 list-decimal pl-5 space-y-1">
          <li>Select the grade you want to upload learners to</li>
          <li>Download our template to ensure proper formatting</li>
          <li>Upload your learner data using the bulk upload tool</li>
          <li>All uploaded learners will be assigned to the selected grade</li>
        </ol>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {grades.map(grade => (
          <div 
            key={grade.id} 
            className={`border rounded-lg p-5 cursor-pointer transition-all ${
              selectedGrade?.id === grade.id 
                ? 'border-blue-500 bg-blue-50 shadow-md' 
                : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
            }`}
            onClick={() => handleGradeSelection(grade)}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-gray-800">{grade.name}</h3>
                <p className="text-sm text-gray-600">{grade.grade_level}</p>
                {grade.capacity && (
                  <p className="text-xs text-gray-500 mt-1">
                    Capacity: {grade.capacity} students
                  </p>
                )}
              </div>
              <span className={`text-lg ${
                selectedGrade?.id === grade.id ? 'text-blue-600' : 'text-gray-400'
              }`}>→</span>
            </div>
            {grade.description && (
              <p className="text-sm text-gray-500 mt-2">{grade.description}</p>
            )}
          </div>
        ))}
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-8">
        <h3 className="font-semibold text-gray-800 mb-2">Need the template?</h3>
        <p className="text-sm text-gray-600 mb-3">
          Download our CSV template to ensure your data is formatted correctly
        </p>
        <button 
          onClick={downloadTemplate}
          className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors flex items-center"
        >
          <span className="mr-2">⬇️</span>
          Download CSV Template
        </button>
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={onBack}
          className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          disabled={isLoading}
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          disabled={isLoading || !selectedGrade}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Processing...' : 'Continue →'}
        </button>
      </div>

      {/* Bulk Upload Modal */}
      <BulkUpload
        isOpen={isBulkUploadOpen}
        onClose={() => setIsBulkUploadOpen(false)}
        selectedGrade={selectedGrade}
        onUploadSuccess={handleUploadSuccess}
        schools={school ? [school] : []}
      />
    </div>
  );
};

export default Step2UploadLearners;