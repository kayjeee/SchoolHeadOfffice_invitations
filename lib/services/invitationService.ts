
import { logger } from '../utils/logger';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

interface BulkInvitationParams {
  invitations: {
    phone_number: string;
    parent_name?: string;
    learner_number?: string;
  }[];
  school_id: string;
  sender_id?: string;
  userEmail?: string;
}

class InvitationService {
  private invitationsURL: string;

  constructor() {
    this.invitationsURL = `${API_BASE_URL}/api/v1/invitations`;
  }

  async createBulkInvitations(params: BulkInvitationParams): Promise<any> {
    const { invitations, school_id, sender_id, userEmail } = params;

    if (!invitations || invitations.length === 0) {
      throw new Error('Invitations array cannot be empty.');
    }

    const payload = {
      invitations,
      school_id,
      sender_id,
      role: 'parent',
      invited_via: 'whatsapp',
    };

    try {
      const response = await fetch(`${this.invitationsURL}/bulk_create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': userEmail || 'system@schoolheadoffice.com',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Bulk invitation failed');
      }

      return data;
    } catch (error) {
      logger.error('createBulkInvitations', 'Error creating bulk invitations', {
        error,
      });
      throw error;
    }
  }
}

export default new InvitationService();
