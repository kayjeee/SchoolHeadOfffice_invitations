import api from './api';

/**
 * Invitation Service - Handles all invite-related API calls
 * Updated to work with PR code integration and user information
 */
export const invitationService = {
  // Create a new invitation - UPDATED FOR PR CODE INTEGRATION AND USER DATA
  createInvite: async (inviteData) => {
    try {
      console.log('[invitationService] createInvite payload:', inviteData);
      
      // Helper function to resolve Auth0 ID from various user object formats
      const resolveUserId = (user) => {
        // Auth0 typically uses 'sub' field, but check various possibilities
        return user?.sub || user?.auth0_id || user?.id || user?.userId || user?.user_id || null;
      };

      const requestData = {
        invite: {
          recipient_type: inviteData.recipientType,
          recipient_email: inviteData.recipientEmail,
          recipient_phone: inviteData.recipientPhone,
          recipient_name: inviteData.recipientName,
          channels: inviteData.channels,
          custom_message: inviteData.customMessage,
          pr_code: inviteData.prCode, // This should match the PR code created earlier
          school_id: inviteData.schoolId,
          grade_id: inviteData.gradeId,
          scheduled_at: inviteData.scheduledDate,
          send_immediately: inviteData.sendImmediately,
          
          // Auth0 ID from user - matches your curl example format
          auth0_id: inviteData.userId || resolveUserId(inviteData.user)
        }
      };

      console.log('[invitationService] formatted request:', requestData);
      
      const response = await api.post('/invites', requestData);
      console.log('[invitationService] createInvite success:', response.data);
      return response.data;
    } catch (error) {
      console.error('[invitationService] API Error:', error.response?.status, error.response?.data);
      throw error;
    }
  },

  // Get a single invitation
  getInvite: async (inviteId) => {
    try {
      const response = await api.get(`/invites/${inviteId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching invite:', error);
      throw error;
    }
  },

  // Update an existing invitation
  updateInvite: async (inviteId, updates) => {
    try {
      const response = await api.put(`/invites/${inviteId}`, {
        invite: updates
      });
      return response.data;
    } catch (error) {
      console.error('Error updating invite:', error);
      throw error;
    }
  },

  // Delete an invitation
  deleteInvite: async (inviteId) => {
    try {
      const response = await api.delete(`/invites/${inviteId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting invite:', error);
      throw error;
    }
  },

  // Get invitations by user (if you need to query by creator)
  getInvitesByUser: async (userId) => {
    try {
      const response = await api.get(`/invites?created_by_user_id=${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching invites by user:', error);
      throw error;
    }
  },

  // Get invitations by school (with optional user filter)
  getInvitesBySchool: async (schoolId, userId = null) => {
    try {
      let url = `/invites?school_id=${schoolId}`;
      if (userId) {
        url += `&created_by_user_id=${userId}`;
      }
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching invites by school:', error);
      throw error;
    }
  }
};

export default invitationService;