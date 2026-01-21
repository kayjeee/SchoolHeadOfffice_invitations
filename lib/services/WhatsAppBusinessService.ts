import { nasaLog as logger } from '../nasaLogger';
import InvitationService from './invitationService';

interface InvitationParams {
  phoneNumber: string;
  schoolId: string;
  learnerNumbers?: string[];
  parentName?: string;
  gradeId?: string;
  sender: string;
  userEmail?: string;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'https://shobackendv2-production.up.railway.app';

class WhatsAppBusinessService {
  baseURL: string;
  invitationsURL: string;

  constructor() {
    this.baseURL = '/api/whatsapp-business';
    this.invitationsURL = `${API_BASE_URL}/api/v1/invitations`;
  }

  /* ============================================================
   🔹 STEP 1 – CREATE INVITATION (GET TOKEN)
  ============================================================ */

  async createInvitation({
    phoneNumber,
    schoolId,
    learnerNumbers = [],
    parentName,
    gradeId,
    sender,
    userEmail,
  }: InvitationParams): Promise<string> {
    try {
      logger('INFO', 'WhatsAppService', 'Creating invitation token', {
        phoneNumber,
        schoolId,
      });

      if (!schoolId) throw new Error('schoolId is required');
      if (!phoneNumber) throw new Error('phoneNumber is required');

      const payload = {
        phone_number: phoneNumber,
        school_id: schoolId,
        learner_numbers: learnerNumbers,
        role: 'parent',
        parent_name: parentName ?? null,
        grade_id: gradeId ?? null,
        invited_via: 'whatsapp',
        sender,
      };

      logger('INFO', 'WhatsAppService', 'Sending invitation payload', payload);

      const response = await fetch(this.invitationsURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': userEmail || 'system@schoolheadoffice.com',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      logger('INFO', 'WhatsAppService', 'Invitation response received', {
        status: response.status,
        success: data.success,
        hasToken: !!data.invitation?.token
      });

      if (!response.ok || !data.success) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }

      const token = data.invitation?.token || data.token;

      if (!token) {
        throw new Error('No token returned from API');
      }

      logger('INFO', 'WhatsAppService', 'Token created successfully', {
        token: token.slice(0, 8) + '...',
      });

