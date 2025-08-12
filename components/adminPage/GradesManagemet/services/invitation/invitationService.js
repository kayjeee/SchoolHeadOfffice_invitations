/**
 * InvitationService - Handles all invitation-related API calls and business logic
 * This service abstracts the backend communication for invitation operations
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

class InvitationService {
  /**
   * Get available recipients for a specific grade
   * @param {string} gradeId - The grade ID
   * @returns {Promise<Array>} List of available recipients
   */
  async getAvailableRecipients(gradeId) {
    try {
      const response = await fetch(`${API_BASE_URL}/grades/${gradeId}/recipients`);
      if (!response.ok) {
        throw new Error('Failed to fetch recipients');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching recipients:', error);
      throw error;
    }
  }

  /**
   * Get invitation templates
   * @returns {Promise<Array>} List of available templates
   */
  async getInvitationTemplates() {
    try {
      const response = await fetch(`${API_BASE_URL}/invitation-templates`);
      if (!response.ok) {
        throw new Error('Failed to fetch templates');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching templates:', error);
      throw error;
    }
  }

  /**
   * Get available variables for message personalization
   * @returns {Promise<Array>} List of available variables
   */
  async getAvailableVariables() {
    try {
      const response = await fetch(`${API_BASE_URL}/invitation-variables`);
      if (!response.ok) {
        throw new Error('Failed to fetch variables');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching variables:', error);
      // Return default variables if API fails
      return this.getDefaultVariables();
    }
  }

  /**
   * Get a sample recipient for preview purposes
   * @returns {Promise<Object>} Sample recipient data
   */
  async getSampleRecipient() {
    try {
      const response = await fetch(`${API_BASE_URL}/sample-recipient`);
      if (!response.ok) {
        throw new Error('Failed to fetch sample recipient');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching sample recipient:', error);
      // Return default sample data
      return {
        id: 'sample-1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        grade: 'Grade 10',
        school: 'Sample School',
        firstName: 'John',
        lastName: 'Doe'
      };
    }
  }

  /**
   * Send invitation to recipients
   * @param {Object} invitationData - The invitation data
   * @returns {Promise<Object>} Send result
   */
  async sendInvitation(invitationData) {
    try {
      const response = await fetch(`${API_BASE_URL}/invitations/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invitationData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send invitation');
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending invitation:', error);
      throw error;
    }
  }

  /**
   * Schedule invitation for later sending
   * @param {Object} invitationData - The invitation data with schedule info
   * @returns {Promise<Object>} Schedule result
   */
  async scheduleInvitation(invitationData) {
    try {
      const response = await fetch(`${API_BASE_URL}/invitations/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invitationData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to schedule invitation');
      }

      return await response.json();
    } catch (error) {
      console.error('Error scheduling invitation:', error);
      throw error;
    }
  }

  /**
   * Save invitation as draft
   * @param {Object} draftData - The draft invitation data
   * @returns {Promise<Object>} Save result
   */
  async saveDraft(draftData) {
    try {
      const response = await fetch(`${API_BASE_URL}/invitations/drafts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(draftData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save draft');
      }

      return await response.json();
    } catch (error) {
      console.error('Error saving draft:', error);
      throw error;
    }
  }

  /**
   * Send test invitation
   * @param {Object} testData - Test invitation data
   * @returns {Promise<Object>} Test result
   */
  async sendTestInvitation(testData) {
    try {
      const response = await fetch(`${API_BASE_URL}/invitations/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send test invitation');
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending test invitation:', error);
      throw error;
    }
  }

  /**
   * Get invitation sending status
   * @param {string} invitationId - The invitation ID
   * @returns {Promise<Object>} Status information
   */
  async getInvitationStatus(invitationId) {
    try {
      const response = await fetch(`${API_BASE_URL}/invitations/${invitationId}/status`);
      if (!response.ok) {
        throw new Error('Failed to fetch invitation status');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching invitation status:', error);
      throw error;
    }
  }

  /**
   * Get user's invitation credits
   * @returns {Promise<Object>} Credits information
   */
  async getInvitationCredits() {
    try {
      const response = await fetch(`${API_BASE_URL}/user/invitation-credits`);
      if (!response.ok) {
        throw new Error('Failed to fetch invitation credits');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching invitation credits:', error);
      throw error;
    }
  }

  /**
   * Validate invitation data before sending
   * @param {Object} invitationData - The invitation data to validate
   * @returns {Object} Validation result
   */
  validateInvitationData(invitationData) {
    const errors = {};

    // Validate recipients
    if (!invitationData.recipients || invitationData.recipients.length === 0) {
      errors.recipients = 'At least one recipient is required';
    }

    // Validate subject
    if (!invitationData.subject || invitationData.subject.trim().length === 0) {
      errors.subject = 'Subject is required';
    } else if (invitationData.subject.length > 200) {
      errors.subject = 'Subject must be 200 characters or less';
    }

    // Validate message
    if (!invitationData.message || invitationData.message.trim().length === 0) {
      errors.message = 'Message content is required';
    }

    // Validate scheduling
    if (!invitationData.sendImmediately && !invitationData.scheduledDate) {
      errors.scheduling = 'Scheduled date is required when not sending immediately';
    }

    if (invitationData.scheduledDate) {
      const scheduledDate = new Date(invitationData.scheduledDate);
      const now = new Date();
      
      if (scheduledDate <= now) {
        errors.scheduling = 'Scheduled date must be in the future';
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Get default variables when API is not available
   * @returns {Array} Default variables
   */
  getDefaultVariables() {
    return [
      {
        key: 'name',
        name: 'Full Name',
        description: 'Recipient\'s full name',
        category: 'personal',
        example: 'John Doe',
        isCommon: true
      },
      {
        key: 'first_name',
        name: 'First Name',
        description: 'Recipient\'s first name',
        category: 'personal',
        example: 'John',
        isCommon: true
      },
      {
        key: 'last_name',
        name: 'Last Name',
        description: 'Recipient\'s last name',
        category: 'personal',
        example: 'Doe',
        isCommon: false
      },
      {
        key: 'email',
        name: 'Email Address',
        description: 'Recipient\'s email address',
        category: 'personal',
        example: 'john.doe@example.com',
        isCommon: false
      },
      {
        key: 'grade',
        name: 'Grade',
        description: 'Student\'s grade level',
        category: 'academic',
        example: 'Grade 10',
        isCommon: true
      },
      {
        key: 'school',
        name: 'School Name',
        description: 'Name of the school',
        category: 'academic',
        example: 'Lincoln High School',
        isCommon: true
      },
      {
        key: 'date',
        name: 'Current Date',
        description: 'Today\'s date',
        category: 'system',
        example: new Date().toLocaleDateString(),
        isCommon: false
      },
      {
        key: 'time',
        name: 'Current Time',
        description: 'Current time',
        category: 'system',
        example: new Date().toLocaleTimeString(),
        isCommon: false
      }
    ];
  }
}

// Create and export a singleton instance
export const invitationService = new InvitationService();
export default invitationService;

