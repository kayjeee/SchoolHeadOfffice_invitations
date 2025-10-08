import api from './api';

/**
 * PR Code Service - Handles PR code generation and management
 * Updated to match Rails backend expectations
 */
export const prCodeService = {
  // Create a new PR code - UPDATED FOR RAILS
  createPRCode: async (prCodeData) => {
    try {
      console.log('[prCodeService] createPRCode payload:', prCodeData);
      
      // Format the data to match Rails strong parameters
      const requestData = {
        pr_code: {
          code: prCodeData.code,
          recipient_type: prCodeData.recipientType,
          recipient_name: prCodeData.recipientName,
          recipient_email: prCodeData.recipientEmail,
          recipient_phone: prCodeData.recipientPhone,
          school_id: prCodeData.schoolId,
          invite_id: prCodeData.inviteId || null,
          // Include metadata as JSON string if needed, or as nested attributes
          metadata: prCodeData.metadata ? JSON.stringify(prCodeData.metadata) : null
        }
      };

      console.log('[prCodeService] formatted request:', requestData);
      
      const response = await api.post('/pr_codes', requestData);
      console.log('[prCodeService] createPRCode success:', response.data);
      return response.data;
    } catch (error) {
      console.error('[prCodeService] API Error:', error.response?.status, error.response?.data);
      
      // Log detailed validation errors if available
      if (error.response?.status === 422 && error.response?.data?.errors) {
        console.error('[prCodeService] Validation errors:', error.response.data.errors);
      }
      
      throw error;
    }
  },

  // Get all PR codes with optional filters
  getPRCodes: async (filters = {}) => {
    try {
      const response = await api.get('/pr_codes', {
        params: filters
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching PR codes:', error);
      throw error;
    }
  },

  // Get a specific PR code
  getPRCode: async (code) => {
    try {
      const response = await api.get(`/pr_codes/${code}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching PR code:', error);
      throw error;
    }
  },

  // Delete a PR code
  deletePRCode: async (code) => {
    try {
      const response = await api.delete(`/pr_codes/${code}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting PR code:', error);
      throw error;
    }
  },

  // Validate PR code (for redemption)
  validatePRCode: async (code) => {
    try {
      const response = await api.get(`/pr_codes/${code}/validate`);
      return response.data;
    } catch (error) {
      console.error('Error validating PR code:', error);
      throw error;
    }
  },

  // Redeem PR code (mark as used)
  redeemPRCode: async (code, userData) => {
    try {
      const response = await api.post(`/pr_codes/${code}/redeem`, {
        user: userData
      });
      return response.data;
    } catch (error) {
      console.error('Error redeeming PR code:', error);
      throw error;
    }
  },

  // Generate QR code for PR code
  generateQRCode: async (code, options = {}) => {
    try {
      const response = await api.post(`/pr_codes/${code}/qrcode`, {
        qr_code: options
      });
      return response.data;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw error;
    }
  }
};

export default prCodeService;