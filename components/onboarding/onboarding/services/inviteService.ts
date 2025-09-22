// components/onboarding/services/inviteService.ts
import { Invite, CreateInviteData } from '../types';

const API_BASE_URL = 'http://localhost:4000/api/v1';

/**
 * Service for handling invitation-related operations
 */
class InviteService {
  private baseUrl = `${API_BASE_URL}/invites`;

  /**
   * Helper method for making API calls
   */
  private async apiCall(endpoint: string, options: RequestInit = {}) {
    try {
      const response = await fetch(endpoint, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API call failed:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Create a new invitation with PR code
   */
  async createInvite(inviteData: CreateInviteData): Promise<Invite> {
    return this.apiCall(this.baseUrl, {
      method: 'POST',
      body: JSON.stringify(inviteData),
    });
  }

  /**
   * Send invitation through specified channels
   */
  async sendInvite(inviteId: string, channels: string[]): Promise<{ success: boolean; message: string }> {
    return this.apiCall(`${this.baseUrl}/${inviteId}/send`, {
      method: 'POST',
      body: JSON.stringify({ channels }),
    });
  }

  /**
   * Resend an existing invitation
   */
  async resendInvite(inviteId: string): Promise<{ success: boolean; message: string }> {
    return this.apiCall(`${this.baseUrl}/${inviteId}/resend`, {
      method: 'POST',
    });
  }

  /**
   * Get invitations for a specific school
   */
  async getInvitesBySchool(schoolId: string, params?: { page?: number; limit?: number }): Promise<{ invites: Invite[]; total: number }> {
    const queryParams = new URLSearchParams();
    queryParams.append('school_id', schoolId);
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    return this.apiCall(`${this.baseUrl}?${queryParams.toString()}`);
  }

  /**
   * Get invitation statistics for a school
   */
  async getInviteStats(schoolId: string): Promise<{
    total: number;
    sent: number;
    pending: number;
    accepted: number;
    expired: number;
    byChannel: { channel: string; count: number }[];
  }> {
    return this.apiCall(`${this.baseUrl}/stats?school_id=${schoolId}`);
  }

  /**
   * Bulk create invitations
   */
  async createBulkInvites(invitesData: CreateInviteData[]): Promise<{ success: number; failed: number; results: Invite[] }> {
    return this.apiCall(`${this.baseUrl}/bulk`, {
      method: 'POST',
      body: JSON.stringify({ invites: invitesData }),
    });
  }

  /**
   * Update invitation status
   */
  async updateInviteStatus(inviteId: string, status: string, reason?: string): Promise<Invite> {
    return this.apiCall(`${this.baseUrl}/${inviteId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reason }),
    });
  }

  /**
   * Validate PR code
   */
  async validatePRCode(prCode: string): Promise<{ valid: boolean; invite?: Invite; message?: string }> {
    return this.apiCall(`${this.baseUrl}/validate/${prCode}`);
  }

  /**
   * Handle errors consistently
   */
  private handleError(error: any): Error {
    if (error instanceof Error) {
      return error;
    }
    return new Error('An unexpected error occurred');
  }
}

// Export singleton instance
export const inviteService = new InviteService();