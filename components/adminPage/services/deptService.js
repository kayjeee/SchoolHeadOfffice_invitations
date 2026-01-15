// services/debtService.js
import { API_CONFIG } from "../../../lib/config/api";

const API_BASE_URL = API_CONFIG.CLIENT_API_BASE;

export const fetchDebtSummary = async (schoolId) => {
  const response = await fetch(`${API_BASE_URL}/api/v1/schools/${schoolId}/debt_summary`);
  if (!response.ok) throw new Error('Failed to fetch debt summary');
  return await response.json();
};

export const fetchDebtors = async (schoolId) => {
  const response = await fetch(`${API_BASE_URL}/api/v1/schools/${schoolId}/debtors`);
  if (!response.ok) throw new Error('Failed to fetch debtors');
  return await response.json();
};

export const getDebtorById = async (schoolId, accountId) => {
  const response = await fetch(`${API_BASE_URL}/api/v1/schools/${schoolId}/accounts/${accountId}`);
  if (!response.ok) throw new Error('Failed to fetch account');
  return await response.json();
};

export const processPayment = async (schoolId, accountId, paymentData) => {
  const response = await fetch(`${API_BASE_URL}/api/v1/schools/${schoolId}/accounts/${accountId}/payments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(paymentData),
  });
  if (!response.ok) throw new Error('Failed to process payment');
  return await response.json();
};
