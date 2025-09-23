import { Learner, InviteChannel, InviteMessage, Invite, InviteStatus } from '../types';

export interface SendInviteRequest {
  learners: Learner[];
  channel: InviteChannel;
  message: InviteMessage;
}

export interface SendInviteResponse {
  invites: Invite[];
  successCount: number;
  failureCount: number;
}

export interface InviteServiceConfig {
  apiBaseUrl: string;
  apiKey?: string;
}

class InviteService {
  private config: InviteServiceConfig;

  constructor(config: InviteServiceConfig) {
    this.config = config;
  }

  /**
   * Send invites to multiple learners
   */
  async sendInvites(request: SendInviteRequest): Promise<SendInviteResponse> {
    try {
      const response = await fetch(`${this.config.apiBaseUrl}/invites/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
        },
        body: JSON.stringify({
          learnerIds: request.learners.map(l => l.id),
          channel: request.channel.id,
          message: request.message
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to send invites: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error sending invites:', error);
      throw error;
    }
  }

  /**
   * Resend a specific invite
   */
  async resendInvite(inviteId: string): Promise<Invite> {
    try {
      const response = await fetch(`${this.config.apiBaseUrl}/invites/${inviteId}/resend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to resend invite: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error resending invite:', error);
      throw error;
    }
  }

  /**
   * Cancel a specific invite
   */
  async cancelInvite(inviteId: string): Promise<void> {
    try {
      const response = await fetch(`${this.config.apiBaseUrl}/invites/${inviteId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to cancel invite: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error canceling invite:', error);
      throw error;
    }
  }

  /**
   * Get invite status and details
   */
  async getInvite(inviteId: string): Promise<Invite> {
    try {
      const response = await fetch(`${this.config.apiBaseUrl}/invites/${inviteId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get invite: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting invite:', error);
      throw error;
    }
  }

  /**
   * Get all invites for a specific batch or session
   */
  async getInvites(batchId?: string): Promise<Invite[]> {
    try {
      const url = batchId 
        ? `${this.config.apiBaseUrl}/invites?batchId=${batchId}`
        : `${this.config.apiBaseUrl}/invites`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get invites: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting invites:', error);
      throw error;
    }
  }

  /**
   * Update invite status (typically called by webhooks)
   */
  async updateInviteStatus(inviteId: string, status: InviteStatus, metadata?: any): Promise<Invite> {
    try {
      const response = await fetch(`${this.config.apiBaseUrl}/invites/${inviteId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
        },
        body: JSON.stringify({
          status,
          metadata
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to update invite status: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating invite status:', error);
      throw error;
    }
  }

  /**
   * Generate invite preview for testing
   */
  async previewInvite(request: {
    learnerId: string;
    channel: InviteChannel;
    message: InviteMessage;
  }): Promise<{ preview: string; estimatedDelivery: string }> {
    try {
      const response = await fetch(`${this.config.apiBaseUrl}/invites/preview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`Failed to generate preview: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error generating preview:', error);
      throw error;
    }
  }
}

// Default instance with environment configuration
export const inviteService = new InviteService({
    apiBaseUrl: 'http://localhost:4000/api/v1',
});

export default InviteService;

