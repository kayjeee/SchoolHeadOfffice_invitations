// src/services/tripService.js

// Mock data for trips
const mockTrips = [
    {
      id: '1',
      title: 'Museum Field Trip',
      description: 'Visit to the Natural History Museum',
      destination: 'Natural History Museum',
      departureDate: new Date(Date.now() + 86400000 * 14).toISOString(), // 14 days from now
      returnDate: new Date(Date.now() + 86400000 * 14.5).toISOString(),
      cost: 25.50,
      capacity: 40,
      registrationDeadline: new Date(Date.now() + 86400000 * 10).toISOString(),
      requirements: 'Bring packed lunch and comfortable shoes',
      contactPerson: 'Ms. Johnson',
      contactEmail: 'johnson@school.edu',
      contactPhone: '555-123-4567',
      isPublished: true,
      schoolId: 'school-1'
    },
    {
      id: '2',
      title: 'Outdoor Adventure Camp',
      description: '3-day camping trip with outdoor activities',
      destination: 'Green Valley Campsite',
      departureDate: new Date(Date.now() + 86400000 * 30).toISOString(), // 30 days from now
      returnDate: new Date(Date.now() + 86400000 * 33).toISOString(),
      cost: 120.00,
      capacity: 25,
      registrationDeadline: new Date(Date.now() + 86400000 * 20).toISOString(),
      requirements: 'Permission slip required. Pack for all weather conditions.',
      contactPerson: 'Mr. Thompson',
      contactEmail: 'thompson@school.edu',
      isPublished: false,
      schoolId: 'school-1'
    }
  ];
  
  // Simulate API delay
  const simulateDelay = () => new Promise(resolve => setTimeout(resolve, 300));
  
  export const getTrips = async (schoolId) => {
    await simulateDelay();
    return mockTrips.filter(trip => trip.schoolId === schoolId);
  };
  
  export const createTrip = async (tripData) => {
    await simulateDelay();
    const newTrip = {
      ...tripData,
      id: Math.random().toString(36).substring(2, 9),
      schoolId: 'school-1' // Default school ID for mock
    };
    mockTrips.push(newTrip);
    return newTrip;
  };
  
  export const updateTrip = async (id, tripData) => {
    await simulateDelay();
    const index = mockTrips.findIndex(t => t.id === id);
    if (index >= 0) {
      mockTrips[index] = { ...mockTrips[index], ...tripData };
      return mockTrips[index];
    }
    throw new Error('Trip not found');
  };
  
  export const deleteTrip = async (id) => {
    await simulateDelay();
    const index = mockTrips.findIndex(t => t.id === id);
    if (index >= 0) {
      mockTrips.splice(index, 1);
      return { id };
    }
    throw new Error('Trip not found');
  };