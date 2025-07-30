// services/debtService.js
const API_BASE = 'http://localhost:4000/api/v1';

export const fetchDebtSummary = async (schoolId) => {
  const response = await fetch(`${API_BASE}/schools/${schoolId}/debt_summary`);
  if (!response.ok) throw new Error('Failed to fetch debt summary');
  return await response.json();
};

export const fetchDebtors = async (schoolId) => {
  const response = await fetch(`${API_BASE}/schools/${schoolId}/debtors`);
  if (!response.ok) throw new Error('Failed to fetch debtors');
  return await response.json();
};

export const getDebtorById = async (schoolId, accountId) => {
  const response = await fetch(`${API_BASE}/schools/${schoolId}/accounts/${accountId}`);
  if (!response.ok) throw new Error('Failed to fetch account');
  return await response.json();
};

export const processPayment = async (schoolId, accountId, paymentData) => {
  const response = await fetch(`${API_BASE}/schools/${schoolId}/accounts/${accountId}/payments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(paymentData),
  });
  if (!response.ok) throw new Error('Failed to process payment');
  return await response.json();
};