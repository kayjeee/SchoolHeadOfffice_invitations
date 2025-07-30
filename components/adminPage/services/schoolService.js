// Mock data for school settings
const mockSchoolSettings = {
    id: 'school-001',
    name: 'Greenwood High School',
    features: {
      onlinePayments: true,
      mealPreOrdering: false,
      eventManagement: true,
      attendanceTracking: false,
      gradebook: true
    },
    branding: {
      schoolName: 'Greenwood High',
      primaryColor: '#3b82f6',
      secondaryColor: '#10b981',
      logo: '/logos/greenwood-high.png',
      theme: 'light'
    },
    updatedAt: new Date().toISOString()
  };
  
  // Mock API function to fetch school settings
  export const fetchSchoolSettings = async (schoolId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          ...mockSchoolSettings,
          id: schoolId
        });
      }, 500); // Simulate network delay
    });
  };
  
  // Mock API function to update school settings
  export const updateSchoolSettings = async (schoolId, settings) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // In a real app, you would send this to your API
        Object.assign(mockSchoolSettings, settings);
        mockSchoolSettings.updatedAt = new Date().toISOString();
        resolve(mockSchoolSettings);
      }, 800); // Simulate network delay
    });
  };
  
  // Additional school-related functions
  export const fetchSchoolDetails = async (schoolId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: schoolId,
          name: 'Greenwood High School',
          address: '123 Education St, Learning City',
          phone: '(555) 123-4567',
          email: 'info@greenwoodhigh.edu',
          website: 'https://greenwoodhigh.edu',
          principal: 'Dr. Sarah Johnson'
        });
      }, 500);
    });
  };