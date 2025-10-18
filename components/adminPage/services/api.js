// src/services/api.js
const API_BASE = 'http://shobackendv2-production.up.railway.app/api/v1';

export const fetchFromAPI = async (endpoint, options = {}) => {
  const response = await fetch(`${API_BASE}/${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    },
    ...options
  });
  
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }
  
  return response.json();
};