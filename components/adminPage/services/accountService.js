// services/accountService.js
const API_BASE = 'http://localhost:4000/api/v1';

export const fetchAccounts = async (schoolId, filters = {}) => {
  try {
    // Build query string from filters
    const params = new URLSearchParams();
    params.append('status', filters.status || 'all');
    params.append('search', filters.search || '');
    params.append('grade', filters.grade || 'all');

    const response = await fetch(
      `${API_BASE}/schools/${schoolId}/parents?${params.toString()}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch accounts');
    }

    const data = await response.json();
    
    // Transform the API response to match your frontend structure
    return data.data.map(parent => ({
      id: parent.id,
      status: 'active', // Default status, adjust as needed
      balance: 0, // Default balance, adjust as needed
      parent: {
        name: parent.name,
        email: parent.email,
        phone: parent.phone || '' // Add phone if available
      },
      student: { // This would come from associated student records
        id: parent.student_id || '',
        name: parent.student_name || '',
        grade: parent.student_grade || '',
        avatar: parent.student_avatar || '/default-avatar.png'
      }
    }));
  } catch (error) {
    console.error('Error fetching accounts:', error);
    throw error;
  }
};

export const getAccountById = async (accountId) => {
  try {
    const response = await fetch(`${API_BASE}/accounts/${accountId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch account');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching account:', error);
    throw error;
  }
};

export const updateAccount = async (accountId, updates) => {
  try {
    const response = await fetch(`${API_BASE}/accounts/${accountId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates)
    });
    
    if (!response.ok) {
      throw new Error('Failed to update account');
    }
    return await response.json();
  } catch (error) {
    console.error('Error updating account:', error);
    throw error;
  }
};