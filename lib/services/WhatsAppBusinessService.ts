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

interface ScheduleBulkParams {
  gradeIds: string[];
  message: string;
  scheduledAt: string | Date;
  timezone?: string;
  recipientNumbers: string[];
  schoolId: string;
  schoolName: string;
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
  }: ScheduleBulkParams) {
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

      const response = await fetch(this.invitationsURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': userEmail || 'system@schoolheadoffice.com',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }

      const token = data.invitation?.token || data.token;

      if (!token) {
        throw new Error('No token returned from API');
      }

      logger('INFO', 'WhatsAppService', 'Token created', {
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
   🔹 STEP 2 – BUILD MAGIC LINK (UPDATED FOR GITHUB PAGES)
  ============================================================ */

  buildMagicLink({ token, schoolName }: { token: string; schoolName: string }) {
    if (!token) throw new Error('Token missing');
    if (!schoolName) throw new Error('School name missing');

    const encodedSchool = encodeURIComponent(schoolName);

    // ✅ UPDATED: Points to your GitHub Pages URL
    const baseUrl = 'https://kayjeee.github.io/Far-North-school/';

    // Return the complete URL with token and school parameters
    return `${baseUrl}?token=${token}&school=${encodedSchool}`;
  }

  /* ============================================================
   🔹 STEP 3 – BUILD MESSAGE
  ============================================================ */

  buildMagicLinkMessage({
    schoolName,
    gradeName,
    magicLink,
  }: {
    schoolName: string;
    gradeName: string;
    magicLink: string;
  }) {
    return `🏫 ${schoolName} - Important Notice

Dear Parent,

Please collect the following uniform items tomorrow:

📅 Date: 17th January 2025
⏰ Time: 08h00 - 12h00

Items to collect:
✓ Pants
✓ Shirts
✓ Skirts

⚠️ IMPORTANT: Please bring:
• Uniform list
• Proof of Payment (POP)

🔗 View full details: ${magicLink}

Kind Regards,
Mr Maropeng PS
${schoolName}`;
  }

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
      throw new Error('Message too long');
    }

    if (message.match(/[<>]/g)) {
      throw new Error('Invalid characters found');
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
      if (!to || !schoolName || !schoolId) {
        throw new Error('Missing required fields');
      }

      const token = await this.createInvitation({
        phoneNumber: to,
        schoolId,
        learnerNumbers: learnerNumber ? [learnerNumber] : [],
        parentName: parentName || 'Parent',
        gradeId: grade?.id,
        sender: sender_id || userEmail,
        userEmail,
      });

      const magicLink = this.buildMagicLink({
        token,
        schoolName,
      });

      const message = this.buildMagicLinkMessage({
        schoolName,
        gradeName: grade?.name || "your child's class",
        magicLink,
      });

      this.validateMessageTemplate(message);

      const response = await fetch(`${this.baseURL}/test-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({
          to,
          message,
          magicLink,
          testType: 'MAGIC_LINK',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send test');
      }

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

      return data;
    } catch (error: any) {
      logger('ERROR', 'WhatsAppService', 'Bulk send failed', {
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