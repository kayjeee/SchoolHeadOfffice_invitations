// src/services/eventService.js

// Mock data for events
const mockEvents = [
  {
    id: '1',
    title: 'School Science Fair',
    description: 'Annual science fair showcasing student projects',
    startDate: new Date(Date.now() + 86400000 * 3).toISOString(),
    endDate: new Date(Date.now() + 86400000 * 3.5).toISOString(),
    location: 'School Gymnasium',
    isPublic: true,
    targetAudience: 'all',
    schoolId: 'school1'
  },
  // Add more mock events as needed
];

// Simulate API delay
const simulateDelay = () => new Promise(resolve => setTimeout(resolve, 300));

// Named exports
export const getEvents = async (schoolId) => {
  await simulateDelay();
  return mockEvents.filter(event => event.schoolId === schoolId);
};

export const createEvent = async (eventData) => {
  await simulateDelay();
  const newEvent = {
    ...eventData,
    id: Math.random().toString(36).substring(2, 9),
    schoolId: eventData.schoolId || 'school1'
  };
  mockEvents.push(newEvent);
  return newEvent;
};

export const updateEvent = async (id, eventData) => {
  await simulateDelay();
  const index = mockEvents.findIndex(e => e.id === id);
  if (index >= 0) {
    mockEvents[index] = { ...mockEvents[index], ...eventData };
    return mockEvents[index];
  }
  throw new Error('Event not found');
};

export const deleteEvent = async (id) => {
  await simulateDelay();
  const index = mockEvents.findIndex(e => e.id === id);
  if (index >= 0) {
    mockEvents.splice(index, 1);
    return { id };
  }
  throw new Error('Event not found');
};