import api from './api';

/**
 * Analytics Service - Handles analytics and reporting
 */
export const analyticsService = {
  // Get invite analytics
  getInviteAnalytics: async (filters = {}) => {
    try {
      const response = await api.get('/analytics/invites', {
        params: filters
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching invite analytics:', error);
      throw error;
    }
  },

  // Get PR code analytics
  getPRCodeAnalytics: async (filters = {}) => {
    try {
      const response = await api.get('/analytics/pr-codes', {
        params: filters
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching PR code analytics:', error);
      throw error;
    }
  },

  // Get engagement analytics
  getEngagementAnalytics: async (filters = {}) => {
    try {
      const response = await api.get('/analytics/engagement', {
        params: filters
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching engagement analytics:', error);
      throw error;
    }
  },

  // Get channel performance analytics
  getChannelPerformance: async (filters = {}) => {
    try {
      const response = await api.get('/analytics/channel-performance', {
        params: filters
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching channel performance:', error);
      throw error;
    }
  },

  // Get conversion funnel analytics
  getConversionFunnel: async (filters = {}) => {
    try {
      const response = await api.get('/analytics/conversion-funnel', {
        params: filters
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching conversion funnel:', error);
      throw error;
    }
  },

  // Export analytics data
  exportAnalytics: async (filters = {}, format = 'csv') => {
    try {
      const response = await api.get('/analytics/export', {
        params: { ...filters, format },
        responseType: format === 'csv' ? 'blob' : 'json'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting analytics:', error);
      throw error;
    }
  },

  // Get real-time analytics dashboard
  getDashboard: async (filters = {}) => {
    try {
      const response = await api.get('/analytics/dashboard', {
        params: filters
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      throw error;
    }
  }
};

export default analyticsService;