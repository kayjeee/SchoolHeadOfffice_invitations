// components/onboarding/OnboardingFlow/Step2UploadLearners.tsx
import React, { useState, useEffect } from 'react';
import BulkUpload from '../components/BulkUpload'; // Adjust path as needed
import { useOnboardingFlow } from '../hooks/useOnboardingFlow';
import { FiUpload, FiDownload } from 'react-icons/fi';

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
  const { updateOnboardingData } = useOnboardingFlow();

  // Fetch grades for the current school
  useEffect(() => {
    const fetchGrades = async () => {
      if (!school?.id) return;
      
      try {
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
          setGrades(gradesData);
        } else {
          console.error('Failed to fetch grades');
        }
      } catch (error) {
        console.error('Error fetching grades:', error);
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
    // Same implementation as in BulkUpload component
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

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">👥</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Upload Learners</h2>
        <p className="text-gray-600">Import your student roster using our template</p>
      </div>

      <div className="space-y-6">
        {/* Grade Selection */}
        {grades.length > 0 && (
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <label htmlFor="grade-select" className="block text-sm font-medium text-gray-700 mb-2">
              Select Grade for Uploaded Learners
            </label>
            <select
              id="grade-select"
              value={selectedGrade?.id || ''}
              onChange={(e) => {
                const gradeId = e.target.value;
                const grade = grades.find(g => g.id === gradeId);
                setSelectedGrade(grade || null);
              }}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a grade</option>
              {grades.map(grade => (
                <option key={grade.id} value={grade.id}>
                  {grade.name} ({grade.grade_level})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-xl">📁</span>
          </div>
          <p className="text-gray-600 mb-4">Upload your learner data using our bulk upload tool</p>
          
          <button 
            onClick={() => setIsBulkUploadOpen(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <FiUpload className="inline mr-2" />
            Open Bulk Upload Tool
          </button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">Download Template</h3>
          <p className="text-sm text-blue-700 mb-3">Ensure your file matches our required format</p>
          <button 
            onClick={downloadTemplate}
            className="px-4 py-2 bg-white border border-blue-300 text-blue-700 rounded-md hover:bg-blue-50 transition-colors"
          >
            <FiDownload className="inline mr-2" />
            Download CSV Template
          </button>
        </div>
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
          disabled={isLoading}
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