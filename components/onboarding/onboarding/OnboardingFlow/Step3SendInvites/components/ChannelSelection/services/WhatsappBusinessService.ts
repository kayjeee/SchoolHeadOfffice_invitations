// services/WhatsAppBusinessService.ts
import { logger } from '../utils/logger';

const API_BASE_URL: string = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

interface Grade {
    id: string;
    name: string;
  }

  interface InvitationParams {
    phoneNumber: string;
    schoolId: string;
    userEmail?: string;
  }

  interface MagicLinkParams {
    schoolName: string;
    gradeName: string;
    magicLink: string;
  }

  interface BuildMagicLinkParams {
    token: string;
    schoolName: string;
  }

  interface TestMessageParams {
    to: string;
    schoolName: string;
    grade?: Grade;
    schoolId: string;
    userEmail?: string;
  }

  interface BulkMessagesParams {
    gradeIds: string[];
    schoolName: string;
    recipientNumbers: string[];
    schoolId: string;
    userEmail?: string;
  }

  interface ScheduleMessageParams {
    gradeIds: string[];
    message: string;
    scheduledAt: string | Date;
    timezone: string;
    recipientNumbers: string[];
    schoolId: string;
    schoolName: string;
  }

class WhatsAppBusinessService {
  private baseURL: string;
  private invitationsURL: string;

  constructor() {
    this.baseURL = '/api/whatsapp-business';
    this.invitationsURL = `${API_BASE_URL}/api/v1/invitations`;
  }

  async createInvitation({ phoneNumber, schoolId, userEmail }: InvitationParams): Promise<string> {
    try {
      logger.info('WhatsAppBusinessService', 'Creating invitation token', {
        phoneNumber,
        schoolId,
        userEmail
      });

      if (!schoolId) throw new Error('schoolId is required to create invitation');
      if (!phoneNumber) throw new Error('phoneNumber is required to create invitation');

      const payload = {
        phone_number: phoneNumber,
        school_id: schoolId,
        role: 'parent',
      };

      const response = await fetch(this.invitationsURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': userEmail || 'kagiso.killagram@gmail.com',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: Failed to create invitation`);
      }
      if (!data.success) {
        throw new Error(data.message || 'API returned success: false');
      }

      const token = data.invitation?.token || data.token;
      if (!token) {
        throw new Error('No token received in invitation response');
      }

      return token;
    } catch (error: any) {
      logger.error('WhatsAppBusinessService', 'Failed to create invitation', {
        error: error.message,
        phoneNumber,
        schoolId,
        userEmail
      });
      throw error;
    }
  }

  buildMagicLinkMessage({ schoolName, gradeName, magicLink }: MagicLinkParams): string {
    const domain = schoolName.toLowerCase().replace(/\s+/g, '');
    const supportEmail = `support@${domain}.com`;

    return `🏫 ${schoolName} Parent Portal Invitation

Dear Parent,

You're invited to join our secure parent communication portal for ${gradeName}.

✅ Get real-time updates about your child's progress
✅ Receive important announcements instantly
✅ Connect with teachers directly
✅ Access school resources and calendar

🔗 Join now: ${magicLink}

For support, WhatsApp us at this number or email ${supportEmail}

Best wishes,
${schoolName} Admin Team`;
  }

  validateMessageTemplate(message: string): boolean {
    if (typeof message !== 'string') {
      throw new Error('Message must be a string');
    }

    const validations = [
      {
        check: message.length > 0,
        error: 'Message cannot be empty',
      },
      {
        check: message.length <= 4096,
        error: `Message exceeds maximum length of 4096 characters (current: ${message.length})`,
      },
      {
        check: !message.includes('{{1}}') || (message.match(/{{(\d+)}}/g) || []).length <= 10,
        error: 'Maximum 10 variables allowed in template',
      },
      {
        check: !message.match(/[<>]/g),
        error: 'Message contains invalid characters (< or >)',
      },
    ];

    for (const validation of validations) {
      if (!validation.check) {
        throw new Error(validation.error);
      }
    }

    return true;
  }

  buildMagicLink({ token, schoolName }: BuildMagicLinkParams): string {
    const domain = schoolName.toLowerCase().replace(/\s+/g, '');
    return `https://portal.${domain}.com/join?token=${token}`;
  }

