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
    const response = await fetch(`${this.config.apiBaseUrl}/invites/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.config.apiKey && { Authorization: `Bearer ${this.config.apiKey}` }),
      },
      body: JSON.stringify({
        learnerIds: request.learners.map(l => l.id),
        channel: request.channel.id,
        message: request.message,
      }),
    });

    if (!response.ok) throw new Error(`Failed to send invites: ${response.statusText}`);
    return response.json();
  }

  /**
   * Resend a specific invite
   */
  async resendInvite(inviteId: string): Promise<Invite> {
    const response = await fetch(`${this.config.apiBaseUrl}/invites/${inviteId}/resend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.config.apiKey && { Authorization: `Bearer ${this.config.apiKey}` }),
      },
    });

    if (!response.ok) throw new Error(`Failed to resend invite: ${response.statusText}`);
    return response.json();
  }

  /**
   * Cancel a specific invite
   */
  async cancelInvite(inviteId: string): Promise<void> {
    const response = await fetch(`${this.config.apiBaseUrl}/invites/${inviteId}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.config.apiKey && { Authorization: `Bearer ${this.config.apiKey}` }),
      },
    });

    if (!response.ok) throw new Error(`Failed to cancel invite: ${response.statusText}`);
  }

  /**
   * Get invite status and details
   */
  async getInvite(inviteId: string): Promise<Invite> {
    const response = await fetch(`${this.config.apiBaseUrl}/invites/${inviteId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(this.config.apiKey && { Authorization: `Bearer ${this.config.apiKey}` }),
      },
    });

    if (!response.ok) throw new Error(`Failed to get invite: ${response.statusText}`);
    return response.json();
  }

  /**
   * Get all invites (optionally filter by batchId)
   */
  async getInvites(batchId?: string): Promise<Invite[]> {
    const url = batchId
      ? `${this.config.apiBaseUrl}/invites?batchId=${batchId}`
      : `${this.config.apiBaseUrl}/invites`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(this.config.apiKey && { Authorization: `Bearer ${this.config.apiKey}` }),
      },
    });

    if (!response.ok) throw new Error(`Failed to get invites: ${response.statusText}`);
    return response.json();
  }

  /**
   * Update invite status
   */
  async updateInviteStatus(inviteId: string, status: InviteStatus, metadata?: any): Promise<Invite> {
    const response = await fetch(`${this.config.apiBaseUrl}/invites/${inviteId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(this.config.apiKey && { Authorization: `Bearer ${this.config.apiKey}` }),
      },
      body: JSON.stringify({ status, metadata }),
    });

    if (!response.ok) throw new Error(`Failed to update invite status: ${response.statusText}`);
    return response.json();
  }

  /**
   * Generate invite preview
   */
  async previewInvite(request: {
    learnerId: string;
    channel: InviteChannel;
    message: InviteMessage;
  }): Promise<{ preview: string; estimatedDelivery: string }> {
    const response = await fetch(`${this.config.apiBaseUrl}/invites/preview`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.config.apiKey && { Authorization: `Bearer ${this.config.apiKey}` }),
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) throw new Error(`Failed to generate preview: ${response.statusText}`);
    return response.json();
  }

  /**
   * Generate PR Code for enrollment
   */
  async generatePrCode(schoolId: string, gradeId: string, purpose: string = 'enrollment') {
    const response = await fetch(`${this.config.apiBaseUrl}/schools/${schoolId}/pr_codes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.config.apiKey && { Authorization: `Bearer ${this.config.apiKey}` }),
      },
      body: JSON.stringify({
        pr_code: {
          purpose,
          metadata: {
            grade_id: gradeId,
            academic_year: '2024', // TODO: Make dynamic
          },
        },
      }),
    });

    if (!response.ok) throw new Error('Failed to generate PR code');
    const data = await response.json();
    return data.pr_code;
  }
}

// Default instance with local API
export const inviteService = new InviteService({
  apiBaseUrl: 'http://localhost:4000/api/v1',
});

export default InviteService;