      return token;
    } catch (error: any) {
      logger('ERROR', 'WhatsAppService', 'Create invitation failed', {
        error: error.message,
      });
      throw error;
    }
  }

  /* ============================================================
   🔹 STEP 2 – BUILD MAGIC LINK (VALIDATED)
  ============================================================ */

  buildMagicLink({ token, schoolName }: { token: string; schoolName: string }) {
    if (!token) {
      throw new Error('Token is required for magic link');
    }
    if (!schoolName) {
      throw new Error('School name is required for magic link');
    }

    // Validate that neither parameter is 'undefined' string
    if (token === 'undefined' || schoolName === 'undefined') {
      throw new Error('Invalid parameters: token or schoolName is undefined');
    }

    const encodedSchool = encodeURIComponent(schoolName);
    const baseUrl = 'https://kayjeee.github.io/Far-North-school/';

    const magicLink = `${baseUrl}?token=${token}&school=${encodedSchool}`;

    logger('INFO', 'WhatsAppService', 'Magic link built', {
      token: token.slice(0, 8) + '...',
      schoolName,
      linkLength: magicLink.length
    });

    // Final validation
    if (magicLink.includes('undefined')) {
      throw new Error('Magic link contains undefined value');
    }

    return magicLink;
  }

  /* ============================================================
   🔹 STEP 3 – BUILD MESSAGE (REMOVED - NOT NEEDED)
  ============================================================ */
  // The template is handled by WhatsApp, no need to build message here

  /* ============================================================
   🔹 STEP 4 – VALIDATE MESSAGE
  ============================================================ */

  validateMessageTemplate(message: string) {
    if (typeof message !== 'string') {
      throw new Error('Message must be string');
    }

    if (message.length === 0) {
      throw new Error('Message cannot be empty');
    }

    if (message.length > 4096) {
      throw new Error('Message too long (max 4096 characters)');
    }

    if (message.match(/[<>]/g)) {
      throw new Error('Invalid characters found in message');
    }

    return true;
  }

  /* ============================================================
   🔹 STEP 5 – SEND TEST MESSAGE
  ============================================================ */

  async sendTestMessage({
    to,
    schoolName,
    grade,
    schoolId,
    userEmail,
    learnerNumber,
    parentName,
    sender_id,
  }: any) {
    try {
      // Validate required fields
      if (!to || !schoolName || !schoolId) {
        throw new Error('Missing required fields: to, schoolName, or schoolId');
      }

      logger('INFO', 'WhatsAppService', 'Starting test message send', {
        to,
        schoolName,
        schoolId
      });

      // Step 1: Create invitation and get token
      const token = await this.createInvitation({
        phoneNumber: to,
        schoolId,
        learnerNumbers: learnerNumber ? [learnerNumber] : [],
        parentName: parentName || 'Parent',
        gradeId: grade?.id,
        sender: sender_id || userEmail,
        userEmail,
      });

      // Step 2: Build magic link
      const magicLink = this.buildMagicLink({
        token,
        schoolName,
      });

      logger('INFO', 'WhatsAppService', 'Magic link created', {
        magicLink: magicLink.substring(0, 50) + '...'
      });

      // Step 3: Send via WhatsApp API
      const response = await fetch(`${this.baseURL}/test-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({
          to,
          schoolName,
          magicLink,
          testType: 'MAGIC_LINK',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        logger('ERROR', 'WhatsAppService', 'Test send failed', {
          status: response.status,
          error: data
        });
        throw new Error(data.error || 'Failed to send test message');
      }

      logger('INFO', 'WhatsAppService', 'Test message sent successfully', {
        messageId: data.messageId
      });

      return { ...data, token, magicLink };
    } catch (error: any) {
      logger('ERROR', 'WhatsAppService', 'Test send failed', {
        error: error.message,
      });
      throw error;
    }
  }

  /* ============================================================
   🔹 STEP 6 – BULK SEND
  ============================================================ */

  async sendBulkMessages({
    gradeIds,
    schoolName,
    recipientNumbers,
    schoolId,
    userEmail,
    senderId,
  }: any) {
    try {
      if (!schoolId || !schoolName) {
        throw new Error('schoolId & schoolName required');
      }

      logger('INFO', 'WhatsAppService', 'Starting bulk send', {
        recipientCount: recipientNumbers.length,
        schoolName
      });

      // Create bulk invitations
      const invitations = recipientNumbers.map((r: any) => ({
        phone_number: r.phone,
        parent_name: r.name,
        learner_number: r.learner_number,
      }));

      const bulk = await InvitationService.createBulkInvitations({
        invitations,
        school_id: schoolId,
        sender_id: senderId,
        userEmail,
      });

      logger('INFO', 'WhatsAppService', 'Bulk invitations created', {
        count: bulk.invitations.length
      });

      // Build personalized messages with magic links
      const personalized = bulk.invitations.map((inv: any) => {
        const magicLink = this.buildMagicLink({
          token: inv.token,
          schoolName,
        });

        return {
          to: inv.phone_number,
          schoolName,
          magicLink,
        };
      });

      // Send bulk messages
      const response = await fetch(`${this.baseURL}/send-bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({
          personalizedMessages: personalized,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Bulk send failed');
      }

      logger('INFO', 'WhatsAppService', 'Bulk send completed', {
        sent: data.sentCount,
        failed: data.failedCount
      });

      return data;
    } catch (error: any) {
      logger('ERROR', 'WhatsAppService', 'Bulk send failed', {
        error: error.message,
      });
      throw error;
    }
  }

  /* ============================================================
   🔹 STEP 7 – SCHEDULE BULK SEND
  ============================================================ */

  async scheduleBulkMessage({
    gradeIds,
    message,
    scheduledAt,
    timezone,
    recipientNumbers,
    schoolId,
    schoolName,
  }: any) {
    try {
      const response = await fetch(`${this.baseURL}/schedule-bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({
          gradeIds,
          message,
          scheduledAt,
          timezone,
          recipientNumbers,
          schoolId,
          schoolName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Schedule bulk message failed');
      }

      return data;
    } catch (error: any) {
      logger('ERROR', 'WhatsAppService', 'Schedule bulk failed', {
        error: error.message,
      });
      throw error;
    }
  }

  /* ============================================================
   🔹 HELPERS
  ============================================================ */

  validatePhoneNumber(phone: string) {
    if (!phone) return false;
    const cleaned = phone.replace(/\s+/g, '');
    return /^\+?[1-9]\d{1,14}$/.test(cleaned);
  }

  formatPhoneNumber(phone: string) {
    if (!phone) return '';
    const cleaned = phone.replace(/\s+/g, '');
    return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
  }
}

export default new WhatsAppBusinessService();