  async sendTestMessage({ to, schoolName, grade, schoolId, userEmail }: TestMessageParams): Promise<any> {
    try {
      logger.info('WhatsAppBusinessService', 'Preparing to send test message', { to, schoolName, grade: grade?.name, schoolId });

      if (!to || !schoolName || !schoolId) {
        throw new Error('Missing required fields: to, schoolName, and schoolId are required');
      }

      const token = await this.createInvitation({ phoneNumber: to, schoolId, userEmail });
      const magicLink = this.buildMagicLink({ token, schoolName });
      const gradeName = grade?.name || "your child's class";

      const payload = {
        to,
        variables: {
          schoolname: schoolName,
          gradename: gradeName,
          magiclink: magicLink,
        },
        fallbackTemplate: "school_invitation"
      };

      const response = await fetch(`${this.baseURL}/test-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: Failed to send test message`);
      }

      return { ...data, magicLink, token };
    } catch (error: any) {
      logger.error('WhatsAppBusinessService', 'Failed to send test message', {
        error: error.message,
        to,
        schoolName,
        schoolId
      });
      throw error;
    }
  }

  async sendBulkMessages({ gradeIds, schoolName, recipientNumbers, schoolId, userEmail }: BulkMessagesParams): Promise<any> {
    try {
        logger.info('WhatsAppBusinessService', 'Preparing to send bulk magic link messages', {
            recipientCount: recipientNumbers.length,
            schoolName,
            schoolId,
            gradeIds
          });
      if (!schoolId || !schoolName) throw new Error('schoolId and schoolName are required for bulk messages');
      if (!recipientNumbers || recipientNumbers.length === 0) throw new Error('recipientNumbers cannot be empty');

      const personalizedMessages: { to: string; message: string; magicLink: string; token: string }[] = [];
      const errors: { phoneNumber: string; error: string }[] = [];

      for (let i = 0; i < recipientNumbers.length; i++) {
        const number = recipientNumbers[i];
        try {
          const token = await this.createInvitation({ phoneNumber: number, schoolId, userEmail });
          const magicLink = this.buildMagicLink({ token, schoolName });
          const message = this.buildMagicLinkMessage({
            schoolName,
            gradeName: 'your child\'s class',
            magicLink,
          });
          this.validateMessageTemplate(message);
          personalizedMessages.push({ to: number, message, magicLink, token });
          if (i < recipientNumbers.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        } catch (error: any) {
            errors.push({ phoneNumber: number, error: error.message });
        }
      }

      if (errors.length > 0) {
        logger.warn('WhatsAppBusinessService', 'Some invitations failed during token generation', {
          failedCount: errors.length,
          successfulCount: personalizedMessages.length,
          errors: errors.slice(0, 5)
        });
      }

      if (personalizedMessages.length === 0) {
        throw new Error('No messages could be generated. All invitations failed.');
      }

      const response = await fetch(`${this.baseURL}/send-bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({
          gradeIds,
          schoolName,
          schoolId,
          campaignType: 'MAGIC_LINK_INVITES',
          personalizedMessages,
          totalRecipients: personalizedMessages.length,
          failedDuringGeneration: errors.length,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: Failed to send bulk messages`);
      }

      return { ...data, generationErrors: errors, totalProcessed: personalizedMessages.length + errors.length };
    } catch (error: any) {
      logger.error('WhatsAppBusinessService', 'Failed to send bulk magic link messages', {
        error: error.message,
        schoolName,
        schoolId,
        recipientCount: recipientNumbers?.length
      });
      throw error;
    }
  }

  async sendBulkMessages({ gradeIds, schoolName, recipientNumbers, schoolId, userEmail }: BulkMessagesParams): Promise<any> {
    try {
        logger.info('WhatsAppBusinessService', 'Preparing to send bulk magic link messages', {
            recipientCount: recipientNumbers.length,
            schoolName,
            schoolId,
            gradeIds
          });
      if (!schoolId || !schoolName) throw new Error('schoolId and schoolName are required for bulk messages');
      if (!recipientNumbers || recipientNumbers.length === 0) throw new Error('recipientNumbers cannot be empty');

      const personalizedMessages: { to: string; message: string; magicLink: string; token: string }[] = [];
      const errors: { phoneNumber: string; error: string }[] = [];

      for (let i = 0; i < recipientNumbers.length; i++) {
        const number = recipientNumbers[i];
        try {
          const token = await this.createInvitation({ phoneNumber: number, schoolId, userEmail });
          const magicLink = this.buildMagicLink({ token, schoolName });
          const message = this.buildMagicLinkMessage({
            schoolName,
            gradeName: 'your child\'s class',
            magicLink,
          });
          this.validateMessageTemplate(message);
          personalizedMessages.push({ to: number, message, magicLink, token });
          if (i < recipientNumbers.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        } catch (error: any) {
            errors.push({ phoneNumber: number, error: error.message });
        }
      }

      if (errors.length > 0) {
        logger.warn('WhatsAppBusinessService', 'Some invitations failed during token generation', {
          failedCount: errors.length,
          successfulCount: personalizedMessages.length,
          errors: errors.slice(0, 5)
        });
      }

      if (personalizedMessages.length === 0) {
        throw new Error('No messages could be generated. All invitations failed.');
      }

      const response = await fetch(`${this.baseURL}/send-bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({
          gradeIds,
          schoolName,
          schoolId,
          campaignType: 'MAGIC_LINK_INVITES',
          personalizedMessages,
          totalRecipients: personalizedMessages.length,
          failedDuringGeneration: errors.length,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: Failed to send bulk messages`);
      }

      return { ...data, generationErrors: errors, totalProcessed: personalizedMessages.length + errors.length };
    } catch (error: any) {
      logger.error('WhatsAppBusinessService', 'Failed to send bulk magic link messages', {
        error: error.message,
        schoolName,
        schoolId,
        recipientCount: recipientNumbers?.length
      });
      throw error;
    }
  }

  validatePhoneNumber(phoneNumber: string): boolean {
    if (!phoneNumber) return false;
    const cleaned = phoneNumber.replace(/\s+/g, '');
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(cleaned);
  }

  formatPhoneNumber(phoneNumber: string): string {
    if (!phoneNumber) return '';
    const cleaned = phoneNumber.replace(/\s+/g, '');
    return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
  }
}

export default new WhatsAppBusinessService();