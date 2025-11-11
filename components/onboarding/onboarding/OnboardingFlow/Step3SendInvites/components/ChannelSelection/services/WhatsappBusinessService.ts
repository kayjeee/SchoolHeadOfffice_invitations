// services/WhatsAppBusinessService.ts
import { logger } from '../utils/logger';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

interface InvitationParams {
  phoneNumber: string;
  schoolId: string;
  userEmail?: string;
}

interface BuildMagicLinkParams {
  token: string;
  schoolName: string;
}

interface TestMessageParams {
  to: string;
  schoolName: string;
  schoolId: string;
  userEmail?: string;
}

interface BulkMessagesParams {
  schoolName: string;
  recipientNumbers: string[];
  schoolId: string;
  userEmail?: string;
}

interface ScheduleMessageParams {
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

  // ✅ Internal validator
  private validateMessageTemplate(message: string): void {
    if (typeof message !== 'string' || message.trim() === '') {
      throw new Error('Message must be a non-empty string');
    }
    if (message.length > 4096) {
      throw new Error('Message exceeds maximum length (4096 chars)');
    }
    if (/[<>]/g.test(message)) {
      throw new Error('Message contains invalid characters: < or >');
    }
  }

  private sanitizeSchoolName(schoolName: string): string {
    return schoolName?.trim() || 'Your School';
  }

  private buildSupportEmail(schoolName: string): string {
    const domain = schoolName.toLowerCase().replace(/\s+/g, '');
    return `support@${domain || 'schoolportal'}.com`;
  }

  private buildMagicLink({ token, schoolName }: BuildMagicLinkParams): string {
    const domain = schoolName.toLowerCase().replace(/\s+/g, '');
    return `https://portal.${domain}.com/join?token=${token}`;
  }

  async createInvitation({ phoneNumber, schoolId, userEmail }: InvitationParams): Promise<string> {
    if (!schoolId || !phoneNumber) {
      throw new Error('schoolId and phoneNumber are required');
    }

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

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to create invitation');
    }

    return data.invitation?.token || data.token;
  }

  private buildMagicLinkMessage(schoolName: string, magicLink: string, supportEmail: string): string {
    return `🏫 ${schoolName} Parent Portal Invitation

Dear Parent,

Confirm that your child has joined our secure parent communication portal for ${schoolName}.

✅ Get real-time updates about your child's progress
✅ Receive important announcements instantly
✅ Connect with teachers directly
✅ Access school resources and calendar

🔗 Join now: ${magicLink}

For support, WhatsApp us at this number or email ${supportEmail}

Best wishes,
${schoolName} Admin Team`;
  }

  async sendTestMessage({ to, schoolName, schoolId, userEmail }: TestMessageParams): Promise<any> {
    const formattedNumber = to.replace(/\D/g, "");
    if (!formattedNumber.startsWith("27")) {
      throw new Error('Invalid phone number: must start with 27');
    }

    const token = await this.createInvitation({ phoneNumber: formattedNumber, schoolId, userEmail });
    const sanitizedSchoolName = this.sanitizeSchoolName(schoolName);
    const magicLink = this.buildMagicLink({ token, schoolName: sanitizedSchoolName });
    const supportEmail = this.buildSupportEmail(sanitizedSchoolName);

    const messageText = this.buildMagicLinkMessage(sanitizedSchoolName, magicLink, supportEmail);
    this.validateMessageTemplate(messageText);

    const payload = {
      to: formattedNumber,
      schoolName: sanitizedSchoolName,
      magicLink,
      supportEmail,
      testType: 'MAGIC_LINK',
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
      console.error('❌ WhatsApp API Error:', data);
      throw new Error(data.error || 'Failed to send WhatsApp message');
    }

    return { ...data, payload };
  }

  getTemplateInfo() {
    return {
      templateName: 'school_invitation',
      variables: [
        { position: 1, name: 'gradename', description: 'Grade name (e.g. "1st Grade")' },
        { position: 2, name: 'magiclink', description: 'Magic link invitation URL' },
        { position: 3, name: 'supportemail', description: 'Support email for the school' },
        { position: 4, name: 'schoolname', description: 'Name of the school' },
      ],
    };
  }
}

export default new WhatsAppBusinessService();
